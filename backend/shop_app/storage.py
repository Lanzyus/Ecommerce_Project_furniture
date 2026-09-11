import os

import cloudinary
import cloudinary.uploader
import cloudinary.utils

from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class ProductMediaCloudinaryStorage(Storage):
    """
    Cloudinary storage specifically for ProductMedia.

    Images are uploaded as Cloudinary image resources.
    Videos are uploaded as Cloudinary video resources.

    The saved Django filename keeps the resource type so that
    Django can generate the correct Cloudinary URL later.
    """

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
        extension = os.path.splitext(str(filename))[1].lower()

        if extension in self.VIDEO_EXTENSIONS:
            return "video"

        if extension in self.IMAGE_EXTENSIONS:
            return "image"

        return "auto"

    # =========================================================
    # CLEAN NAME
    # =========================================================

    def _clean_name(self, name):
        return str(name).replace("\\", "/").lstrip("/")

    # =========================================================
    # SAVE
    # =========================================================

    def _save(self, name, content):
        name = self._clean_name(name)

        resource_type = self._get_resource_type(name)

        try:
            content.seek(0)
        except Exception:
            pass

        filename = os.path.basename(name)

        extension = os.path.splitext(filename)[1].lower()

        filename_without_extension = os.path.splitext(filename)[0]

        public_id = filename_without_extension.strip()
        public_id = public_id.replace(" ", "_")

        if not public_id:
            public_id = "product_media"

        result = cloudinary.uploader.upload(
            content,
            folder="product_media",
            public_id=public_id,
            resource_type=resource_type,
            use_filename=False,
            unique_filename=True,
            overwrite=False,
        )

        returned_public_id = result.get("public_id")

        if not returned_public_id:
            raise RuntimeError(
                "Cloudinary upload failed: "
                "no public_id returned."
            )

        # Keep the resource type and extension in the value
        # stored by Django.
        #
        # Example:
        # image:product_media/Double_Beds6_cxchw5.jpg
        # video:product_media/sofa_def_jszjvr.mp4
        #
        # The actual Cloudinary public_id remains unchanged.

        return (
            f"{resource_type}:"
            f"{returned_public_id}"
            f"{extension}"
        )

    # =========================================================
    # EXISTS
    # =========================================================

    def exists(self, name):
        return False

    # =========================================================
    # URL
    # =========================================================

    def url(self, name):
        if not name:
            return ""

        name = self._clean_name(name)

        # New format:
        #
        # image:product_media/example.jpg
        # video:product_media/example.mp4

        if ":" in name:
            resource_type, stored_name = name.split(":", 1)
        else:
            # Backward compatibility for old database records.
            resource_type = self._get_resource_type(name)
            stored_name = name

        stored_name = self._clean_name(stored_name)

        public_id = os.path.splitext(stored_name)[0]

        cloud_name = cloudinary.config().cloud_name

        if not cloud_name:
            raise RuntimeError(
                "Cloudinary cloud_name is not configured."
            )

        if resource_type == "video":
            delivery_type = "video"
        else:
            delivery_type = "image"

        # Generate the Cloudinary delivery URL.
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=delivery_type,
            type="upload",
            secure=True,
        )

        return url

    # =========================================================
    # DELETE
    # =========================================================

    def delete(self, name):
        if not name:
            return

        name = self._clean_name(name)

        if ":" in name:
            resource_type, stored_name = name.split(":", 1)
        else:
            resource_type = self._get_resource_type(name)
            stored_name = name

        stored_name = self._clean_name(stored_name)

        public_id = os.path.splitext(stored_name)[0]

        if resource_type not in {"image", "video"}:
            resource_type = "image"

        try:
            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",
            )
        except Exception:
            pass

    # =========================================================
    # AVAILABLE NAME
    # =========================================================

    def get_available_name(self, name, max_length=None):
        return name

    # =========================================================
    # SIZE
    # =========================================================

    def size(self, name):
        return 0
