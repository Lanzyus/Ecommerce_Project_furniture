import React, { useState, useEffect, useMemo } from "react";
import { BASE_URL } from "../../api";

const ProductMediaModal = ({
  show,
  onClose,
  media = [],
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [videoErrors, setVideoErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  /*
   * ---------------------------------------------------------
   * NORMALIZE MEDIA
   * ---------------------------------------------------------
   */

  const normalizedMedia = useMemo(() => {
    if (!Array.isArray(media)) {
      return [];
    }

    return media.filter(Boolean);
  }, [media]);

  /*
   * ---------------------------------------------------------
   * RESET CURRENT INDEX
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (normalizedMedia.length === 0) {
      setCurrentIndex(0);
      return;
    }

    const safeIndex = Math.min(
      Math.max(Number(initialIndex) || 0, 0),
      normalizedMedia.length - 1
    );

    setCurrentIndex(safeIndex);
  }, [initialIndex, normalizedMedia.length]);

  /*
   * ---------------------------------------------------------
   * PREVENT BACKGROUND SCROLL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!show) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [show]);

  /*
   * ---------------------------------------------------------
   * KEYBOARD CONTROLS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!show) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        goNext();
        return;
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, normalizedMedia.length]);

  /*
   * ---------------------------------------------------------
   * GET CURRENT MEDIA
   * ---------------------------------------------------------
   */

  const currentMedia =
    normalizedMedia.length > 0
      ? normalizedMedia[currentIndex]
      : null;

  /*
   * ---------------------------------------------------------
   * GET MEDIA FILE
   *
   * Supports:
   *   file_url
   *   file
   *   url
   * ---------------------------------------------------------
   */

  const getMediaFile = (item) => {
    if (!item) {
      return "";
    }

    return (
      item.file_url ||
      item.file ||
      item.url ||
      ""
    );
  };

  /*
   * ---------------------------------------------------------
   * GET URL
   * ---------------------------------------------------------
   */

  const getUrl = (file) => {
    if (!file) {
      return "";
    }

    if (typeof file !== "string") {
      return "";
    }

    const cleanFile = file.trim();

    if (!cleanFile) {
      return "";
    }

    /*
     * Absolute URLs
     *
     * Examples:
     * https://res.cloudinary.com/...
     * http://127.0.0.1:8001/...
     * https://example.com/...
     */

    if (
      cleanFile.startsWith("http://") ||
      cleanFile.startsWith("https://") ||
      cleanFile.startsWith("//")
    ) {
      return cleanFile;
    }

    /*
     * Data URLs
     */

    if (cleanFile.startsWith("data:")) {
      return cleanFile;
    }

    /*
     * Make sure BASE_URL does not create:
     *
     * http://127.0.0.1:8001//media/...
     */

    const base = String(BASE_URL || "").replace(/\/+$/, "");

    const path = cleanFile.startsWith("/")
      ? cleanFile
      : `/${cleanFile}`;

    return `${base}${path}`;
  };

  /*
   * ---------------------------------------------------------
   * DETERMINE MEDIA TYPE
   * ---------------------------------------------------------
   */

  const getMediaType = (item) => {
    if (!item) {
      return "image";
    }

    /*
     * Prefer backend media_type
     */

    if (
      item.media_type &&
      String(item.media_type).toLowerCase() === "video"
    ) {
      return "video";
    }

    /*
     * Support type/mediaType if your API uses those names
     */

    if (
      item.type &&
      String(item.type).toLowerCase() === "video"
    ) {
      return "video";
    }

    if (
      item.mediaType &&
      String(item.mediaType).toLowerCase() === "video"
    ) {
      return "video";
    }

    /*
     * Check MIME type
     */

    const mimeType =
      item.mime_type ||
      item.mimeType ||
      item.content_type ||
      item.contentType ||
      "";

    if (
      String(mimeType)
        .toLowerCase()
        .startsWith("video/")
    ) {
      return "video";
    }

    /*
     * Check file extension
     */

    const file = getMediaFile(item);

    const cleanFile = file
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();

    const videoExtensions = [
      ".mp4",
      ".webm",
      ".ogg",
      ".mov",
      ".m4v",
      ".avi",
      ".mkv",
      ".wmv",
      ".3gp",
    ];

    if (
      videoExtensions.some((extension) =>
        cleanFile.endsWith(extension)
      )
    ) {
      return "video";
    }

    /*
     * Cloudinary video URLs normally contain /video/upload/
     */

    if (
      cleanFile.includes("/video/upload/")
    ) {
      return "video";
    }

    return "image";
  };

  /*
   * ---------------------------------------------------------
   * CLOUDINARY VIDEO THUMBNAIL
   * ---------------------------------------------------------
   *
   * Cloudinary can generate an image frame from a video.
   *
   * Example:
   *
   * /video/upload/v123/folder/video.mp4
   *
   * becomes:
   *
   * /video/upload/so_0/video.mp4.jpg
   *
   * We also support URLs where Cloudinary is returning
   * /image/upload/ incorrectly, but this only works if the
   * actual Cloudinary resource is a video.
   * ---------------------------------------------------------
   */

  const getVideoThumbnail = (url) => {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(url);

      if (
        !parsedUrl.hostname.includes(
          "res.cloudinary.com"
        )
      ) {
        return "";
      }

      const pathname = parsedUrl.pathname;

      if (
        !pathname.includes("/upload/")
      ) {
        return "";
      }

      /*
       * Correct Cloudinary video URL.
       */

      if (
        pathname.includes("/video/upload/")
      ) {
        const marker = "/video/upload/";

        const index = pathname.indexOf(marker);

        const before = pathname.substring(
          0,
          index + marker.length
        );

        const after = pathname.substring(
          index + marker.length
        );

        /*
         * Remove version if present only for the
         * transformation position handling.
         */

        return `${parsedUrl.origin}${before}so_0/${after}.jpg`;
      }

      /*
       * If backend incorrectly returns /image/upload/
       * we do NOT blindly assume it is a video.
       *
       * Return empty so the video can use a fallback.
       */

      return "";
    } catch (error) {
      console.warn(
        "Unable to generate Cloudinary video thumbnail:",
        error
      );

      return "";
    }
  };

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  const goNext = () => {
    if (normalizedMedia.length <= 1) {
      return;
    }

    setCurrentIndex(
      (previous) =>
        (previous + 1) %
        normalizedMedia.length
    );
  };

  const goPrevious = () => {
    if (normalizedMedia.length <= 1) {
      return;
    }

    setCurrentIndex(
      (previous) =>
        previous === 0
          ? normalizedMedia.length - 1
          : previous - 1
    );
  };

  /*
   * ---------------------------------------------------------
   * ERROR HANDLERS
   * ---------------------------------------------------------
   */

  const handleVideoError = (index, event) => {
    console.error(
      "MAIN PRODUCT VIDEO FAILED",
      {
        index,
        url: event?.currentTarget?.currentSrc,
        media: normalizedMedia[index],
        error: event?.currentTarget?.error || null,
      }
    );

    setVideoErrors((previous) => ({
      ...previous,
      [index]: true,
    }));
  };

  const handleImageError = (index, event) => {
    console.error(
      "PRODUCT IMAGE FAILED",
      {
        index,
        url: event?.currentTarget?.src,
        media: normalizedMedia[index],
      }
    );

    setImageErrors((previous) => ({
      ...previous,
      [index]: true,
    }));
  };

  /*
   * ---------------------------------------------------------
   * CLOSE ON BACKDROP CLICK
   * ---------------------------------------------------------
   */

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /*
   * ---------------------------------------------------------
   * DO NOT RENDER
   * ---------------------------------------------------------
   */

  if (!show) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * EMPTY MEDIA
   * ---------------------------------------------------------
   */

  if (!currentMedia) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{
          background: "rgba(0, 0, 0, 0.92)",
          zIndex: 9999,
        }}
      >
        <button
          type="button"
          className="btn btn-light position-absolute"
          style={{
            top: "20px",
            right: "20px",
            zIndex: 10001,
            fontSize: "22px",
            width: "45px",
            height: "45px",
            borderRadius: "50%",
          }}
          onClick={onClose}
          aria-label="Close media viewer"
        >
          ✕
        </button>

        <div className="text-white text-center">
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            📷
          </div>

          <h5>No product media available</h5>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * CURRENT MEDIA DATA
   * ---------------------------------------------------------
   */

  const currentFile = getMediaFile(
    currentMedia
  );

  const currentUrl = getUrl(currentFile);

  const currentType =
    getMediaType(currentMedia);

  const currentVideoThumbnail =
    currentType === "video"
      ? getVideoThumbnail(currentUrl)
      : "";

  const currentVideoFailed =
    Boolean(videoErrors[currentIndex]);

  const currentImageFailed =
    Boolean(imageErrors[currentIndex]);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        background: "rgba(0, 0, 0, 0.92)",
        zIndex: 9999,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Product media viewer"
    >
      {/* =====================================================
          CLOSE BUTTON
          ===================================================== */}

      <button
        type="button"
        className="btn btn-light position-absolute shadow"
        style={{
          top: "20px",
          right: "20px",
          zIndex: 10001,
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          fontSize: "20px",
          fontWeight: "bold",
        }}
        onClick={onClose}
        aria-label="Close media viewer"
      >
        ✕
      </button>

      {/* =====================================================
          PREVIOUS BUTTON
          ===================================================== */}

      {normalizedMedia.length > 1 && (
        <button
          type="button"
          className="btn btn-light position-absolute shadow"
          style={{
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10001,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            fontSize: "22px",
            fontWeight: "bold",
          }}
          onClick={goPrevious}
          aria-label="Previous product media"
        >
          ❮
        </button>
      )}

      {/* =====================================================
          NEXT BUTTON
          ===================================================== */}

      {normalizedMedia.length > 1 && (
        <button
          type="button"
          className="btn btn-light position-absolute shadow"
          style={{
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10001,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            fontSize: "22px",
            fontWeight: "bold",
          }}
          onClick={goNext}
          aria-label="Next product media"
        >
          ❯
        </button>
      )}

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div
        className="d-flex justify-content-center align-items-center w-100 h-100"
        style={{
          padding:
            normalizedMedia.length > 1
              ? "70px 80px 150px"
              : "70px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* ===================================================
            VIDEO
            =================================================== */}

        {currentType === "video" ? (
          currentVideoFailed ? (
            <div
              className="text-white text-center"
              style={{
                maxWidth: "700px",
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                  marginBottom: "20px",
                }}
              >
                ▶
              </div>

              <h5>
                Unable to play this video
              </h5>

              <p
                className="text-white-50 mb-3"
                style={{
                  wordBreak: "break-word",
                }}
              >
                The product video could not be
                loaded.
              </p>

              {currentUrl && (
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  Open Video
                </a>
              )}
            </div>
          ) : (
            <video
              key={currentUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={
                currentVideoThumbnail || undefined
              }
              onError={(event) =>
                handleVideoError(
                  currentIndex,
                  event
                )
              }
              style={{
                maxHeight: "calc(100vh - 180px)",
                maxWidth: "90vw",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                background: "#000",
              }}
            >
              <source
                src={currentUrl}
                type={
                  currentMedia.mime_type ||
                  currentMedia.mimeType ||
                  "video/mp4"
                }
              />

              Your browser does not support
              HTML5 video.
            </video>
          )
        ) : currentImageFailed ? (
          /* =================================================
             IMAGE ERROR
             ================================================= */

          <div
            className="text-white text-center"
            style={{
              maxWidth: "700px",
            }}
          >
            <div
              style={{
                fontSize: "60px",
                marginBottom: "20px",
              }}
            >
              🖼️
            </div>

            <h5>
              Unable to load this image
            </h5>

            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-light"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                Open Image
              </a>
            )}
          </div>
        ) : (
          /* =================================================
             IMAGE
             ================================================= */

          <img
            key={currentUrl}
            src={currentUrl}
            alt={
              currentMedia.alt_text ||
              currentMedia.title ||
              "Product media"
            }
            onError={(event) =>
              handleImageError(
                currentIndex,
                event
              )
            }
            style={{
              maxHeight:
                "calc(100vh - 180px)",
              maxWidth: "90vw",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        )}
      </div>

      {/* =====================================================
          MEDIA COUNTER
          ===================================================== */}

      {normalizedMedia.length > 1 && (
        <div
          className="position-absolute text-white"
          style={{
            top: "25px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            background:
              "rgba(0, 0, 0, 0.55)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "14px",
          }}
        >
          {currentIndex + 1} /{" "}
          {normalizedMedia.length}
        </div>
      )}

      {/* =====================================================
          THUMBNAILS
          ===================================================== */}

      {normalizedMedia.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x d-flex align-items-center gap-2 p-3"
          style={{
            maxWidth: "95vw",
            overflowX: "auto",
            zIndex: 10000,
            background:
              "rgba(0, 0, 0, 0.45)",
            borderRadius: "12px 12px 0 0",
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {normalizedMedia.map(
            (item, index) => {
              const itemFile =
                getMediaFile(item);

              const itemUrl =
                getUrl(itemFile);

              const itemType =
                getMediaType(item);

              const videoThumbnail =
                itemType === "video"
                  ? getVideoThumbnail(
                      itemUrl
                    )
                  : "";

              return (
                <button
                  type="button"
                  key={
                    item.id ??
                    `${itemUrl}-${index}`
                  }
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`View media ${
                    index + 1
                  }`}
                  style={{
                    padding: 0,
                    border:
                      currentIndex === index
                        ? "3px solid #ffffff"
                        : "2px solid rgba(255,255,255,0.6)",
                    borderRadius: "7px",
                    background:
                      "rgba(255,255,255,0.1)",
                    width: "75px",
                    height: "75px",
                    flex: "0 0 auto",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {itemType === "video" ? (
                    videoThumbnail ? (
                      <img
                        src={videoThumbnail}
                        alt={`Video ${
                          index + 1
                        }`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          background:
                            "#222",
                          color: "#fff",
                          fontSize: "28px",
                        }}
                      >
                        ▶
                      </div>
                    )
                  ) : (
                    <img
                      src={itemUrl}
                      alt={`Product ${
                        index + 1
                      }`}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}

                  {/* VIDEO INDICATOR */}

                  {itemType === "video" && (
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform:
                          "translate(-50%, -50%)",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background:
                          "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize: "14px",
                        pointerEvents: "none",
                      }}
                    >
                      ▶
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default ProductMediaModal;
