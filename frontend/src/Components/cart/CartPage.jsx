import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import useCartData from "../../hooks/useCartData";
import { CartContext } from "../../Context/CartContext";
import api from "../../api";

import styles from "./CartPage.module.css";

const ITEMS_PER_PAGE = 4;

const CartPage = () => {
  const { fetchCartStats } = useContext(CartContext);

  const {
    cartItems,
    cartTotal,
    totalQuantity,
    tax,
    loading,
    refetchCart,
  } = useCartData();

  const [clearingCart, setClearingCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [cartItems.length]);

  const totalPages = Math.ceil(
    cartItems.length / ITEMS_PER_PAGE
  );

  const indexOfLastItem =
    currentPage * ITEMS_PER_PAGE;

  const indexOfFirstItem =
    indexOfLastItem - ITEMS_PER_PAGE;

  const currentItems = cartItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const clearCart = async () => {
    const cartCode =
      localStorage.getItem("cart_code");

    if (!cartCode) {
      toast.error("Cart not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) return;

    try {
      setClearingCart(true);

      await api.delete(
        `/clear-cart/${cartCode}/`
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

      setCurrentPage(1);

      toast.success(
        "Your shopping bag has been cleared"
      );
    } catch (error) {
      console.error(
        "Clear Cart Error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to clear cart"
      );
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <main className={styles.cartPage}>

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className={styles.pageHeader}>
        <div className={styles.container}>

          <span className={styles.eyebrow}>
            YOUR SELECTION
          </span>

          <h1>
            Shopping <em>Bag</em>
          </h1>

          <div className={styles.headerLine} />

          {!loading && cartItems.length > 0 && (
            <p>
              {totalQuantity}{" "}
              {totalQuantity === 1
                ? "item"
                : "items"}{" "}
              selected for your home.
            </p>
          )}

        </div>
      </section>


      {/* =========================================
          CART CONTENT
      ========================================= */}

      <section className={styles.cartSection}>
        <div className={styles.container}>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Preparing your shopping bag...</p>
            </div>
          ) : cartItems.length === 0 ? (

            /* =====================================
               EMPTY CART
            ===================================== */

            <div className={styles.emptyCart}>

              <div className={styles.emptyIcon}>
                <FiShoppingBag />
              </div>

              <span className={styles.eyebrow}>
                YOUR BAG IS EMPTY
              </span>

              <h2>
                Nothing here <em>yet.</em>
              </h2>

              <p>
                Discover beautifully selected furniture,
                décor and pieces designed to transform
                your space.
              </p>

              <Link
                to="/search"
                className={styles.goldButton}
              >
                Explore Collection
                <FiArrowRight />
              </Link>

            </div>

          ) : (

            <div className={styles.cartLayout}>

              {/* ===================================
                  LEFT — ITEMS
              =================================== */}

              <div className={styles.itemsColumn}>

                <div className={styles.itemsHeader}>

                  <div>
                    <span className={styles.smallLabel}>
                      SHOPPING BAG
                    </span>

                    <h2>
                      {cartItems.length}{" "}
                      {cartItems.length === 1
                        ? "Product"
                        : "Products"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={clearCart}
                    disabled={clearingCart}
                  >
                    <FiTrash2 />

                    {clearingCart
                      ? "Clearing..."
                      : "Clear Bag"}
                  </button>

                </div>


                <div className={styles.itemsList}>

                  {currentItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      refetchCart={refetchCart}
                      fetchCartStats={fetchCartStats}
                    />
                  ))}

                </div>


                {/* PAGINATION */}

                {totalPages > 1 && (
                  <div className={styles.pagination}>

                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(
                          (prev) => prev - 1
                        )
                      }
                    >
                      <FiArrowLeft />
                      Previous
                    </button>

                    <span>
                      <strong>{currentPage}</strong>
                      {" "}of{" "}
                      {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (prev) => prev + 1
                        )
                      }
                    >
                      Next
                      <FiArrowRight />
                    </button>

                  </div>
                )}


                {/* CONTINUE SHOPPING */}

                <Link
                  to="/search"
                  className={styles.continueShopping}
                >
                  <FiArrowLeft />
                  Continue Shopping
                </Link>

              </div>


              {/* ===================================
                  RIGHT — SUMMARY
              =================================== */}

              <CartSummary
                cartTotal={cartTotal}
                tax={tax}
                totalQuantity={totalQuantity}
              />

            </div>

          )}

        </div>
      </section>

    </main>
  );
};

export default CartPage;











// import React, {
//   useEffect,
//   useState,
//   useContext,
// } from "react";

// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// import { CartContext } from "../../Context/CartContext";
// import api from "../../api";
// import { toast } from "react-toastify";


// const CartPage = () => {
//   const { fetchCartStats } =
//     useContext(CartContext);

//   const [clearingCart, setClearingCart] = useState(false);
//   const {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart,
//   } = useCartData();

  

//   const [currentPage, setCurrentPage] =
//     useState(1);

//   const itemsPerPage = 4;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   const indexOfLastItem =
//     currentPage * itemsPerPage;

//   const indexOfFirstItem =
//     indexOfLastItem - itemsPerPage;

//   const currentItems =
//     cartItems.slice(
//       indexOfFirstItem,
//       indexOfLastItem
//     );

//   const totalPages = Math.ceil(
//     cartItems.length / itemsPerPage
//   );

//   const clearCart = async () => {
//   const cart_code =
//     localStorage.getItem("cart_code");

//   if (!cart_code) {
//     toast.error("Cart not found");
//     return;
//   }

//   const confirmed = window.confirm(
//     "Are you sure you want to remove all items from your cart?"
//   );

//   if (!confirmed) return;

//   try {
//     setClearingCart(true);

//     await api.delete(
//       `/clear-cart/${cart_code}/`
//     );

//     // Refresh the cart page
//     if (refetchCart) {
//       await refetchCart();
//     }

//     // Refresh navbar cart count
//     if (fetchCartStats) {
//       await fetchCartStats();
//     }

//     // Notify other components that cart changed
//     window.dispatchEvent(
//       new Event("cartUpdated")
//     );

//     // Return pagination to page 1
//     setCurrentPage(1);

//     toast.success(
//       "Cart cleared successfully"
//     );

//   } catch (error) {
//     console.error(
//       "Clear Cart Error:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       "Failed to clear cart"
//     );

//   } finally {
//     setClearingCart(false);
//   }
// };

//   return (
//     <div className="container py-4">
//       <h3 className="mb-4">
//         Shopping Cart
//       </h3>

//       <div className="row">
//         {/* <div className="col-lg-8">
//           {loading ? ( */}
//         <div className="col-lg-8">
//            {!loading && cartItems.length > 0 && (
//             <div className="d-flex justify-content-end mb-3">
//               <button
//                 className="btn btn-outline-danger"
//                 onClick={clearCart}
//                 disabled={clearingCart}
//               >
//                 {clearingCart
//                   ? "Clearing Cart..."
//                   : "Clear Cart"}
//               </button>
//             </div>
//           )}

//           {loading ? (
//             <div className="text-center">
//               Loading cart...
//             </div>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-info">
//               Your cart is empty
//             </div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 refetchCart={refetchCart}
//                 fetchCartStats={
//                   fetchCartStats
//                 }
//               />
//             ))
//           )}

//           {totalPages > 1 && (
//             <div className="d-flex justify-content-between mt-3">
//               <button
//                 className="btn btn-secondary"
//                 disabled={
//                   currentPage === 1
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     (prev) => prev - 1
//                   )
//                 }
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of{" "}
//                 {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 disabled={
//                   currentPage === totalPages
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     (prev) => prev + 1
//                   )
//                 }
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />
//       </div>
//     </div>
//   );
// };

// export default CartPage;



// import React, {
//   useEffect,
//   useState,
//   useContext,
// } from "react";

// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// import {CartContext} from "../../Context/CartContext"


// const CartPage = () => {
//   const { fetchCartStats } =
//     useContext(CartContext);

