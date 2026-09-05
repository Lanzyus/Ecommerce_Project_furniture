import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

import logo from "../../assets/image/NaijaOpenMarket.png";

const OrdersPage = () => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");


  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("access");

        await api.delete(
            `/orders/delete/${orderId}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setOrders(
            orders.filter(
                (order) => order.id !== orderId
            )
        );

        alert("Order deleted successfully");

    } catch (error) {
        console.error(error);

        alert(
            error.response?.data?.error ||
            "Failed to delete order"
        );
    }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const fetchOrders = async () => {
    try {
      const res = await api.get(
        "/my-orders/"
      );

      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (
    orderId
  ) => {
    try {
      if (selectedOrder === orderId) {
        setSelectedOrder(null);
        return;
      }

      if (orderDetails[orderId]) {
        setSelectedOrder(orderId);
        return;
      }

      setLoadingDetails(true);

      const res = await api.get(
        `/orders/${orderId}/`
      );

      setOrderDetails((prev) => ({
        ...prev,
        [orderId]: res.data,
      }));

      setSelectedOrder(orderId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const generateInvoicePDF = async (
    order,
    details
  ) => {
    try {
      const doc = new jsPDF();

      const invoiceUrl =
        `${window.location.origin}/invoice/${order.id}`;

      const qrCodeImage =
        await QRCode.toDataURL(
          invoiceUrl
        );

      // LOGO

      doc.addImage(
        logo,
        "PNG",
        14,
        10,
        25,
        25
      );

      // HEADER

      doc.setFontSize(22);

      doc.text(
        "NaijaOpenMarket",
        45,
        18
      );

      doc.setFontSize(10);

      doc.text(
        "Your Trusted Online Marketplace",
        45,
        25
      );

      doc.setFontSize(18);

      doc.text(
        "INVOICE",
        160,
        20
      );

      // QR CODE

      doc.addImage(
        qrCodeImage,
        "PNG",
        160,
        30,
        35,
        35
      );

      // ORDER INFO

      doc.setFontSize(11);

      doc.text(
        `Invoice No: ${order.order_number}`,
        14,
        45
      );

      doc.text(
        `Date: ${new Date(
          order.created_at
        ).toLocaleDateString()}`,
        14,
        52
      );

      doc.text(
        `Status: ${order.status}`,
        14,
        59
      );

      doc.text(
        `Payment Status: ${
          order.payment_status ||
          "Paid"
        }`,
        14,
        66
      );

      // CUSTOMER

      doc.setFontSize(14);

      doc.text(
        "Customer Information",
        14,
        82
      );

      doc.setFontSize(11);

      doc.text(
        `Customer: ${
          order.full_name || ""
        }`,
        14,
        90
      );

      doc.text(
        `Email: ${
          order.email || ""
        }`,
        14,
        97
      );

      doc.text(
        `Phone: ${
          order.phone || ""
        }`,
        14,
        104
      );

      doc.text(
        `Address: ${
          order.shipping_address || ""
        }`,
        14,
        111
      );

      // ITEMS

      const rows =
        details?.items?.map(
          (item) => [
            item.product_name,
            item.quantity,
            `₦${formatCurrency(
              item.unit_price
            )}`,
            `₦${formatCurrency(
              item.total_price
            )}`,
          ]
        ) || [];

      autoTable(doc, {
        startY: 120,

        head: [
          [
            "Product",
            "Qty",
            "Unit Price",
            "Total",
          ],
        ],

        body: rows,

        theme: "grid",

        headStyles: {
          fillColor: [96, 88, 220],
        },
      });

      const finalY =
        doc.lastAutoTable.finalY + 15;

      // TOTALS

      doc.text(
        `Subtotal: ₦${formatCurrency(
          order.subtotal
        )}`,
        130,
        finalY
      );

      doc.text(
        `VAT: ₦${formatCurrency(
          order.vat
        )}`,
        130,
        finalY + 8
      );

      doc.text(
        `Delivery Fee: ₦${formatCurrency(
          order.delivery_fee
        )}`,
        130,
        finalY + 16
      );

      doc.setFontSize(14);

      doc.text(
        `TOTAL: ₦${formatCurrency(
          order.total_amount
        )}`,
        130,
        finalY + 28
      );

      // FOOTER

      doc.setFontSize(10);

      doc.text(
        "Thank you for shopping with NaijaOpenMarket",
        14,
        finalY + 45
      );

      doc.text(
        "support@naijaopenmarket.com",
        14,
        finalY + 52
      );

      doc.save(
        `${order.order_number}-Invoice.pdf`
      );
    } catch (err) {
      console.error(
        "Invoice Error:",
        err
      );
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        Loading orders...
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );

  return (
    <div className="container py-5">

      <h2 className="mb-4">
        My Orders
      </h2>

      <table className="table table-hover">

        <thead className="table-dark">
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {orders.map((order) => (
            <React.Fragment
              key={order.id}
            >

              <tr>

                <td>

                  <button
                    className="btn btn-link"
                    onClick={() =>
                      fetchOrderDetails(
                        order.id
                      )
                    }
                  >
                    {order.order_number}
                  </button>

                </td>

                <td>
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </td>

                <td>
                  ₦
                  {formatCurrency(
                    order.total_amount
                  )}
                </td>

                <td>
                  {order.status}
                </td>

                <td>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteOrder(order.id)}
                    >
                        Delete
                    </button>
                </td>


              </tr>
{selectedOrder === order.id && (
  <tr>
    <td colSpan="4" className="bg-light">
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <h5 className="mb-3">
            Order Details
          </h5>

          {loadingDetails ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : (
            <>
              <div className="row">

                <div className="col-md-6">

                  <p>
                    <strong>Shipping Address:</strong>
                  </p>

                  <p>
                    {order.shipping_address}
                  </p>

                  <p>
                    <strong>City:</strong>{" "}
                    {order.city}
                  </p>

                </div>

                <div className="col-md-6">

                  <p>
                    <strong>Payment Type:</strong>{" "}
                    {orderDetails[order.id]?.payment_type ||
                      "Online"}
                  </p>

                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {orderDetails[order.id]?.payment_method ||
                      "Paystack"}
                  </p>

                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <span className="badge bg-success">
                      {order.payment_status || "Paid"}
                    </span>
                  </p>

                </div>

              </div>

              <hr />

              <h6 className="fw-bold">
                Ordered Items
              </h6>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <thead>
                  <tr>
                      <th>Order Number</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                  </tr>
              </thead>

                <tbody>

                  {orderDetails[order.id]?.items?.length > 0 ? (

                    orderDetails[order.id].items.map(
                      (item) => (
                        <tr key={item.id}>

                          <td>
                            {item.product_name}
                          </td>

                          <td>
                            {item.quantity}
                          </td>

                          <td>
                            ₦
                            {Number(
                              item.unit_price
                            ).toLocaleString()}
                          </td>

                          <td>
                            ₦
                            {Number(
                              item.total_price
                            ).toLocaleString()}
                          </td>

                        </tr>
                      )
                    )

                  ) : (

                    <tr>
                      <td
                        colSpan="4"
                        className="text-center"
                      >
                        No items found.
                      </td>
                    </tr>

                  )}

                </tbody>
              </table>

              <div className="mt-4 d-flex gap-2 flex-wrap">

                <Link
                  to={`/invoice/${order.id}`}
                  className="btn btn-success"
                >
                  View Invoice
                </Link>

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    generateInvoicePDF(
                      order,
                      orderDetails[order.id]
                    )
                  }
                >
                  Download PDF
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    window.print()
                  }
                >
                  Print Order
                </button>

              </div>

            </>
          )}

        </div>
      </div>
    </td>
  </tr>
)}
              {/* {selectedOrder ===
                order.id && (
                <tr>

                  <td colSpan="4">

                    <div className="card">

                      <div className="card-body">

                        {loadingDetails ? (
                          "Loading..."
                        ) : (
                          <>
                            <p>
                              <strong>
                                Address:
                              </strong>{" "}
                              {
                                order.shipping_address
                              }
                            </p>

                            <p>
                              <strong>
                                City:
                              </strong>{" "}
                              {order.city}
                            </p>

                            <p>
                              <strong>
                                Payment Type:
                              </strong>{" "}
                              {
                                orderDetails[
                                  order.id
                                ]
                                  ?.payment_type
                              }
                            </p>

                            <p>
                              <strong>
                                Payment Method:
                              </strong>{" "}
                              {
                                orderDetails[
                                  order.id
                                ]
                                  ?.payment_method
                              }
                            </p>

                            <div className="d-flex gap-2 mt-3">

                              <Link
                                to={`/invoice/${order.id}`}
                                className="btn btn-success"
                              >
                                View Invoice
                              </Link>

                              <button
                                className="btn btn-danger"
                                onClick={() =>
                                  generateInvoicePDF(
                                    order,
                                    orderDetails[
                                      order.id
                                    ]
                                  )
                                }
                              >
                                Download PDF
                              </button>

                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  window.print()
                                }
                              >
                                Print Order
                              </button>

                            </div>
                          </>
                        )}

                      </div>

                    </div>

                  </td>

                </tr>
              )} */}

            </React.Fragment>
          ))}

        </tbody>

      </table>

    </div>
  );
};

export default OrdersPage;





// import React, { useEffect, useState } from "react";
// import api from "../../api";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { Link } from "react-router-dom";

// import QRCode from "qrcode";
// import logo from "../../assets/image/NaijaOpenMarket.png";

// const OrdersPage = () => {
// const generateInvoicePDF = (order, details) => {
//   const doc = new jsPDF();


// const invoiceUrl =
//   `${window.location.origin}/invoice/${order.id}`;

// const qrCodeImage =
//   await QRCode.toDataURL(invoiceUrl);

//   const formatCurrency = (amount) =>
//     Number(amount || 0).toLocaleString("en-NG", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
// const img = new Image();
// img.src = logo;

// img.onload = () => {
//   doc.addImage(
//     img,
//     "PNG",
//     14,
//     10,
//     30,
//     30
//   );
// };


//   // Header
//   doc.setFontSize(24);
//   doc.setTextColor(96, 88, 220);
//   doc.text("NaijaOpenMarket", 14, 20);

//   doc.setFontSize(12);
//   doc.setTextColor(0, 0, 0);

//   doc.text(
//     "Your Trusted Online Marketplace",
//     14,
//     28
//   );

//   // Invoice Title
//   doc.setFontSize(18);
//   doc.text("INVOICE", 160, 20);

//   doc.setFontSize(11);

//   doc.text(
//     `Invoice No: ${order.order_number}`,
//     14,
//     45
//   );

//   doc.text(
//     `Date: ${new Date(
//       order.created_at
//     ).toLocaleDateString()}`,
//     14,
//     52
//   );

//   doc.text(
//     `Status: ${order.status}`,
//     14,
//     59
//   );

//   doc.text(
//   `Payment Type: ${details.payment_type}`,
//   14,
//   55
// );

// doc.text(
//   `Payment Method: ${details.payment_method}`,
//   14,
//   63
// );
//   // Customer Details
//   doc.setFontSize(14);
//   doc.text("Shipping Information", 14, 75);

//   doc.setFontSize(11);

//   doc.text(
//     `Address: ${order.shipping_address}`,
//     14,
//     85
//   );

//   doc.text(
//     `City: ${order.city}`,
//     14,
//     92
//   );
// doc.addImage(
//   qrCodeImage,
//   "PNG",
//   160,
//   30,
//   35,
//   35
// );

//   // Products Table
//   const rows =
//     details?.items?.map((item) => [
//       item.product_name,
//       item.quantity,
//       `₦${formatCurrency(
//         item.unit_price
//       )}`,
//       `₦${formatCurrency(
//         item.total_price
//       )}`,
//     ]) || [];

//   autoTable(doc, {
//     startY: 105,
//     head: [
//       [
//         "Product",
//         "Qty",
//         "Unit Price",
//         "Total",
//       ],
//     ],
//     body: rows,
//     theme: "grid",
//     headStyles: {
//       fillColor: [96, 88, 220],
//     },
//   });

//   const finalY =
//     doc.lastAutoTable.finalY + 15;

//   // Summary
//   doc.setFontSize(12);

//   doc.text(
//     `Subtotal: ₦${formatCurrency(
//       order.subtotal
//     )}`,
//     130,
//     finalY
//   );

//   doc.text(
//     `Total: ₦${formatCurrency(
//       order.total_amount
//     )}`,
//     130,
//     finalY + 10
//   );

//   // Footer
//   doc.setFontSize(10);

//   doc.text(
//     "Thank you for shopping with NaijaOpenMarket.",
//     14,
//     finalY + 30
//   );

//   doc.text(
//     "For support contact support@naijaopenmarket.com",
//     14,
//     finalY + 38
//   );

//   doc.save(
//     `${order.order_number}-Invoice.pdf`
//   );
// };

//   const logo = "/assets/image/NaijaOpenMarket.png";

// const img = new Image();

// img.src = logo;

// img.onload = () => {
//   doc.addImage(
//     img,
//     "PNG",
//     14,
//     10,
//     25,
//     25
//   );

//   // Rest of PDF generation code
// };

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingDetails, setLoadingDetails] = useState(false);
//   const [error, setError] = useState("");

//   const [selectedOrder, setSelectedOrder] =
//     useState(null);

//   const [orderDetails, setOrderDetails] =
//     useState({});

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get(
//         "/my-orders/"
//       );

//       console.log(
//         "Orders Response:",
//         response.data
//       );

//       setOrders(
//         response.data.orders || []
//       );
//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//           "Failed to load orders."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrderDetails = async (
//     orderId
//   ) => {
//     try {
//       if (selectedOrder === orderId) {
//         setSelectedOrder(null);
//         return;
//       }

//       if (orderDetails[orderId]) {
//         setSelectedOrder(orderId);
//         return;
//       }

//       setLoadingDetails(true);

//       const response = await api.get(
//         `/orders/${orderId}/`
//       );

//       console.log(
//         "Order Details:",
//         response.data
//       );

//       setOrderDetails((prev) => ({
//         ...prev,
//         [orderId]: response.data,
//       }));

//       setSelectedOrder(orderId);

//     } catch (err) {
//       console.error(
//         "Order Detail Error:",
//         err
//       );

//       alert(
//         err.response?.data?.detail ||
//         err.response?.data?.error ||
//         "Unable to load order details."
//       );
//     } finally {
//       setLoadingDetails(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container py-5 text-center">
//         <div
//           className="spinner-border text-primary"
//           role="status"
//         >
//           <span className="visually-hidden">
//             Loading...
//           </span>
//         </div>

//         <p className="mt-3">
//           Loading your orders...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">

//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="fw-bold">
//           My Orders
//         </h2>

//         <span className="badge bg-primary fs-6">
//           {orders.length} Orders
//         </span>
//       </div>

//       {orders.length === 0 ? (
//         <div className="alert alert-info">
//           You have not placed any orders yet.
//         </div>
//       ) : (
//         <div className="table-responsive">

//           <table className="table table-hover align-middle shadow-sm">

//             <thead className="table-dark">
//               <tr>
//                 <th>Order Number</th>
//                 <th>Date</th>
//                 <th>Total</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>

//               {orders.map((order) => (
//                 <React.Fragment
//                   key={order.id}
//                 >

//                   {/* Main Order Row */}

//                   <tr>

//                     <td>

//                       <button
//                         className="btn btn-link fw-bold text-decoration-none p-0"
//                         onClick={() =>
//                           fetchOrderDetails(
//                             order.id
//                           )
//                         }
//                       >
//                         {order.order_number}

//                         <span className="ms-2">
//                           {selectedOrder ===
//                           order.id
//                             ? "▲"
//                             : "▼"}
//                         </span>

//                       </button>

//                     </td>

//                     <td>
//                       {new Date(
//                         order.created_at
//                       ).toLocaleDateString()}
//                     </td>

//                     <td>
//                       ₦
//                       {Number(
//                         order.total_amount
//                       ).toLocaleString()}
//                     </td>

//                     <td>

//                       <span
//                         className={`badge ${
//                           order.status ===
//                           "delivered"
//                             ? "bg-success"
//                             : order.status ===
//                               "processing"
//                             ? "bg-warning text-dark"
//                             : order.status ===
//                               "cancelled"
//                             ? "bg-danger"
//                             : "bg-secondary"
//                         }`}
//                       >
//                         {order.status}
//                       </span>

//                     </td>

//                   </tr>

//                   {/* Expanded Order Details */}

//                   {selectedOrder ===
//                     order.id && (
//                     <tr>

//                       <td
//                         colSpan="4"
//                         className="bg-light"
//                       >

//                         <div className="card border-0 shadow-sm">

//                           <div className="card-body">

//                             <h5 className="mb-3">
//                               Order Details
//                             </h5>

//                             {loadingDetails ? (
//                               <div className="text-center py-3">
//                                 <div className="spinner-border spinner-border-sm text-primary" />
//                               </div>
//                             ) : (
//                               <>
//                                 <div className="row">

//                                   <div className="col-md-6 mb-3">
//                                     <strong>
//                                       Shipping Address
//                                     </strong>

//                                     <p className="mb-0">
//                                       {
//                                         order.shipping_address
//                                       }
//                                     </p>
//                                   </div>

//                                   <div className="col-md-6 mb-3">
//                                     <strong>
//                                       City
//                                     </strong>

//                                     <p className="mb-0">
//                                       {
//                                         order.city
//                                       }
//                                     </p>
//                                     <p>
//                                       <strong>Payment Type:</strong>{" "}
//                                       {selectedOrder.payment_type}
//                                     </p>

//                                     <p>
//                                       <strong>Payment Method:</strong>{" "}
//                                       {selectedOrder.payment_method}
//                                     </p>
//                                   </div>

//                                 </div>

//                                 <hr />

//                                 <h6 className="fw-bold">
//                                   Ordered Items
//                                 </h6>

//                                 <table className="table table-bordered">

//                                   <thead>
//                                     <tr>
//                                       <th>
//                                         Product
//                                       </th>
//                                       <th>
//                                         Qty
//                                       </th>
//                                       <th>
//                                         Price
//                                       </th>
//                                       <th>
//                                         Total
//                                       </th>
//                                     </tr>
//                                   </thead>

//                                   <tbody>

//                                     {orderDetails[
//                                       order.id
//                                     ]?.items?.length >
//                                     0 ? (
//                                       orderDetails[
//                                         order.id
//                                       ].items.map(
//                                         (
//                                           item
//                                         ) => (
//                                           <tr
//                                             key={
//                                               item.id
//                                             }
//                                           >

//                                             <td>
//                                               {
//                                                 item.product_name
//                                               }
//                                             </td>

//                                             <td>
//                                               {
//                                                 item.quantity
//                                               }
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {Number(item.unit_price).toLocaleString()}
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {Number(item.total_price).toLocaleString()}
//                                             </td>
//                                             <Link
//                                               to={`/invoice/${order.id}`}
//                                               className="btn btn-success btn-sm"
//                                             >
//                                               View Invoice
//                                             </Link>
//                                             {/* <td>
//                                               ₦
//                                               {Number(
//                                                 item.price
//                                               ).toLocaleString()}
//                                             </td>

//                                             <td>
//                                               ₦
//                                               {(
//                                                 Number(
//                                                   item.price
//                                                 ) *
//                                                 Number(
//                                                   item.quantity
//                                                 )
//                                               ).toLocaleString()}
//                                             </td> */}

//                                           </tr>
//                                         )
//                                       )
//                                     ) : (
//                                       <tr>
//                                         <td
//                                           colSpan="4"
//                                           className="text-center"
//                                         >
//                                           No items found.
//                                         </td>
//                                       </tr>
//                                     )}

//                                   </tbody>
//                               <div className="mt-3 text-end">
                                
       

//                                 <button
//                                   className="btn btn-danger"
//                                   onClick={() =>
//                                   generateInvoicePDF(
//                                     order,
//                                     orderDetails[order.id]
//                                   )
//                                 }
//                                 >
//                                   Download PDF
//                                 </button>
                                
// {/*                                 

//                                 <button
//                                   className="btn btn-danger"
//                                   onClick={() =>
//                                     downloadOrderPDF(
//                                       order,
//                                       orderDetails[order.id]
//                                     )
//                                   }
//                                 >
//                                   Download PDF
//                                 </button> */}
//                               </div>
//                               <button
//                                 className="btn btn-primary me-2"
//                                 onClick={() => window.print()}
//                               >
//                                 Print Order
//                               </button>
//                                 </table>

//                               </>
//                             )}

//                           </div>

//                         </div>

//                       </td>

//                     </tr>
//                   )}

//                 </React.Fragment>
//               ))}

//             </tbody>

//           </table>

//         </div>
//       )}
//     </div>
    
//   );
// };


// export default OrdersPage;



// import React, { useEffect, useState } from "react";
// import api from "../../api";

// const OrdersPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const [orderDetails, setOrderDetails] = useState({});

//   const [loadingDetails, setLoadingDetails] = useState(false);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/my-orders/");

//       console.log("Orders Response:", response.data);

//       setOrders(response.data.orders || []);
//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//         "Failed to load orders."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//     const fetchOrderDetails = async (
//     orderId
//     ) => {
//     try {
//         setLoadingDetails(true);

//         if (selectedOrder === orderId) {
//         setSelectedOrder(null);
//         return;
//         }

//         const response = await api.get(
//         `/orders/${orderId}/`
//         );

//         setOrderDetails((prev) => ({
//         ...prev,
//         [orderId]: response.data,
//         }));

//         setSelectedOrder(orderId);

//     } catch (err) {
//         console.error(err);
//     } finally {
//         setLoadingDetails(false);
//     }
//     };

//   console.log("Loading:", loading);
//   console.log("Orders:", orders);

//   if (loading) {
//     return (
//       <div className="container py-5 text-center">
//         <div
//           className="spinner-border text-primary"
//           role="status"
//         >
//           <span className="visually-hidden">
//             Loading...
//           </span>
//         </div>

//         <p className="mt-3">
//           Loading your orders...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-5">

//       <h2 className="mb-4">
//         My Orders
//       </h2>

//       {orders.length === 0 ? (
//         <div className="alert alert-info">
//           You have no orders yet.
//         </div>
//       ) : (
//         <div className="table-responsive">

//           <table className="table table-striped table-hover">

//             <thead className="table-dark">
//               <tr>
//                 <th>Order Number</th>
//                 <th>Date</th>
//                 <th>Total</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>

//               {orders.map((order) => (
//                 <tr key={order.id}>

//                   {/* <td>
//                     {order.order_number}
//                   </td> */}
//                   <td>
//                 <button
//                     className="btn btn-link text-decoration-none fw-bold"
//                     onClick={() =>
//                     fetchOrderDetails(order.id)
//                     }
//                 >
//                     {order.order_number}

//                     {selectedOrder === order.id
//                     ? " ▲"
//                     : " ▼"}
//                 </button>
//                 </td>

//                   <td>
//                     {new Date(
//                       order.created_at
//                     ).toLocaleDateString()}
//                   </td>

//                   <td>
//                     ₦
//                     {Number(
//                       order.total_amount
//                     ).toLocaleString()}
//                   </td>

//                   <td>
//                     <span
//                       className={`badge ${
//                         order.status === "delivered"
//                           ? "bg-success"
//                           : order.status === "processing"
//                           ? "bg-warning text-dark"
//                           : order.status === "cancelled"
//                           ? "bg-danger"
//                           : "bg-secondary"
//                       }`}
//                     >
//                       {order.status}
//                     </span>
//                   </td>

//                 </tr>
//               ))}

//             </tbody>

//           </table>

//         </div>
//       )}
//     </div>
//   );
// };

// export default OrdersPage;