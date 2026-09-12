# ============================================================
# PRODUCT MEDIA CLOUDINARY STORAGE
# ============================================================
#
# This storage backend handles ProductMedia files using
# Cloudinary.
#
# It supports:
#
#   - Images
#   - Videos
#
# The most important goals are:
#
#   1. Every upload gets a UNIQUE Cloudinary public_id.
#   2. Images are delivered through /image/upload/
#   3. Videos are delivered through /video/upload/
#   4. Cloudinary's version is preserved.
#   5. Browser/CDN caching does not cause an old asset to
#      appear after a new upload.
#   6. Existing Django code can continue using:
#
#          obj.file.url
#
# ============================================================

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
    Cloudinary storage specifically for ProductMedia.

    Every uploaded file receives a unique Cloudinary public_id.

    Example image:

        Original:
            sofa_def.jpg

        Cloudinary:
            product_media/sofa_def_a82f91c72d10

        Django stored value:

            image:product_media/sofa_def_a82f91c72d10.jpg|v1768254000


    Example video:

        Original:
            sofa_video.mp4

        Cloudinary:
            product_media/sofa_video_91bc72d8e301

        Django stored value:

            video:product_media/sofa_video_91bc72d8e301.mp4|v1768254050


    The stored value allows the URL method to know:

        - resource type
        - public ID
        - original extension
        - Cloudinary version

    without having to guess later.
    """

    # ========================================================
    # CLOUDINARY FOLDER
    # ========================================================

    CLOUDINARY_FOLDER = "product_media"

    # ========================================================
    # ALLOWED IMAGE EXTENSIONS
    # ========================================================

    IMAGE_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".avif",
        ".gif",
    }

    # ========================================================
    # ALLOWED VIDEO EXTENSIONS
    # ========================================================

    VIDEO_EXTENSIONS = {
        ".mp4",
        ".webm",
        ".mov",
        ".m4v",
        ".avi",
        ".mkv",
    }

    # ========================================================
    # RESOURCE TYPE
    # ========================================================

    def _get_resource_type(self, filename):
        """
        Determine whether a file is an image or video.

        We use the ORIGINAL filename/extension during upload.

        After the file is uploaded, we do not try to determine
        the resource type from the Cloudinary public_id.

        That is important because Cloudinary public_ids normally
        do not contain the original file extension.
        """

        extension = os.path.splitext(
            str(filename)
        )[1].lower()

        # ----------------------------------------------------
        # Video
        # ----------------------------------------------------

        if extension in self.VIDEO_EXTENSIONS:
            return "video"

        # ----------------------------------------------------
        # Image
        # ----------------------------------------------------

        if extension in self.IMAGE_EXTENSIONS:
            return "image"

        # ----------------------------------------------------
        # Unsupported file
        # ----------------------------------------------------

        return None

    # ========================================================
    # CLEAN NAME
    # ========================================================

    def _clean_name(self, name):
        """
        Normalize a Django storage filename.

        This converts Windows backslashes to forward slashes
        and removes leading slashes.
        """

        return (
            str(name)
            .replace("\\", "/")
            .lstrip("/")
        )

    # ========================================================
    # SAFE PUBLIC ID
    # ========================================================

    def _make_safe_public_id(self, filename):
        """
        Convert the original filename into a safe Cloudinary
        public ID component.

        Example:

            "My Sofa Photo (Final).jpg"

        becomes:

            "My_Sofa_Photo_Final"
        """

        # ----------------------------------------------------
        # Remove extension.
        # ----------------------------------------------------

        filename_without_extension = os.path.splitext(
            filename
        )[0]

        # ----------------------------------------------------
        # Replace whitespace with underscores.
        # ----------------------------------------------------

        filename_without_extension = re.sub(
            r"\s+",
            "_",
            filename_without_extension,
        )

        # ----------------------------------------------------
        # Keep only safe characters.
        #
        # We keep:
        #
        # letters
        # numbers
        # underscores
        # hyphens
        # ----------------------------------------------------

        safe_name = re.sub(
            r"[^A-Za-z0-9_-]",
            "_",
            filename_without_extension,
        )

        # ----------------------------------------------------
        # Remove repeated underscores.
        # ----------------------------------------------------

        safe_name = re.sub(
            r"_+",
            "_",
            safe_name,
        )

        # ----------------------------------------------------
        # Remove underscores from beginning/end.
        # ----------------------------------------------------

        safe_name = safe_name.strip("_")

        # ----------------------------------------------------
        # Fallback if filename is empty or contains only
        # unsupported characters.
        # ----------------------------------------------------

        if not safe_name:
            safe_name = "product_media"

        return safe_name

    # ========================================================
    # SAVE
    # ========================================================

    def _save(self, name, content):
        """
        Upload a ProductMedia file to Cloudinary.

        IMPORTANT:

        The public_id is intentionally UNIQUE.

        We do NOT use:

            public_id = filename

        because filenames are not unique.

        Instead:

            filename + UUID

        is used.

        Example:

            sofa_def_a82f91c72d10
        """

        # ----------------------------------------------------
        # Normalize filename.
        # ----------------------------------------------------

        name = self._clean_name(name)

        # ----------------------------------------------------
        # Get original filename.
        # ----------------------------------------------------

        filename = os.path.basename(name)

        # ----------------------------------------------------
        # Get extension.
        # ----------------------------------------------------

        extension = os.path.splitext(
            filename
        )[1].lower()

        # ----------------------------------------------------
        # Determine resource type.
        # ----------------------------------------------------

        resource_type = self._get_resource_type(
            filename
        )

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # Do not allow "auto" here.
        #
        # ProductMedia only supports image/video.
        #
        # If we allow "auto", a bad/unsupported file could
        # become a Cloudinary "raw" resource and then our URL
        # generation would be incorrect.
        # ----------------------------------------------------

        if resource_type is None:

            raise SuspiciousOperation(
                "Unsupported product media format. "
                "Allowed image formats: JPG, JPEG, PNG, "
                "WEBP, AVIF, GIF. "
                "Allowed video formats: MP4, WEBM, MOV, "
                "M4V, AVI, MKV."
            )

        # ----------------------------------------------------
        # Reset file pointer.
        #
        # This is important when Django has already read part
        # of the uploaded file.
        # ----------------------------------------------------

        try:
            content.seek(0)
        except Exception:
            pass

        # ----------------------------------------------------
        # Create a safe version of the original filename.
        # ----------------------------------------------------

        safe_filename = self._make_safe_public_id(
            filename
        )

        # ----------------------------------------------------
        # Generate a truly unique identifier.
        #
        # Example:
        #
        # a82f91c72d10
        # ----------------------------------------------------

        unique_id = uuid.uuid4().hex[:12]

        # ----------------------------------------------------
        # FINAL CLOUDINARY PUBLIC ID
        #
        # Example:
        #
        # sofa_def_a82f91c72d10
        #
        # Another upload with the exact same filename:
        #
        # sofa_def_91bc72d8e301
        #
        # Therefore there is NO collision.
        # ----------------------------------------------------

        public_id = (
            f"{safe_filename}_{unique_id}"
        )

        # ----------------------------------------------------
        # Upload to Cloudinary.
        #
        # We explicitly specify the resource type because we
        # already determined it from the original file.
        #
        # This guarantees:
        #
        # image -> Cloudinary image
        # video -> Cloudinary video
        # ----------------------------------------------------

        result = cloudinary.uploader.upload(
            content,
            folder=self.CLOUDINARY_FOLDER,
            public_id=public_id,

            # ------------------------------------------------
            # IMPORTANT:
            #
            # We already know the resource type, so don't use
            # "auto" here.
            # ------------------------------------------------

            resource_type=resource_type,

            # ------------------------------------------------
            # Never overwrite another upload.
            #
            # Because our public_id contains a UUID, this is
            # safe.
            # ------------------------------------------------

            overwrite=False,

            # ------------------------------------------------
            # We are providing our own public_id.
            #
            # Therefore unique_filename is unnecessary.
            # ------------------------------------------------

            unique_filename=False,

            # ------------------------------------------------
            # Don't let Cloudinary derive another filename
            # from the original upload.
            # ------------------------------------------------

            use_filename=False,

            # ------------------------------------------------
            # Secure HTTPS delivery.
            # ------------------------------------------------

            secure=True,
        )

        # ====================================================
        # VALIDATE CLOUDINARY RESPONSE
        # ====================================================

        returned_public_id = result.get(
            "public_id"
        )

        returned_resource_type = result.get(
            "resource_type"
        )

        returned_version = result.get(
            "version"
        )

        # ----------------------------------------------------
        # public_id is mandatory.
        # ----------------------------------------------------

        if not returned_public_id:

            raise SuspiciousOperation(
                "Cloudinary upload failed: "
                "no public_id was returned."
            )

        # ----------------------------------------------------
        # resource_type is mandatory.
        # ----------------------------------------------------

        if returned_resource_type not in {
            "image",
            "video",
        }:

            raise SuspiciousOperation(
                "Cloudinary returned an unsupported "
                f"resource type: {returned_resource_type}"
            )

        # ----------------------------------------------------
        # version is important for cache busting.
        # ----------------------------------------------------

        if returned_version is None:

            raise SuspiciousOperation(
                "Cloudinary upload failed: "
                "no version was returned."
            )

        # ====================================================
        # STORE METADATA IN DJANGO'S FILE NAME
        # ====================================================
        #
        # Example:
        #
        # image:product_media/sofa_def_a82f91c72d10.jpg|v1768254000
        #
        # or:
        #
        # video:product_media/sofa_video_91bc72d8e301.mp4|v1768254050
        #
        # ====================================================

        stored_name = (
            f"{returned_resource_type}:"
            f"{returned_public_id}"
            f"{extension}"
            f"|v{returned_version}"
        )

        return stored_name

    # ========================================================
    # EXISTS
    # ========================================================

    def exists(self, name):
        """
        Always return False.

        Cloudinary assets are remote and every upload receives
        a unique public_id.

        Returning False allows Django to proceed with the
        upload rather than trying to treat Cloudinary like a
        local filesystem.
        """

        return False

    # ========================================================
    # PARSE STORED NAME
    # ========================================================

    def _parse_stored_name(self, name):
        """
        Parse the custom filename stored in Django.

        New format:

            image:product_media/sofa_abc123.jpg|v1768254000

        Returns:

            resource_type
            stored_name
            version
            public_id

        """

        name = self._clean_name(name)

        # ----------------------------------------------------
        # Default values.
        # ----------------------------------------------------

        resource_type = None
        version = None
        stored_name = name

        # ====================================================
        # RESOURCE TYPE
        # ====================================================

        if ":" in stored_name:

            possible_resource_type, remainder = (
                stored_name.split(":", 1)
            )

            if possible_resource_type in {
                "image",
                "video",
            }:

                resource_type = (
                    possible_resource_type
                )

                stored_name = remainder

        # ====================================================
        # VERSION
        # ====================================================

        # ----------------------------------------------------
        # New format ends with:
        #
        # |v1768254000
        # ----------------------------------------------------

        version_match = re.search(
            r"\|v(\d+)$",
            stored_name,
        )

        if version_match:

            version = int(
                version_match.group(1)
            )

            stored_name = stored_name[
                :version_match.start()
            ]

        # ====================================================
        # PUBLIC ID
        # ====================================================

        # ----------------------------------------------------
        # The extension was intentionally stored after the
        # public_id so that Django can retain information about
        # the original file.
        #
        # We remove it before generating the Cloudinary URL.
        # ----------------------------------------------------

        public_id = os.path.splitext(
            stored_name
        )[0]

        # ----------------------------------------------------
        # BACKWARD COMPATIBILITY
        # ----------------------------------------------------
        #
        # Old records may not contain:
        #
        # resource_type
        #
        # or:
        #
        # version
        #
        # In that case, try the old extension-based method.
        #
        # IMPORTANT:
        #
        # An old video whose database value has NO extension
        # cannot be automatically identified as a video.
        # Such old records need to be re-uploaded.
        # ----------------------------------------------------

        if resource_type is None:

            resource_type = (
                self._get_resource_type(
                    stored_name
                )
            )

        return {
            "resource_type": resource_type,
            "stored_name": stored_name,
            "version": version,
            "public_id": public_id,
        }

    # ========================================================
    # URL
    # ========================================================

    def url(self, name):
        """
        Generate the correct Cloudinary delivery URL.

        IMAGE:

            /image/upload/vVERSION/PUBLIC_ID

        VIDEO:

            /video/upload/vVERSION/PUBLIC_ID

        Example image:

            https://res.cloudinary.com/tkmeq34s/
            image/upload/v1768254000/
            product_media/sofa_def_a82f91c72d10

        Example video:

            https://res.cloudinary.com/tkmeq34s/
            video/upload/v1768254050/
            product_media/sofa_video_91bc72d8e301
        """

        # ----------------------------------------------------
        # Empty value.
        # ----------------------------------------------------

        if not name:
            return ""

        # ----------------------------------------------------
        # Parse stored value.
        # ----------------------------------------------------

        parsed = self._parse_stored_name(
            name
        )

        resource_type = parsed[
            "resource_type"
        ]

        public_id = parsed[
            "public_id"
        ]

        version = parsed[
            "version"
        ]

        # ----------------------------------------------------
        # If resource type is still unknown, fail loudly.
        #
        # This is much safer than accidentally serving a video
        # through /image/upload/.
        # ----------------------------------------------------

        if resource_type not in {
            "image",
            "video",
        }:

            raise SuspiciousOperation(
                "Unable to determine Cloudinary resource "
                f"type for media: {name}"
            )

        # ----------------------------------------------------
        # Get Cloudinary cloud name.
        # ----------------------------------------------------

        cloud_name = cloudinary.config().cloud_name

        # ----------------------------------------------------
        # Make sure Cloudinary is configured.
        # ----------------------------------------------------

        if not cloud_name:

            raise RuntimeError(
                "Cloudinary cloud_name is not configured."
            )

        # ====================================================
        # GENERATE URL
        # ====================================================

        # ----------------------------------------------------
        # Use Cloudinary's URL helper.
        #
        # We explicitly pass:
        #
        # resource_type
        # version
        # type=upload
        # secure=True
        #
        # This prevents videos from accidentally becoming
        # image URLs.
        # ----------------------------------------------------

        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="upload",
            version=version,
            secure=True,
        )

        return url

    # ========================================================
    # DELETE
    # ========================================================

    def delete(self, name):
        """
        Delete a Cloudinary asset.

        The resource type is taken from the stored metadata,
        rather than guessed from the current filename.
        """

        # ----------------------------------------------------
        # Nothing to delete.
        # ----------------------------------------------------

        if not name:
            return

        # ----------------------------------------------------
        # Parse stored filename.
        # ----------------------------------------------------

        parsed = self._parse_stored_name(
            name
        )

        resource_type = parsed[
            "resource_type"
        ]

        public_id = parsed[
            "public_id"
        ]

        # ----------------------------------------------------
        # Only image/video resources are supported.
        # ----------------------------------------------------

        if resource_type not in {
            "image",
            "video",
        }:

            return

        # ----------------------------------------------------
        # Delete from Cloudinary.
        # ----------------------------------------------------

        try:

            cloudinary.uploader.destroy(
                public_id,
                resource_type=resource_type,
                type="upload",

                # --------------------------------------------
                # Invalidate cached CDN copies.
                # --------------------------------------------

                invalidate=True,
            )

        except Exception:
            # ------------------------------------------------
            # Do not allow Cloudinary cleanup failure to crash
            # Django's delete operation.
            #
            # The database record can still be deleted.
            # ------------------------------------------------

            pass

    # ========================================================
    # AVAILABLE NAME
    # ========================================================

    def get_available_name(
        self,
        name,
        max_length=None,
    ):
        """
        Return the name unchanged.

        We generate a UUID during _save(), so there is no need
        for Django to generate a second filename.
        """

        return name

    # ========================================================
    # SIZE
    # ========================================================

    def size(self, name):
        """
        Product media lives remotely on Cloudinary.

        Django's local filesystem size isn't available here.

        Return 0 as a safe fallback.
        """

        return 0

    # ========================================================
    # OPEN
    # ========================================================

    def _open(self, name, mode="rb"):
        """
        Product media is remotely hosted on Cloudinary.

        The application should use file.url instead of trying
        to open the remote asset as a local Django file.
        """

        raise NotImplementedError(
            "Product media is stored remotely on Cloudinary. "
            "Use file.url to access the media."
        )
