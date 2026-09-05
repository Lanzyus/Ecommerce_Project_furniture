import React from "react";
import styles from "./OrderHistoryItem.module.css";

const API_BASE_URL = "http://127.0.0.1:8001";

// ============================================================
// BUILD IMAGE URL
// ============================================================

const buildImageUrl = (image) => {

  if (!image) {
    return "";
  }

  if (typeof image !== "string") {
    return "";
  }

  const value = image.trim();

  if (!value) {
    return "";
  }

  // Absolute URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Django media path
  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  // Relative media path
  return `${API_BASE_URL}/${value}`;
};


// ============================================================
// GET PRODUCT IMAGE
// ============================================================

const getProductImage = (productItem) => {

  if (!productItem) {
    return "";
  }

  // ----------------------------------------------------------
  // 1. BACKEND product_image
  // ----------------------------------------------------------

  if (productItem.product_image) {

    return buildImageUrl(
      productItem.product_image
    );
  }

  // ----------------------------------------------------------
  // 2. NESTED PRODUCT
  // ----------------------------------------------------------

  const product =
    productItem.product || {};

  // ----------------------------------------------------------
  // 3. primary_image
  // ----------------------------------------------------------

  if (product.primary_image) {

    return buildImageUrl(
      product.primary_image
    );
  }

  // ----------------------------------------------------------
  // 4. PRODUCT MEDIA
  // ----------------------------------------------------------

  if (
    Array.isArray(product.media) &&
    product.media.length > 0
  ) {

    // Primary image
    const primaryImage =
      product.media.find(
        (media) =>
          media?.media_type === "image" &&
          media?.is_primary === true
      );

    if (primaryImage) {

      const image =
        primaryImage.image_url ||
        primaryImage.file;

      if (image) {

        return buildImageUrl(
          image
        );
      }
    }

    // First image
    const firstImage =
      product.media.find(
        (media) =>
          media?.media_type === "image"
      );

    if (firstImage) {

      const image =
        firstImage.image_url ||
        firstImage.file;

      if (image) {

        return buildImageUrl(
          image
        );
      }
    }
  }

  // ----------------------------------------------------------
  // 5. OTHER POSSIBLE IMAGE FIELDS
  // ----------------------------------------------------------

  const fallbackImage =
    product.image ||
    product.image_url ||
    product.product_image;

  if (fallbackImage) {

    return buildImageUrl(
      fallbackImage
    );
  }

  return "";
};


// ============================================================
// FORMAT MONEY
// ============================================================

const formatMoney = (value) => {

  const number =
    Number(value || 0);

  return number.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};


// ============================================================
// ORDER HISTORY ITEM
// ============================================================

