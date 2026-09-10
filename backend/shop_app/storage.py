# storage.py

import os

from cloudinary_storage.storage import MediaCloudinaryStorage


class ProductMediaCloudinaryStorage(MediaCloudinaryStorage):

    IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".bmp",
        ".tiff",
        ".svg",
        ".avif",
    }

    VIDEO_EXTENSIONS = {
        ".mp4",
        ".webm",
    }

    def _get_resource_type(self, name):
        extension = os.path.splitext(name)[1].lower()

        if extension in self.VIDEO_EXTENSIONS:
            return "video"

        if extension in self.IMAGE_EXTENSIONS:
            return "image"

        return "raw"