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

    New records are stored using a format such as:

        image:product_media/sofa_abc123.jpg|v1768254000

        video:product_media/sofa_xyz789.mp4|v1768254050

    The resource type is explicitly stored so that new records do not
    depend on filename extension when generating the Cloudinary URL.

    IMPORTANT:

    Legacy records may look like:

        product_media/sofa_def_jszjvr

    or:

        product_media/sofa.jpg

    The storage class supports these records as far as possible.

    For completely extensionless legacy records, the serializer should
    use ProductMedia.media_type because Storage.url() does not receive
    the ProductMedia instance.
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

    RESOURCE_TYPES = {
        "image",
        "video",
    }

    # =========================================================
    # RESOURCE TYPE
    # =========================================================

    def _get_resource_type(self, filename):
        """
        Determine resource type from a filename.

        Returns:
            "image"
            "video"
            None
        """

        if not filename:
            return None

        extension = os.path.splitext(
            str(filename)
        )[1].lower()

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

        if not name:
            return ""

        return (
            str(name)
            .replace("\\", "/")
            .lstrip("/")
        )

    # =========================================================
    # REMOVE VERSION
    # =========================================================

    def _remove_version(self, name):
        """
        Remove a Cloudinary version suffix.

        Example:

            product_media/sofa.jpg|v123456

        becomes:

            product_media/sofa.jpg
        """

        if not name:
            return ""

        name = str(name)

        if "|v" in name:
            name = name.rsplit("|v", 1)[0]

        return self._clean_name(name)

    # =========================================================
    # REMOVE RESOURCE PREFIX
    # =========================================================

    def _remove_resource_prefix(self, name):
        """
        Remove our explicit resource prefix.

        Example:

            video:product_media/sofa.mp4

        becomes:

            product_media/sofa.mp4
        """

        if not name:
            return ""

        name = str(name)

        if ":" in name:
            prefix, remainder = name.split(":", 1)

            if prefix in self.RESOURCE_TYPES:
                return self._clean_name(remainder)

        return self._clean_name(name)

    # =========================================================
    # SAFE PUBLIC ID
    # =========================================================

    def _make_safe_public_id(self, filename):
        """
        Convert original filename into a safe Cloudinary public ID.

        A UUID suffix guarantees uniqueness.
        """

        base_name = os.path.splitext(
            os.path.basename(filename)
        )[0]

        safe_name = re.sub(
            r"[^a-zA-Z0-9_-]+",
            "_",
            base_name,
        )

        safe_name = safe_name.strip("_")

        if not safe_name:
            safe_name = "product_media"

        unique_suffix = uuid.uuid4().hex[:12]

        return f"{safe_name}_{unique_suffix}"

    # =========================================================
    # SAVE
    # =========================================================

    def _save(self, name, content):
        """
        Upload media to Cloudinary.

        Resource type is determined BEFORE upload from the original
        uploaded filename.
        """

        name = self._clean_name(name)

        resource_type = self._get_resource_type(name)

        if resource_type is None:
            raise SuspiciousOperation(
                "Unsupported ProductMedia file type: "
                f"{name}. Supported image types: "
                f"{', '.join(sorted(self.IMAGE_EXTENSIONS))}. "
                "Supported video types: "
                f"{', '.join(sorted(self.VIDEO_EXTENSIONS))}."
            )

        try:
            content.seek(0)
        except Exception:
            pass

        filename = os.path.basename(name)

        extension = os.path.splitext(
            filename
        )[1].lower()

        public_id = self._make_safe_public_id(
            filename
        )

        # -----------------------------------------------------
        # CLOUDINARY UPLOAD
        # -----------------------------------------------------

        result = cloudinary.uploader.upload(
            content,
            folder=self.CLOUDINARY_FOLDER,
            public_id=public_id,
            resource_type=resource_type,
            use_filename=False,
            unique_filename=False,
            overwrite=False,
            secure=True,
        )

        # -----------------------------------------------------
        # VALIDATE RESPONSE
        # -----------------------------------------------------

        returned_public_id = result.get(
            "public_id"
        )

        returned_resource_type = result.get(
            "resource_type"
        )

        version = result.get("version")

        if not returned_public_id:
            raise RuntimeError(
                "Cloudinary upload failed: "
                "public_id missing."
            )

        if returned_resource_type != resource_type:
            raise RuntimeError(
                "Cloudinary resource type mismatch. "
                f"Expected '{resource_type}', "
                f"received '{returned_resource_type}'."
            )

        if not version:
            raise RuntimeError(
                "Cloudinary upload failed: "
                "version missing."
            )

        # -----------------------------------------------------
        # DATABASE VALUE
        # -----------------------------------------------------

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
        Cloudinary manages the remote asset.

        Always return False so Django does not attempt local
        filesystem collision checks.
        """

        return False

    # =========================================================
    # PARSE STORED NAME
    # =========================================================

    def _parse_stored_name(self, name):
        """
        Parse a ProductMedia database value.

        Supports:

            image:product_media/sofa.jpg|v123

            video:product_media/sofa.mp4|v123

        and legacy:

            product_media/sofa.jpg

            product_media/sofa.mp4

            product_media/sofa_def_jszjvr
        """

        if not name:
            return {
                "resource_type": None,
                "version": None,
                "stored_name": "",
                "public_id": None,
            }

        original_name = self._clean_name(name)

        # -----------------------------------------------------
        # RESOURCE TYPE
        # -----------------------------------------------------

        resource_type = None

        working_name = self._remove_resource_prefix(
            original_name
        )

        # Explicit prefix from new records.
        if ":" in original_name:
            prefix, remainder = original_name.split(
                ":",
                1,
            )

            if prefix in self.RESOURCE_TYPES:
                resource_type = prefix
                working_name = self._clean_name(
                    remainder
                )

        # -----------------------------------------------------
        # VERSION
        # -----------------------------------------------------

        version = None

        if "|v" in working_name:
            working_name, version_string = (
                working_name.rsplit("|v", 1)
            )

            try:
                version = int(version_string)
            except (
                TypeError,
                ValueError,
            ):
                version = None

        working_name = self._clean_name(
            working_name
        )

        # -----------------------------------------------------
        # LEGACY RESOURCE TYPE
        # -----------------------------------------------------

        if resource_type is None:
            resource_type = self._get_resource_type(
                working_name
            )

        # -----------------------------------------------------
        # PUBLIC ID
        # -----------------------------------------------------

        public_id = os.path.splitext(
            working_name
        )[0]

        if public_id.startswith(
            f"{self.CLOUDINARY_FOLDER}/"
        ):
            public_id = public_id[
                len(self.CLOUDINARY_FOLDER) + 1:
            ]

        public_id = (
            f"{self.CLOUDINARY_FOLDER}/"
            f"{public_id}"
        )

        return {
            "resource_type": resource_type,
            "version": version,
            "stored_name": working_name,
            "public_id": public_id,
        }

    # =========================================================
    # BUILD URL
    # =========================================================

    def _build_url(
        self,
        public_id,
        resource_type,
        version=None,
    ):
        """
        Build a secure Cloudinary URL.
        """

        cloud_name = (
            cloudinary.config().cloud_name
        )

        if not cloud_name:
            raise RuntimeError(
                "Cloudinary cloud_name is not configured."
            )

        if resource_type not in self.RESOURCE_TYPES:
            raise SuspiciousOperation(
                "Unable to determine Cloudinary "
                "resource type."
            )

        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="upload",
            version=version,
            secure=True,
        )

        return url

    # =========================================================
    # URL
    # =========================================================

    def url(self, name):
        """
        Generate the correct Cloudinary URL.

        NOTE:

        For an extensionless legacy record there is no reliable
        way for Storage.url() to know whether it is an image or
        video because Django passes only the stored filename.

        ProductMediaSerializer handles that situation using
        ProductMedia.media_type.
        """

        if not name:
            return ""

        parsed = self._parse_stored_name(name)

        resource_type = parsed[
            "resource_type"
        ]

        if resource_type not in self.RESOURCE_TYPES:
            raise SuspiciousOperation(
                "Unable to determine Cloudinary "
                "resource type for stored media: "
                f"{name}. "
                "For legacy extensionless records, "
                "use ProductMedia.media_type when "
                "building the URL."
            )

        return self._build_url(
            public_id=parsed["public_id"],
            resource_type=resource_type,
            version=parsed["version"],
        )

    # =========================================================
    # DELETE
    # =========================================================

    def delete(self, name):
        """
        Delete corresponding Cloudinary asset.
        """

        if not name:
            return

        parsed = self._parse_stored_name(
            name
        )

        resource_type = parsed[
            "resource_type"
        ]

        public_id = parsed[
            "public_id"
        ]

        if resource_type not in self.RESOURCE_TYPES:
            # Cannot safely delete an extensionless legacy
            # asset when the resource type is unknown.
            return

        if not public_id:
            return

        try:
            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",
                invalidate=True,
            )
        except Exception:
            # Database deletion should not fail merely because
            # the Cloudinary asset no longer exists.
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
        Return requested name.

        _save() generates the actual unique Cloudinary ID.
        """

        return name

    # =========================================================
    # SIZE
    # =========================================================

    def size(self, name):
        """
        Remote Cloudinary storage does not expose a local
        filesystem size.
        """

        return 0

    # =========================================================
    # OPEN
    # =========================================================

    def _open(
        self,
        name,
        mode="rb",
    ):
        """
        Product media is stored remotely.

        Use file.url instead of opening it locally.
        """

        raise NotImplementedError(
            "Product media is stored remotely "
            "on Cloudinary. Use file.url instead."
        )









