import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { BASE_URL } from "../../api";

const ProductMediaModal = ({
  show,
  onClose,
  media = [],
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoErrors, setVideoErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" &&
      window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const videoRef = useRef(null);
  const contentRef = useRef(null);

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
   * GET MEDIA FILE
   *
   * Supports:
   * file_url
   * file
   * url
   * image
   * image_url
   * video
   * video_url
   * media_url
   * src
   * thumbnail
   * ---------------------------------------------------------
   */
  const getMediaFile = useCallback((item) => {
    if (!item) {
      return "";
    }

    if (typeof item === "string") {
      return item;
    }

    /*
     * Django REST Framework may sometimes return:
     *
     * {
     *   file: "..."
     * }
     *
     * or:
     *
     * {
     *   file: {
     *      url: "..."
     *   }
     * }
     */

    const possibleFile =
      item.file_url ||
      item.file ||
      item.url ||
      item.media_url ||
      item.image_url ||
      item.image ||
      item.video_url ||
      item.video ||
      item.src ||
      "";

    if (typeof possibleFile === "string") {
      return possibleFile;
    }

    if (
      possibleFile &&
      typeof possibleFile === "object"
    ) {
      return (
        possibleFile.url ||
        possibleFile.file_url ||
        possibleFile.path ||
        ""
      );
    }

    return "";
  }, []);

  /*
   * ---------------------------------------------------------
   * GET URL
   * ---------------------------------------------------------
   */
  const getUrl = useCallback((file) => {
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
     * Blob URLs
     */
    if (cleanFile.startsWith("blob:")) {
      return cleanFile;
    }

    /*
     * BASE_URL should normally be something like:
     *
     * http://127.0.0.1:8001
     *
     * or:
     *
     * https://yourdomain.com
     */
    const base = String(BASE_URL || "").replace(
      /\/+$/,
      ""
    );

    /*
     * Make sure the path starts with /
     */
    const path = cleanFile.startsWith("/")
      ? cleanFile
      : `/${cleanFile}`;

    return `${base}${path}`;
  }, []);

  /*
   * ---------------------------------------------------------
   * DETERMINE MEDIA TYPE
   * ---------------------------------------------------------
   */
  const getMediaType = useCallback(
    (item) => {
      if (!item) {
        return "image";
      }

      /*
       * Explicit backend media type
       */
      const explicitType =
        item.media_type ||
        item.mediaType ||
        item.type ||
        item.content_type ||
        item.contentType ||
        "";

      if (
        String(explicitType)
          .toLowerCase()
          .includes("video")
      ) {
        return "video";
      }

      /*
       * MIME type
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
       * Check video-specific fields
       */
      if (
        item.video ||
        item.video_url ||
        item.videoUrl
      ) {
        return "video";
      }

      /*
       * File extension
       */
      const file = getMediaFile(item);

      const cleanFile = String(file)
        .split("?")[0]
        .split("#")[0]
        .toLowerCase();

      const videoExtensions = [
        ".mp4",
        ".webm",
        ".ogg",
        ".ogv",
        ".mov",
        ".m4v",
        ".avi",
        ".mkv",
        ".wmv",
        ".3gp",
        ".mpeg",
        ".mpg",
      ];

      if (
        videoExtensions.some((extension) =>
          cleanFile.endsWith(extension)
        )
      ) {
        return "video";
      }

      /*
       * Cloudinary video URL
       */
      if (
        cleanFile.includes("/video/upload/")
      ) {
        return "video";
      }

      return "image";
    },
    [getMediaFile]
  );

  /*
   * ---------------------------------------------------------
   * CLOUDINARY VIDEO THUMBNAIL
   * ---------------------------------------------------------
   */
  const getVideoThumbnail = useCallback(
    (url) => {
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
          !pathname.includes("/video/upload/")
        ) {
          return "";
        }

        const marker = "/video/upload/";

        const index = pathname.indexOf(marker);

        if (index === -1) {
          return "";
        }

        const before = pathname.substring(
          0,
          index + marker.length
        );

        let after = pathname.substring(
          index + marker.length
        );

        /*
         * Remove query/hash
         */
        after = after
          .split("?")[0]
          .split("#")[0];

        /*
         * If Cloudinary URL contains transformations,
         * this remains compatible with most URLs.
         *
         * Example:
         *
         * /video/upload/v123/folder/video.mp4
         *
         * becomes:
         *
         * /video/upload/so_0/v123/folder/video.mp4.jpg
         */
        return `${parsedUrl.origin}${before}so_0/${after}.jpg`;
      } catch (error) {
        console.warn(
          "Unable to generate Cloudinary video thumbnail:",
          error
        );

        return "";
      }
    },
    []
  );

  /*
   * ---------------------------------------------------------
   * GET THUMBNAIL
   * ---------------------------------------------------------
   */
  const getThumbnailUrl = useCallback(
    (item) => {
      if (!item) {
        return "";
      }

      const thumbnail =
        item.thumbnail_url ||
        item.thumbnailUrl ||
        item.thumbnail ||
        item.preview_url ||
        item.previewUrl ||
        item.poster ||
        item.poster_url ||
        item.posterUrl ||
        "";

      if (thumbnail) {
        return getUrl(thumbnail);
      }

      const itemType = getMediaType(item);

      if (itemType === "video") {
        const videoUrl = getUrl(
          getMediaFile(item)
        );

        return getVideoThumbnail(videoUrl);
      }

      return getUrl(getMediaFile(item));
    },
    [
      getUrl,
      getMediaFile,
      getMediaType,
      getVideoThumbnail,
    ]
  );

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
   * RESET ERRORS WHEN MEDIA CHANGES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    setVideoErrors({});
    setImageErrors({});
    setThumbnailErrors({});
  }, [media]);

  /*
   * ---------------------------------------------------------
   * PREVENT BACKGROUND SCROLL
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [show]);

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */
  const goNext = useCallback(() => {
    if (normalizedMedia.length <= 1) {
      return;
    }

    setCurrentIndex((previous) => {
      return (
        (previous + 1) %
        normalizedMedia.length
      );
    });
  }, [normalizedMedia.length]);

  const goPrevious = useCallback(() => {
    if (normalizedMedia.length <= 1) {
      return;
    }

    setCurrentIndex((previous) => {
      return previous === 0
        ? normalizedMedia.length - 1
        : previous - 1;
    });
  }, [normalizedMedia.length]);

  /*
   * ---------------------------------------------------------
   * KEYBOARD CONTROLS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose();
          break;

        case "ArrowRight":
          event.preventDefault();
          goNext();
          break;

        case "ArrowLeft":
          event.preventDefault();
          goPrevious();
          break;

        default:
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    show,
    onClose,
    goNext,
    goPrevious,
  ]);

  /*
   * ---------------------------------------------------------
   * STOP VIDEO WHEN MEDIA CHANGES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch (error) {
        console.warn(
          "Unable to reset video:",
          error
        );
      }
    }
  }, [currentIndex]);

  /*
   * ---------------------------------------------------------
   * TOUCH / SWIPE SUPPORT
   * ---------------------------------------------------------
   */
  const handleTouchStart = (event) => {
    if (!event.touches?.length) {
      return;
    }

    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (
      touchStartX === null ||
      !event.changedTouches?.length
    ) {
      return;
    }

    const endX =
      event.changedTouches[0].clientX;

    const difference =
      touchStartX - endX;

    const minimumSwipeDistance = 50;

    if (
      Math.abs(difference) >=
      minimumSwipeDistance
    ) {
      if (difference > 0) {
        goNext();
      } else {
        goPrevious();
      }
    }

    setTouchStartX(null);
  };

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
   * ERROR HANDLERS
   * ---------------------------------------------------------
   */
  const handleVideoError = (
    index,
    event
  ) => {
    console.error(
      "MAIN PRODUCT VIDEO FAILED",
      {
        index,
        url:
          event?.currentTarget?.currentSrc ||
          event?.currentTarget?.src ||
          "",
        media:
          normalizedMedia[index],
        error:
          event?.currentTarget?.error ||
          null,
      }
    );

    setVideoErrors((previous) => ({
      ...previous,
      [index]: true,
    }));
  };

  const handleImageError = (
    index,
    event
  ) => {
    console.error(
      "PRODUCT IMAGE FAILED",
      {
        index,
        url:
          event?.currentTarget?.src ||
          "",
        media:
          normalizedMedia[index],
      }
    );

    setImageErrors((previous) => ({
      ...previous,
      [index]: true,
    }));
  };

  const handleThumbnailError = (
    index
  ) => {
    setThumbnailErrors((previous) => ({
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
    if (
      event.target === event.currentTarget
    ) {
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
          background:
            "rgba(0, 0, 0, 0.92)",
          zIndex: 9999,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Product media viewer"
      >
        <button
          type="button"
          className="btn btn-light position-absolute shadow"
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

        <div className="text-white text-center px-3">
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            📷
          </div>

          <h5>
            No product media available
          </h5>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * CURRENT MEDIA DATA
   * ---------------------------------------------------------
   */
  const currentFile =
    getMediaFile(currentMedia);

  const currentUrl =
    getUrl(currentFile);

  const currentType =
    getMediaType(currentMedia);

  const currentVideoThumbnail =
    currentType === "video"
      ? getThumbnailUrl(currentMedia)
      : "";

  const currentVideoFailed =
    Boolean(videoErrors[currentIndex]);

  const currentImageFailed =
    Boolean(imageErrors[currentIndex]);

  /*
   * ---------------------------------------------------------
   * VIDEO MIME TYPE
   * ---------------------------------------------------------
   */
  const currentMimeType =
    currentMedia.mime_type ||
    currentMedia.mimeType ||
    currentMedia.content_type ||
    currentMedia.contentType ||
    "video/mp4";

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        background:
          "rgba(0, 0, 0, 0.92)",
        zIndex: 9999,
        touchAction: "pan-y",
      }}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
          top: "15px",
          right: "15px",
          zIndex: 10001,
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          fontSize: "20px",
          fontWeight: "bold",
          lineHeight: 1,
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close media viewer"
      >
        ✕
      </button>

      {/* =====================================================
          MEDIA COUNTER
          ===================================================== */}
      {normalizedMedia.length > 1 && (
        <div
          className="position-absolute text-white"
          style={{
            top: "20px",
            left: "50%",
            transform:
              "translateX(-50%)",
            zIndex: 10000,
            background:
              "rgba(0, 0, 0, 0.60)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          {currentIndex + 1} /{" "}
          {normalizedMedia.length}
        </div>
      )}

      {/* =====================================================
          PREVIOUS BUTTON
          ===================================================== */}
      {normalizedMedia.length > 1 && !isMobile && (
        <button
          type="button"
          className="btn btn-light position-absolute shadow"
          style={{
            left: "15px",
            top: "50%",
            transform:
              "translateY(-50%)",
            zIndex: 10001,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            fontSize: "22px",
            fontWeight: "bold",
            lineHeight: 1,
          }}
          onClick={(event) => {
            event.stopPropagation();
            goPrevious();
          }}
          aria-label="Previous product media"
        >
          ❮
        </button>
      )}

      {/* =====================================================
          NEXT BUTTON
          ===================================================== */}
      {normalizedMedia.length > 1 && !isMobile && (
        <button
          type="button"
          className="btn btn-light position-absolute shadow"
          style={{
            right: "15px",
            top: "50%",
            transform:
              "translateY(-50%)",
            zIndex: 10001,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            fontSize: "22px",
            fontWeight: "bold",
            lineHeight: 1,
          }}
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          aria-label="Next product media"
        >
          ❯
        </button>
      )}

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}
      <div
        ref={contentRef}
        className="d-flex justify-content-center align-items-center w-100 h-100"
        style={{
          padding: isMobile
            ? "50px 12px 120px"
            : normalizedMedia.length > 1
            ? "70px 70px 140px"
            : "70px 60px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* ===================================================
            VIDEO
            =================================================== */}
        {currentType === "video" ? (
          currentVideoFailed ? (
            <div
              className="text-white text-center px-3"
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
                The product video could
                not be loaded.
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
              ref={videoRef}
              key={currentUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={
                currentVideoThumbnail ||
                undefined
              }
              onError={(event) =>
                handleVideoError(
                  currentIndex,
                  event
                )
              }
              style={{
                maxHeight: isMobile
                  ? "calc(100vh - 160px)"
                  : "calc(100vh - 190px)",
                maxWidth: isMobile
                  ? "96vw"
                  : "90vw",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                background: "#000",
                display: "block",
              }}
            >
              <source
                src={currentUrl}
                type={currentMimeType}
              />

              Your browser does not
              support HTML5 video.
            </video>
          )
        ) : currentImageFailed ? (
          /* =================================================
             IMAGE ERROR
             ================================================= */
          <div
            className="text-white text-center px-3"
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

            <p className="text-white-50">
              The product image could
              not be loaded.
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
              currentMedia.altText ||
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
              maxHeight: isMobile
                ? "calc(100vh - 160px)"
                : "calc(100vh - 190px)",
              maxWidth: isMobile
                ? "96vw"
                : "90vw",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
              display: "block",
            }}
          />
        )}
      </div>

      {/* =====================================================
          THUMBNAILS
          ===================================================== */}
      {normalizedMedia.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x d-flex align-items-center gap-2 p-3"
          style={{
            width: "auto",
            maxWidth: "95vw",
            overflowX: "auto",
            overflowY: "hidden",
            zIndex: 10000,
            background:
              "rgba(0, 0, 0, 0.55)",
            borderRadius:
              "12px 12px 0 0",
            scrollbarWidth: "thin",
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
          onTouchStart={(event) =>
            event.stopPropagation()
          }
          onTouchEnd={(event) =>
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

              const thumbnailUrl =
                getThumbnailUrl(item);

              const thumbnailFailed =
                Boolean(
                  thumbnailErrors[index]
                );

              const isActive =
                currentIndex === index;

              return (
                <button
                  type="button"
                  key={
                    item.id ??
                    item.pk ??
                    `${itemUrl}-${index}`
                  }
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`View media ${
                    index + 1
                  }`}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  style={{
                    padding: 0,
                    border: isActive
                      ? "3px solid #ffffff"
                      : "2px solid rgba(255,255,255,0.6)",
                    borderRadius: "7px",
                    background:
                      "rgba(255,255,255,0.1)",
                    width: "75px",
                    height: "75px",
                    minWidth: "75px",
                    flex:
                      "0 0 75px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    boxSizing:
                      "border-box",
                  }}
                >
                  {thumbnailUrl &&
                  !thumbnailFailed ? (
                    <img
                      src={thumbnailUrl}
                      alt={`Product ${
                        index + 1
                      }`}
                      onError={() =>
                        handleThumbnailError(
                          index
                        )
                      }
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
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "#222",
                        color: "#fff",
                        fontSize:
                          itemType ===
                          "video"
                            ? "28px"
                            : "25px",
                      }}
                    >
                      {itemType ===
                      "video"
                        ? "▶"
                        : "🖼️"}
                    </div>
                  )}

                  {/* =========================================
                      VIDEO INDICATOR
                      ========================================= */}
                  {itemType ===
                    "video" && (
                    <>
                      <span
                        style={{
                          position:
                            "absolute",
                          left: "50%",
                          top: "50%",
                          transform:
                            "translate(-50%, -50%)",
                          width: "30px",
                          height: "30px",
                          borderRadius:
                            "50%",
                          background:
                            "rgba(0, 0, 0, 0.72)",
                          color: "#fff",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontSize: "13px",
                          pointerEvents:
                            "none",
                        }}
                      >
                        ▶
                      </span>

                      <span
                        style={{
                          position:
                            "absolute",
                          left: "4px",
                          bottom: "4px",
                          background:
                            "rgba(0,0,0,0.75)",
                          color: "#fff",
                          padding:
                            "2px 5px",
                          borderRadius:
                            "3px",
                          fontSize: "9px",
                          fontWeight:
                            "bold",
                          pointerEvents:
                            "none",
                        }}
                      >
                        VIDEO
                      </span>
                    </>
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











// import React, { useState, useEffect } from "react";
// import { BASE_URL } from "../../api";

// const ProductMediaModal = ({
//   show,
//   onClose,
//   media,
//   initialIndex = 0,
// }) => {
//   const [currentIndex, setCurrentIndex] =
//     useState(initialIndex);

//   useEffect(() => {
//     setCurrentIndex(initialIndex);
//   }, [initialIndex]);

//   if (!show) return null;

//   const currentMedia =
//     media[currentIndex];

//   const getUrl = (file) => {
//     if (!file) return "";

//     return file.startsWith("http")
//       ? file
//       : `${BASE_URL}${file}`;
//   };

//   const next = () => {
//     setCurrentIndex(
//       (prev) =>
//         (prev + 1) % media.length
//     );
//   };

//   const prev = () => {
//     setCurrentIndex(
//       (prev) =>
//         prev === 0
//           ? media.length - 1
//           : prev - 1
//     );
//   };

//   return (
//     <div
//       className="position-fixed top-0 start-0 w-100 h-100"
//       style={{
//         background:
//           "rgba(0,0,0,0.9)",
//         zIndex: 9999,
//       }}
//     >
//       {/* CLOSE */}
//       <button
//         className="btn btn-light position-absolute"
//         style={{
//           top: "20px",
//           right: "20px",
//           zIndex: 10000,
//         }}
//         onClick={onClose}
//       >
//         ✕
//       </button>

//       {/* PREVIOUS */}
//       <button
//         className="btn btn-light position-absolute"
//         style={{
//           left: "20px",
//           top: "50%",
//           transform:
//             "translateY(-50%)",
//         }}
//         onClick={prev}
//       >
//         ❮
//       </button>

//       {/* NEXT */}
//       <button
//         className="btn btn-light position-absolute"
//         style={{
//           right: "20px",
//           top: "50%",
//           transform:
//             "translateY(-50%)",
//         }}
//         onClick={next}
//       >
//         ❯
//       </button>

//       {/* MAIN CONTENT */}
//       <div
//         className="d-flex justify-content-center align-items-center h-100"
//       >
//         {currentMedia.media_type === "video" ? (
//           <video controls autoPlay style={{ maxHeight: "90%", maxWidth: "90%" }}>
//             <source src={getUrl(currentMedia.file_url)} />
//           </video>
//         ) : (
//           <img
//             src={getUrl(currentMedia.file_url)}
//             alt=""
//             style={{ maxHeight: "90%", maxWidth: "90%", objectFit: "contain" }}
//           />
//         )}

//         {/* {currentMedia.media_type ===
//         "video" ? (
//           <video
//             controls
//             autoPlay
//             style={{
//               maxHeight: "90%",
//               maxWidth: "90%",
//             }}
//           >
//             <source
//               src={getUrl(
//                 currentMedia.file
//               )}
//             />
//           </video>
//         ) : (
//           <img
//             src={getUrl(
//               currentMedia.file
//             )}
//             alt=""
//             style={{
//               maxHeight: "90%",
//               maxWidth: "90%",
//               objectFit: "contain",
//             }}
//           />
//         )} */}
//       </div>

//       {/* THUMBNAILS */}
//       <div
//         className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 p-3"
//       >
//         {/* {media.map((item, index) => (
//           <img
//             key={item.id}
//             src={getUrl(item.file)}
//             alt=""
//             onClick={() =>
//               setCurrentIndex(index)
//             }
//             style={{
//               width: "70px",
//               height: "70px",
//               objectFit: "cover",
//               cursor: "pointer",
//               border:
//                 currentIndex === index
//                   ? "3px solid orange"
//                   : "2px solid white",
//             }}
//           />
//         ))} */}

//         {media.map((item, index) => (
//           <img
//             key={item.id}
//             src={getUrl(item.file_url)}   {/* was item.file */}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductMediaModal;