//   const {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart,
//   } = useCartData();

  

//   const [currentPage, setCurrentPage] =
//     useState(1);

//   const itemsPerPage = 4;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   const indexOfLastItem =
//     currentPage * itemsPerPage;

//   const indexOfFirstItem =
//     indexOfLastItem - itemsPerPage;

//   const currentItems =
//     cartItems.slice(
//       indexOfFirstItem,
//       indexOfLastItem
//     );

//   const totalPages = Math.ceil(
//     cartItems.length / itemsPerPage
//   );

//   return (
//     <div className="container py-4">
//       <h3 className="mb-4">
//         Shopping Cart
//       </h3>

//       <div className="row">
//         <div className="col-lg-8">
//           {loading ? (
//             <div className="text-center">
//               Loading cart...
//             </div>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-info">
//               Your cart is empty
//             </div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 refetchCart={refetchCart}
//                 fetchCartStats={
//                   fetchCartStats
//                 }
//               />
//             ))
//           )}

//           {totalPages > 1 && (
//             <div className="d-flex justify-content-between mt-3">
//               <button
//                 className="btn btn-secondary"
//                 disabled={
//                   currentPage === 1
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     (prev) => prev - 1
//                   )
//                 }
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of{" "}
//                 {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 disabled={
//                   currentPage === totalPages
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     (prev) => prev + 1
//                   )
//                 }
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />
//       </div>
//     </div>
//   );
// };

// export default CartPage;








// import React, {
//   useEffect,
//   useState,
// } from "react";

// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// const CartPage = ({
//   fetchCartStats,
// }) => {

// import { useContext } from "react";
// import { CartContext } from "../../Context/CartContext";

// const CartPage = () => {

//  const { fetchCartStats } =
//    useContext(CartContext);

//   const {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart,
//   } = useCartData();

//   const [currentPage, setCurrentPage] =
//     useState(1);

//   const itemsPerPage = 4;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   const indexOfLastItem =
//     currentPage * itemsPerPage;

//   const indexOfFirstItem =
//     indexOfLastItem - itemsPerPage;

//   const currentItems =
//     cartItems.slice(
//       indexOfFirstItem,
//       indexOfLastItem
//     );

//   const totalPages = Math.ceil(
//     cartItems.length / itemsPerPage
//   );

//   return (
//     <div className="container py-4">

//       <h3 className="mb-4">
//         Shopping Cart
//       </h3>

//       <div className="row">

//         <div className="col-lg-8">

//           {loading ? (
//             <div className="text-center">
//               Loading cart...
//             </div>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-info">
//               Your cart is empty
//             </div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 refetchCart={refetchCart}
//                 fetchCartStats={
//                   fetchCartStats
//                 }
//               />
//             ))
//           )}

//           {totalPages > 1 && (
//             <div className="d-flex justify-content-between mt-3">

//               <button
//                 className="btn btn-secondary"
//                 disabled={
//                   currentPage === 1
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     currentPage - 1
//                   )
//                 }
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of{" "}
//                 {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 disabled={
//                   currentPage === totalPages
//                 }
//                 onClick={() =>
//                   setCurrentPage(
//                     currentPage + 1
//                   )
//                 }
//               >
//                 Next
//               </button>

//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />

//       </div>
//     </div>
//   );
// };

// export default CartPage;










// import React, { useEffect, useState } from "react";
// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// const CartPage = ({ setNumCartItems, fetchCartStats }) => {
//   const {
//     cartItems,
//     setCartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart,
//   } = useCartData();

//   const [currentPage, setCurrentPage] = useState(1);

//   const itemsPerPage = 4;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = cartItems.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );

//   const totalPages = Math.ceil(
//     cartItems.length / itemsPerPage
//   );

//   return (
//     <div className="container my-3 py-3">
//       <h5 className="mb-4">Shopping Cart</h5>

//       <div className="row">
//         <div className="col-md-8">
//           {loading ? (
//             <p>Loading...</p>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-primary">
//               Your cart is empty
//             </div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 cartItems={cartItems}
//                 setCartItems={setCartItems}
//                 setNumCartItems={setNumCartItems}
//                 refetchCart={refetchCart}
//                 fetchCartStats={fetchCartStats}
//               />
//             ))
//           )}

