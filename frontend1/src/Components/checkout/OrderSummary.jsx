import React from "react";
import OrderItems from "./OrderItems";
import styles from "./OrderSummary.module.css";

const OrderSummary = ({
  cartItems = [],
}) => {
  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item?.total || 0),
    0
  );

  return (
    <div className="col-md-8">
      <div
        className={`card mb-4 ${styles.card}`}
      >
        <div
          className="card-header"
          style={{
            backgroundColor: "#605EDC",
            color: "white",
          }}
        >
          <h5 className="mb-0">
            Order Summary
          </h5>
        </div>

        <div className="card-body">
          <div
            className="px-3"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {cartItems.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">
                  Your cart is empty
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <OrderItems
                  key={item.id}
                  item={item}
                />
              ))
            )}
          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center">
            <h5>Total</h5>

            <h5>
              ₦
              {total.toLocaleString(
                "en-NG",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;










// import React from "react";
// import OrderItems from "./OrderItems";
// import styles from "./OrderSummary.module.css";

// const OrderSummary = ({ cartItems = [] }) => {
//   const total = cartItems.reduce(
//     (sum, item) => sum + Number(item.total || 0),
//     0
//   );

//   return (
//     <div className="col-md-8">
//       <div className={`card mb-4 ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{ backgroundColor: "#605EDC", color: "white" }}
//         >
//           <h5 className="mb-0">Cart Summary</h5>
//         </div>

//         <div className="card-body">
//           <div className="px-3" style={{ height: "300px", overflowY: "auto" }}>
//             {cartItems.length === 0 ? (
//               <p className="text-muted">No items in cart</p>
//             ) : (
//               cartItems.map((item) => (
//                 <OrderItems key={item.id} item={item} />
//               ))
//             )}
//           </div>

//           <hr />

//           <div className="d-flex justify-content-between">
//             <h6 className="mb-0">Total</h6>
//             {/* <h6 className="mb-0">₦{total.toFixed(2)}</h6> */}
//             <h6 className="mb-0">
//               ₦{Number(total).toLocaleString("en-NG", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </h6>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSummary;


// import React from "react";
// import OrderItems from "./OrderItems";
// import styles from "./OrderSummary.module.css";

// const OrderSummary = ({ cartItems = [] }) => {
//   return (
//     <div className="col-md-8">
//       <div className={`card mb-4 ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{ backgroundColor: "#605EDC", color: "white" }}
//         >
//           <h5 className="mb-0">Cart Summary</h5>
//         </div>

//         <div className="card-body">
//           <div className="px-3" style={{ height: "300px", overflowY: "auto" }}>
//             {cartItems.length === 0 ? (
//               <p className="text-muted">No items in cart</p>
//             ) : (
//               cartItems.map(cartItem => 
//                 <cartItem key={cartItem.id} cartItem={cartItem} />
//               )
//             )}
//           </div>

//           <hr />

//           <div className="d-flex justify-content-between">
//             <h6 className="mb-0">Total</h6>
//             <h6 className="mb-0">$100.00</h6>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSummary;


// import React from "react";
// import OrderItems from "./OrderItems";
// import styles from "./OrderSummary.module.css";

// const OrderSummary = () => {
//   return (
//     <div className="col-md-8">
//       <div className={`card mb-4 ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{ backgroundColor: "#605EDC", color: "white" }}
//         >
//           <h5>Cart Summary</h5>
//         </div>

//         <div className="card-body">
//           <div
//             className="px-3"
//             style={{ height: "300px", overflowY: "auto" }}
//           >
//             {/* {cartItems.map(item => (
//               <OrderItems key={item.id} item={item} />
//             ))} */}

//             <OrderItems />
//           </div>

//           <hr />

//           <div className="d-flex justify-content-between">
//             <h6>Total</h6>
//             <h6>$100.00</h6>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderSummary;


// import React from 'react'
// import OrderItems from './OrderItems'
// import styles from  './OrderSummary.module.css'

// const OrderSummary = () => {
//   return (
// <div className="col-md-8">
//       <div className={`card mb-4 ${styles.card}`}>
//         <div className="card-header" style={{ backgroundColor: '#605EDC', color: 'white' }}>
//           <h5>Cart Summary</h5>
//         </div>

//         <div className="card-body">
//           <div className="px-3" style={{ height: '300px', overflow: 'auto' }}>
//             {/* {cartitems.map(item => <OrderItem key={item.id} />)} */}
//           <OrderItems />

//           </div>

//           <hr />

//           <div className="d-flex justify-content-between">
//             <h6>Total</h6>
//             <h6>$100.00</h6>
//           </div>
//         </div>
//       </div>
//     </div>
    
//   )
// }

// export default OrderSummary


 