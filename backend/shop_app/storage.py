# backend/shop_app/storage.py

import os
import re
import uuid

import cloudinary
import cloudinary.uploader
import cloudinary.utils

from django.core.files.storage import Storage
from django.core.exceptions import SuspiciousOperation
from django.utils.deconstruct import deconstructible


@deconstructible
class ProductMediaCloudinaryStorage(Storage):
    """
    Cloudinary storage dedicated to ProductMedia.

    Images are uploaded using Cloudinary resource_type="image".

    Videos are uploaded using Cloudinary resource_type="video".

    The Django database value keeps:
        - resource type
        - public ID
        - original extension
        - Cloudinary version

    Example image:
        image:product_media/modern_sofa_a82f91c72d10.jpg|v1768254000

    Example video:
        video:product_media/modern_sofa_91bc72d8e301.mp4|v1768254050
    """

    CLOUDINARY_FOLDER = "product_media"

    IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".avif",
        ".gif",
    }

    VIDEO_EXTENSIONS = {
        ".mp4",
        ".webm",
        ".mov",
        ".m4v",
        ".avi",
        ".mkv",
    }

    # =========================================================
    # RESOURCE TYPE
    # =========================================================

    def _get_resource_type(self, filename):
        """
        Determine whether the file is an image or video
        from its extension.
        """

        extension = os.path.splitext(str(filename))[1].lower()

        if extension in self.VIDEO_EXTENSIONS:
            return "video"

        if extension in self.IMAGE_EXTENSIONS:
            return "image"

        return None

    # =========================================================
    # CLEAN NAME
    # =========================================================

    def _clean_name(self, name):
        """
        Normalize Windows/Linux path separators.
        """

        return str(name).replace("\\", "/").lstrip("/")

    # =========================================================
    # SAFE PUBLIC ID
    # =========================================================

    def _make_safe_public_id(self, filename):
        """
        Convert the original filename into a safe Cloudinary
        public ID and append a UUID so two files with the same
        filename never collide.
        """

        base_name = os.path.splitext(
            os.path.basename(filename)
        )[0]

        # Replace spaces and unsafe characters.
        safe_name = re.sub(
            r"[^a-zA-Z0-9_-]+",
            "_",
            base_name,
        )

        safe_name = safe_name.strip("_")

        if not safe_name:
            safe_name = "product_media"

        # Guaranteed uniqueness.
        unique_suffix = uuid.uuid4().hex[:12]

        return f"{safe_name}_{unique_suffix}"

    # =========================================================
    # SAVE
    # =========================================================

    def _save(self, name, content):
        """
        Upload the file to Cloudinary and return the value
        that Django will store in ProductMedia.file.
        """

        name = self._clean_name(name)

        resource_type = self._get_resource_type(name)

        if resource_type is None:
            raise SuspiciousOperation(
                f"Unsupported ProductMedia file type: {name}"
            )

        # Reset file pointer before uploading.
        try:
            content.seek(0)
        except Exception:
            pass

        filename = os.path.basename(name)

        extension = os.path.splitext(filename)[1].lower()

        public_id = self._make_safe_public_id(filename)

        # -----------------------------------------------------
        # CLOUDINARY UPLOAD
        # -----------------------------------------------------

        result = cloudinary.uploader.upload(
            content,
            folder=self.CLOUDINARY_FOLDER,
            public_id=public_id,
            resource_type=resource_type,

            # We already generate our own unique public ID.
            use_filename=False,
            unique_filename=False,

            # Never overwrite another product media file.
            overwrite=False,

            # Generate secure HTTPS URLs.
            secure=True,
        )

        # -----------------------------------------------------
        # VALIDATE CLOUDINARY RESPONSE
        # -----------------------------------------------------

        returned_public_id = result.get("public_id")

        returned_resource_type = result.get(
            "resource_type"
        )

        version = result.get("version")

        if not returned_public_id:
            raise RuntimeError(
                "Cloudinary upload failed: public_id missing."
            )

        if returned_resource_type != resource_type:
            raise RuntimeError(
                "Cloudinary resource type mismatch. "
                f"Expected {resource_type}, "
                f"received {returned_resource_type}."
            )

        if not version:
            raise RuntimeError(
                "Cloudinary upload failed: version missing."
            )

        # -----------------------------------------------------
        # VALUE STORED IN DATABASE
        # -----------------------------------------------------

        # Example:
        #
        # video:product_media/sofa_91bc72d8e301.mp4|v1768254050
        #
        # Example:
        #
        # image:product_media/sofa_a82f91c72d10.jpg|v1768254000

        stored_name = (
            f"{resource_type}:"
            f"{returned_public_id}"
            f"{extension}"
            f"|v{version}"
        )

        return stored_name

    # =========================================================
    # EXISTS
    # =========================================================

    def exists(self, name):
        """
        We deliberately return False.

        Cloudinary manages the actual remote resource.
        """

        return False

    # =========================================================
    # PARSE STORED NAME
    # =========================================================

    def _parse_stored_name(self, name):
        """
        Convert the database value back into its components.

        Supports the new format:

            video:product_media/example.mp4|v123456

        Also provides basic compatibility with older records.
        """

        name = self._clean_name(name)

        resource_type = None
        version = None

        # -----------------------------------------------------
        # RESOURCE TYPE
        # -----------------------------------------------------

        if ":" in name:
            prefix, remainder = name.split(":", 1)

            if prefix in {"image", "video"}:
                resource_type = prefix
                name = remainder

        # -----------------------------------------------------
        # VERSION
        # -----------------------------------------------------

        if "|v" in name:
            name, version_string = name.rsplit(
                "|v",
                1,
            )

            try:
                version = int(version_string)
            except (TypeError, ValueError):
                version = None

        name = self._clean_name(name)

        # -----------------------------------------------------
        # BACKWARD COMPATIBILITY
        # -----------------------------------------------------

        if resource_type is None:
            resource_type = self._get_resource_type(name)

        # -----------------------------------------------------
        # PUBLIC ID
        # -----------------------------------------------------

        public_id = os.path.splitext(name)[0]

        if public_id.startswith(
            f"{self.CLOUDINARY_FOLDER}/"
        ):
            public_id = public_id[
                len(self.CLOUDINARY_FOLDER) + 1:
            ]

        public_id = (
            f"{self.CLOUDINARY_FOLDER}/{public_id}"
        )

        return {
            "resource_type": resource_type,
            "version": version,
            "stored_name": name,
            "public_id": public_id,
        }

    # =========================================================
    # URL
    # =========================================================

    def url(self, name):
        """
        Generate the correct Cloudinary delivery URL.
        """

        if not name:
            return ""

        parsed = self._parse_stored_name(name)

        resource_type = parsed["resource_type"]
        version = parsed["version"]
        public_id = parsed["public_id"]

        cloud_name = cloudinary.config().cloud_name

        if not cloud_name:
            raise RuntimeError(
                "Cloudinary cloud_name is not configured."
            )

        if resource_type not in {"image", "video"}:
            raise SuspiciousOperation(
                f"Unable to determine Cloudinary resource type "
                f"for stored media: {name}"
            )

        # -----------------------------------------------------
        # CLOUDINARY URL
        # -----------------------------------------------------

        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="upload",
            version=version,
            secure=True,
        )

        return url

    # =========================================================
    # DELETE
    # =========================================================

    def delete(self, name):
        """
        Delete the corresponding Cloudinary asset.
        """

        if not name:
            return

        parsed = self._parse_stored_name(name)

        resource_type = parsed["resource_type"]
        public_id = parsed["public_id"]

        if resource_type not in {"image", "video"}:
            return

        try:
            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",
                invalidate=True,
            )
        except Exception:
            # Do not prevent the database record from
            # being deleted if Cloudinary no longer has
            # the remote file.
            pass

    # =========================================================
    # AVAILABLE NAME
    # =========================================================

    def get_available_name(
        self,
        name,
        max_length=None,
    ):
        """
        Return the requested name.

        Our _save() method generates the actual unique
        Cloudinary public ID.
        """

        return name

    # =========================================================
    # SIZE
    # =========================================================

    def size(self, name):
        """
        Size is stored remotely in Cloudinary.

        We don't use Django's local filesystem size.
        """

        return 0

    # =========================================================
    # OPEN
    # =========================================================

    def _open(self, name, mode="rb"):
        """
        Product media is remote in Cloudinary.

        The application should use file.url rather than
        trying to open the file locally.
        """

        raise NotImplementedError(
            "Product media is stored remotely on Cloudinary. "
            "Use file.url instead."
        )
