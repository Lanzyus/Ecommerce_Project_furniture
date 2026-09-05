import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield, FiLock } from "react-icons/fi";

import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";
import useCartData from "../../hooks/useCartData";

import styles from "./CheckoutPage.module.css";

function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    totalQuantity,
    tax,
    loading,
    refetchCart,
  } = useCartData();

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>Preparing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.checkoutPage}>

      {/* =========================================
          HEADER
      ========================================= */}
      <section className={styles.checkoutHeader}>
        <div className={styles.container}>

          <Link to="/cart" className={styles.backLink}>
            <FiArrowLeft />
            Back to Cart
          </Link>

          <div className={styles.heading}>
            <span>SECURE CHECKOUT</span>

            <h1>Complete Your Order</h1>

            <p>
              Review your selected pieces and choose your
              preferred payment method.
            </p>
          </div>

          <div className={styles.security}>
            <div>
              <FiLock />
              <span>Secure Checkout</span>
            </div>

            <div>
              <FiShield />
              <span>Protected Payment</span>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================
          CHECKOUT CONTENT
      ========================================= */}
      <section className={styles.checkoutContent}>
        <div className={styles.container}>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCheckout}>

              <div className={styles.emptyIcon}>
                🛍
              </div>

              <span>YOUR CART</span>

              <h2>Your cart is empty</h2>

              <p>
                There are currently no items ready for checkout.
              </p>

              <Link to="/search" className={styles.shopButton}>
                Continue Shopping
              </Link>

            </div>
          ) : (
            <div className={styles.checkoutGrid}>

              {/* ORDER */}
              <OrderSummary
                cartItems={cartItems}
                cartTotal={cartTotal}
                tax={tax}
                totalQuantity={totalQuantity}
              />

              {/* PAYMENT */}
              <PaymentSection
                cartItems={cartItems}
                cartTotal={cartTotal}
                totalQuantity={totalQuantity}
                tax={tax}
                refetchCart={refetchCart}
              />

            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default CheckoutPage; 













// import React from "react";
// import OrderSummary from "./OrderSummary";
// import PaymentSection from "./PaymentSection";
// import useCartData from "../../hooks/useCartData";

// function CheckoutPage() {
//   const {cartItems,cartTotal,totalQuantity,tax,loading, refetchCart,} = useCartData();


//   return (
//     <div className="container my-3">
//       <div className="row">
//         <OrderSummary  cartItems={cartItems} />
//         <PaymentSection />
//       </div>
//     </div>
//   );
// }

// export default CheckoutPage;



// import React from 'react'
// import OrderSummary from './OrderSummary'
// import PaymentSection from './PaymentSection'

// function CheckoutPage() {
//   return (
//     <div className="container my-3">
//   <div className="row">
//     <OrderSummary />
//     <PaymentSection/>
//   </div>
// </div> 
//   )
// }

// export default CheckoutPage

