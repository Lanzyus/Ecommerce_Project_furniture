import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../api";

const ProductMediaModal = ({
  show,
  onClose,
  media,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] =
    useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!show) return null;

  const currentMedia =
    media[currentIndex];

  const getUrl = (file) => {
    if (!file) return "";

    return file.startsWith("http")
      ? file
      : `${BASE_URL}${file}`;
  };

  const next = () => {
    setCurrentIndex(
      (prev) =>
        (prev + 1) % media.length
    );
  };

  const prev = () => {
    setCurrentIndex(
      (prev) =>
        prev === 0
          ? media.length - 1
          : prev - 1
    );
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        background:
          "rgba(0,0,0,0.9)",
        zIndex: 9999,
      }}
    >
      {/* CLOSE */}
      <button
        className="btn btn-light position-absolute"
        style={{
          top: "20px",
          right: "20px",
          zIndex: 10000,
        }}
        onClick={onClose}
      >
        ✕
      </button>

      {/* PREVIOUS */}
      <button
        className="btn btn-light position-absolute"
        style={{
          left: "20px",
          top: "50%",
          transform:
            "translateY(-50%)",
        }}
        onClick={prev}
      >
        ❮
      </button>

      {/* NEXT */}
      <button
        className="btn btn-light position-absolute"
        style={{
          right: "20px",
          top: "50%",
          transform:
            "translateY(-50%)",
        }}
        onClick={next}
      >
        ❯
      </button>

      {/* MAIN CONTENT */}
      <div
        className="d-flex justify-content-center align-items-center h-100"
      >
        {currentMedia.media_type ===
        "video" ? (
          <video
            controls
            autoPlay
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
            }}
          >
            <source
              src={getUrl(
                currentMedia.file
              )}
            />
          </video>
        ) : (
          <img
            src={getUrl(
              currentMedia.file
            )}
            alt=""
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      {/* THUMBNAILS */}
      <div
        className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 p-3"
      >
        {media.map((item, index) => (
          <img
            key={item.id}
            src={getUrl(item.file)}
            alt=""
            onClick={() =>
              setCurrentIndex(index)
            }
            style={{
              width: "70px",
              height: "70px",
              objectFit: "cover",
              cursor: "pointer",
              border:
                currentIndex === index
                  ? "3px solid orange"
                  : "2px solid white",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductMediaModal;