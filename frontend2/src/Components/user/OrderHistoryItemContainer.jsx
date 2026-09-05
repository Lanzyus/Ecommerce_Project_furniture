// src/Components/user/OrderHistoryItemContainer.jsx
import React from "react";
import OrderHistoryItem from "./OrderHistoryItem";

const OrderHistoryItemContainer = ({ orderitems = [] }) => {
  console.log("Received orderitems:", orderitems);

  return (
    <div className="card mt-4">
      <div
        className="card-header"
        style={{
          backgroundColor: "#6050DC",
          color: "#fff",
        }}
      >
        <h5 className="mb-0">Order History</h5>
      </div>

      <div
        className="card-body"
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {orderitems.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orderitems.map((item) => (
            <OrderHistoryItem
              key={item.id}
              item={item}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistoryItemContainer;


