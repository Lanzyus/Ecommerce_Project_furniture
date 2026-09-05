import React from "react";
import OrderHistoryItem from "./OrderHistoryItem";

const OrderHistoryItemContainer = ({
  orderitems = [],
}) => {
  if (!Array.isArray(orderitems)) {
    return (
      <div className="alert alert-warning">
        Unable to load order history.
      </div>
    );
  }

  if (orderitems.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <h5>No Order History</h5>

        <p className="mb-0">
          Your orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="order-history-list">

      {orderitems.map((order) => (
        <OrderHistoryItem
          key={order.id}
          item={order}
        />
      ))}

    </div>
  );
};

export default OrderHistoryItemContainer;










// import React from "react";
// import OrderHistoryItem from "./OrderHistoryItem";
// import styles from "./OrderHistoryItemContainer.module.css";

// const OrderHistoryItemContainer = ({
//   orderitems = [],
// }) => {
//   return (
//     <section className={styles.ordersSection}>

//       {/* =====================================================
//           SECTION HEADER
//       ====================================================== */}

//       <div className={styles.ordersHeader}>

//         <div>

//           <span className={styles.eyebrow}>
//             YOUR ACTIVITY
//           </span>

//           <h2>
//             Order History
//           </h2>

//           <p>
//             A record of your purchases and
//             recent orders.
//           </p>

//         </div>


//         <div className={styles.orderCount}>

//           <strong>
//             {orderitems.length}
//           </strong>

//           <span>
//             {orderitems.length === 1
//               ? "ORDER"
//               : "ORDERS"}
//           </span>

//         </div>

//       </div>


//       {/* =====================================================
//           ORDERS
//       ====================================================== */}

//       {orderitems.length === 0 ? (

//         <div className={styles.emptyOrders}>

//           <div className={styles.emptyIcon}>
//             —
//           </div>

//           <h3>
//             No orders yet
//           </h3>

//           <p>
//             Your order history will appear here
//             once you make your first purchase.
//           </p>

//         </div>

//       ) : (

//         <div className={styles.ordersList}>

//           {orderitems.map((item, index) => (

//             <OrderHistoryItem
//               key={
//                 item?.id ||
//                 item?.order_number ||
//                 index
//               }
//               item={item}
//             />

//           ))}

//         </div>

//       )}

//     </section>
//   );
// };

// export default OrderHistoryItemContainer;







// // src/Components/user/OrderHistoryItemContainer.jsx
// import React from "react";
// import OrderHistoryItem from "./OrderHistoryItem";

// const OrderHistoryItemContainer = ({ orderitems = [] }) => {
//   console.log("Received orderitems:", orderitems);

//   return (
//     <div className="card mt-4">
//       <div
//         className="card-header"
//         style={{
//           backgroundColor: "#6050DC",
//           color: "#fff",
//         }}
//       >
//         <h5 className="mb-0">Order History</h5>
//       </div>

//       <div
//         className="card-body"
//         style={{
//           maxHeight: "400px",
//           overflowY: "auto",
//         }}
//       >
//         {orderitems.length === 0 ? (
//           <p>No orders found.</p>
//         ) : (
//           orderitems.map((item) => (
//             <OrderHistoryItem
//               key={item.id}
//               item={item}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrderHistoryItemContainer;


