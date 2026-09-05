import React from "react";
import styles from "./OrderHistoryItem.module.css";

const OrderHistoryItem = ({ item }) => {
  return (
    <div className="card-body">
      <div className={`order-item mb-3 ${styles.orderItem}`}>
        <div className="row align-items-center">

          <div className="col-md-8">
            <h6>{item.order_number}</h6>

            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </p>

            <p>
              <strong>Order ID:</strong>{" "}
              {item.id}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {item.status}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {item.city}
            </p>
          </div>

          <div className="col-md-4 text-center">
            <h6>
              ₦{Number(item.total_amount).toLocaleString()}
            </h6>
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