# # backend/shop_app/storage.py

# import os
# import re
# import uuid

# import cloudinary
# import cloudinary.uploader
# import cloudinary.utils

# from django.core.files.storage import Storage
# from django.core.exceptions import SuspiciousOperation
# from django.utils.deconstruct import deconstructible


# @deconstructible
# class ProductMediaCloudinaryStorage(Storage):
#     """
#     Cloudinary storage dedicated to ProductMedia.

#     Images are uploaded using Cloudinary resource_type="image".

#     Videos are uploaded using Cloudinary resource_type="video".

#     The Django database value keeps:
#         - resource type
#         - public ID
#         - original extension
#         - Cloudinary version

#     Example image:
#         image:product_media/modern_sofa_a82f91c72d10.jpg|v1768254000

#     Example video:
#         video:product_media/modern_sofa_91bc72d8e301.mp4|v1768254050
#     """

#     CLOUDINARY_FOLDER = "product_media"

#     IMAGE_EXTENSIONS = {
#         ".jpg",
#         ".jpeg",
#         ".png",
#         ".webp",
#         ".avif",
#         ".gif",
#     }

#     VIDEO_EXTENSIONS = {
#         ".mp4",
#         ".webm",
#         ".mov",
#         ".m4v",
#         ".avi",
#         ".mkv",
#     }

#     # =========================================================
#     # RESOURCE TYPE
#     # =========================================================

#     def _get_resource_type(self, filename):
#         """
#         Determine whether the file is an image or video
#         from its extension.
#         """

#         extension = os.path.splitext(str(filename))[1].lower()

#         if extension in self.VIDEO_EXTENSIONS:
#             return "video"

#         if extension in self.IMAGE_EXTENSIONS:
#             return "image"

#         return None

#     # =========================================================
#     # CLEAN NAME
#     # =========================================================

#     def _clean_name(self, name):
#         """
#         Normalize Windows/Linux path separators.
#         """

#         return str(name).replace("\\", "/").lstrip("/")

#     # =========================================================
#     # SAFE PUBLIC ID
#     # =========================================================

#     def _make_safe_public_id(self, filename):
#         """
#         Convert the original filename into a safe Cloudinary
#         public ID and append a UUID so two files with the same
#         filename never collide.
#         """

#         base_name = os.path.splitext(
#             os.path.basename(filename)
#         )[0]

#         # Replace spaces and unsafe characters.
#         safe_name = re.sub(
#             r"[^a-zA-Z0-9_-]+",
#             "_",
#             base_name,
#         )

#         safe_name = safe_name.strip("_")

#         if not safe_name:
#             safe_name = "product_media"