const OrderHistoryItem = ({ item }) => {

  const orderItems =
    Array.isArray(item?.orderitems)
      ? item.orderitems
      : [];

  return (

    <div className={`mb-5 ${styles.orderItem}`}>

      {/* ====================================================
          ORDER HEADER
      ==================================================== */}

      <div className="row align-items-start mb-4">

        <div className="col-md-8">

          <div className="small text-uppercase text-muted mb-1">
            Order
          </div>

          <h4 className="mb-2">
            {item?.order_number || "Order"}
          </h4>

          <div className="text-muted">

            {item?.created_at
              ? new Date(
                  item.created_at
                ).toLocaleDateString(
                  "en-NG",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "N/A"}

            {" • "}

            Order ID: {item?.id || "N/A"}

          </div>

          <div className="mt-2">

            <span className="badge bg-light text-dark text-capitalize">
              {item?.status || "N/A"}
            </span>

          </div>

        </div>


        {/* ==================================================
            ORDER TOTAL
        ================================================== */}

        <div className="col-md-4 text-md-end mt-3 mt-md-0">

          <div className="small text-uppercase text-muted">
            Order Total
          </div>

          <div className="fs-4 fw-bold">

            ₦
            {formatMoney(
              item?.total_amount
            )}

          </div>

        </div>

      </div>


      {/* ====================================================
          PRODUCTS
      ==================================================== */}

      <div className="border-top pt-4">

        <div className="d-flex justify-content-between align-items-center mb-3">

          <div>

            <div className="small text-uppercase text-muted">
              Order Contents
            </div>

            <h4 className="mb-0">
              Products
            </h4>

          </div>

          <span className="text-muted">

            {orderItems.length}{" "}
            {orderItems.length === 1
              ? "Product"
              : "Products"}

          </span>

        </div>


        {/* ==================================================
            PRODUCT LIST
        ================================================== */}

        {orderItems.length > 0 ? (

          <div>

            {orderItems.map(
              (productItem) => {

                const image =
                  getProductImage(
                    productItem
                  );

                return (

                  <div
                    key={productItem.id}
                    className="border rounded p-4 mb-3"
                  >

                    <div className="row align-items-center">


                      {/* ====================================
                          IMAGE
                      ==================================== */}

                      <div className="col-12 col-md-2 mb-3 mb-md-0">

                        <div
                          className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
                          style={{
                            width: "130px",
                            height: "130px",
                            margin: "0 auto",
                          }}
                        >

                          {image ? (

                            <img
                              src={image}
                              alt={
                                productItem.product_name ||
                                "Product"
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(event) => {

                                console.error(
                                  "PRODUCT IMAGE FAILED:",
                                  image
                                );

                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <div className="text-center text-muted">

                              <div
                                style={{
                                  fontSize: "28px",
                                }}
                              >
                                📦
                              </div>

                              <small>
                                No Image
                              </small>

                            </div>

                          )}

                        </div>

                      </div>


                      {/* ====================================
                          PRODUCT NAME
                      ==================================== */}

                      <div className="col-12 col-md-6">

                        <div className="small text-uppercase text-muted mb-2">
                          Item
                        </div>

                        <h4 className="mb-2">

                          {productItem.product_name ||
                            "Product unavailable"}

                        </h4>

                        {productItem.product_brand && (

                          <div className="text-muted mb-2">

                            Brand:{" "}
                            {productItem.product_brand}

                          </div>

                        )}

                        {productItem.shop_name && (

                          <div className="text-muted mb-2">

                            Shop:{" "}
                            {productItem.shop_name}

                          </div>

                        )}

                      </div>


                      {/* ====================================
                          QUANTITY
                      ==================================== */}

                      <div className="col-6 col-md-2 text-md-center">

                        <div className="small text-uppercase text-muted mb-2">
                          Quantity
                        </div>

                        <div className="fw-semibold">

                          {productItem.quantity || 0}

                        </div>

                      </div>


                      {/* ====================================
                          PRICE
                      ==================================== */}

                      <div className="col-6 col-md-2 text-end">

                        <div className="small text-uppercase text-muted mb-2">
                          Unit Price
                        </div>

                        <div className="fw-semibold mb-3">

                          ₦
                          {formatMoney(
                            productItem.unit_price
                          )}

                        </div>

                        <div className="small text-uppercase text-muted mb-2">
                          Item Total
                        </div>

                        <div className="fw-bold">

                          ₦
                          {formatMoney(
                            productItem.total_price
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        ) : (

          <div className="border rounded p-5 text-center text-muted">

            No products found for this order.

          </div>

        )}

      </div>


      {/* ====================================================
          ORDER SUMMARY
      ==================================================== */}

      <div className="border-top mt-4 pt-4">

        <div className="row justify-content-end">

          <div className="col-md-5">

            <div className="d-flex justify-content-between mb-2">

              <span>
                Subtotal
              </span>

              <strong>

                ₦
                {formatMoney(
                  item?.subtotal
                )}

              </strong>

            </div>

            <div className="d-flex justify-content-between">

              <span>
                Order Total
              </span>

              <strong className="fs-5">

                ₦
                {formatMoney(
                  item?.total_amount
                )}

              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderHistoryItem;


// import React from "react";
// import styles from "./OrderHistoryItem.module.css";

// const OrderHistoryItem = ({ item }) => {
//   const orderItems = Array.isArray(item?.orderitems)
//     ? item.orderitems
//     : [];

//   return (
//     <div className={`mb-4 ${styles.orderItem}`}>
//       {/* =====================================================
//           ORDER HEADER
//       ====================================================== */}

//       <div className="row align-items-start mb-3">

//         <div className="col-md-8">

//           <h6 className="fw-bold mb-3">
//             {item.order_number || "Order"}
//           </h6>

//           <p className="mb-1">
//             <strong>Order Date:</strong>{" "}
//             {item.created_at
//               ? new Date(
//                   item.created_at
//                 ).toLocaleDateString()
//               : "N/A"}
//           </p>

//           <p className="mb-1">
//             <strong>Order ID:</strong>{" "}
//             {item.id || "N/A"}
//           </p>

//           <p className="mb-1">
//             <strong>Status:</strong>{" "}
//             <span className="text-capitalize">
//               {item.status || "N/A"}
//             </span>
//           </p>

//           <p className="mb-1">
//             <strong>City:</strong>{" "}
//             {item.city || "N/A"}
//           </p>

//         </div>


//         {/* =================================================
//             ORDER TOTAL
//         ================================================== */}

//         <div className="col-md-4 text-md-end text-start mt-3 mt-md-0">

//           <small className="text-muted d-block">
//             Order Total
//           </small>

//           <h5 className="fw-bold mb-0">
//             ₦
//             {Number(
//               item.total_amount || 0
//             ).toLocaleString()}
//           </h5>

//         </div>

//       </div>


//       {/* =====================================================
//           PRODUCTS IN THIS ORDER
//       ====================================================== */}

//       {orderItems.length > 0 ? (

//         <div className="mt-3">

//           <h6 className="fw-bold mb-3">
//             Products
//           </h6>

//           {orderItems.map((productItem) => (

//             <div
//               key={productItem.id}
//               className="border rounded p-3 mb-3"
//             >

//               <div className="row align-items-center">

//                 {/* ==========================================
//                     PRODUCT IMAGE
//                 =========================================== */}

//                 <div className="col-4 col-md-2 text-center">

//                   {productItem.product_image ? (

//                     <img
//                       src={
//                         productItem.product_image
//                       }
//                       alt={
//                         productItem.product_name ||
//                         "Product"
//                       }
//                       className="img-fluid rounded"
//                       style={{
//                         width: "100px",
//                         height: "100px",
//                         objectFit: "cover",
//                       }}
//                       onError={(event) => {
//                         event.currentTarget.style.display =
//                           "none";
//                       }}
//                     />

//                   ) : (

//                     <div
//                       className="d-flex align-items-center justify-content-center bg-light rounded"
//                       style={{
//                         width: "100px",
//                         height: "100px",
//                         margin: "0 auto",
//                       }}
//                     >
//                       <span className="text-muted small">
//                         No Image
//                       </span>
//                     </div>

//                   )}

//                 </div>


//                 {/* ==========================================
//                     PRODUCT INFORMATION
//                 =========================================== */}

//                 <div className="col-8 col-md-6">

//                   <h6 className="fw-bold mb-2">
//                     {productItem.product_name ||
//                       "Product unavailable"}
//                   </h6>

//                   {productItem.product_description && (

//                     <p className="text-muted small mb-2">
//                       {productItem.product_description}
//                     </p>

//                   )}

//                   {productItem.product_brand && (

//                     <p className="small mb-1">
//                       <strong>Brand:</strong>{" "}
//                       {productItem.product_brand}
//                     </p>

//                   )}

//                   {productItem.shop_name && (

//                     <p className="small mb-1">
//                       <strong>Shop:</strong>{" "}
//                       {productItem.shop_name}
//                     </p>

//                   )}

//                   <p className="small mb-1">
//                     <strong>Quantity:</strong>{" "}
//                     {productItem.quantity || 0}
//                   </p>

//                 </div>


//                 {/* ==========================================
//                     PRODUCT PRICE
//                 =========================================== */}

//                 <div className="col-md-4 text-md-end mt-3 mt-md-0">

//                   <p className="small text-muted mb-1">
//                     Unit Price
//                   </p>

//                   <p className="fw-semibold mb-1">
//                     ₦
//                     {Number(
//                       productItem.unit_price || 0
//                     ).toLocaleString()}
//                   </p>

//                   <p className="small text-muted mb-1">
//                     Item Total
//                   </p>

//                   <h6 className="fw-bold">
//                     ₦
//                     {Number(
//                       productItem.total_price || 0
//                     ).toLocaleString()}
//                   </h6>

//                 </div>

//               </div>

//             </div>

//           ))}

//         </div>

//       ) : (

//         <div className="alert alert-light border">
//           No products found for this order.
//         </div>

//       )}

//     </div>
//   );
// };

// export default OrderHistoryItem;






// import React from "react";
// import styles from "./OrderHistoryItem.module.css";

// const OrderHistoryItem = ({ item }) => {
//   console.log("Order Item:", item);
//   return (
//     <div className="card-body">
//       <div className={`order-item mb-3 ${styles.orderItem}`}>
//         <div className="row align-items-center">
//           <div className="col-md-2">
//             <img
//               src={item?.product?.image}
//               alt={item?.product?.name}
//               className="img-fluid"
//               style={{ borderRadius: "5px" }}
//             />
//           </div>

//           <div className="col-md-6">
//             <h6>{item?.product?.name}</h6>

//             <p>
//               <strong>Order Date:</strong>{" "}
//               {item?.order_date || "N/A"}
//             </p>

//             <p>
//               <strong>Order ID:</strong>{" "}
//               {item?.order_id || "N/A"}
//             </p>
//           </div>

//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">
//               Quantity: {item?.quantity || 0}
//             </h6>
//           </div>

//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">
//               ₦
//               {Number(
//                 item?.product?.price || 0
//               ).toLocaleString()}
//             </h6>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderHistoryItem;


// import React from "react";
// import styles from "./OrderHistoryItem.module.css";

// const OrderHistoryItem = ({item}) => {
//   return (
//     <div className="card-body">
//       <div className={`order-item mb-3 ${styles.orderItem}`}>
//         <div className="row align-items-center">
//           <div className="col-md-2">
//             <img
//               src={image}
//               alt={productName}
//               className="img-fluid"
//               style={{ borderRadius: "5px" }}
//             />
//           </div>

//           <div className="col-md-6">
//             <h6>{item.product.name}</h6>
//             <p>{`Order Date: ${item.order_date}'}</p>
//             <p>{`Order ID: ${order_id}`}</p>
//           </div>

//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">Quantity: {quantity}</h6>
//           </div>

//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">
//               ₦{Number(price).toLocaleString()}
//             </h6>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderHistoryItem;



// import React from 'react'
// import pic from '../../assets/react.svg'
// import styles from './OrderHistoryItem.module.css'


// const OrderHistoryItem = () => {
//   return (
  
//      <div className="card-body">
//       <div className={`order-item mb-3 ${styles.orderItem}`}>
//         <div className="row">
//           <div className="col-md-2">
//             <img
//               src="assets/hero.png"
//               alt="Order Item"
//               className="img-fluid"
//               style={{ borderRadius: '5px' }}
//             />
//           </div>
//           <div className="col-md-6">
//             <h6>Product Name</h6>
//             <p>Order Date: June 5, 2024</p>
//             <p>Order ID: 123456</p>
//           </div>
//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">Quantity: 1</h6>
//           </div>
//           <div className="col-md-2 text-center">
//             <h6 className="text-muted">$100.00</h6>
//           </div>
//         </div>
//         {/* Repeat for other orders */}
//       </div>
//     </div>
    
//   )
// }

// export default OrderHistoryItem
