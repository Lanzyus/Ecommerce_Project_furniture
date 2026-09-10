# backend/shop_app/storage.py

import os

import cloudinary
import cloudinary.uploader

from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class ProductMediaCloudinaryStorage(Storage):
    """
    Cloudinary storage specifically for ProductMedia.

    Images are uploaded as Cloudinary image resources.

    Videos are uploaded as Cloudinary video resources.
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
        extension = os.path.splitext(
            str(filename)
        )[1].lower()

        if extension in self.VIDEO_EXTENSIONS:
            return "video"

        if extension in self.IMAGE_EXTENSIONS:
            return "image"

        return "auto"

    # =========================================================
    # CLEAN NAME
    # =========================================================

    def _clean_name(self, name):
        name = str(name).replace("\\", "/")
        return name.lstrip("/")

    # =========================================================
    # SAVE
    # =========================================================

    def _save(self, name, content):

        name = self._clean_name(name)

        resource_type = self._get_resource_type(
            name
        )

        try:
            content.seek(0)
        except Exception:
            pass

        filename = os.path.basename(name)

        filename_without_extension = os.path.splitext(
            filename
        )[0]

        public_id = filename_without_extension.strip()

        public_id = public_id.replace(
            " ",
            "_"
        )

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

        returned_public_id = result.get(
            "public_id"
        )

        if not returned_public_id:
            raise RuntimeError(
                "Cloudinary upload failed: "
                "no public_id returned."
            )

        return returned_public_id

    # =========================================================
    # EXISTS
    # =========================================================

    def exists(self, name):
        """
        Cloudinary generates unique filenames,
        so Django does not need to check first.
        """

        return False

    # =========================================================
    # URL
    # =========================================================

    def url(self, name):

        if not name:
            return ""

        name = self._clean_name(name)

        resource_type = self._get_resource_type(
            name
        )

        public_id = os.path.splitext(name)[0]

        public_id = public_id.replace(
            "\\",
            "/"
        )

        if public_id.startswith(
            "product_media/"
        ):
            public_id = public_id[
                len("product_media/"):
            ]

        cloud_name = cloudinary.config().cloud_name

        if not cloud_name:
            raise RuntimeError(
                "Cloudinary cloud_name is not configured."
            )

        if resource_type == "video":

            return (
                f"https://res.cloudinary.com/"
                f"{cloud_name}/"
                f"video/upload/"
                f"product_media/{public_id}"
            )

        return (
            f"https://res.cloudinary.com/"
            f"{cloud_name}/"
            f"image/upload/"
            f"product_media/{public_id}"
        )

    # =========================================================
    # DELETE
    # =========================================================

    def delete(self, name):

        if not name:
            return

        name = self._clean_name(name)

        resource_type = self._get_resource_type(
            name
        )

        public_id = os.path.splitext(name)[0]

        public_id = public_id.replace(
            "\\",
            "/"
        )

        if public_id.startswith(
            "product_media/"
        ):
            public_id = public_id[
                len("product_media/"):
            ]

        full_public_id = (
            f"product_media/{public_id}"
        )

        try:

            cloudinary.uploader.destroy(
                full_public_id,
                resource_type=resource_type,
                type="upload",
            )

        except Exception:

            # Do not prevent Django from deleting
            # the database record if the Cloudinary
            # resource no longer exists.
            pass

    # =========================================================
    # AVAILABLE NAME
    # =========================================================

    def get_available_name(
        self,
        name,
        max_length=None,
    ):
        return name

    # =========================================================
    # SIZE
    # =========================================================

    def size(self, name):
        return 0