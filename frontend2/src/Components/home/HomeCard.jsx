import React from "react";
import { Link } from "react-router-dom";
import styles from "./HomeCard.module.css";
import { getProductImage } from "../../utils/productImage";

const HomeCard = ({ product }) => {
  if (!product) return null;

  // ==========================
  // PRICE
  // ==========================
  const currentPrice = Number(
    product.current_price ?? product.price ?? 0
  );

  const originalPrice = Number(
    product.price ?? currentPrice
  );

  const discount =
    originalPrice > currentPrice
      ? Math.round(
          ((originalPrice - currentPrice) /
            originalPrice) *
            100
        )
      : 0;

  // ==========================
  // NEW PRODUCT
  // ==========================
  const isNew = product.created_at
    ? (Date.now() -
        new Date(product.created_at).getTime()) /
        (1000 * 60 * 60 * 24) <=
      7
    : false;

  // ==========================
  // RATING
  // ==========================
  const averageRating = Number(
    product.average_rating ??
      product.rating ??
      0
  );

  const starRating = Math.round(averageRating);

  const reviewCount =
    product.review_count ??
    product.reviews_count ??
    0;

// ==========================
// STOCK
// ==========================

const stock = Number(
  product.stock ??
  product.quantity ??
  product.available_quantity ??
  product.inventory ??
  product.stock_quantity ??
  0
);

let stockText;
let stockClass;

if (stock <= 0) {
  stockText = "Out of Stock";
  stockClass = styles.outStock;
} else if (stock <= 5) {
  stockText = `Only ${stock} left`;
  stockClass = styles.lowStock;
} else {
  stockText = `${stock} items available`;
  stockClass = styles.inStock;
}

  return (
    <Link
      to={`/products/${product.slug}`}
      className={styles.cardLink}
    >
      <div className={styles.card}>
        {/* BADGES */}

        <div className={styles.badges}>
          {isNew && (
            <span className={styles.newBadge}>
              NEW
            </span>
          )}

          {discount > 0 && (
            <span className={styles.discountBadge}>
              -{discount}%
            </span>
          )}
        </div>

        {/* IMAGE */}

        <div className={styles.imageWrapper}>
          <img
            src={getProductImage(product)}
            alt={product.name}
            className={styles.image}
          />
        </div>

        {/* CONTENT */}

        <div className={styles.content}>
          {product.brand && (
            <div className={styles.brand}>
              {product.brand.name ??
                product.brand}
            </div>
          )}

          <h6 className={styles.name}>
            {product.name}
          </h6>

          {/* Rating */}

          <div className={styles.rating}>
            <span className="text-warning">
              {"★".repeat(starRating)}
              {"☆".repeat(
                5 - starRating
              )}
            </span>

            <span className="ms-2 fw-bold">
              {averageRating.toFixed(1)}
            </span>

            <span className="text-muted ms-2">
              ({reviewCount} Reviews)
            </span>
          </div>

          {/* PRICE */}

          {originalPrice >
            currentPrice && (
            <div
              className={styles.oldPrice}
            >
              ₦
              {originalPrice.toLocaleString()}
            </div>
          )}

          <div className={styles.price}>
            ₦
            {currentPrice.toLocaleString()}
          </div>

          {/* STOCK */}
      <div className={stockClass}>
      {stockText}
    </div>
          {/* <div
            className={
              inStock
                ? styles.inStock
                : styles.outStock
            }
          >
            {inStock
              ? `In Stock (${stock})`
              : "Out of Stock"}
          </div> */}
        </div>
      </div>
    </Link>
  );
};

export default HomeCard;









// import React from "react";
// import styles from "./HomeCard.module.css";
// import { Link } from "react-router-dom";

// const HomeCard = ({ product }) => {
//   if (!product) return null;

//   const currentPrice = Number(
//     product.current_price || product.price || 0
//   );

//   const originalPrice = Number(
//     product.price || currentPrice
//   );

//   const discount =
//     originalPrice > currentPrice
//       ? Math.round(
//           ((originalPrice - currentPrice) /
//             originalPrice) *
//             100
//         )
//       : 0;

//   const isNew = product.created_at
//     ? (new Date() - new Date(product.created_at)) /
//         (1000 * 60 * 60 * 24) <=
//       7
//     : false;

