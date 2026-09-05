// import React, {
//   useEffect,
//   useState,
// } from "react";

// import {
//   useParams,
// } from "react-router-dom";

// import api from "../../api";

// import {
//   generateInvoicePDF,
// } from "./invoiceUtils";

// const InvoicePage = () => {
//   const { id } = useParams();

//   const [invoice, setInvoice] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {
//     loadInvoice();
//   }, [id]);

//   const loadInvoice = async () => {
//     try {
//       const response =
//         await api.get(
//           `/orders/${id}/`
//         );

//       setInvoice(
//         response.data
//       );
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="container py-5">
//         Loading...
//       </div>
//     );

//   return (
//     <div
//       className="container py-5"
//       id="invoice-area"
//     >
//       <div className="card shadow">
//         <div className="card-body">

//           <h2>
//             Invoice #
//             {
//               invoice.order_number
//             }
//           </h2>

//           <hr />

//           <p>
//             <strong>
//               Customer:
//             </strong>{" "}
//             {
//               invoice.full_name
//             }
//           </p>

//           <p>
//             <strong>
//               Email:
//             </strong>{" "}
//             {invoice.email}
//           </p>

//           <p>
//             <strong>
//               Address:
//             </strong>{" "}
//             {
//               invoice.shipping_address
//             }
//           </p>

//           <table className="table">
//             <thead>
//               <tr>
//                 <th>
//                   Product
//                 </th>
//                 <th>
//                   Qty
//                 </th>
//                 <th>
//                   Price
//                 </th>
//                 <th>
//                   Total
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {invoice.items?.map(
//                 (item) => (
//                   <tr
//                     key={
//                       item.id
//                     }
//                   >
//                     <td>
//                       {
//                         item.product_name
//                       }
//                     </td>

//                     <td>
//                       {
//                         item.quantity
//                       }
//                     </td>

//                     <td>
//                       ₦
//                       {Number(
//                         item.unit_price
//                       ).toLocaleString()}
//                     </td>

//                     <td>
//                       ₦
//                       {Number(
//                         item.total_price
//                       ).toLocaleString()}
//                     </td>
//                   </tr>
//                 )
//               )}
//             </tbody>
//           </table>

//           <div className="mt-4">
//             <button
//               className="btn btn-primary me-2"
//               onClick={() =>
//                 window.print()
//               }
//             >
//               Print Invoice
//             </button>

//             <button
//               className="btn btn-danger"
//               onClick={() =>
//                 generateInvoicePDF(
//                   invoice,
//                   invoice
//                 )
//               }
//             >
//               Download PDF
//             </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoicePage;














import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";

const InvoicePage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(
        `/orders/${orderId}/`
      );

      setOrder(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5">
        Loading Invoice...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between mb-4 no-print">
        <h2>Invoice</h2>

        <button
          className="btn btn-primary"
          onClick={printInvoice}
        >
          Print Invoice
        </button>
      </div>

      <div
        className="card shadow p-4"
        id="invoice"
      >
        <div className="row">

          <div className="col-md-6">
            <h3>NaijaOpenMarket</h3>

            <p>
              Your Trusted Online Store
            </p>
          </div>

          <div className="col-md-6 text-end">
            <h4>
              Invoice
            </h4>

            <p>
              #{order.order_number}
            </p>

            <p>
              {new Date(
                order.created_at
              ).toLocaleDateString()}
            </p>
          </div>

        </div>

        <hr />

        <div className="mb-4">
          <h5>Shipping Information</h5>

          <p>
            {order.shipping_address}
          </p>

          <p>
            {order.city}
          </p>
        </div>

        <table className="table table-bordered">

          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>

            {order.items?.map((item) => (
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
            ))}

          </tbody>

        </table>

        <div className="text-end">

          <h5>
            Total:
            ₦
            {Number(
              order.total_amount
            ).toLocaleString()}
          </h5>

        </div>

      </div>
    </div>
  );
};

export default InvoicePage;