#         # Guaranteed uniqueness.
#         unique_suffix = uuid.uuid4().hex[:12]

#         return f"{safe_name}_{unique_suffix}"

#     # =========================================================
#     # SAVE
#     # =========================================================

#     def _save(self, name, content):
#         """
#         Upload the file to Cloudinary and return the value
#         that Django will store in ProductMedia.file.
#         """

#         name = self._clean_name(name)

#         resource_type = self._get_resource_type(name)

#         if resource_type is None:
#             raise SuspiciousOperation(
#                 f"Unsupported ProductMedia file type: {name}"
#             )

#         # Reset file pointer before uploading.
#         try:
#             content.seek(0)
#         except Exception:
#             pass

#         filename = os.path.basename(name)

#         extension = os.path.splitext(filename)[1].lower()

#         public_id = self._make_safe_public_id(filename)

#         # -----------------------------------------------------
#         # CLOUDINARY UPLOAD
#         # -----------------------------------------------------

#         result = cloudinary.uploader.upload(
#             content,
#             folder=self.CLOUDINARY_FOLDER,
#             public_id=public_id,
#             resource_type=resource_type,

#             # We already generate our own unique public ID.
#             use_filename=False,
#             unique_filename=False,

#             # Never overwrite another product media file.
#             overwrite=False,

#             # Generate secure HTTPS URLs.
#             secure=True,
#         )

#         # -----------------------------------------------------
#         # VALIDATE CLOUDINARY RESPONSE
#         # -----------------------------------------------------

#         returned_public_id = result.get("public_id")

#         returned_resource_type = result.get(
#             "resource_type"
#         )

#         version = result.get("version")

#         if not returned_public_id:
#             raise RuntimeError(
#                 "Cloudinary upload failed: public_id missing."
#             )

#         if returned_resource_type != resource_type:
#             raise RuntimeError(
#                 "Cloudinary resource type mismatch. "
#                 f"Expected {resource_type}, "
#                 f"received {returned_resource_type}."
#             )

#         if not version:
#             raise RuntimeError(
#                 "Cloudinary upload failed: version missing."
#             )

#         # -----------------------------------------------------
#         # VALUE STORED IN DATABASE
#         # -----------------------------------------------------

#         # Example:
#         #
#         # video:product_media/sofa_91bc72d8e301.mp4|v1768254050
#         #
#         # Example:
#         #
#         # image:product_media/sofa_a82f91c72d10.jpg|v1768254000

#         stored_name = (
#             f"{resource_type}:"
#             f"{returned_public_id}"
#             f"{extension}"
#             f"|v{version}"
#         )

#         return stored_name

#     # =========================================================
#     # EXISTS
#     # =========================================================

#     def exists(self, name):
#         """
#         We deliberately return False.

#         Cloudinary manages the actual remote resource.
#         """

#         return False

#     # =========================================================
#     # PARSE STORED NAME
#     # =========================================================

#     def _parse_stored_name(self, name):
#         """
#         Convert the database value back into its components.

#         Supports the new format:

#             video:product_media/example.mp4|v123456

#         Also provides basic compatibility with older records.
#         """

#         name = self._clean_name(name)

#         resource_type = None
#         version = None

#         # -----------------------------------------------------
#         # RESOURCE TYPE
#         # -----------------------------------------------------

