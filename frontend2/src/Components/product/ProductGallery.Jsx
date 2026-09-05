import { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../../api";
import ProductMediaModal from "./ProductMediaModal";

export default function ProductGallery({ media = [] }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const videoRef = useRef(null);

  useEffect(() => {
    if (media.length > 0) {
      const primary =
        media.find((item) => item.is_primary) || media[0];

      setSelectedMedia(primary);
    } else {
      setSelectedMedia(null);
    }
  }, [media]);

  useEffect(() => {
    if (
      selectedMedia &&
      isVideo(selectedMedia) &&
      videoRef.current
    ) {
      videoRef.current.load();

      videoRef.current
        .play()
        .catch((error) => {
          console.log("Video autoplay prevented:", error);
        });
    }
  }, [selectedMedia]);

  const getMediaUrl = (file) => {
    if (!file) return null;

    if (file.startsWith("http")) {
      return file;
    }

    return `${BASE_URL}${file}`;
  };

  const isVideo = (item) => {
    if (!item) return false;

    if (
      item.media_type &&
      item.media_type.toLowerCase() === "video"
    ) {
      return true;
    }

    const file = item.file || "";

    return /\.(mp4|webm|ogg|mov)$/i.test(file);
  };

  if (!media.length) {
    return (
      <div className="border rounded p-5 text-center">
        No media available
      </div>
    );
  }

  const selectedUrl = selectedMedia
    ? getMediaUrl(selectedMedia.file)
    : null;

  return (
    <>
      <div className="d-flex gap-3">
        {/* THUMBNAILS */}
        <div
          style={{
            width: "90px",
            maxHeight: "650px",
            overflowY: "auto",
          }}
        >
          {media.map((item) => {
            const mediaUrl = getMediaUrl(item.file);

            return (
              <div
                key={item.id}
                onClick={() => {
                  console.log("Selected media:", item);
                  console.log("Media URL:", mediaUrl);

                  setSelectedMedia(item);
                }}
                style={{
                  width: "80px",
                  height: "80px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  border:
                    selectedMedia?.id === item.id
                      ? "2px solid orange"
                      : "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {!mediaUrl ? (
                  <div
                    className="d-flex align-items-center justify-content-center h-100"
                    style={{
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    No Media
                  </div>
                ) : isVideo(item) ? (
                  <>
                    <video
                      src={mediaUrl}
                      muted
                      preload="metadata"
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform:
                          "translate(-50%, -50%)",
                        background:
                          "rgba(0,0,0,0.6)",
                        color: "white",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                    >
                      ▶
                    </div>
                  </>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Product"
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* MAIN MEDIA */}
        <div className="border rounded p-3 flex-grow-1 bg-white">
          {selectedMedia ? (
            isVideo(selectedMedia) ? (
              selectedUrl ? (
                <video
                  ref={videoRef}
                  key={selectedMedia.id}
                  controls
                  className="w-100"
                  preload="metadata"
                  playsInline
                  style={{
                    height: "650px",
                    objectFit: "contain",
                    background: "#000",
                  }}
                  onError={(e) => {
                    console.error(
                      "Video failed to load:",
                      selectedUrl
                    );

                    console.error(
                      "Video error:",
                      e.currentTarget.error
                    );
                  }}
                >
                  <source
                    src={selectedUrl}
                    type="video/mp4"
                  />

                  Your browser does not support
                  video playback.
                </video>
              ) : (
                <div className="text-center p-5">
                  No Video Available
                </div>
              )
            ) : selectedUrl ? (
              <img
                src={selectedUrl}
                alt="Product"
                className="w-100"
                style={{
                  height: "650px",
                  objectFit: "contain",
                  cursor: "zoom-in",
                }}
                onClick={() => {
                  const index = media.findIndex(
                    (item) =>
                      item.id === selectedMedia.id
                  );

                  setModalIndex(index);
                  setShowModal(true);
                }}
              />
            ) : (
              <div className="text-center p-5">
                No Image Available
              </div>
            )
          ) : (
            <div className="text-center p-5">
              No Media Selected
            </div>
          )}
        </div>
      </div>

      <ProductMediaModal
        show={showModal}
        onClose={() => setShowModal(false)}
        media={media}
        initialIndex={modalIndex}
      />
    </>
  );
}









// import { useState, useEffect } from "react";
// import { BASE_URL } from "../../api";
// import ProductMediaModal from "./ProductMediaModal";

// export default function ProductGallery({
//   media = [],
// }) {
//   const [selectedMedia, setSelectedMedia] =
//     useState(null);

//   const [showModal, setShowModal] =
//     useState(false);

//   const [modalIndex, setModalIndex] =
//     useState(0);

//   useEffect(() => {
//     if (media.length > 0) {
//       const primary =
//         media.find(
//           (item) => item.is_primary
//         ) || media[0];

//       setSelectedMedia(primary);
//     } else {
//       setSelectedMedia(null);
//     }
//   }, [media]);

//   const getMediaUrl = (file) => {
//     if (!file) return null;

//     return file.startsWith("http")
//       ? file
//       : `${BASE_URL}${file}`;
//   };

//   if (!media.length) {
//     return (
//       <div className="border rounded p-5 text-center">
//         No media available
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="d-flex gap-3">

//         {/* THUMBNAILS */}
//         <div
//           style={{
//             width: "90px",
//             maxHeight: "650px",
//             overflowY: "auto",
//           }}
//         >
//           {media.map((item) => {
//             const mediaUrl =
//               getMediaUrl(item.file);

//             return (
//               <div
//                 key={item.id}
//                 onClick={() =>
//                   setSelectedMedia(item)
//                 }
//                 style={{
//                   width: "80px",
//                   height: "80px",
//                   cursor: "pointer",
//                   marginBottom: "10px",
//                   border:
//                     selectedMedia?.id ===
//                     item.id
//                       ? "2px solid orange"
//                       : "1px solid #ddd",
//                   borderRadius: "8px",
//                   overflow: "hidden",
//                 }}
//               >
//                 {!mediaUrl ? (
//                   <div
//                     className="d-flex align-items-center justify-content-center h-100"
//                     style={{
//                       fontSize: "12px",
//                       color: "#888",
//                     }}
//                   >
//                     No Media
//                   </div>
//                 ) : item.media_type ===
//                   "video" ? (
//                   <video
//                     src={mediaUrl}
//                     muted
//                     preload="metadata"
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 ) : (
//                   <img
//                     src={mediaUrl}
//                     alt="Product"
//                     loading="lazy"
//                     style={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                     }}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* MAIN MEDIA */}
//         <div className="border rounded p-3 flex-grow-1 bg-white">
//           {selectedMedia ? (
//             selectedMedia.media_type ===
//             "video" ? (
//               getMediaUrl(
//                 selectedMedia.file
//               ) && (
//                 <video
//                   controls
//                   autoPlay
//                   className="w-100"
//                   style={{
//                     height: "650px",
//                     objectFit: "contain",
//                   }}
//                 >
//                   <source
//                     src={getMediaUrl(
//                       selectedMedia.file
//                     )}
//                   />
//                   Your browser does not
//                   support video playback.
//                 </video>
//               )
//             ) : getMediaUrl(
//                 selectedMedia.file
//               ) ? (
//               <img
//                 src={getMediaUrl(
//                   selectedMedia.file
//                 )}
//                 alt="Product"
//                 className="w-100"
//                 style={{
//                   height: "650px",
//                   objectFit: "contain",
//                   cursor: "zoom-in",
//                 }}
//                 onClick={() => {
//                   const index =
//                     media.findIndex(
//                       (item) =>
//                         item.id ===
//                         selectedMedia.id
//                     );

//                   setModalIndex(index);
//                   setShowModal(true);
//                 }}
//               />
//             ) : (
//               <div className="text-center p-5">
//                 No Image Available
//               </div>
//             )
//           ) : (
//             <div className="text-center p-5">
//               No Media Selected
//             </div>
//           )}
//         </div>
//       </div>

//       {/* MODAL */}
//       <ProductMediaModal
//         show={showModal}
//         onClose={() =>
//           setShowModal(false)
//         }
//         media={media}
//         initialIndex={modalIndex}
//       />
//     </>
//   );
// }










// import { useState, useEffect } from "react";
// import { BASE_URL } from "../../api";
// import ProductMediaModal from "./ProductMediaModal";

// export default function ProductGallery({
// media = [],
// }) {
// const [selectedMedia, setSelectedMedia] =
// useState(null);

// const [showModal, setShowModal] =
// useState(false);

// const [modalIndex, setModalIndex] =
// useState(0);

// useEffect(() => {
// if (media.length > 0) {
// const primary =
// media.find(
// (item) => item.is_primary
// ) || media[0];


//   setSelectedMedia(primary);
// }


// }, [media]);

// const getMediaUrl = (file) => {
// if (!file) return "";


// return file.startsWith("http")
//   ? file
//   : `${BASE_URL}${file}`;


// };

// if (!media.length) {
// return ( <div className="border rounded p-5 text-center">
// No media available </div>
// );
// }

// return (
// <> <div className="d-flex gap-3">


//     {/* THUMBNAILS */}
//     <div
//       style={{
//         width: "90px",
//         maxHeight: "650px",
//         overflowY: "auto",
//       }}
//     >
//       {media.map((item) => (
//         <div
//           key={item.id}
//           onClick={() =>
//             setSelectedMedia(item)
//           }
//           style={{
//             width: "80px",
//             height: "80px",
//             cursor: "pointer",
//             marginBottom: "10px",
//             border:
//               selectedMedia?.id ===
//               item.id
//                 ? "2px solid orange"
//                 : "1px solid #ddd",
//             borderRadius: "8px",
//             overflow: "hidden",
//           }}
//         >
//           {item.media_type ===
//           "video" ? (
//             <video
//               src={getMediaUrl(
//                 item.file
//               )}
//               muted
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit:
//                   "cover",
//               }}
//             />
//           ) : (
//             <img
//               src={getMediaUrl(
//                 item.file
//               )}
//               alt=""
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit:
//                   "cover",
//               }}
//             />
//           )}
//         </div>
//       ))}
//     </div>

//     {/* MAIN MEDIA */}
//     <div className="border rounded p-3 flex-grow-1 bg-white">

//       {selectedMedia?.media_type ===
//       "video" ? (
//         <video
//           controls
//           autoPlay
//           className="w-100"
//           style={{
//             height: "650px",
//             objectFit: "contain",
//           }}
//         >
//           <source
//             src={getMediaUrl(
//               selectedMedia.file
//             )}
//           />
//         </video>
//       ) : (
//         <img
//           src={getMediaUrl(
//             selectedMedia?.file
//           )}
//           alt=""
//           className="w-100"
//           style={{
//             height: "650px",
//             objectFit: "contain",
//             cursor: "zoom-in",
//           }}
//           onClick={() => {
//             const index =
//               media.findIndex(
//                 (item) =>
//                   item.id ===
//                   selectedMedia.id
//               );

//             setModalIndex(index);
//             setShowModal(true);
//           }}
//         />
//       )}

//     </div>

//   </div>

//   {/* MODAL */}
//   <ProductMediaModal
//     show={showModal}
//     onClose={() =>
//       setShowModal(false)
//     }
//     media={media}
//     initialIndex={modalIndex}
//   />
// </>

// );
// }















// import { useState, useEffect } from "react";
// import { BASE_URL } from "../../api";
// import ProductMediaModal from "./ProductMediaModal";

// export default function ProductGallery({ media = [] }) {
//   const [selectedMedia, setSelectedMedia] =
//     useState(null);
//   const [showModal, setShowModal] =
//     useState(false);

//   const [modalIndex, setModalIndex] =
//     useState(0);


//   useEffect(() => {
//     if (media.length > 0) {
//       const primary =
//         media.find((item) => item.is_primary) ||
//         media[0];

//       setSelectedMedia(primary);
//     }
//   }, [media]);

//   const getMediaUrl = (file) => {
//     if (!file) return "";

//     if (file.startsWith("http")) {
//       return file;
//     }

//     return `${BASE_URL}${file}`;
//   };

//   if (!media.length) {
//     return (
//       <div className="border p-5 rounded">
//         No media available
//       </div>
//     );
//   }

//   return (
//     <div className="d-flex gap-3">

//       {/* THUMBNAILS */}
//       <div
//         style={{
//           width: "90px",
//           maxHeight: "650px",
//           overflowY: "auto",
//         }}
//       >
//         {media.map((item) => (
//           <div
//             key={item.id}
//             onClick={() =>
//               setSelectedMedia(item)
//             }
//             style={{
//               width: "80px",
//               height: "80px",
//               cursor: "pointer",
//               marginBottom: "10px",
//               border:
//                 selectedMedia?.id === item.id
//                   ? "2px solid orange"
//                   : "1px solid #ddd",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             {item.media_type === "video" ? (
//               <video
//                 src={getMediaUrl(item.file)}
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                 }}
//               />
//             ) : (
//               // <img
//               //   src={getMediaUrl(item.file)}
//               //   alt=""
//               //   style={{
//               //     width: "100%",
//               //     height: "100%",
//               //     objectFit: "cover",
//               //   }}
//               // />
//             <img
//             src={getMediaUrl(
//               selectedMedia?.file
//             )}
//             alt=""
//             className="w-100"
//             style={{
//               height: "650px",
//               objectFit: "contain",
//               cursor: "zoom-in",
//             }}
//             onClick={() => {
//               const index =
//                 media.findIndex(
//                   (item) =>
//                     item.id ===
//                     selectedMedia.id
//                 );

//               setModalIndex(index);
//               setShowModal(true);
//             }}
//           />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* MAIN MEDIA */}
//       <div
//         className="border rounded p-3 flex-grow-1 bg-white"
//       >
//         {selectedMedia?.media_type ===
//         "video" ? (
//           <video
//             controls
//             autoPlay
//             className="w-100"
//             style={{
//               height: "650px",
//               objectFit: "contain",
//             }}
//           >
//             <source
//               src={getMediaUrl(
//                 selectedMedia.file
//               )}
//             />
//           </video>
//         ) : (
//           <img
//             src={getMediaUrl(
//               selectedMedia?.file
//             )}
//             alt=""
//             className="w-100"
//             style={{
//               height: "650px",
//               objectFit: "contain",
//             }}
//           />
//         )}
//       </div>

//     </div>
//   );
// }
// <ProductMediaModal
//   show={showModal}
//   onClose={() =>
//     setShowModal(false)
//   }
//   media={media}
//   initialIndex={modalIndex}
// />
// export default ProductGallery;


// import { useState, useEffect } from "react";
// import { BASE_URL } from "../../api";

// export default function ProductGallery({ media = [] }) {
//   const [selectedImage, setSelectedImage] = useState(null);

//   useEffect(() => {
//     if (media.length > 0) {
//       const primary =
//         media.find((img) => img.is_primary) ||
//         media[0];

//       setSelectedImage(primary);
//     }
//   }, [media]);

//   if (!media.length) {
//     return (
//       <div className="border rounded p-5 text-center">
//         No images available
//       </div>
//     );
//   }

//   const getImageUrl = (file) => {
//     if (!file) return "/placeholder.jpg";

//     if (file.startsWith("http")) {
//       return file;
//     }

//     return `${BASE_URL}${file}`;
//   };

//   return (
//     <div className="d-flex gap-3">

//       {/* THUMBNAILS */}
//       <div
//         style={{
//           width: "90px",
//           maxHeight: "650px",
//           overflowY: "auto",
//         }}
//       >
//         {media.map((image) => (
//           <img
//             key={image.id}
//             src={getImageUrl(image.file)}
//             alt=""
//             onClick={() =>
//               setSelectedImage(image)
//             }
//             onError={(e) => {
//               console.log(
//                 "Thumbnail failed:",
//                 image.file
//               );
//             }}
//             style={{
//               width: "80px",
//               height: "80px",
//               objectFit: "cover",
//               cursor: "pointer",
//               marginBottom: "10px",
//               border:
//                 selectedImage?.id === image.id
//                   ? "2px solid orange"
//                   : "1px solid #ddd",
//               borderRadius: "8px",
//             }}
//           />
//         ))}
//       </div>

//       {/* MAIN IMAGE */}
//       <div
//         className="border bg-white rounded p-3 flex-grow-1"
//       >
//         <img
//           src={getImageUrl(
//             selectedImage?.file
//           )}
//           alt=""
//           onError={(e) => {
//             console.log(
//               "Main image failed:",
//               selectedImage?.file
//             );
//             e.target.src =
//               "/placeholder.jpg";
//           }}
//           style={{
//             width: "100%",
//             height: "650px",
//             objectFit: "contain",
//           }}
//         />
//       </div>

//     </div>
//   );
// }









// import { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight, X } from "lucide-react";
// import styles from "./ProductGallery.module.css";

// export default function ProductGallery({ media = [] }) {
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     if (media.length > 0) {
//       setSelectedIndex(0);
//     }
//   }, [media]);

//   if (!media.length) {
//     return (
//       <div className={styles.galleryEmpty}>
//         <p>No product images available</p>
//       </div>
//     );
//   }

//   const currentImage = media[selectedIndex];

//   const nextImage = () => {
//     setSelectedIndex((prev) =>
//       prev === media.length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevImage = () => {
//     setSelectedIndex((prev) =>
//       prev === 0 ? media.length - 1 : prev - 1
//     );
//   };

//   return (
//     <>
//       <div className={styles.temuGallery}>

//         {/* Thumbnail Column */}
//         <div className={styles.thumbnailColumn}>
//           {media.map((image, index) => (
//             <img
//               key={image.id || index}
//               src={`http://127.0.0.1:8001${image.file}`}
//               alt={`Thumbnail ${index + 1}`}
//               onClick={() => setSelectedIndex(index)}
//               className={`${styles.thumbnail} ${
//                 selectedIndex === index ? styles.active : ""
//               }`}
//             />
//           ))}
//         </div>

//         {/* Main Image */}
//         <div className={styles.mainImageContainer}>

//           {media.length > 1 && (
//             <>
//               <button
//                 type="button"
//                 className={`${styles.galleryArrow} ${styles.left}`}
//                 onClick={prevImage}
//               >
//                 <ChevronLeft size={28} />
//               </button>

//               <button
//                 type="button"
//                 className={`${styles.galleryArrow} ${styles.right}`}
//                 onClick={nextImage}
//               >
//                 <ChevronRight size={28} />
//               </button>
//             </>
//           )}

//           <img
//             src={`http://127.0.0.1:8001${currentImage.file}`}
//             alt="Product"
//             className={styles.mainImage}
//             onClick={() => setShowModal(true)}
//           />
//         </div>

//       </div>

//       {/* Fullscreen Modal */}
//       {showModal && (
//         <div
//           className={styles.imageModal}
//           onClick={() => setShowModal(false)}
//         >
//           <div
//             className={styles.modalContent}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               type="button"
//               className={styles.closeBtn}
//               onClick={() => setShowModal(false)}
//             >
//               <X size={32} />
//             </button>

//             {media.length > 1 && (
//               <>
//                 <button
//                   type="button"
//                   className={`${styles.modalArrow} ${styles.modalLeft}`}
//                   onClick={prevImage}
//                 >
//                   <ChevronLeft size={40} />
//                 </button>

//                 <button
//                   type="button"
//                   className={`${styles.modalArrow} ${styles.modalRight}`}
//                   onClick={nextImage}
//                 >
//                   <ChevronRight size={40} />
//                 </button>
//               </>
//             )}

//             <img
//               src={`http://127.0.0.1:8001${currentImage.file}`}
//               alt="Full Product"
//               className={styles.modalImage}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }









// import { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import styles from "./ProductGallery.module.css";

// export default function ProductGallery({ media = [] }) {
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   useEffect(() => {
//     if (media.length > 0) {
//       setSelectedIndex(0);
//     }
//   }, [media]);

//   if (!media.length) {
//     return (
//       <div className={styles.galleryEmpty}>
//         <p>No product images available</p>
//       </div>
//     );
//   }

//   const currentImage = media[selectedIndex];

//   const nextImage = () => {
//     setSelectedIndex((prev) =>
//       prev === media.length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevImage = () => {
//     setSelectedIndex((prev) =>
//       prev === 0 ? media.length - 1 : prev - 1
//     );
//   };

//   return (
//     <div className={styles.temuGallery}>
      
//       {/* Thumbnails */}
//       <div className={styles.thumbnailColumn}>
//         {media.map((image, index) => (
//           <img
//             key={image.id}
//             src={`http://127.0.0.1:8001${image.file}`}
//             alt={`Thumbnail ${index + 1}`}
//             onClick={() => setSelectedIndex(index)}
//             className={`${styles.thumbnail} ${
//               selectedIndex === index ? styles.active : ""
//             }`}
//           />
//         ))}
//       </div>

//       {/* Main Image */}
//       <div className={styles.mainImageContainer}>
        
//         {media.length > 1 && (
//           <>
//             <button
//               className={`${styles.galleryArrow} ${styles.left}`}
//               onClick={prevImage}
//             >
//               <ChevronLeft size={28} />
//             </button>

//             <button
//               className={`${styles.galleryArrow} ${styles.right}`}
//               onClick={nextImage}
//             >
//               <ChevronRight size={28} />
//             </button>
//           </>
//         )}

//         <img
//           src={`http://127.0.0.1:8001${currentImage.file}`}
//           alt="Product"
//           className={styles.mainImage}
//         />
//       </div>

//     </div>
//   );
// N  }





// import { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import styles from "./ProductGallery.module.css";

// export default function ProductGallery({ media = [] }) {
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   useEffect(() => {
//     if (media.length > 0) {
//       setSelectedIndex(0);
//     }
//   }, [media]);

//   if (!media.length) {
//     return (
//       <div className={styles.galleryEmpty}>
//         <p>No product images available</p>
//       </div>
//     );
//   }

//   const currentImage = media[selectedIndex];

//   const nextImage = () => {
//     setSelectedIndex((prev) =>
//       prev === media.length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevImage = () => {
//     setSelectedIndex((prev) =>
//       prev === 0 ? media.length - 1 : prev - 1
//     );
//   };

//   return (
//     <div className={styles.temuGallery}>
      
//       {/* Thumbnail Column */}
//       <div className={styles.thumbnailColumn}>
//         {media.map((image, index) => (
//           <img
//             key={image.id}
//             src={`http://127.0.0.1:8001${image.file}`}
//             alt={`Thumbnail ${index + 1}`}
//             onClick={() => setSelectedIndex(index)}
//             className={`${styles.thumbnail} ${
//               selectedIndex === index ? styles.active : ""
//             }`}
//           />
//         ))}
//       </div>

//       {/* Main Image */}
//       <div className={styles.mainImageContainer}>
        
//         {media.length > 1 && (
//           <>
//             <button
//               className={`${styles.galleryArrow} ${styles.left}`}
//               onClick={prevImage}
//             >
//               <ChevronLeft size={28} />
//             </button>

//             <button
//               className={`${styles.galleryArrow} ${styles.right}`}
//               onClick={nextImage}
//             >
//               <ChevronRight size={28} />
//             </button>
//           </>
//         )}

//         <img
//           src={`http://127.0.0.1:8001${currentImage.file}`}
//           alt="Product"
//           className={styles.mainImage}
//         />
//       </div>
//     </div>
//   );
// }