//           {cartItems.length > itemsPerPage && (
//             <div className="d-flex justify-content-between mt-3">
//               <button
//                 className="btn btn-secondary"
//                 disabled={currentPage === 1}
//                 onClick={() =>
//                   setCurrentPage((p) => p - 1)
//                 }
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 disabled={currentPage === totalPages}
//                 onClick={() =>
//                   setCurrentPage((p) => p + 1)
//                 }
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />
//       </div>
//     </div>
//   );
// };

// export default CartPage;



// import React, { useEffect, useState } from "react";
// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// const CartPage = () => {
//   const {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart,
//   } = useCartData();

//   // ✅ pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 4;

//   useEffect(() => {
//     refetchCart();
//   }, [refetchCart]);

//   // reset page when cart changes (important after delete/update)
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   // pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

//   const totalPages = Math.ceil(cartItems.length / itemsPerPage);

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prev) => prev - 1);
//     }
//   };

//   return (
//     <div className="container my-3 py-3">
//       <h5 className="mb-4">Shopping Cart</h5>

//       <div className="row">
//         <div className="col-md-8">
//           {loading ? (
//             <p>Loading...</p>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-primary">Your cart is empty</div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 refetchCart={refetchCart}
//               />
//             ))
//           )}

//           {/* ✅ PAGINATION CONTROLS */}
//           {cartItems.length > itemsPerPage && (
//             <div className="d-flex justify-content-between align-items-center mt-3">
//               <button
//                 className="btn btn-secondary"
//                 onClick={prevPage}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 onClick={nextPage}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />
//       </div>
//     </div>
//   );
// };

// export default CartPage;

// import React, { useEffect, useState } from "react";
// import CartItem from "./CartItem";
// import CartSummary from "./CartSummary";
// import useCartData from "../../hooks/useCartData";

// const CartPage = () => {
// <CartItem
//   key={item.id}
//   item={item}
//   refetchCart={refetchCart}
//   fetchCartStats={fetchCartStats}
// />

//   // const {
//   //   cartItems,
//   //   cartTotal,
//   //   totalQuantity,
//   //   tax,
//   //   loading,
//   //   refetchCart,
//   // } = useCartData();

//   useEffect(() => {
//     refetchCart();
//   }, [refetchCart]);

//   // ✅ pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 4;

//   // reset page when cart changes (important after delete/update)
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [cartItems]);

//   // pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);

//   const totalPages = Math.ceil(cartItems.length / itemsPerPage);

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prev) => prev - 1);
//     }
//   };

//   return (
//     <div className="container my-3 py-3">
//       <h5 className="mb-4">Shopping Cart</h5>

//       <div className="row">
//         <div className="col-md-8">
//           {loading ? (
//             <p>Loading...</p>
//           ) : currentItems.length === 0 ? (
//             <div className="alert alert-primary">
//               Your cart is empty
//             </div>
//           ) : (
//             currentItems.map((item) => (
//               <CartItem
//                 key={item.id}
//                 item={item}
//                 refetchCart={refetchCart}
//               />
//             ))
//           )}

//           {/* ✅ PAGINATION CONTROLS */}
//           {cartItems.length > itemsPerPage && (
//             <div className="d-flex justify-content-between align-items-center mt-3">
//               <button
//                 className="btn btn-secondary"
//                 onClick={prevPage}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>

//               <span>
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button
//                 className="btn btn-primary"
//                 onClick={nextPage}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>

//         <CartSummary
//           cartTotal={cartTotal}
//           tax={tax}
//           totalQuantity={totalQuantity}
//         />
//       </div>
//     </div>
//   );
// };

// export default CartPage;


// // import React, { useEffect } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import useCartData from "../../hooks/useCartData";

// // const CartPage = () => {
// //   const {
// //     cartItems,
// //     cartTotal,
// //     totalQuantity,
// //     tax,
// //     loading,
// //     refetchCart,
// //   } = useCartData();