#         if ":" in name:
#             prefix, remainder = name.split(":", 1)

#             if prefix in {"image", "video"}:
#                 resource_type = prefix
#                 name = remainder

#         # -----------------------------------------------------
#         # VERSION
#         # -----------------------------------------------------

#         if "|v" in name:
#             name, version_string = name.rsplit(
#                 "|v",
#                 1,
#             )

#             try:
#                 version = int(version_string)
#             except (TypeError, ValueError):
#                 version = None

#         name = self._clean_name(name)

#         # -----------------------------------------------------
#         # BACKWARD COMPATIBILITY
#         # -----------------------------------------------------

#         if resource_type is None:
#             resource_type = self._get_resource_type(name)

#         # -----------------------------------------------------
#         # PUBLIC ID
#         # -----------------------------------------------------

#         public_id = os.path.splitext(name)[0]

#         if public_id.startswith(
#             f"{self.CLOUDINARY_FOLDER}/"
#         ):
#             public_id = public_id[
#                 len(self.CLOUDINARY_FOLDER) + 1:
#             ]

#         public_id = (
#             f"{self.CLOUDINARY_FOLDER}/{public_id}"
#         )

#         return {
#             "resource_type": resource_type,
#             "version": version,
#             "stored_name": name,
#             "public_id": public_id,
#         }

#     # =========================================================
#     # URL
#     # =========================================================

#     def url(self, name):
#         """
#         Generate the correct Cloudinary delivery URL.
#         """

#         if not name:
#             return ""

#         parsed = self._parse_stored_name(name)

#         resource_type = parsed["resource_type"]
#         version = parsed["version"]
#         public_id = parsed["public_id"]

#         cloud_name = cloudinary.config().cloud_name

#         if not cloud_name:
#             raise RuntimeError(
#                 "Cloudinary cloud_name is not configured."
#             )

#         if resource_type not in {"image", "video"}:
#             raise SuspiciousOperation(
#                 f"Unable to determine Cloudinary resource type "
#                 f"for stored media: {name}"
#             )

#         # -----------------------------------------------------
#         # CLOUDINARY URL
#         # -----------------------------------------------------

#         url, _ = cloudinary.utils.cloudinary_url(
#             public_id,
#             resource_type=resource_type,
#             type="upload",
#             version=version,
#             secure=True,
#         )

#         return url

#     # =========================================================
#     # DELETE
#     # =========================================================

#     def delete(self, name):
#         """
#         Delete the corresponding Cloudinary asset.
#         """

#         if not name:
#             return

#         parsed = self._parse_stored_name(name)

#         resource_type = parsed["resource_type"]
#         public_id = parsed["public_id"]

#         if resource_type not in {"image", "video"}:
#             return

#         try:
#             cloudinary.uploader.destroy(
#                 public_id,
#                 resource_type=resource_type,
#                 type="upload",
#                 invalidate=True,
#             )
#         except Exception:
#             # Do not prevent the database record from
#             # being deleted if Cloudinary no longer has
#             # the remote file.
#             pass

#     # =========================================================
#     # AVAILABLE NAME
#     # =========================================================

#     def get_available_name(
#         self,
#         name,
#         max_length=None,
#     ):
#         """
#         Return the requested name.

#         Our _save() method generates the actual unique
#         Cloudinary public ID.
#         """

#         return name

#     # =========================================================
#     # SIZE
#     # =========================================================

#     def size(self, name):
#         """
#         Size is stored remotely in Cloudinary.

#         We don't use Django's local filesystem size.
#         """

#         return 0

#     # =========================================================
#     # OPEN
#     # =========================================================

#     def _open(self, name, mode="rb"):
#         """
#         Product media is remote in Cloudinary.

#         The application should use file.url rather than
#         trying to open the file locally.
#         """

#         raise NotImplementedError(
#             "Product media is stored remotely on Cloudinary. "
#             "Use file.url instead."
#         )