//   return (
//     <Link
//       to={`/products/${product.slug}`}
//       className={styles.cardLink}
//     >
//       <div className={styles.card}>

//         {/* BADGES */}
//         <div className={styles.badges}>
//           {isNew && (
//             <span className={styles.newBadge}>
//               NEW
//             </span>
//           )}

//           {discount > 0 && (
//             <span className={styles.discountBadge}>
//               -{discount}%
//             </span>
//           )}
//         </div>

//         {/* IMAGE */}
//         <div className={styles.imageWrapper}>
//           <img
//             src={
//               product?.media?.[0]?.file
//                 ? `http://127.0.0.1:8001${product.media[0].file}`
//                 : "/placeholder.jpg"
//             }
//             alt={product.name}
//             className={styles.image}
//           />
//         </div>

//         {/* CONTENT */}
//         <div className={styles.content}>

//           <h6 className={styles.name}>
//             {product.name}
//           </h6>

//           {/* Original Price */}
//           {originalPrice > currentPrice && (
//             <div className={styles.oldPrice}>
//               ₦{originalPrice.toLocaleString()}
//             </div>
//           )}

//           {/* Current Price */}
//           <div className={styles.price}>
//             ₦{currentPrice.toLocaleString()}
//           </div>

//         </div>

//       </div>
//     </Link>
//   );
// };

// export default HomeCard;









// import React from "react";
// import styles from "./HomeCard.module.css";
// import { Link } from "react-router-dom";
// import { BASE_URL } from "../../api";

// const currencyMap = {
//   NGN: "en-NG",
//   USD: "en-US",
//   EUR: "de-DE",
//   GBP: "en-GB",
//   JPY: "ja-JP",
// };

// const HomeCard = ({ product, currency = "NGN" }) => {
//   if (!product) return null;

//   const locale = currencyMap[currency] || "en-NG";

//   const formattedPrice = new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//   }).format(Number(product.price || 0));

//   return (
//     <Link
//       to={`/products/${product.slug}`}
//       className={styles.cardLink}
//     >
//       <div className={styles.card}>

//         <div className={styles.imageWrapper}>
//           <img
//             src={
//               product?.media?.[0]?.file
//                 ? `http://127.0.0.1:8001${product.media[0].file}`
//                 : "/placeholder.jpg"
//             }
//             alt={product.name}
//             className={styles.image}
//           />
//         </div>

//         <div className={styles.content}>
//           <h6 className={styles.name}>
//             {product.name}
//           </h6>

//           <p className={styles.price}>
//             ₦{Number(product.current_price).toLocaleString()}
//           </p>
//         </div>

//       </div>
//     </Link>
//   );
// };

// export default HomeCard;


// import React from "react";
// import styles from "./HomeCard.module.css";
// import { Link } from "react-router-dom";
// import { BASE_URL } from "../../api";

// const currencyMap = {
//   NGN: "en-NG",
//   USD: "en-US",
//   EUR: "de-DE",
//   GBP: "en-GB",
//   JPY: "ja-JP",
// };

// const HomeCard = ({ product, currency = "NGN" }) => {
//   if (!product) return null;

//   const locale = currencyMap[currency] || "en-NG";

//   const formattedPrice = new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency: currency,
//   }).format(Number(product.price || 0));

//   return (
//     <div className={`col-md-3 mb-5 ${styles.col}`}>
//       <Link to={`/products/${product.slug}`} className={styles.link}>
//         <div className={styles.card}>

//         <div className={styles.cardImgWrapper}>
//           <img
//             src={
//               product?.media?.[0]?.file
//                 ? `http://127.0.0.1:8001${product.media[0].file}`
//                 : "/placeholder.jpg"
//             }
//             alt={product.name}
//             className={styles.cardImg}
//           />
//         </div>

//           {/* <div className={styles.cardImgWrapper}>
//             <img
//               src={`${BASE_URL}${product.image}`}
//               alt={product.name}
//               className={styles.cardImg}
//             />
//           </div> */}

//           <div className={styles.cardBody}>
//             <h5 className={styles.cardTitle}>
//               {product.name || "Unnamed Product"}
//             </h5>

//             <p className={styles.cardText}>
//               {formattedPrice}
//             </p>
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// };

// export default HomeCard;
