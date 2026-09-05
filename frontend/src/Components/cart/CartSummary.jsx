import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import styles from "./CartSummary.module.css";

const CartSummary = ({ cartTotal, tax, totalQuantity }) => {
  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const subTotal = Number(cartTotal || 0);
  const cartTax = Number(tax || 0);
  const total = subTotal + cartTax;

  return (
    <aside className={styles.summary}>
      <div className={styles.summaryCard}>

        {/* Header */}
        <div className={styles.summaryHeader}>
          <div className={styles.iconBox}>
            <FiShoppingBag />
          </div>

          <div>
            <span className={styles.eyebrow}>
              YOUR ORDER
            </span>

            <h2>Cart Summary</h2>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Quantity */}
        <div className={styles.summaryRow}>
          <span>Total Quantity</span>
          <strong>{totalQuantity}</strong>
        </div>

        {/* Subtotal */}
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(subTotal)}</span>
        </div>

        {/* Tax */}
        <div className={styles.summaryRow}>
          <span>Tax</span>
          <span>{formatCurrency(cartTax)}</span>
        </div>

        <div className={styles.divider} />

        {/* Total */}
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        {/* Checkout */}
        <Link to="/checkout" className={styles.checkoutButton}>
          <span>Proceed to Checkout</span>
          <FiArrowRight />
        </Link>

        {/* Continue Shopping */}
        <Link to="/search" className={styles.continueShopping}>
          Continue Shopping
        </Link>

      </div>
    </aside>
  );
};

export default CartSummary;









// import React from "react";
// import { Link } from "react-router-dom";

// const CartSummary = ({ cartTotal, tax, totalQuantity }) => {
//   const formatCurrency = (amount) =>
//     Number(amount || 0).toLocaleString("en-NG", {
//       style: "currency",
//       currency: "NGN",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const subTotal = Number(cartTotal || 0);
//   const cartTax = Number(tax || 0);
//   // const total = subTotal + cartTax;
//   const total =
//   Number(cartTotal || 0) +
//   Number(tax || 0);

//   return (
//     <div className="col-md-4 align-self-start">
//       <div className="card">
//         <div className="card-body">
//           <h5 className="card-title">Cart Summary</h5>
//           <hr />

//           <div className="d-flex justify-content-between mb-3">
//             <span>Total Quantity:</span>
//             <strong>{totalQuantity}</strong>
//           </div>

//           <div className="d-flex justify-content-between">
//             <span>Subtotal:</span>
//             <span>{formatCurrency(subTotal)}</span>
//           </div>

//           <div className="d-flex justify-content-between">
//             <span>Tax:</span>
//             <span>{formatCurrency(cartTax)}</span>
//           </div>

//           <div className="d-flex justify-content-between mb-3">
//             <span>Total:</span>
//             <strong>{formatCurrency(total)}</strong>
//           </div>

//           <Link to="/checkout">
//             <button
//               className="btn btn-primary w-100"
//               style={{
//                 backgroundColor: "#6050DC",
//                 borderColor: "#6050DC",
//               }}
//             >
//               Proceed to Checkout
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartSummary;



// import React from "react";
// import { Link } from "react-router-dom";

// const CartSummary = ({ cartTotal, tax, totalQuantity }) => {
//   const subTotal = Number(cartTotal).toFixed(2);
//   const cartTax = Number(tax).toFixed(2);
//   const total = (Number(cartTotal) + Number(tax)).toFixed(2);

//   return (
//     <div className="col-md-4 align-self-start">
//       <div className="card">
//         <div className="card-body">
//           <h5 className="card-title">Cart Summary</h5>
//           <hr />

//           <div className="d-flex justify-content-between mb-3">
//             <span>Total Quantity:</span>
//             <strong>{totalQuantity}</strong>
//           </div>

//           <div className="d-flex justify-content-between">
//             <span>Subtotal:</span>
//             <span>₦{subTotal}</span>
//           </div>

//           <div className="d-flex justify-content-between">
//             <span>Tax:</span>       
//             <span>₦{cartTax}</span>
//           </div>

//           <div className="d-flex justify-content-between mb-3">
//             <span>Total:</span>
//             <strong>₦{total}</strong>
//           </div>

//           <Link to="/checkout">
//             <button
//               className="btn btn-primary w-100"
//               style={{
//                 backgroundColor: "#6050DC",
//                 borderColor: "#6050DC",
//               }}
//             >
//               Proceed to Checkout
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartSummary;


// import React from 'react'
// import {Link} from 'react-router-dom'

//     const CartSummary = ({ cartTotal, tax , totalQuantity}) => {
//     const subTotal = cartTotal.toFixed(2)
//     const cartTax = tax.toFixed(2)
//     const total = (cartTotal+ tax).toFixed(2) 
//     const quantity = totalQuantity


//   return (
//     <div className="col-md-4 align-self-start">
//             <div className="card">
//                 <div className="card-body">
//                     <h5 className="card-title">Cart Summary</h5>
//                     <hr />
//                     <div className="d-flex justify-content-between mb-3">
//                         <span>Total quantity:</span>
//                         <strong>{`${quantity}`}</strong>
//                     </div>
//                     <div className="d-flex justify-content-between">
//                         <span>Subtotal:</span>
//                         <span>{`₦${subTotal}`}</span>
//                     </div>
//                     <div className="d-flex justify-content-between">
//                         <span>Tax:</span>
//                         <span>{`₦${cartTax}`}</span>
//                     </div>
//                     <div className="d-flex justify-content-between mb-3">
//                         <span>Total:</span>
//                         <strong>{`₦${total}`}</strong>
//                     </div>
//                     <Link to="/checkout">
//                         <button
//                             className="btn btn-primary w-100"
//                             style={{ backgroundColor: '#6050DC', borderColor: '#6050DC' }}
//                         >
//                             Proceed to Checkout
//                         </button>
//                     </Link>
//                 </div>
//             </div>
//         </div>
//   );
// };

// export default CartSummary;
