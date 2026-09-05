import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../api";

const ProductMediaModal = ({
  show,
  onClose,
  media = [],
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  /*
   * Keep current index within the available media range
   */
  useEffect(() => {
    if (!media.length) {
      setCurrentIndex(0);
      return;
    }

    const safeIndex = Math.min(
      Math.max(initialIndex, 0),
      media.length - 1
    );

    setCurrentIndex(safeIndex);
  }, [initialIndex, media.length]);

  /*
   * Keyboard navigation
   */
  useEffect(() => {
    if (!show || !media.length) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        next();
      }

      if (event.key === "ArrowLeft") {
        prev();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, media.length]);

  /*
   * Do not render the modal if it is hidden
   * or there is no media.
   */
  if (!show || !media.length) {
    return null;
  }

  const currentMedia = media[currentIndex];

  /*
   * Build the correct media URL.
   */
  const getUrl = (file) => {
    if (!file) return "";

    if (
      file.startsWith("http://") ||
      file.startsWith("https://")
    ) {
      return file;
    }

    const baseUrl = BASE_URL?.replace(/\/$/, "");
    const filePath = file.startsWith("/")
      ? file
      : `/${file}`;

    return `${baseUrl}${filePath}`;
  };

  /*
   * Go to next media item
   */
  const next = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= media.length ? 0 : prev + 1
    );
  };

  /*
   * Go to previous media item
   */
  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? media.length - 1 : prev - 1
    );
  };

  /*
   * Close when clicking the background.
   * Prevent closing when clicking the media itself.
   */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        background: "rgba(0, 0, 0, 0.92)",
        zIndex: 9999,
      }}
      onClick={handleBackdropClick}
    >
      {/* CLOSE BUTTON */}
      <button
        type="button"
        className="btn btn-light position-absolute"
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

      {/* PREVIOUS BUTTON */}
      {media.length > 1 && (
        <button
          type="button"
          className="btn btn-light position-absolute"
          style={{
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10001,
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            fontSize: "24px",
          }}
          onClick={prev}
          aria-label="Previous media"
        >
          ❮
        </button>
      )}

      {/* NEXT BUTTON */}
      {media.length > 1 && (
        <button
          type="button"
          className="btn btn-light position-absolute"
          style={{
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10001,
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            fontSize: "24px",
          }}
          onClick={next}
          aria-label="Next media"
        >
          ❯
        </button>
      )}

      {/* MAIN MEDIA */}
      <div
        className="d-flex justify-content-center align-items-center w-100 h-100"
        style={{
          padding: "70px 90px 120px",
        }}
      >
        {currentMedia.media_type === "video" ? (
          <video
            key={currentMedia.id || currentMedia.file}
            controls
            autoPlay
            playsInline
            style={{
              maxHeight: "85vh",
              maxWidth: "90vw",
              objectFit: "contain",
            }}
          >
            <source
              src={getUrl(currentMedia.file)}
              type={currentMedia.mime_type || "video/mp4"}
            />

            Your browser does not support video playback.
          </video>
        ) : (
          <img
            key={currentMedia.id || currentMedia.file}
            src={getUrl(currentMedia.file)}
            alt="Product media"
            style={{
              maxHeight: "85vh",
              maxWidth: "90vw",
              objectFit: "contain",
              userSelect: "none",
            }}
          />
        )}
      </div>

      {/* MEDIA COUNTER */}
      <div
        className="position-absolute text-white"
        style={{
          top: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "15px",
          zIndex: 10001,
        }}
      >
        {currentIndex + 1} / {media.length}
      </div>

      {/* THUMBNAILS */}
      {media.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 p-3"
          style={{
            maxWidth: "95%",
            overflowX: "auto",
            zIndex: 10001,
          }}
        >
          {media.map((item, index) => (
            <button
              key={item.id || `${item.file}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label={`View media ${index + 1}`}
            >
              {item.media_type === "video" ? (
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "#222",
                    border:
                      currentIndex === index
                        ? "3px solid orange"
                        : "2px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "28px",
                  }}
                >
                  ▶
                </div>
              ) : (
                <img
                  src={getUrl(item.file)}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    border:
                      currentIndex === index
                        ? "3px solid orange"
                        : "2px solid white",
                    display: "block",
                  }}
                />
              )}
            </button>
          ))}
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
//         {currentMedia.media_type ===
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
//         )}
//       </div>

//       {/* THUMBNAILS */}
//       <div
//         className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 p-3"
//       >
//         {media.map((item, index) => (
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
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductMediaModal;