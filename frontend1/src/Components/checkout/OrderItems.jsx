import React from "react";
import { BASE_URL } from "../../api";

const OrderItems = ({ item }) => {
  const product = item?.product;

  const primaryMedia =
    product?.media?.find(
      (media) => media?.is_primary
    ) || product?.media?.[0];

  const imageUrl = primaryMedia?.file
    ? `${BASE_URL}${primaryMedia.file}`
    : "https://picsum.photos/100";

  return (
    <div
      className="d-flex justify-content-between align-items-center mb-3"
      style={{ padding: "10px" }}
    >
      <div className="d-flex align-items-center">
        <img
          src={imageUrl}
          alt={product?.name || "Product"}
          className="img-fluid"
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "5px",
          }}
          onError={(e) => {
            e.target.src =
              "https://picsum.photos/100";
          }}
        />

        <div className="ms-3">
          <h6 className="mb-0">
            {product?.name}
          </h6>

          <small>
            Quantity: {item?.quantity}
          </small>
        </div>
      </div>

      <h6 className="mb-0">
        ₦
        {Number(
          item?.total || 0
        ).toLocaleString()}
      </h6>
    </div>
  );
};

export default OrderItems;










// import React from "react";
// import { BASE_URL } from "../../api";

// const OrderItems = ({ item }) => {
//   const product = item?.product;

//   return (
//     <div
//       className="d-flex justify-content-between align-items-center mb-3"
//       style={{ padding: "10px" }}
//     >
//       <div className="d-flex align-items-center">
//         <img
//           src={
//             product?.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product?.name || "Product"}
//           className="img-fluid"
//           style={{
//             width: "60px",
//             height: "60px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3">
//           <h6 className="mb-0">{product?.name}</h6>
//           <small>Quantity: {item?.quantity}</small>
//         </div>
//       </div>

//       <h6 className="mb-0">
//         ₦{Number(item?.total || 0).toLocaleString()}
//       </h6>
//     </div>
//   );
// };

// export default OrderItems;




// import React from "react";
// import { BASE_URL } from "../../api";

// const OrderItems = ({ cartItem }) => {
//   return (
//     <div
//       className="d-flex justify-content-between align-items-center mb-3"
//       style={{ padding: "10px" }}
//     >
//       <div className="d-flex align-items-center">
//         <img
//           src={
//             cartItem?.product?.image
//               ? `${BASE_URL}${cartItem.product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={cartItem?.product?.name}
//           className="img-fluid"
//           style={{
//             width: "60px",
//             height: "60px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3">
//           <h6 className="mb-0">{cartItem?.product?.name}</h6>
//           <small>Quantity: {cartItem?.quantity}</small>
//         </div>
//       </div>

//       <h6>₦{cartItem?.total || 0}</h6>
//     </div>
//   );
// };

// export default OrderItems;

// import React from "react";

// const OrderItems = () => {
//   return (
//     <div
//       className="d-flex justify-content-between align-items-center mb-3"
//       style={{ padding: "10px" }}
//     >
//       <div className="d-flex align-items-center">
//         <img
//           src=""
//           alt="Product"
//           className="img-fluid"
//           style={{
//             width: "60px",
//             height: "60px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />
//         <div className="ms-3">
//           <h6 className="mb-0">Product Name</h6>
//           <small>Quantity: 1</small>
//         </div>
//       </div>

//       <h6>$100.00</h6>
//     </div>
//   );
// };

// export default OrderItems;



// // import React from 'react'

// // const OrderItems = () => {
// //   return (
// //    <div
// //       className="d-flex justify-content-between align-items-center mb-3"
// //       style={{ padding }}
// //     >
// //       <div className="d-flex align-items-center">
// //         <img
// //           src=""
// //           alt="Product"
// //           className="img-fluid"
// //           style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }}
// //         />
// //         <div className="ms-3">
// //           <h6 className="mb-0">Product Name</h6>
// //           <small>Quantity: 1</small>
// //         </div>
// //       </div>
// //       <h6>$100.00</h6>
// //     </div>
// //   )
// // }

// // export default OrderItems

