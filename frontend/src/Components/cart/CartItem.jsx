import React, { useEffect, useState } from "react";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";

import api, { BASE_URL } from "../../api";

import styles from "./CartItem.module.css";

const CartItem = ({
  item,
  refetchCart,
  fetchCartStats,
}) => {

  const product = item?.product;

  const [quantity, setQuantity] = useState(
    Number(item?.quantity || 1)
  );

  const [loading, setLoading] = useState(false);

  const [quantityChanged, setQuantityChanged] =
    useState(false);


  /* =========================================
     KEEP LOCAL QUANTITY IN SYNC
  ========================================= */

  useEffect(() => {
    setQuantity(Number(item?.quantity || 1));
    setQuantityChanged(false);
  }, [item?.quantity]);


  if (!product) {
    return (
      <div className={styles.errorItem}>
        <p>
          Product information is unavailable.
        </p>
      </div>
    );
  }


  /* =========================================
     PRODUCT IMAGE
  ========================================= */

  const primaryMedia =
    product?.media?.find(
      (media) => media?.is_primary
    ) || product?.media?.[0];

  let imageUrl = "/placeholder.jpg";

  if (primaryMedia?.file) {
    imageUrl = primaryMedia.file.startsWith("http")
      ? primaryMedia.file
      : `${BASE_URL}${primaryMedia.file}`;
  }


  /* =========================================
     PRICE
  ========================================= */

  const unitPrice = Number(
    product?.current_price ??
      product?.price ??
      0
  );

  const itemTotal =
    unitPrice * Number(quantity);


  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    );


  /* =========================================
     QUANTITY
  ========================================= */

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      const next = Math.max(1, prev - 1);

      setQuantityChanged(
        next !== Number(item?.quantity || 1)
      );

      return next;
    });
  };


  const increaseQuantity = () => {
    setQuantity((prev) => {
      const next = prev + 1;

      setQuantityChanged(
        next !== Number(item?.quantity || 1)
      );

      return next;
    });
  };


  /* =========================================
     UPDATE CART
  ========================================= */

  const updateCartItem = async () => {

    if (quantity < 1) {
      toast.error(
        "Quantity must be at least 1"
      );
      return;
    }

    try {
      setLoading(true);

      await api.patch(
        `/cart/update/${item.id}/`,
        {
          quantity: Number(quantity),
        }
      );

      if (refetchCart) {
        await refetchCart();
      }

      if (fetchCartStats) {
        await fetchCartStats();
      }

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      setQuantityChanged(false);

      toast.success(
        "Shopping bag updated"
      );

    } catch (error) {

      console.error(
        "Update Cart Error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update cart"
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     REMOVE ITEM
  ========================================= */

  const removeItem = async () => {

    const confirmed = window.confirm(
      `Remove "${product.name}" from your shopping bag?`
    );

    if (!confirmed) return;

    try {

      setLoading(true);

      await api.delete(
        `/cart/remove/${item.id}/`
      );

      if (refetchCart) {
        await refetchCart();
      }

      if (fetchCartStats) {
        await fetchCartStats();
      }

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      toast.success(
        "Item removed from your bag"
      );

    } catch (error) {

      console.error(
        "Remove Item Error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to remove item"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <article className={styles.cartItem}>

      {/* =====================================
          IMAGE
      ===================================== */}

      <div className={styles.imageContainer}>

        <img
          src={imageUrl}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src =
              "/placeholder.jpg";
          }}
        />

      </div>


      {/* =====================================
          PRODUCT INFO
      ===================================== */}

      <div className={styles.productInfo}>

        <div className={styles.productTop}>

          <div>

            <span className={styles.productCategory}>
              {product.category_name ||
                product.category?.name ||
                "Interior Collection"}
            </span>

            <h3>
              {product.name}
            </h3>

          </div>

          <button
            type="button"
            className={styles.removeButton}
            onClick={removeItem}
            disabled={loading}
            aria-label={`Remove ${product.name}`}
          >
            <FiTrash2 />
          </button>

        </div>


        {/* PRICE */}

        <div className={styles.priceRow}>

          <span>
            {formatCurrency(unitPrice)}
          </span>

          <small>
            per item
          </small>

        </div>


        {/* BOTTOM */}

        <div className={styles.productBottom}>

          {/* QUANTITY */}

          <div className={styles.quantityWrapper}>

            <span>
              Quantity
            </span>

            <div className={styles.quantityControl}>

              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={
                  loading || quantity <= 1
                }
                aria-label="Decrease quantity"
              >
                <FiMinus />
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={loading}
                aria-label="Increase quantity"
              >
                <FiPlus />
              </button>

            </div>

          </div>


          {/* TOTAL */}

          <div className={styles.itemTotal}>

            <span>
              Total
            </span>

            <strong>
              {formatCurrency(itemTotal)}
            </strong>

          </div>

        </div>


        {/* UPDATE */}

        {quantityChanged && (
          <button
            type="button"
            className={styles.updateButton}
            onClick={updateCartItem}
            disabled={loading}
          >
            <FiRefreshCw
              className={
                loading
                  ? styles.spinning
                  : ""
              }
            />

            {loading
              ? "Updating..."
              : "Update Quantity"}
          </button>
        )}

      </div>

    </article>
  );
};

export default CartItem;











// import React, { useState } from "react";
// import api, { BASE_URL } from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
// item,
// refetchCart,
// fetchCartStats,
// }) => {
// const [loading, setLoading] = useState(false);

// const [quantity, setQuantity] = useState(
// item?.quantity || 1
// );

// const product = item?.product;

// if (!product) {
// return ( <div className="alert alert-warning">
// Product information unavailable </div>
// );
// }

// // =====================================
// // GET PRODUCT IMAGE
// // =====================================

// const primaryMedia =
// product?.media?.find(
// (media) => media?.is_primary
// ) || product?.media?.[0];

// let imageUrl = "/placeholder.jpg";

// if (primaryMedia?.file) {
// imageUrl = primaryMedia.file.startsWith("http")
// ? primaryMedia.file
// : `${BASE_URL}${primaryMedia.file}`;
// }

// // =====================================
// // UPDATE CART ITEM
// // =====================================
// const updateCartItem = async () => {
//   if (quantity < 1) {
//     toast.error("Quantity must be at least 1");
//     return;
//   }

//   try {
//     setLoading(true);

//     const response = await api.patch(
//       `/cart/update/${item.id}/`,
//       {
//         quantity: Number(quantity),
//       }
//     );

//     console.log("Update Response:", response.data);

//     // Refresh cart contents
//     if (refetchCart) {
//       await refetchCart();
//     }

//     // Refresh navbar badge
//     if (fetchCartStats) {
//       await fetchCartStats();
//     }

//     // Notify every component using CartContext
//     window.dispatchEvent(new Event("cartUpdated"));

//     toast.success("Cart updated successfully");

//   } catch (error) {

//     console.error(
//       "Update Cart Error:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       "Failed to update cart"
//     );

//   } finally {

//     setLoading(false);

//   }
// };


// // =====================================
// // REMOVE CART ITEM
// // =====================================

// const removeItem = async () => {

//   const confirmed = window.confirm(
//     `Remove "${item.product.name}" from cart?`
//   );

//   if (!confirmed) return;

//   try {

//     setLoading(true);

//     await api.delete(
//       `/cart/remove/${item.id}/`
//     );

//     if (refetchCart) {
//       await refetchCart();
//     }

//     if (fetchCartStats) {
//       await fetchCartStats();
//     }

//     window.dispatchEvent(
//       new Event("cartUpdated")
//     );

//     toast.success("Item removed successfully");

//   } catch (error) {

//     console.error(
//       "Remove Item Error:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       "Failed to remove item"
//     );

//   } finally {

//     setLoading(false);

//   }

// };



// const removeItem = async () => {
// const confirmed = window.confirm(
// `Remove "${product.name}" from cart?`
// );


// if (!confirmed) return;

// try {
//   setLoading(true);

//   await api.delete(
//     `/remove_item/${item.id}/`
//   );

//   console.log(
//     "Item removed. Refreshing count..."
//   );

//   await fetchCartStats();



//   if (refetchCart) {
//     await refetchCart();
//   }

//   if (fetchCartStats) {
//     await fetchCartStats();
//   }

//   toast.success(
//     "Item removed successfully"
//   );
// } catch (error) {
//   console.error(
//     "Remove Item Error:",
//     error
//   );

//   toast.error(
//     error?.response?.data?.message ||
//       error?.response?.data?.error ||
//       "Failed to remove item"
//   );
// } finally {
//   setLoading(false);
// }


// };

// =====================================
// JSX
// =====================================

// return ( <div className="card shadow-sm mb-3"> <div className="card-body"> <div className="row align-items-center">


//       {/* Product Image */}
//       <div className="col-md-2 col-4">
//         <img
//           src={imageUrl}
//           alt={product.name}
//           className="img-fluid rounded"
//           style={{
//             width: "100px",
//             height: "100px",
//             objectFit: "cover",
//           }}
//           onError={(e) => {
//             e.target.src =
//               "/placeholder.jpg";
//           }}
//         />
//       </div>

//       {/* Product Details */}
//       <div className="col-md-4 col-8">
//         <h5 className="mb-1">
//           {product.name}
//         </h5>

//         <p className="text-muted mb-1">
//           ₦
//           {Number(
//             product.current_price ||
//               product.price ||
//               0
//           ).toLocaleString()}
//         </p>

//         <small className="text-secondary">
//           Current Quantity:
//           {" "}
//           {item.quantity}
//         </small>
//       </div>

//       {/* Quantity Input */}
//       <div className="col-md-3 mt-3 mt-md-0">
//         <input
//           type="number"
//           min="1"
//           value={quantity}
//           disabled={loading}
//           className="form-control"
//           onChange={(e) =>
//             setQuantity(
//               Math.max(
//                 1,
//                 Number(
//                   e.target.value
//                 ) || 1
//               )
//             )
//           }
//         />
//       </div>

//       {/* Buttons */}
//       <div className="col-md-3 mt-3 mt-md-0 d-flex gap-2">

//         <button
//           className="btn btn-primary"
//           disabled={
//             loading ||
//             quantity === item.quantity
//           }
//           onClick={updateCartItem}
//         >
//           {loading
//             ? "Updating..."
//             : "Update"}
//         </button>

//         <button
//           className="btn btn-danger"
//           disabled={loading}
//           onClick={removeItem}
//         >
//           {loading
//             ? "Removing..."
//             : "Remove"}
//         </button>

//       </div>

//     </div>
//   </div>
// </div>


// );
// };

// export default CartItem;











// import React, { useState } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
//   item,
//   refetchCart,
//   fetchCartStats,
// }) => {
//   const product = item?.product;

//   const [quantity, setQuantity] = useState(
//     item?.quantity || 1
//   );

//   const [loading, setLoading] = useState(false);

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product information unavailable
//       </div>
//     );
//   }

//   const primaryMedia =
//     product?.media?.find(
//       (m) => m.is_primary
//     ) || product?.media?.[0];

//   const imageUrl =
//     primaryMedia?.file ||
//     "/placeholder.jpg";

//   const updateCartItem = async () => {
//     try {
//       setLoading(true);
        
//       await api.put(
//         `/update_cart_item/${item.id}/`,
//         {
//           quantity: Number(quantity),
//         }
//       );

//       // await api.put(
//       //   `/update_cart_item/${item.id}/`,
//       //   {
//       //     quantity: quantity,
//       //   }
//       // );

//       await refetchCart();

//       if (fetchCartStats) {
//         await fetchCartStats();
//       }

//       toast.success("Cart updated");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     const confirmed = window.confirm(
//       "Remove this item?"
//     );

//     if (!confirmed) return;

//     try {
//       setLoading(true);

//       await api.delete(
//         `/remove_item/${item.id}/`
//       );

//       await refetchCart();

//       if (fetchCartStats) {
//         await fetchCartStats();
//       }

//       toast.success("Item removed");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to remove item");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="card mb-3">
//       <div className="card-body d-flex align-items-center">
//         <img
//           src={imageUrl}
//           alt={product.name}
//           width="100"
//           height="100"
//           style={{
//             objectFit: "cover",
//             borderRadius: "8px",
//           }}
//           onError={(e) => {
//             e.target.src = "/placeholder.jpg";
//           }}
//         /> 

//         <div className="ms-3 flex-grow-1">
//           <h5>{product.name}</h5>

//           <p className="text-muted mb-1">
//             ₦
//             {Number(
//               product.current_price ||
//               product.price ||
//               0
//             ).toLocaleString()}
//           </p>

//           <small>
//             Qty: {item.quantity}
//           </small>
//         </div>

//         <div className="d-flex align-items-center">

//           <input
//             type="number"
//             min="1"
//             className="form-control me-2"
//             style={{ width: "80px" }}
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(
//                 Number(e.target.value)
//               )
//             }
//           />

//           <button
//             className="btn btn-primary me-2"
//             disabled={loading}
//             onClick={updateCartItem}
//           >
//             Update
//           </button>

//           <button
//             className="btn btn-danger"
//             disabled={loading}
//             onClick={removeItem}
//           >
//             Remove
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;



// import React, { useState } from "react";
// import api, { BASE_URL } from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
//   item,
//   setNumCartItems,
//   refetchCart,
//   fetchCartStats,
// }) => {
//   const product = item?.product;

//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     try {
//       setLoading(true);

//       // await api.post("/update_quantity/", {
//       //   item_id: item.id,
//       //   quantity: newQty,
//       // });

//       await api.put("/update_quantity/", {
//         item_id: item.id,
//         quantity: Number(quantity),
//       });

//       // 🔥 IMPORTANT: reload everything from backend
//       await refetchCart();

//       if (fetchCartStats) {
//         fetchCartStats();
//       }

//       toast.success("Cart updated");
//     } catch (err) {
//       console.error(err?.response?.data || err);
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     try {
//       const confirmDelete = window.confirm("Remove item?");
//         if (!confirmDelete) return;


//       await api.delete(`/remove_item/${item.id}/`);

//       await refetchCart(); // 🔥 CRITICAL FIX

//       if (fetchCartStats) {
//         fetchCartStats();
//       }

//       toast.success("Item removed");
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div className="cart-item d-flex align-items-center mb-3 p-3 bg-light rounded">

//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{ width: "80px", height: "80px", objectFit: "cover" }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5>{product.name}</h5>

//           <p className="text-muted mb-0">
//             {Number(product.price || 0).toLocaleString("en-NG", {
//               style: "currency",
//               currency: "NGN",
//             })}
//           </p>
//         </div>

//         <input
//           type="number"
//           min="1"
//           value={quantity}
//           onChange={(e) =>
//             setQuantity(Math.max(1, Number(e.target.value)))
//           }
//           className="form-control me-2"
//           style={{ width: "80px" }}
//         />

//         <button
//           className="btn btn-primary me-2"
//           disabled={loading}
//           onClick={updateCartItem}
//         >
//           {loading ? "Updating..." : "Update"}
//         </button>

//         <button className="btn btn-danger" onClick={removeItem}>
//           Remove
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CartItem;


// import React, { useState } from "react";
// import api, { BASE_URL } from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
//   fetchCartStats,
// }) => {
//   const product = item?.product;

//   const [quantity, setQuantity] = useState(
//     item?.quantity || 1
//   );

//   const [loading, setLoading] = useState(false);

//   const recalculateCartCount = (items) => {
//     const total = items.reduce(
//       (sum, cartItem) =>
//         sum + Number(cartItem.quantity || 0),
//       0
//     );

//     setNumCartItems(total);
//   };

//   const updateCartItem = async () => {
//   try {
//     setLoading(true);

//     await api.put("/update_quantity/", {
//       item_id: item.id,
//       quantity: Number(quantity),
//     });

//     // 🔥 CRITICAL FIX: reload from backend
//     await refetchCart();

//     // update navbar too
//     if (fetchCartStats) {
//       fetchCartStats();
//     }

//     toast.success("Cart updated");
//   } catch (err) {
//     console.error(err.response?.data || err);
//     toast.error("Update failed");
//   } finally {
//     setLoading(false);
//   }
// };

//   // const updateCartItem = async () => {
//   //   try {
//   //     setLoading(true);

//   //     await api.put("/update_quantity/", {
//   //       item_id: item.id,
//   //       quantity,
//   //     });

//   //     const updatedCart = cartItems.map((cartItem) =>
//   //       cartItem.id === item.id
//   //         ? {
//   //             ...cartItem,
//   //             quantity,
//   //             total:
//   //               Number(product.price || 0) *
//   //               Number(quantity),
//   //           }
//   //         : cartItem
//   //     );

//   //     setCartItems(updatedCart);

//   //     recalculateCartCount(updatedCart);

//   //     if (fetchCartStats) {
//   //       fetchCartStats();
//   //     }

//   //     toast.success("Cart updated");
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error("Update failed");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const removeItem = async () => {
//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (cartItem) => cartItem.id !== item.id
//       );

//       setCartItems(updatedCart);

//       recalculateCartCount(updatedCart);

//       if (fetchCartStats) {
//         fetchCartStats();
//       }

//       toast.success("Item removed");
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div className="cart-item d-flex align-items-center mb-3 p-3 bg-light rounded">
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5>{product.name}</h5>

//           <p className="text-muted mb-0">
//             {Number(product.price || 0).toLocaleString(
//               "en-NG",
//               {
//                 style: "currency",
//                 currency: "NGN",
//               }
//             )}
//           </p>
//         </div>

//         <input
//           type="number"
//           min="1"
//           className="form-control me-2"
//           value={quantity}
//           onChange={(e) =>
//             setQuantity(
//               Math.max(1, Number(e.target.value))
//             )
//           }
//           style={{ width: "80px" }}
//         />

//         <button
//           className="btn btn-primary me-2"
//           disabled={loading}
//           onClick={updateCartItem}
//         >
//           {loading ? "Updating..." : "Update"}
//         </button>

//         <button
//           className="btn btn-danger"
//           onClick={removeItem}
//         >
//           Remove
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CartItem;




// import React, { useState } from "react";
// import api, { BASE_URL } from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     try {
//       setLoading(true);

//       const res = await api.put(`/update_item/${item.id}/`, {
//          item_id: item.id,
//         quantity,
//       });

// await api.put("/update_quantity/", {
//   item_id: item.id,
//   quantity,
// });

//       const updatedCart = cartItems.map((c) =>
//         c.id === item.id ? res.data : c
//       );

//       setCartItems(updatedCart);

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       if (setNumCartItems) setNumCartItems(newQuantity);

//       toast.success("Updated");
//     } catch (err) {
//       console.error(err);
//       toast.error("Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     const confirmDelete = window.confirm("Remove item?");
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (c) => c.id !== item.id
//       );

//       setCartItems(updatedCart);

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       if (setNumCartItems) setNumCartItems(newQuantity);

//       toast.success("Item removed");
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>

//           <p className="mb-0 text-muted">
//             {Number(product.price || 0).toLocaleString("en-NG", {
//               style: "currency",
//               currency: "NGN",
//               minimumFractionDigits: 2,
//             })}
//           </p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button
//             className="btn btn-danger btn-sm"
//             onClick={removeItem}
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;


// import React, { useState } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
// }) => {
//   const [quantity, setQuantity] = useState(item?.quantity || 1);

//   const updateCartItem = async (newQty) => {
//     try {
//       const res = await api.put(`/update_item/${item.id}/`, {
//         quantity: newQty,
//       });

//       const updatedCart = cartItems.map((c) =>
//         c.id === item.id ? res.data : c
//       );

//       setCartItems(updatedCart);

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       if (setNumCartItems) setNumCartItems(newQuantity);

//       toast.success("Updated");
//     } catch (err) {
//       console.error(err);
//       toast.error("Update failed");
//     }
//   };

//   const removeItem = async () => {
//     const confirmDelete = window.confirm("Remove item?");
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (c) => c.id !== item.id
//       );

//       setCartItems(updatedCart);

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       if (setNumCartItems) setNumCartItems(newQuantity);

//       toast.success("Item removed");
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };


//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           {/* <p className="mb-0 text-muted">₦{product.price}</p> */}
//           <p className="mb-0 text-muted">
//           {Number(product.price || 0).toLocaleString("en-NG", {
//             style: "currency",
//             currency: "NGN",
//             minimumFractionDigits: 2,
//           })}
//         </p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button
//             className="btn btn-danger btn-sm"
//             onClick={removeItem}
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;
 
//   return (
//     <div className="cart-item">
//       <h4>{item?.product?.name}</h4>

//       <button onClick={() => updateCartItem(quantity + 1)}>+</button>
//       <button onClick={() => updateCartItem(quantity - 1)}>-</button>

//       <button onClick={removeItem}>Remove</button>
//     </div>
//   );
// };

// export default CartItem;

// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api, { BASE_URL } from "../../api";
// import spinner from "../ui/spinner";


// const CartItem = ({setNumCartItems,
//   item,
//   cartItems,
//   setCartItems,
//   setCartTotal,
//   setTotalQuantity
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     setLoading(true);

//     try {
//       const res = await api.patch("/update_quantity/", {
//         quantity,
//         item_id: item?.id,
//       });

//       const updatedItem = res.data.data;

//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem.id === item.id ? updatedItem : cartItem
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, c=-r) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setTotalQuantity(newQuantity);

//       // if (typeof setNumCartItems === "function") {
//       //   setNumCartItems(newQuantity);
//       // }
    
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to update cart item.");
//     } finally {
//       toast.success("Cart item updated successfully!");
//       setLoading(false);
//     }
//      if(loading){
//         return <spinner loading={loading}/>
//       }
     
//   };

  
// const removeItem = async () => {
//   const confirmDelete = window.confirm("Remove item?");
//   if (!confirmDelete) return;

//   try {
//     await api.delete(`/remove_item/${item.id}/`);

//     // Refresh cart from backend
//     await refetchCart();

//     // Refresh navbar count
//     if (typeof fetchCartStats === "function") {
//       await fetchCartStats();
//     }

//     toast.success("Item removed");
//   } catch (err) {
//     console.error("Delete failed:", err);
//     toast.error("Delete failed");
//   }
// };


//   const removeItem = async () => {
//   const confirmDelete = window.confirm("Remove item?");
//   if (!confirmDelete) return;

//   try {
//     // await api.delete(`/remove_item/${item.id}/`);
//     await api.delete(`/remove_item/${item.id}/`);
//     await refetchCart();

//     if (fetchCartStats) {
//       await fetchCartStats();
//     }

//     const updatedCart = cartItems.filter(
//       (cartItem) => cartItem.id !== item.id
//     );

//     setCartItems(updatedCart);

//     const newTotalQty = updatedCart.reduce(
//       (acc, curr) => acc + Number(curr.quantity || 0),
//       0
//     );

//     setTotalQuantity(newTotalQty);

//     // 🔥 THIS IS WHAT UPDATES NAVBAR IN REAL TIME
//     //setNumCartItems(newTotalQty);


//   } catch (err) {
//     //toast.error("Delete failed");
//   }
//   toast.success("Item removed");
// };

  // const removeItem = async () => {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to remove this item from your cart?"
  //   );

  //   if (!confirmDelete) return;

  //   try {
  //     await api.delete(`/remove_item/${item.id}/`);

  //     const updatedCart = cartItems.filter(
  //       (cartItem) => cartItem.id !== item.id
  //     );

  //     setCartItems(updatedCart);

  //     const newTotal = updatedCart.reduce(
  //       (acc, curr) => acc + Number(curr.total || 0),
  //       0
  //     );

  //     const newQuantity = updatedCart.reduce(
  //       (acc, curr) => acc + Number(curr.quantity || 0),
  //       0
  //     );

  //     setCartTotal(newTotal);
  //     setTotalQuantity(newQuantity);

  //     if (typeof setNumCartItems === "function") {
  //       setNumCartItems(newQuantity);
  //     }


  //   } catch (err) {
  //     console.log(err?.response?.data || err.message);
  //     //toast.error("Failed to remove item.");
  //   }
  //   toast.success("Item removed from cart!");
  // };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           {/* <p className="mb-0 text-muted">₦{product.price}</p> */}
//           <p className="mb-0 text-muted">
//           {Number(product.price || 0).toLocaleString("en-NG", {
//             style: "currency",
//             currency: "NGN",
//             minimumFractionDigits: 2,
//           })}
//         </p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button
//             className="btn btn-danger btn-sm"
//             onClick={removeItem}
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;


// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api, { BASE_URL } from "../../api";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
//   setCartTotal,
//   setTotalQuantity,
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     setLoading(true);

//     try {
//       const res = await api.patch("/update_quantity/", {
//         quantity,
//         item_id: item?.id,
//       });

//       const updatedItem = res.data.data;

//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem.id === item.id ? updatedItem : cartItem
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setTotalQuantity(newQuantity);
//       setNumCartItems(newQuantity);

      
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to update cart item.");
//     } finally {
//       toast.success("Cart item updated successfully!");
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to remove this item from your cart?"
//     );

//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (cartItem) => cartItem.id !== item.id
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setTotalQuantity(newQuantity);
//       setNumCartItems(newQuantity);

    
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to remove item.");
//     }
//       toast.success("Item removed from cart!");
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           <p className="mb-0 text-muted">₦{product.price}</p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button className="btn btn-danger btn-sm" onClick={removeItem}>
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;

// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api, { BASE_URL } from "../../api";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
//   setCartTotal,
//   setTotalQuantity,
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     setLoading(true);

//     try {
//       const res = await api.patch("/update_quantity/", {
//         quantity,
//         item_id: item?.id,
//       });

//       const updatedItem = res.data.data;

//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem.id === item.id ? updatedItem : cartItem
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setTotalQuantity(newQuantity);
//       setNumCartItems(newQuantity);

      
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to update cart item.");
//     } finally {
//       toast.success("Cart item updated successfully!");
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to remove this item from your cart?"
//     );

//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (cartItem) => cartItem.id !== item.id
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setTotalQuantity(newQuantity);
//       setNumCartItems(newQuantity);

    
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to remove item.");
//     }
//       toast.success("Item removed from cart!");
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           <p className="mb-0 text-muted">₦{product.price}</p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button className="btn btn-danger btn-sm" onClick={removeItem}>
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;

// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api, { BASE_URL } from "../../api";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
//   setCartTotal,
//   setTotalQuantity,
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     setLoading(true);

//     try {
//       const res = await api.patch("/update_quantity/", {
//         quantity,
//         item_id: item?.id,
//       });

//       const updatedItem = res.data.data;

//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem.id === item.id ? updatedItem : cartItem
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setNumCartItems(newQuantity);
//       setTotalQuantity(newQuantity);

      
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to update cart item.");
//     } finally {
//       toast.success("Cart item updated successfully!");
//       setLoading(false);
//     }
//   };

//   const removeItem = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to remove this item from your cart?"
//     );

//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (cartItem) => cartItem.id !== item.id
//       );

//       setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setNumCartItems(newQuantity);
//       setTotalQuantity(newQuantity);

      
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to remove item.");
//     }
//     toast.success("Item removed from cart!");
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           <p className="mb-0 text-muted">₦{product.price}</p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button className="btn btn-danger btn-sm" onClick={removeItem}>
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;


// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import api, { BASE_URL } from "../../api";

// const CartItem = ({
//   item,
//   cartItems,
//   setCartItems,
//   setNumCartItems,
//   setCartTotal,
//   setTotalQuantity,
// }) => {
//   const product = item?.product;
//   const [quantity, setQuantity] = useState(item?.quantity || 1);
//   const [loading, setLoading] = useState(false);

//   const updateCartItem = async () => {
//     setLoading(true);

//     try {
//       const res = await api.patch("/update_quantity/", {
//         quantity,
//         item_id: item?.id,
//       });

//       const updatedItem = res.data.data;

//       // Update cart items
//       const updatedCart = cartItems.map((cartItem) =>
//         cartItem.id === item.id ? updatedItem : cartItem
//       );

//       setCartItems(updatedCart);

//       // Recalculate totals
//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setNumCartItems(newQuantity);
//       setTotalQuantity(newQuantity);

//       // console.log(res.data)
//       // setLoading(false);
//       // toast.success("Cart item updated successfully!");
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       // setLoading(false);
//       // toast.error("Failed to update cart item.");
//     } finally {
//       setLoading(false);
//       toast.success("Cart item updated successfully!");
//       // setLoading(false);
//     }
//   };



//   const removeItem = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to remove this item from your cart?"
//     );

//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/remove_item/${item.id}/`);

//       const updatedCart = cartItems.filter(
//         (cartItem) => cartItem.id !== item.id
//       );

//       setNumberCartItems(
//         cartItems
//           .filter((cartitem) => cartitem.id !== item.id)
//           .reduce((acc, curr) => acc + curr.quantity, 0)
//       );
//       //setCartItems(updatedCart);

//       const newTotal = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.total || 0),
//         0
//       );

//       const newQuantity = updatedCart.reduce(
//         (acc, curr) => acc + Number(curr.quantity || 0),
//         0
//       );

//       setCartTotal(newTotal);
//       setNumCartItems(newQuantity);
//       setTotalQuantity(newQuantity);

//       toast.success("Item removed from cart!");
//     } catch (err) {
//       console.log(err?.response?.data || err.message);
//       //toast.error("Failed to remove item.");
//     }
//     toast.success("Item removed from cart!");
//   };

//   if (!product) {
//     return (
//       <div className="alert alert-warning">
//         Product data not available
//       </div>
//     );
//   }

//   return (
//     <div className="col-md-12">
//       <div
//         className="cart-item d-flex align-items-center mb-3 p-3"
//         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}a
//       >
//         <img
//           src={
//             product.image
//               ? `${BASE_URL}${product.image}`
//               : "https://picsum.photos/100"
//           }
//           alt={product.name}
//           style={{
//             width: "80px",
//             height: "80px",
//             objectFit: "cover",
//             borderRadius: "5px",
//           }}
//         />

//         <div className="ms-3 flex-grow-1">
//           <h5 className="mb-1">{product.name}</h5>
//           <p className="mb-0 text-muted">₦{product.price}</p>
//         </div>

//         <div className="d-flex align-items-center">
//           <input
//             type="number"
//             min="1"
//             className="form-control me-3"
//             value={quantity}
//             onChange={(e) =>
//               setQuantity(Math.max(1, Number(e.target.value)))
//             }
//             style={{ width: "70px" }}
//           />

//           <button
//             className="btn btn-sm mx-2"
//             onClick={updateCartItem}
//             disabled={loading}
//             style={{
//               backgroundColor: "#4b3bcb",
//               color: "white",
//             }}
//           >
//             {loading ? "Updating..." : "Update"}
//           </button>

//           <button
//             className="btn btn-danger btn-sm"
//             onClick={removeItem}
//           >
//             Remove
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartItem;


// // import React, { useState } from "react";
// // import api, { BASE_URL } from "../../api";

// // const CartItem = ({
// //   item,
// //   cartItems,
// //   setCartItems,
// //   setNumCartItems,
// //   setCartTotal,
// //   setTotalQuantity,
// // }) => {
// //   const product = item?.product;
// //   const [quantity, setQuantity] = useState(item?.quantity || 1);
// //   const [loading, setLoading] = useState(false);

// //   const updateCartItem = async () => {
// //     setLoading(true);

// //     try {
// //       const res = await api.patch("/update_quantity/", {
// //         quantity,
// //         item_id: item?.id,
// //       });

// //       const updatedItem = res.data.data;
// //       // ✅ Update cart items properly
// //       const updatedCart = cartItems.map((cartItem) =>
// //         cartItem.id === item.id ? updatedItem : cartItem
// //       );

// //       setCartItems(updatedCart);

// //       // ✅ Recalculate totals
// //       const newTotal = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.total || 0),
// //         0
// //       );

// //       const newQuantity = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.quantity || 0),
// //         0
// //       );

// //       setCartTotal(newTotal);
// //       setNumCartItems(newQuantity);
// //       setTotalQuantity(newQuantity);
// //     } catch (err) {
// //       console.log(err?.response?.data || err.message);
// //     } finally {
// //       setLoading(false);
// //       toast.success("CartItem has been updated successfully!!! ")
// //     }
// //   };

// //   const removeItem = async () => {
// //     const confirmDelete = window.confirm(
// //       "Are you sure you want to remove this item from your cart?"
// //     );

// //     if (!confirmDelete) return;

// //     try {
// //       await api.delete(`/remove_item/${item.id}/`);

// //       const updatedCart = cartItems.filter(
// //         (cartItem) => cartItem.id !== item.id
// //       );

// //       setCartItems(updatedCart);

// //       const newTotal = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.total || 0),
// //         0
// //       );

// //       const newQuantity = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.quantity || 0),
// //         0
// //       );

// //       setCartTotal(newTotal);
// //       setNumCartItems(newQuantity);
// //       setTotalQuantity(newQuantity);
// //     } catch (err) {
// //       console.log(err?.response?.data || err.message);
// //     }
// //   };

// //   if (!product) {
// //     return (
// //       <div className="alert alert-warning">
// //         Product data not available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="col-md-12">
// //       <div
// //         className="cart-item d-flex align-items-center mb-3 p-3"
// //         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
// //       >
// //         <img
// //           src={
// //             product.image
// //               ? `${BASE_URL}${product.image}`
// //               : "https://picsum.photos/100"
// //           }
// //           alt={product.name}
// //           style={{
// //             width: "80px",
// //             height: "80px",
// //             objectFit: "cover",
// //             borderRadius: "5px",
// //           }}
// //         />

// //         <div className="ms-3 flex-grow-1">
// //           <h5 className="mb-1">{product.name}</h5>
// //           <p className="mb-0 text-muted">₦{product.price}</p>
// //         </div>

// //         <div className="d-flex align-items-center">
// //           <input
// //             type="number"
// //             min="1"
// //             className="form-control me-3"
// //             value={quantity}
// //             onChange={(e) =>
// //               setQuantity(Math.max(1, Number(e.target.value)))
// //             }
// //             style={{ width: "70px" }}
// //           />

// //           <button
// //             className="btn btn-sm mx-2"
// //             onClick={updateCartItem}
// //             disabled={loading}
// //             style={{
// //               backgroundColor: "#4b3bcb",
// //               color: "white",
// //             }}
// //           >
// //             {loading ? "Updating..." : "Update"}
// //           </button>

// //           <button
// //             className="btn btn-danger btn-sm"
// //             onClick={removeItem}
// //           >
// //             Remove
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartItem;

// // import React, { useState } from "react";
// // import api, { BASE_URL } from "../../api";

// // const CartItem = ({
// //   item,
// //   cartItems,
// //   setCartItems,
// //   setNumCartItems,
// //   setCartTotal,
// //   setTotalQuantity,

// // }) => {
// //   const product = item?.product;
// //   const [quantity, setQuantity] = useState(item?.quantity || 1);

// //   const updateCartItem = async () => {
// //     try {
// //       const res = await api.patch("/update_quantity/", {
// //         quantity,
// //         item_id: item?.id,
// //       });

// //       console.log(res.data);

// //       const updatedItem = res.data.data;

// //       // Update cart items
// //       const updatedCart = cartItems.map((cartItem) =>
// //         cartItem.id === item.id ? updatedItem : cartItem
// //       );

// //       setCartItems(updatedCart);

// //       // Update cart total
// //       const newTotal = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.total || 0),
// //         0
// //       );

// //       setCartTotal(newTotal);

// //       // Update cart count
// //       const totalItems = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.quantity || 0),
// //         0
// //       );

// //       setNumCartItems(totalItems);
// //     } catch (err) {
// //       console.log(err?.response?.data || err.message);
// //     }
// //   };

// //   const removeItem = async () => {
// //     const confirmDelete = window.confirm(
// //       "Are you sure you want to remove this item from your cart?"
// //     );

// //     if (!confirmDelete) return;

// //     try {
// //       await api.delete(`/remove_item/${item.id}/`);

// //       const updatedCart = cartItems.filter(
// //         (cartItem) => cartItem.id !== item.id
// //       );

// //       setCartItems(updatedCart);

// //       // Update total amount
// //       const newTotal = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.total || 0),
// //         0
// //       );

// //       setCartTotal(newTotal);

// //       // Update item count
// //       const totalItems = updatedCart.reduce(
// //         (acc, curr) => acc + Number(curr.quantity || 0),
// //         0
// //       );

// //       setNumCartItems(totalItems);
// //     } catch (err) {
// //       console.log(err?.response?.data || err.message);
// //     }
// //   };

// //   if (!product) {
// //     return (
// //       <div className="alert alert-warning">
// //         Product data not available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="col-md-12">
// //       <div
// //         className="cart-item d-flex align-items-center mb-3 p-3"
// //         style={{
// //           backgroundColor: "#f8f9fa",
// //           borderRadius: "8px",
// //         }}
// //       >
// //         {/* Product Image */}
// //         <img
// //           src={
// //             product.image
// //               ? `${BASE_URL}${product.image}`
// //               : "https://picsum.photos/100"
// //           }
// //           alt={product.name}
// //           style={{
// //             width: "80px",
// //             height: "80px",
// //             objectFit: "cover",
// //             borderRadius: "5px",
// //           }}
// //         />

// //         {/* Product Info */}
// //         <div className="ms-3 flex-grow-1">
// //           <h5 className="mb-1">{product.name}</h5>
// //           <p className="mb-0 text-muted">₦{product.price}</p>
// //         </div>

// //         {/* Quantity + Actions */}
// //         <div className="d-flex align-items-center">
// //           <input
// //             type="number"
// //             min="1"
// //             className="form-control me-3"
// //             value={quantity}
// //             onChange={(e) =>
// //               setQuantity(Math.max(1, Number(e.target.value)))
// //             }
// //             style={{ width: "70px" }}
// //           />

// //           <button
// //             className="btn btn-sm mx-2"
// //             onClick={updateCartItem}
// //             style={{
// //               backgroundColor: "#4b3bcb",
// //               color: "white",
// //             }}
// //           >
// //             Update
// //           </button>

// //           <button
// //             className="btn btn-danger btn-sm"
// //             onClick={removeItem}
// //           >
// //             Remove
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartItem;


// // import React, { useState } from "react";
// // import api, { BASE_URL } from "../../api";

// // const CartItem = ({
// //   item,
// //   cartItems,
// //   setCartItems,
// //   setNumCartItems,
// //   setCartTotal,
// // }) => {
// //   const product = item?.product;
// //   const [quantity, setQuantity] = useState(item?.quantity || 1);

// //   const itemData = {
// //     quantity,
// //     item_id: item?.id,
// //   };

// //   function updateCartItem() {
// //     api
// //       .patch("/update_quantity/", itemData)
// //       .then((res) => {
// //         console.log(res.data);

// //         const updatedItem = res.data.data;

// //         // ✅ update cart items
// //         const updatedCart = cartItems.map((cartitem) =>
// //           cartitem.id === item.id ? updatedItem : cartitem
// //         );

// //         setCartItems(updatedCart);

// //         // ✅ recompute total safely
// //         const newTotal = updatedCart.reduce(
// //           (acc, curr) => acc + (curr.total || 0),
// //           0
// //         );

// //         setCartTotal(newTotal);

// //        const updatedCart = cartItems.map((cartitem) =>
// //           cartitem.id === item.id ? updatedItem : cartitem
// //         );

// //         setNumCartItems{updatedCart};

// //       // ✅ recompute total safely
// //         const newTotal = updatedCart.reduce(
// //           (acc, curr) => acc + (curr.quantity || 0),
// //           0
// //         );

// //       })
// //       .catch((err) => {
// //         console.log(err?.response?.data || err.message);
// //       });
// //   }

// //   function removeItem() {
// //     const confirmDelete = window.confirm(
// //       "Are you sure you want to remove this item from your cart?"
// //     );

// //     if (!confirmDelete) return;

// //     api
// //       .delete(`/remove_item/${item.id}/`)
// //       .then(() => {
// //         const updatedCart = cartItems.filter(
// //           (cartitem) => cartitem.id !== item.id
// //         );
// //         setCartItems(updatedCart);
// //         const newTotal = updatedCart.reduce(
// //           (acc, curr) => acc + (curr.total || 0),
// //           0
// //         );

// //         setCartTotal(newTotal);
// //       })
// //       .catch((err) => {
// //         console.log(err?.response?.data || err.message);
// //       });
// //   }

// //   if (!product) {
// //     return (
// //       <div className="alert alert-warning">
// //         Product data not available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="col-md-12">
// //       <div
// //         className="cart-item d-flex align-items-center mb-3 p-3"
// //         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
// //       >
// //         {/* Product Image */}
// //         <img
// //           src={
// //             product.image
// //               ? `${BASE_URL}${product.image}`
// //               : "https://picsum.photos/100"
// //           }
// //           alt={product.name}
// //           style={{
// //             width: "80px",
// //             height: "80px",
// //             objectFit: "cover",
// //             borderRadius: "5px",
// //           }}
// //         />

// //         {/* Product Info */}
// //         <div className="ms-3 flex-grow-1">
// //           <h5 className="mb-1">{product.name}</h5>
// //           <p className="mb-0 text-muted">₦{product.price}</p>
// //         </div>

// //         {/* Quantity + Actions */}
// //         <div className="d-flex align-items-center">
// //           <input
// //             type="number"
// //             min="1"
// //             className="form-control me-3"
// //             value={quantity}
// //             onChange={(e) => setQuantity(Number(e.target.value))}
// //             style={{ width: "70px" }}
// //           />

// //           <button
// //             className="btn btn-sm mx-2"
// //             onClick={updateCartItem}
// //             style={{ backgroundColor: "#4b3bcb", color: "white" }}
// //           >
// //             Update
// //           </button>

// //           <button
// //             className="btn btn-danger btn-sm"
// //             onClick={removeItem}
// //           >
// //             Remove
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartItem;


// // import React, { useState } from "react";
// // import api, { BASE_URL } from "../../api";

// //   const CartItem = ({ item, setCartTotal,cartItems, setCartItems }) => {
// //     const product = item?.product;
// //     const [quantity, setQuantity] = useState(item?.quantity || 1);
// //     const itemData = {quantity,item_id: item?.id,};

// //     function updateCartItem() {
// //   api
// //     .patch("/update_quantity/", itemData)
// //     .then((res) => {
// //       console.log(res.data);

// //       // 🔥 refresh cart immediately
// //       setCartItems(
// //           cartItems.map((cartitem) =>
// //             cartitem.id === item.id ? updatedItem : cartitem
// //           ).reduce(
// //           (acc, curr) => acc + (curr.total || 0),
// //           0
// //         )
// //         );
// //     })
// //     .catch((err) => {
// //       console.log(err?.response?.data || err.message);
// //     });
// // }


// //   //   const updateCartItem = async () => {
// //   //   if (quantity < 1) {
// //   //     alert("Quantity must be at least 1");
// //   //     return;
// //   //   }

// //   //   try {
// //   //     const res = await api.patch("/update_quantity/", {
// //   //       quantity,
// //   //       item_id: item.id,
// //   //     });

// //   //     console.log(res.data);
// //   //   } catch (err) {
// //   //     console.error(err.response?.data || err.message);
// //   //   }
// //   // };

// //   const removeItem = async () => {
// //     const confirmDelete = window.confirm(
// //           "Are you sure you want to remove this item from your cart?"
// //         );
// //         if (!confirmDelete) return;
// //     try {
// //       await api.delete(`/remove_item/${item.id}/`);
// //       window.location.reload();
// //     } catch (err) {
// //       console.log(err.response?.data || err.message);
// //     }
// //   };


// //   if (!product) {
// //     return (
// //       <div className="alert alert-warning">
// //         Product data not available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="col-md-12">
// //       <div
// //         className="cart-item d-flex align-items-center mb-3 p-3"
// //         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
// //       >
// //         {/* Product Image */}
// //         <img
// //           src={
// //             product.image
// //               ? `${BASE_URL}${product.image}`
// //               : "https://picsum.photos/100"
// //           }
// //           alt={product.name}
// //           style={{
// //             width: "80px",
// //             height: "80px",
// //             objectFit: "cover",
// //             borderRadius: "5px",
// //           }}
// //         />

// //         {/* Product Info */}
// //         <div className="ms-3 flex-grow-1">
// //           <h5 className="mb-1">{product.name}</h5>
// //           <p className="mb-0 text-muted">₦{product.price}</p>
// //         </div>

// //         {/* Quantity + Remove */}
// //         <div className="d-flex align-items-center">
// //           <input
// //             type="number"
// //             min="1"
// //             className="form-control me-3"
// //             value={quantity}
// //             onChange={(e) => setQuantity(Number(e.target.value))}
// //             style={{ width: "70px" }}
// //           />
// //           <button className="btn btn-sm mx-2" 
// //           onClick={updateCartItem}
// //           style={{backgroundColor: "#4b3bcb", color:"white"}}>
// //             Update
// //           </button>
// //           <button
// //             className="btn btn-danger btn-sm"
// //             onClick={removeItem}
// //           >
// //             Remove
// //         </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartItem;

// // import React from "react";
// // import { BASE_URL } from "../../api";

// // const CartItem = ({ item }) => {
// //   const product = item?.product;

// //   if (!product) {
// //     return (
// //       <div className="alert alert-warning">
// //         Product data not available
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="col-md-12">
// //       <div
// //         className="cart-item d-flex align-items-center mb-3 p-3"
// //         style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
// //       >
// //         <img
// //           src={
// //             product.image
// //               ? `${BASE_URL}${product.image}`
// //               : "https://picsum.photos/100"
// //           }
// //           alt={product.name}
// //           style={{
// //             width: "80px",
// //             height: "80px",
// //             objectFit: "cover",
// //             borderRadius: "5px",
// //           }}
// //         />

// //         <div className="ms-3 flex-grow-1">
// //           <h5 className="mb-1">{product.name}</h5>
// //           <p className="mb-0 text-muted"> ₦{product.price}</p>
// //         </div>

// //     <div className="ms-3 flex-grow-1">
// //   <h5 className="mb-1">{item.product.name}</h5>
// //   <p className="mb-0 text-muted">₦ ${item.product.price}</p>
// // </div>
// // <div className="d-flex align-items-center">
// //   <input
// //     type="number"
// //     min="1"
// //     className="form-control me-3"
// //     value={quantity}
// //     onChange={(e) => setQuantity(e.target.value)}
// //     style={{ width: "70px" }}
// //   />

// //   <button className="btn btn-danger btn-sm">
// //     Remove
// //   </button>
// // </div>  
// //         <div className="d-flex align-items-center">
// //           <input
// //             type="number"
// //             className="form-control me-3"
// //             value={item.quantity}
// //             readOnly
// //             style={{ width: "70px" }}
// //           />

// //           <button className="btn btn-danger btn-sm">
// //             Remove
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartItem;