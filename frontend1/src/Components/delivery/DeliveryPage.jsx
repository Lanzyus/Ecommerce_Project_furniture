import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../../api";
import AuthContext from "../../Context/AuthContext";


const DeliveryPage = () => {

  const { user } = useContext(
    AuthContext
  );

  const [deliveries, setDeliveries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [selectedStatuses, setSelectedStatuses] =
    useState({});

  // NEW: store selected courier for each delivery
  const [selectedCouriers, setSelectedCouriers] =
    useState({});


  // ==========================================
  // CHECK WHETHER LOGGED-IN USER IS ADMIN
  // ==========================================

  const isAdmin =
    user?.is_staff === true ||
    user?.is_superuser === true;


  // ==========================================
  // DELIVERY STATUS OPTIONS
  // Must match Shipment.STATUS_CHOICES
  // ==========================================

  const statusChoices = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "processing",
      label: "Processing",
    },
    {
      value: "shipped",
      label: "Shipped",
    },
    {
      value: "in_transit",
      label: "In Transit",
    },
    {
      value: "out_for_delivery",
      label: "Out For Delivery",
    },
    {
      value: "delivered",
      label: "Delivered",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ];


  // ==========================================
  // COURIER OPTIONS
  // ==========================================

  const courierChoices = [
    {
      value: "",
      label: "Select Courier",
    },
    {
      value: "GIG Logistics",
      label: "GIG Logistics",
    },
    {
      value: "DHL Express Nigeria",
      label: "DHL Express Nigeria",
    },
    {
      value: "FedEx Nigeria",
      label: "FedEx Nigeria",
    },
    {
      value: "UPS Nigeria",
      label: "UPS Nigeria",
    },
    {
      value: "Red Star Express",
      label: "Red Star Express",
    },
    {
      value: "Kwik Delivery",
      label: "Kwik Delivery",
    },
    {
      value: "Sendbox",
      label: "Sendbox",
    },
  ];


  // ==========================================
  // LOAD DELIVERIES
  // ==========================================

  const fetchDeliveries = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        "/my-deliveries/"
      );

      const deliveryData =
        response.data?.deliveries || [];

      setDeliveries(
        deliveryData
      );


      // --------------------------------------
      // Set current status and courier
      // in admin dropdowns
      // --------------------------------------

      const initialStatuses = {};
      const initialCouriers = {};


      deliveryData.forEach(
        (delivery) => {

          initialStatuses[
            delivery.id
          ] = delivery.status || "pending";


          initialCouriers[
            delivery.id
          ] = delivery.courier || "";

        }
      );


      setSelectedStatuses(
        initialStatuses
      );

      setSelectedCouriers(
        initialCouriers
      );


    } catch (error) {

      console.error(
        "Delivery error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load delivery information."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchDeliveries();

  }, []);


  // ==========================================
  // CHANGE DELIVERY STATUS DROPDOWN
  // ==========================================

  const handleStatusChange = (
    shipmentId,
    value
  ) => {

    setSelectedStatuses(
      (previous) => ({
        ...previous,
        [shipmentId]: value,
      })
    );

  };


  // ==========================================
  // CHANGE COURIER DROPDOWN
  // ==========================================

  const handleCourierChange = (
    shipmentId,
    value
  ) => {

    setSelectedCouriers(
      (previous) => ({
        ...previous,
        [shipmentId]: value,
      })
    );

  };


  // ==========================================
  // ADMIN ONLY
  // UPDATE COURIER + DELIVERY STATUS
  // ==========================================

  const updateDelivery = async (
    shipmentId
  ) => {

    const newStatus =
      selectedStatuses[
        shipmentId
      ];

    const newCourier =
      selectedCouriers[
        shipmentId
      ];


    if (!newCourier) {

      alert(
        "Please select a courier."
      );

      return;
    }


    if (!newStatus) {

      alert(
        "Please select a delivery status."
      );

      return;
    }


    try {

      setUpdatingId(
        shipmentId
      );


      const response =
        await api.post(
          `/shipment/${shipmentId}/status/`,
          {
            status: newStatus,
            courier: newCourier,
          }
        );


      const updatedShipment =
        response.data?.shipment;


      if (updatedShipment) {

        setDeliveries(
          (previous) =>
            previous.map(
              (delivery) =>
                delivery.id === shipmentId
                  ? updatedShipment
                  : delivery
            )
        );


        // Keep dropdown values synchronized
        setSelectedStatuses(
          (previous) => ({
            ...previous,
            [shipmentId]:
              updatedShipment.status ||
              newStatus,
          })
        );


        setSelectedCouriers(
          (previous) => ({
            ...previous,
            [shipmentId]:
              updatedShipment.courier ||
              newCourier,
          })
        );

      } else {

        await fetchDeliveries();

      }


      alert(
        "Delivery updated successfully."
      );


    } catch (error) {

      console.error(
        "Update delivery error:",
        error
      );


      if (
        error.response?.status === 403
      ) {

        alert(
          "You are not allowed to update delivery information."
        );

      } else {

        alert(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update delivery information."
        );

      }

    } finally {

      setUpdatingId(null);

    }
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "Not available";
    }

    return new Date(
      date
    ).toLocaleString();

  };


  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (
    status
  ) => {

    switch (status) {

      case "delivered":
        return "bg-success";

      case "cancelled":
        return "bg-danger";

      case "out_for_delivery":
        return "bg-warning text-dark";

      case "in_transit":
        return "bg-info text-dark";

      case "shipped":
        return "bg-primary";

      case "processing":
        return "bg-secondary";

      default:
        return "bg-secondary";
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="container py-5">

        <h2 className="mb-4">
          Delivery
        </h2>

        <p>
          Loading delivery information...
        </p>

      </div>

    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="container py-5">

        <h2 className="mb-4">
          Delivery
        </h2>

        <div
          className="alert alert-danger"
        >
          {error}
        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="container py-5">

      <div className="mb-4">

        <h2>
          Delivery
        </h2>


        {isAdmin ? (

          <p className="text-muted">
            Admin Delivery Management
          </p>

        ) : (

          <p className="text-muted">
            View your delivery information
            and order status.
          </p>

        )}

      </div>


      {deliveries.length === 0 ? (

        <div
          className="alert alert-info"
        >
          No delivery information is
          available yet.
        </div>

      ) : (

        <div className="row g-4">

          {deliveries.map(
            (delivery) => (

              <div
                className="col-12"
                key={delivery.id}
              >

                <div className="card shadow-sm">

                  <div className="card-body">

                    <div className="row">

                      {/* ==========================
                          DELIVERY INFORMATION
                      ========================== */}

                      <div className="col-md-7">

                        <h5 className="card-title mb-3">

                          Order:{" "}

                          <strong>
                            {
                              delivery.order_number
                            }
                          </strong>

                        </h5>


                        {isAdmin && (

                          <p>

                            <strong>
                              Customer:
                            </strong>{" "}

                            {
                              delivery.customer_username ||
                              "Not available"
                            }

                          </p>

                        )}


                        <p>

                          <strong>
                            Tracking Number:
                          </strong>{" "}

                          {
                            delivery.tracking_number ||
                            "Not available"
                          }

                        </p>


                        <p>

                          <strong>
                            Courier:
                          </strong>{" "}

                          {
                            delivery.courier ||
                            "Not assigned yet"
                          }

                        </p>


                        <p>

                          <strong>
                            Status:
                          </strong>{" "}

                          <span
                            className={
                              `badge ${getStatusBadge(
                                delivery.status
                              )}`
                            }
                          >

                            {
                              delivery.status_display ||
                              delivery.status ||
                              "Pending"
                            }

                          </span>

                        </p>


                        <p>

                          <strong>
                            Created:
                          </strong>{" "}

                          {
                            formatDate(
                              delivery.created_at
                            )
                          }

                        </p>


                        {delivery.shipped_at && (

                          <p>

                            <strong>
                              Shipped:
                            </strong>{" "}

                            {
                              formatDate(
                                delivery.shipped_at
                              )
                            }

                          </p>

                        )}


                        {delivery.delivered_at && (

                          <p>

                            <strong>
                              Delivered:
                            </strong>{" "}

                            {
                              formatDate(
                                delivery.delivered_at
                              )
                            }

                          </p>

                        )}

                      </div>


                      {/* ==========================
                          ADMIN CONTROLS
                          BUYER CANNOT SEE THESE
                      ========================== */}

                      {isAdmin && (

                        <div className="col-md-5">

                          <div
                            className="border rounded p-3"
                          >

                            <h6 className="mb-3">
                              Update Delivery
                            </h6>


                            {/* =====================
                                COURIER DROPDOWN
                            ===================== */}

                            <label
                              className="form-label"
                            >
                              Courier
                            </label>


                            <select
                              className="form-select mb-3"
                              value={
                                selectedCouriers[
                                  delivery.id
                                ] || ""
                              }
                              onChange={(
                                event
                              ) =>
                                handleCourierChange(
                                  delivery.id,
                                  event.target.value
                                )
                              }
                              disabled={
                                updatingId ===
                                delivery.id
                              }
                            >

                              {
                                courierChoices.map(
                                  (courier) => (

                                    <option
                                      key={
                                        courier.value
                                      }
                                      value={
                                        courier.value
                                      }
                                    >

                                      {
                                        courier.label
                                      }

                                    </option>

                                  )
                                )
                              }

                            </select>


                            {/* =====================
                                STATUS DROPDOWN
                            ===================== */}

                            <label
                              className="form-label"
                            >
                              Delivery Status
                            </label>


                            <select
                              className="form-select mb-3"
                              value={
                                selectedStatuses[
                                  delivery.id
                                ] ||
                                delivery.status ||
                                "pending"
                              }
                              onChange={(
                                event
                              ) =>
                                handleStatusChange(
                                  delivery.id,
                                  event.target.value
                                )
                              }
                              disabled={
                                updatingId ===
                                delivery.id
                              }
                            >

                              {
                                statusChoices.map(
                                  (status) => (

                                    <option
                                      key={
                                        status.value
                                      }
                                      value={
                                        status.value
                                      }
                                    >

                                      {
                                        status.label
                                      }

                                    </option>

                                  )
                                )
                              }

                            </select>


                            {/* =====================
                                UPDATE BUTTON
                            ===================== */}

                            <button
                              type="button"
                              className="btn btn-primary w-100"
                              disabled={
                                updatingId ===
                                delivery.id
                              }
                              onClick={() =>
                                updateDelivery(
                                  delivery.id
                                )
                              }
                            >

                              {
                                updatingId ===
                                delivery.id
                                  ? "Updating..."
                                  : "Update Delivery"
                              }

                            </button>

                          </div>

                        </div>

                      )}

                    </div>


                    {/* ==========================
                        TRACKING HISTORY
                    ========================== */}

                    {delivery
                      .tracking_updates
                      ?.length > 0 && (

                      <div className="mt-4">

                        <h6>
                          Delivery History
                        </h6>


                        <div className="table-responsive">

                          <table className="table table-sm">

                            <thead>

                              <tr>

                                <th>
                                  Status
                                </th>

                                <th>
                                  Location
                                </th>

                                <th>
                                  Note
                                </th>

                                <th>
                                  Date
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {
                                delivery
                                  .tracking_updates
                                  .map(
                                    (tracking) => (

                                      <tr
                                        key={
                                          tracking.id
                                        }
                                      >

                                        <td>
                                          {
                                            tracking.status
                                          }
                                        </td>

                                        <td>
                                          {
                                            tracking.location ||
                                            "-"
                                          }
                                        </td>

                                        <td>
                                          {
                                            tracking.note ||
                                            "-"
                                          }
                                        </td>

                                        <td>
                                          {
                                            formatDate(
                                              tracking.created_at
                                            )
                                          }
                                        </td>

                                      </tr>

                                    )
                                  )
                              }

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

};


export default DeliveryPage;












// import React, {
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import api from "../../api";
// import AuthContext from "../../Context/AuthContext";


// const DeliveryPage = () => {

//   const { user } = useContext(
//     AuthContext
//   );

//   const [deliveries, setDeliveries] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [updatingId, setUpdatingId] =
//     useState(null);

//   const [selectedStatuses, setSelectedStatuses] =
//     useState({});


//   // ------------------------------------------
//   // Check whether logged-in user is admin
//   // ------------------------------------------

//   const isAdmin =
//     user?.is_staff === true ||
//     user?.is_superuser === true;


//   // ------------------------------------------
//   // Available delivery statuses
//   // These match Shipment.STATUS_CHOICES
//   // ------------------------------------------

//   const statusChoices = [
//     {
//       value: "pending",
//       label: "Pending",
//     },
//     {
//       value: "processing",
//       label: "Processing",
//     },
//     {
//       value: "shipped",
//       label: "Shipped",
//     },
//     {
//       value: "in_transit",
//       label: "In Transit",
//     },
//     {
//       value: "out_for_delivery",
//       label: "Out For Delivery",
//     },
//     {
//       value: "delivered",
//       label: "Delivered",
//     },
//     {
//       value: "cancelled",
//       label: "Cancelled",
//     },
//   ];


//   // ------------------------------------------
//   // Load deliveries
//   // ------------------------------------------

//   const fetchDeliveries = async () => {

//     try {

//       setLoading(true);
//       setError("");

//       const response = await api.get(
//         "/my-deliveries/"
//       );

//       const deliveryData =
//         response.data?.deliveries || [];

//       setDeliveries(
//         deliveryData
//       );


//       // Set current status in dropdown
//       const initialStatuses = {};

//       deliveryData.forEach(
//         (delivery) => {

//           initialStatuses[
//             delivery.id
//           ] = delivery.status;

//         }
//       );

//       setSelectedStatuses(
//         initialStatuses
//       );

//     } catch (error) {

//       console.error(
//         "Delivery error:",
//         error
//       );

//       setError(
//         error.response?.data?.message ||
//         "Unable to load delivery information."
//       );

//     } finally {

//       setLoading(false);

//     }
//   };


//   useEffect(() => {

//     fetchDeliveries();

//   }, []);


//   // ------------------------------------------
//   // Change dropdown value
//   // ------------------------------------------

//   const handleStatusChange = (
//     shipmentId,
//     value
//   ) => {

//     setSelectedStatuses(
//       (previous) => ({
//         ...previous,
//         [shipmentId]: value,
//       })
//     );

//   };


//   // ------------------------------------------
//   // ADMIN ONLY
//   // Update delivery status
//   // ------------------------------------------

//   const updateStatus = async (
//     shipmentId
//   ) => {

//     const newStatus =
//       selectedStatuses[
//         shipmentId
//       ];

//     if (!newStatus) {

//       alert(
//         "Please select a delivery status."
//       );

//       return;
//     }


//     try {

//       setUpdatingId(
//         shipmentId
//       );

//       const response =
//         await api.post(
//           `/shipment/${shipmentId}/status/`,
//           {
//             status: newStatus,
//           }
//         );


//       const updatedShipment =
//         response.data?.shipment;


//       if (updatedShipment) {

//         setDeliveries(
//           (previous) =>
//             previous.map(
//               (delivery) =>
//                 delivery.id ===
//                 shipmentId
//                   ? updatedShipment
//                   : delivery
//             )
//         );

//       } else {

//         await fetchDeliveries();

//       }


//       alert(
//         "Delivery status updated successfully."
//       );

//     } catch (error) {

//       console.error(
//         "Update delivery error:",
//         error
//       );


//       if (
//         error.response?.status === 403
//       ) {

//         alert(
//           "You are not allowed to update delivery status."
//         );

//       } else {

//         alert(
//           error.response?.data?.message ||
//           "Unable to update delivery status."
//         );

//       }

//     } finally {

//       setUpdatingId(null);

//     }
//   };


//   // ------------------------------------------
//   // Format date
//   // ------------------------------------------

//   const formatDate = (
//     date
//   ) => {

//     if (!date) {
//       return "Not available";
//     }

//     return new Date(
//       date
//     ).toLocaleString();

//   };


//   // ------------------------------------------
//   // Loading
//   // ------------------------------------------

//   if (loading) {

//     return (
//       <div className="container py-5">

//         <h2 className="mb-4">
//           Delivery
//         </h2>

//         <p>
//           Loading delivery information...
//         </p>

//       </div>
//     );

//   }


//   // ------------------------------------------
//   // Error
//   // ------------------------------------------

//   if (error) {

//     return (
//       <div className="container py-5">

//         <h2 className="mb-4">
//           Delivery
//         </h2>

//         <div
//           className="alert alert-danger"
//         >
//           {error}
//         </div>

//       </div>
//     );

//   }


//   return (

//     <div className="container py-5">

//       <div className="mb-4">

//         <h2>
//           Delivery
//         </h2>

//         {isAdmin && (
//           <p className="text-muted">
//             Admin Delivery Management
//           </p>
//         )}

//       </div>


//       {deliveries.length === 0 ? (

//         <div
//           className="alert alert-info"
//         >
//           No delivery information is
//           available yet.
//         </div>

//       ) : (

//         <div className="row g-4">

//           {deliveries.map(
//             (delivery) => (

//               <div
//                 className="col-12"
//                 key={delivery.id}
//               >

//                 <div className="card shadow-sm">

//                   <div className="card-body">

//                     <div className="row">

//                       <div className="col-md-7">

//                         <h5 className="card-title mb-3">

//                           Order:{" "}

//                           <strong>
//                             {
//                               delivery.order_number
//                             }
//                           </strong>

//                         </h5>


//                         {isAdmin && (
//                           <p>
//                             <strong>
//                               Customer:
//                             </strong>{" "}

//                             {
//                               delivery.customer_username
//                             }
//                           </p>
//                         )}


//                         <p>
//                           <strong>
//                             Tracking Number:
//                           </strong>{" "}

//                           {
//                             delivery.tracking_number
//                           }
//                         </p>


//                         <p>
//                           <strong>
//                             Courier:
//                           </strong>{" "}

//                           {
//                             delivery.courier ||
//                             "Not assigned yet"
//                           }
//                         </p>


//                         <p>
//                           <strong>
//                             Status:
//                           </strong>{" "}

//                           <span className="badge bg-primary">

//                             {
//                               delivery.status_display
//                             }

//                           </span>
//                         </p>


//                         <p>
//                           <strong>
//                             Created:
//                           </strong>{" "}

//                           {
//                             formatDate(
//                               delivery.created_at
//                             )
//                           }
//                         </p>


//                         {delivery.shipped_at && (

//                           <p>
//                             <strong>
//                               Shipped:
//                             </strong>{" "}

//                             {
//                               formatDate(
//                                 delivery.shipped_at
//                               )
//                             }
//                           </p>

//                         )}


//                         {delivery.delivered_at && (

//                           <p>
//                             <strong>
//                               Delivered:
//                             </strong>{" "}

//                             {
//                               formatDate(
//                                 delivery.delivered_at
//                               )
//                             }
//                           </p>

//                         )}

//                       </div>


//                       {/* ==================================
//                           ADMIN CONTROLS
//                       ================================== */}

//                       {isAdmin && (

//                         <div className="col-md-5">

//                           <div
//                             className="border rounded p-3"
//                           >

//                             <h6 className="mb-3">

//                               Update Delivery Status

//                             </h6>


//                             <label
//                               className="form-label"
//                             >
//                               Delivery Status
//                             </label>


//                             <select
//                               className="form-select mb-3"
//                               value={
//                                 selectedStatuses[
//                                   delivery.id
//                                 ] ||
//                                 delivery.status
//                               }
//                               onChange={(
//                                 event
//                               ) =>
//                                 handleStatusChange(
//                                   delivery.id,
//                                   event.target.value
//                                 )
//                               }
//                             >

//                               {
//                                 statusChoices.map(
//                                   (status) => (

//                                     <option
//                                       key={
//                                         status.value
//                                       }
//                                       value={
//                                         status.value
//                                       }
//                                     >

//                                       {
//                                         status.label
//                                       }

//                                     </option>

//                                   )
//                                 )
//                               }

//                             </select>


//                             <button
//                               type="button"
//                               className="btn btn-primary"
//                               disabled={
//                                 updatingId ===
//                                 delivery.id
//                               }
//                               onClick={() =>
//                                 updateStatus(
//                                   delivery.id
//                                 )
//                               }
//                             >

//                               {
//                                 updatingId ===
//                                 delivery.id
//                                   ? "Updating..."
//                                   : "Update Status"
//                               }

//                             </button>

//                           </div>

//                         </div>

//                       )}

//                     </div>


//                     {/* ==================================
//                         TRACKING HISTORY
//                     ================================== */}

//                     {delivery
//                       .tracking_updates
//                       ?.length > 0 && (

//                       <div className="mt-4">

//                         <h6>
//                           Delivery History
//                         </h6>

//                         <div className="table-responsive">

//                           <table className="table table-sm">

//                             <thead>

//                               <tr>

//                                 <th>
//                                   Status
//                                 </th>

//                                 <th>
//                                   Location
//                                 </th>

//                                 <th>
//                                   Note
//                                 </th>

//                                 <th>
//                                   Date
//                                 </th>

//                               </tr>

//                             </thead>


//                             <tbody>

//                               {
//                                 delivery
//                                   .tracking_updates
//                                   .map(
//                                     (tracking) => (

//                                       <tr
//                                         key={
//                                           tracking.id
//                                         }
//                                       >

//                                         <td>
//                                           {
//                                             tracking.status
//                                           }
//                                         </td>

//                                         <td>
//                                           {
//                                             tracking.location ||
//                                             "-"
//                                           }
//                                         </td>

//                                         <td>
//                                           {
//                                             tracking.note ||
//                                             "-"
//                                           }
//                                         </td>

//                                         <td>
//                                           {
//                                             formatDate(
//                                               tracking.created_at
//                                             )
//                                           }
//                                         </td>

//                                       </tr>

//                                     )
//                                   )
//                               }

//                             </tbody>

//                           </table>

//                         </div>

//                       </div>

//                     )}

//                   </div>

//                 </div>

//               </div>

//             )
//           )}

//         </div>

//       )}

//     </div>

//   );

// };


// export default DeliveryPage;