// //   useEffect(() => {
// //     refetchCart();
// //   }, [refetchCart]);

// //   return (
// //     <div className="container my-3 py-3">
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {loading ? (
// //             <p>Loading...</p>
// //           ) : (
// //             cartItems.map((item) => (
// //               <CartItem
// //                 key={item.id}
// //                 item={item}
// //                 refetchCart={refetchCart}
// //               />
// //             ))
// //           )}
// //         </div>

// //         <CartSummary
// //           cartTotal={cartTotal}
// //           tax={tax}
// //           totalQuantity={totalQuantity}
// //         />
// //       </div>
// //     </div>
// //   );
// // };
// // export default CartPage;

// // import React, { useEffect } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import useCartData from "../../hooks/useCartData";

// // const CartPage = () => {
// //   const {
// //     cartItems,
// //     cartTotal,
// //     totalQuantity,
// //     tax,
// //     loading,
// //     refetchCart,
// //   } = useCartData();

// //   useEffect(() => {
// //     refetchCart();
// //   }, [refetchCart]);

// //   return (
// //     <div className="container my-3 py-3">
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {loading ? (
// //             <p>Loading...</p>
// //           ) : cartItems.length === 0 ? (
// //             <div className="alert alert-primary">
// //               Your cart is empty
// //             </div>
// //           ) : (
// //             cartItems.map((item) => (
// //               <CartItem key={item.id} item={item} refetchCart={refetchCart} />
// //             ))
// //           )}
// //         </div>

// //         <CartSummary
// //           cartTotal={cartTotal}
// //           tax={tax}
// //           totalQuantity={totalQuantity}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;

// // import React from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import useCartData from "../../hooks/useCartData";

// // const CartPage = () => {

// //   const {
// //   cartItems,
// //   setCartItems,
// //   cartTotal,
// //   setCartTotal,
// //   totalQuantity,
// //   setTotalQuantity,
// //   tax,
// //   loading,
// //   refetchCart,
// // } = useCartData();
// //   // const {
// //   //   cartItems,
// //   //   cartTotal,
// //   //   totalQuantity,
// //   //   tax,
// //   //   loading,
// //   //   refetchCart,
// //   // } = useCartData();
  

// //   return (
// //     <div
// //       className="container my-3 py-3"
// //       style={{ height: "80vh", overflowY: "auto" }}
// //     >
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {loading ? (
// //             <div className="alert alert-info">Loading cart...</div>
// //           ) : cartItems.length === 0 ? (
// //             <div className="alert alert-primary">
// //               You haven't added any item to your cart.
// //             </div>
// //           ) : (
// //             cartItems.map((item) => (
// //               <CartItem
// //                 key={item.id}
// //                 item={item}
// //                 cartItems={cartItems}
// //                 refetchCart={refetchCart}
// //               />
// //             ))
// //           )}
// //         </div>

// //         <CartSummary
// //           cartTotal={cartTotal}
// //           tax={tax}
// //           totalQuantity={totalQuantity}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;


// // import React, { useEffect, useState, useCallback } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import api from "../../api";

// // const CartPage = () => {
// //   const  { cartItems, cartTotal, totalQuantity, tax,  loading, } = useCartData()

// //   // const [cartItems, setCartItems] = useState([]);
// //   // const [cartTotal, setCartTotal] = useState(0);
// //   // const [totalQuantity, setTotalQuantity] = useState(0);

// //   // const tax = 4.0;
// //   // const cart_code = localStorage.getItem("cart_code");

// //   // // ✅ Correct placement of useCallback (INSIDE component)
// //   // const fetchCart = useCallback(async () => {
// //   //   if (!cart_code) {
// //   //     console.error("Cart code not found");
// //   //     return;
// //   //   }

// //   //   try {
// //   //     const res = await api.get(`/get_cart?cart_code=${cart_code}`);

// //   //     setCartItems(res.data.items || []);
// //   //     setCartTotal(res.data.sum_total || 0);
// //   //     setTotalQuantity(res.data.quantity || 0);
// //   //   } catch (err) {
// //   //     console.error(
// //   //       "Error fetching cart:",
// //   //       err.response?.data || err.message
// //   //     );
// //   //   }
// //   // }, [cart_code]);

// //   // ✅ fetch cart on mount
// //   useEffect(() => {
// //     fetchCart();
// //   }, [fetchCart]);

// //   // ✅ auto-recalculate totals whenever cart changes
// //   useEffect(() => {
// //     const total = cartItems.reduce(
// //       (sum, item) => sum + Number(item.total || 0),
// //       0
// //     );

    

// //     const quantity = cartItems.reduce(
// //       (sum, item) => sum + Number(item.quantity || 0),
// //       0
// //     );

// //     setCartTotal(total);
// //     setTotalQuantity(quantity);
// //   }, [cartItems]);

// //   return (
// //     <div
// //       className="container my-3 py-3"
// //       style={{ height: "80vh", overflowY: "auto" }}
// //     >
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {cartItems.length === 0 ? (
// //             <div className="alert alert-primary">
// //               You haven't added any item to your cart.
// //             </div>
// //           ) : (
// //             cartItems.map((item) => (
// //               <CartItem
// //                 key={item.id}
// //                 item={item}
// //                 cartItems={cartItems}
// //                 setCartItems={setCartItems}
// //                 setCartTotal={setCartTotal}
// //                 setTotalQuantity={setTotalQuantity}
// //               />
// //             ))
// //           )}
// //         </div>

// //         <CartSummary
// //           cartTotal={cartTotal}
// //           tax={tax}
// //           totalQuantity={totalQuantity}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;

// // import React, { useEffect, useState, useCallback } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import api from "../../api";

// // const fetchCart = useCallback(async () => {
// //   const res = await api.get(`/get_cart?cart_code=${cart_code}`);

// //   setCartItems(res.data.items || []);
// //   setCartTotal(res.data.sum_total || 0);
// // }, [cart_code]);

// //  const CartPage = () => {
// //   const [cartItems, setCartItems] = useState([]);
// //   const [total, setCartTotal] = useState(0);
// //   const [totalQuantity, setTotalQuantity] = useState(0);

// //   const tax = 4.0;
// //   const cart_code = localStorage.getItem("cart_code");

// //   // ✅ useCallback prevents unnecessary re-creations
// //   const fetchCart = useCallback(async () => {
// //     if (!cart_code) {
// //       console.error("Cart code not found");
// //       return;
// //     }

// //     try {
// //       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

// //       console.log("Cart Response:", res.data);

// //       setCartItems(res.data.items || []);
// //       setCartTotal(res.data.sum_total || 0);
// //     } catch (err) {
// //       console.error(
// //         "Error fetching cart:",
// //         err.response?.data || err.message
// //       );
// //     }
// //   }, [cart_code]);

// //   useEffect(() => {
// //   const total = cartItems.reduce(
// //     (sum, item) => sum + Number(item.total || 0),
// //     0
// //   );

// //   const quantity = cartItems.reduce(
// //     (sum, item) => sum + Number(item.quantity || 0),
// //     0
// //   );

// //   setCartTotal(total);
// //   setTotalQuantity(quantity);
// // }, [cartItems]);


// //   useEffect(() => {
// //     fetchCart();
// //   }, [fetchCart]);

// //   if (cartItems.length === 0) {
// //     return (
// //       <div className="container my-5">
// //         <div className="alert alert-primary" role="alert">
// //           You haven't added any item to your cart.
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div
// //       className="container my-3 py-3"
// //       style={{ height: "80vh", overflowY: "auto" }}
// //     >
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {cartItems.map((item) => (
// //             <CartItem
// //               key={item.id}
// //               item={item}
// //               cartItems={cartItems}
// //               setCartTotal={setCartTotal}   // ✅ passed correctly
// //             />
// //           ))}
// //         </div>

// //         <CartSummary cartTotal={total} tax={tax} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;

// // import React, { useEffect, useState } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import api from "../../api";

// // const CartPage = () => {
// //   const [cartItems, setCartItems] = useState([]);
// //   const [total, setCartTotal] = useState(0);

// //   const tax = 4.0;
// //   const cart_code = localStorage.getItem("cart_code");

  
// //   // Move fetchCart outside useEffect
// //   const fetchCart = async () => {
// //     if (!cart_code) {
// //       console.error("Cart code not found");
// //       return;
// //     }

// //     try {
// //       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

// //       console.log("Cart Response:", res.data);

// //       setCartItems(res.data.items || []);
// //       setCartTotal(res.data.sum_total || 0);
// //     } catch (err) {
// //       console.error(
// //         "Error fetching cart:",
// //         err.response?.data || err.message
// //       );
// //     }
// //   };

// //   useEffect(() => {
// //     fetchCart();
// //   }, [cart_code]);

// //   if (cartItems.length === 0) {
// //     return (
// //       <div className="container my-5">
// //         <div className="alert alert-primary" role="alert">
// //           You haven't added any item to your cart.
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div
// //       className="container my-3 py-3"
// //       style={{ height: "80vh", overflowY: "auto" }}
// //     >
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {cartItems.map((item) => (
// //             <CartItem
// //               key={item.id}
// //               item={item}
// //               refreshCart={fetchCart}
// //             />
// //           ))}
// //         </div>

// //         <CartSummary cartTotal={total} tax={tax} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;

// // import React, { useEffect, useState } from "react";
// // import CartItem from "./CartItem";
// // import CartSummary from "./CartSummary";
// // import api from "../../api";

// // const CartPage = () => {
// //   const [cartItems, setCartItems] = useState([]);
// //   const [total, setCartTotal] = useState(0.0);

// //   const tax = 4.0;
// //   const cart_code = localStorage.getItem("cart_code");

// //   useEffect(() => {
// //     const fetchCart = async () => {
// //       if (!cart_code) {
// //         console.error("Cart code not found");
// //         return;
// //       }

// //       try {
// //         const res = await api.get(`/get_cart?cart_code=${cart_code}`);
// //         console.log(res.data);

// //         setCartItems(res.data.items || []);
// //         setCartTotal(res.data.sum_total || 0);
// //       } catch (err) {
// //         console.error("Error fetching cart:", err);
// //       }
// //     };

// //     fetchCart();
// //   }, [cart_code]);

// //   if (cartItems.length < 1) {
// //     return (
// //       <div className="container my-5">
// //         <div className="alert alert-primary" role="alert">
// //           You haven't added any item to your cart.
// //         </div>
// //       </div>
// //     );
// //   }




// //   return (
// //     <div
// //       className="container my-3 py-3"
// //       style={{ height: "80vh", overflowY: "auto" }}
// //     >
// //       <h5 className="mb-4">Shopping Cart</h5>

// //       <div className="row">
// //         <div className="col-md-8">
// //           {cartItems.map((item) => (
// //             // <CartItem key={item.id} item={item} />
// //             <CartItem key={item.id} item={item} refreshCart={fetchCart}/>
// //           ))}
// //         </div>

// //         <CartSummary cartTotal={total} tax={tax} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default CartPage;

// // import React, { useEffect } from 'react'
// // import CartItem from './CartItem'
// // import CartSummary from './CartSummary'
// // import api from '../../api'


// // const CartPage = () => {
// //     const cart_code = localStorage.getItem("cart_code")

// //     useEffect(function(){ 
// //         api.get(`get_cart?cart_code=${cart_code}`)
// //         .then(res =>{
// //             console.log(res.data)
// //         })
// //         .catch(err=>{
// //             console.log(err.message)
// //         })
// //     }, [])  

// //   return (
// //      <div className="container my-3 py-3" style={{ height: "80vh", overflow: "scroll" }}>
// //             <h5 className="mb-4">Shopping Cart</h5>
// //             <div className="row">
// //                 <div className="col-md-8">
// //                     <CartItem />
// //                 </div>

// //                 <CartSummary />
// //             </div>
// //         </div>
// //   );
// // };

// // export default CartPage;

