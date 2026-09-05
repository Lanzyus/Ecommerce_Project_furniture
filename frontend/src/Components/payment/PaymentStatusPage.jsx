import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import api from "../../api";
import { useContext } from "react";
import { CartContext } from "../../Context/CartContext";



const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
  setNumCartItems,
  fetchCartStats
} = useContext(CartContext);
  
//   const {
//   fetchCartStats,
//   setNumCartItems,
// } = useContext(CartContext);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(
    "Verifying payment..."
  );

  const hasVerified = useRef(false);

 
// ===================================
// CLEAR CART AFTER SUCCESSFUL PAYMENT
// ===================================
const clearCartAfterPayment = async () => {
  
  try {
    const cart_code =
      localStorage.getItem("cart_code");

    if (cart_code) {
      try {
        // Optional backend clear endpoint
        // await api.delete(
        //   `/clear-cart/${cart_code}/`
        // );

        localStorage.removeItem(
          "cart_items"
        );

        localStorage.removeItem(
          "cart_code"
        );
        setNumCartItems(0);


        window.dispatchEvent(
        new CustomEvent("cartUpdated")
        );

      } catch (error) {
        console.log(
          "Cart already cleared:",
          error.response?.data || error
        );
      }
    }

    // Refresh cart counter immediately
    await fetchCartStats();

    // Notify other components
    window.dispatchEvent(
      new CustomEvent("cartUpdated")
    );

  } catch (error) {
    console.error(
      "Error clearing cart:",
      error
    );
  }
};

  // ===================================
  // PAYSTACK VERIFICATION
  // ===================================
  const verifyPaystack = async (
    reference
  ) => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access");

      const response = await api.get(
        `/paystack/verify/${reference}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Paystack Verification:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(true);

        setMessage(
          response.data?.message ||
            "Payment completed successfully."
        );

      await clearCartAfterPayment();

        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      } else {
        setSuccess(false);


        setMessage(
          response.data?.message ||
            "Payment verification failed."
        );
      }
    } catch (error) {
      console.error(
        "Paystack Verification Error:",
        error.response?.data || error
      );

      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to verify Paystack payment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // FLUTTERWAVE VERIFICATION
  // ===================================
  const verifyFlutterwave = async (
    tx_ref
  ) => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access");

      const response = await api.get(
        `/verify-payment/${tx_ref}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Flutterwave Verification:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(true);

        setMessage(
          response.data?.message ||
            "Payment completed successfully."
        );

        await clearCartAfterPayment();

        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      } else {
        setSuccess(false);

        setMessage(
          response.data?.message ||
            "Payment verification failed."
        );
      }
    } catch (error) {
      console.error(
        "Flutterwave Verification Error:",
        error.response?.data || error
      );

      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to verify Flutterwave payment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // VERIFY PAYMENT ON PAGE LOAD
  // ===================================
  useEffect(() => {
    if (hasVerified.current) return;

    hasVerified.current = true;

    const paystackReference =
      searchParams.get("reference") ||
      searchParams.get("trxref");

    const flutterwaveReference =
      searchParams.get("tx_ref");

    console.log(
      "Current URL:",
      window.location.href
    );

    console.log(
      "Paystack Reference:",
      paystackReference
    );

    console.log(
      "Flutterwave Reference:",
      flutterwaveReference
    );

    if (paystackReference) {
      verifyPaystack(paystackReference);
    } else if (flutterwaveReference) {
      verifyFlutterwave(
        flutterwaveReference
      );
    } else {
      setLoading(false);

      setSuccess(false);

      setMessage(
        "Payment reference not found."
      );
    }
  }, [searchParams]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow border-0">
            <div className="card-body text-center p-5">

              {loading ? (
                <>
                  <div
                    className="spinner-border text-primary mb-4"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <h3>
                    Verifying Payment...
                  </h3>

                  <p className="text-muted">
                    Please wait while we
                    confirm your payment.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <i
                      className={`bi ${
                        success
                          ? "bi-check-circle-fill text-success"
                          : "bi-x-circle-fill text-danger"
                      }`}
                      style={{
                        fontSize: "4rem",
                      }}
                    ></i>
                  </div>

                  <h2
                    className={
                      success
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {success
                      ? "Payment Successful"
                      : "Payment Failed"}
                  </h2>

                  <p className="mt-3 fs-5">
                    {message}
                  </p>

                  {success && (
                    <p className="text-muted">
                      Redirecting to your
                      orders page...
                    </p>
                  )}

                  <div className="mt-4">
                    <Link
                      to="/orders"
                      className="btn btn-primary me-2"
                    >
                      View Orders
                    </Link>

                    <Link
                      to="/"
                      className="btn btn-outline-secondary"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;









// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [success, setSuccess] = useState(false);
//   const [message, setMessage] = useState(
//     "Verifying payment..."
//   );

//   useEffect(() => {
//     const paystackReference =
//       searchParams.get("reference") ||
//       searchParams.get("trxref");

//     const flutterwaveReference =
//       searchParams.get("tx_ref");

//     console.log(
//       "Current URL:",
//       window.location.href
//     );

//     console.log(
//       "Paystack Ref:",
//       paystackReference
//     );

//     console.log(
//       "Flutterwave Ref:",
//       flutterwaveReference
//     );

//     if (paystackReference) {
//       verifyPaystack(paystackReference);
//     } else if (flutterwaveReference) {
//       verifyFlutterwave(flutterwaveReference);
//     } else {
//       setLoading(false);
//       setMessage("Payment reference not found.");
//     }
//   }, []);

//   const verifyPaystack = async (reference) => {
//     try {
//       setLoading(true);

//       const token =
//         localStorage.getItem("access");

//       const res = await api.get(
//         `/paystack/verify/${reference}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(
//         "Paystack Verification:",
//         res.data
//       );

//       if (res.data.success) {
//         setSuccess(true);

//         setMessage(
//           res.data.message ||
//             "Payment verified successfully."
//         );

//         localStorage.removeItem(
//           "cart_code"
//         );

//         setTimeout(() => {
//           navigate("/orders");
//         }, 3000);
//       } else {
//         setSuccess(false);
//         setMessage(
//           res.data.message ||
//             "Payment verification failed."
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Verification Error:",
//         error.response?.data || error
//       );

//       setSuccess(false);

//       setMessage(
//         error.response?.data?.message ||
//           error.response?.data?.error ||
//           "Error verifying payment."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyFlutterwave = async (
//     tx_ref
//   ) => {
//     try {
//       setLoading(true);

//       const token =
//         localStorage.getItem("access");

//       const res = await api.get(
//         `/verify-payment/${tx_ref}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log(
//         "Flutterwave Verification:",
//         res.data
//       );

//       if (res.data.success) {
//         setSuccess(true);

//         setMessage(
//           res.data.message ||
//             "Payment verified successfully."
//         );

//         localStorage.removeItem(
//           "cart_code"
//         );

//         setTimeout(() => {
//           navigate("/orders");
//         }, 3000);
//       } else {
//         setSuccess(false);
//         setMessage(
//           res.data.message ||
//             "Payment verification failed."
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Flutterwave Error:",
//         error.response?.data || error
//       );

//       setSuccess(false);

//       setMessage(
//         error.response?.data?.message ||
//           error.response?.data?.error ||
//           "Error verifying payment."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">
//       <div className="row justify-content-center">
//         <div className="col-md-8">
//           <div className="card shadow">
//             <div className="card-body text-center p-5">

//               {loading ? (
//                 <>
//                   <div className="spinner-border text-primary mb-3"></div>
//                   <h4>Verifying Payment...</h4>
//                 </>
//               ) : (
//                 <>
//                   <h3
//                     className={
//                       success
//                         ? "text-success"
//                         : "text-danger"
//                     }
//                   >
//                     {success
//                       ? "Payment Successful"
//                       : "Payment Failed"}
//                   </h3>

//                   <p className="mt-3">
//                     {message}
//                   </p>

//                   <div className="mt-4">
//                     <Link
//                       to="/orders"
//                       className="btn btn-primary me-2"
//                     >
//                       View Orders
//                     </Link>

//                     <Link
//                       to="/"
//                       className="btn btn-secondary"
//                     >
//                       Continue Shopping
//                     </Link>
//                   </div>
//                 </>
//               )}

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentStatusPage;







// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [success, setSuccess] = useState(false);

//   const [message, setMessage] = useState(
//     "Verifying payment..."
//   );

//   const token = localStorage.getItem("access");

// await api.get(
//   `/paystack/verify/${reference}/`,
//   {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   }
// );

//   useEffect(() => {
//     const reference =
//       searchParams.get("reference") ||
//       searchParams.get("trxref") ||
//       searchParams.get("tx_ref");

//     console.log("Current URL:", window.location.href);
//     console.log("Payment Reference:", reference);

//     if (!reference) {
//       setLoading(false);
//       setMessage("Payment reference not found.");
//       return;
//     }

//     verifyPayment(reference);
//   }, []);

//   const verifyPayment = async (reference) => {
//     try {
//       setLoading(true);

//       const res = await api.get(
//         `/paystack/verify/${reference}/`
//       );

//       console.log(
//         "Verification Response:",
//         res.data
//       );

//       if (res.data?.success) {
//         setSuccess(true);

//         setMessage(
//           res.data.message ||
//           `Payment successful. Order ${res.data.order_number}`
//         );

//         localStorage.removeItem("cart_code");

//         setTimeout(() => {
//           navigate("/orders");
//         }, 3000);

//       } else {
//         setSuccess(false);

//         setMessage(
//           res.data?.message ||
//           "Payment verification failed."
//         );
//       }

//     } catch (error) {
//       console.error(
//         "Verification Error:",
//         error.response?.data || error
//       );

//       setSuccess(false);

//       setMessage(
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Error verifying payment."
//       );

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">

//       <div className="row justify-content-center">

//         <div className="col-md-8">

//           <div className="card shadow">

//             <div className="card-body text-center p-5">

//               {loading ? (
//                 <>
//                   <div className="spinner-border text-primary mb-3" />
//                   <h4>Verifying Payment...</h4>
//                 </>
//               ) : (
//                 <>
//                   <h3
//                     className={
//                       success
//                         ? "text-success"
//                         : "text-danger"
//                     }
//                   >
//                     {success
//                       ? "Payment Successful"
//                       : "Payment Failed"}
//                   </h3>

//                   <p className="mt-3">
//                     {message}
//                   </p>

//                   <div className="mt-4">

//                     <Link
//                       to="/orders"
//                       className="btn btn-primary me-2"
//                     >
//                       View Orders
//                     </Link>

//                     <Link
//                       to="/"
//                       className="btn btn-secondary"
//                     >
//                       Continue Shopping
//                     </Link>

//                   </div>
//                 </>
//               )}

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default PaymentStatusPage;















// import React, { useEffect, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = () => {
//   const [searchParams] = useSearchParams();

//   const [message, setMessage] =
//     useState("Verifying payment...");

//   useEffect(() => {
//     console.log(
//       "Current URL:",
//       window.location.href
//     );

//     const reference =
//       searchParams.get("reference") ||
//       searchParams.get("trxref") ||
//       searchParams.get("tx_ref");

//     console.log("Reference:", reference);

//     if (!reference) {
//       setMessage(
//         "Payment reference not found."
//       );
//       return;
//     }

//     verifyPayment(reference);
//   }, []);

//   const verifyPayment = async (
//     reference
//   ) => {
//     try {
//       const res = await api.get(
//         `/paystack/verify/${reference}/`
//       );

//       if (res.data.success) {
//         setMessage(
//           `Payment successful. Order #${res.data.order_number}`
//         );

//         localStorage.removeItem(
//           "cart_code"
//         );
//       } else {
//         setMessage(
//           res.data.message ||
//             "Payment verification failed."
//         );
//       }
//     } catch (error) {
//       console.error(error);

//       setMessage(
//         error.response?.data?.message ||
//           "Error verifying payment."
//       );
//     }
//   };

//   return (
//     <div className="container text-center mt-5">
//       <h2>{message}</h2>

//       <div className="mt-4">
//         <Link
//           to="/orders"
//           className="btn btn-primary me-2"
//         >
//           View Orders
//         </Link>

//         <Link
//           to="/"
//           className="btn btn-secondary"
//         >
//           Continue Shopping
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default PaymentStatusPage;










// import React, { useEffect, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = ({ setNumCartItems }) => {
//   const [searchParams] = useSearchParams();

//   const [message, setMessage] = useState(
//     "Verifying payment..."
//   );

//   useEffect(() => {
//     const reference =
//       searchParams.get("reference");

//     if (!reference) {
//       setMessage(
//         "Payment reference not found."
//       );
//       return;
//     }

//     verifyPayment(reference);
//   }, []);

//   const verifyPayment = async (
//     reference
//   ) => {
//     try {
//       const res = await api.get(
//         `/paystack/verify/${reference}/`
//       );

//       if (res.data.success) {
//         setMessage(
//           `Payment successful. Order #${res.data.order_id}`
//         );

//         if (setNumCartItems) {
//           setNumCartItems(0);
//         }
//       } else {
//         setMessage(
//           "Payment verification failed."
//         );
//       }
//     } catch (error) {
//       console.error(error);

//       setMessage(
//         "Error verifying payment."
//       );
//     }
//   };

//   return (
//     <div className="container text-center mt-5">
//       <h2>{message}</h2>

//       <div className="mt-4">
//         <Link
//           to="/orders"
//           className="btn btn-primary me-3"
//         >
//           View Orders
//         </Link>

//         <Link
//           to="/"
//           className="btn btn-secondary"
//         >
//           Continue Shopping
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default PaymentStatusPage;











// import React, { useEffect, useState } from "react";
// import { Link, useSearchParams, useNavigate } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [statusMessage, setStatusMessage] = useState(
//     "Verifying payment..."
//   );

//   const [statusSubMessage, setStatusSubMessage] = useState(
//     "Please wait while we confirm your payment."
//   );

//   useEffect(() => {
//     const reference = searchParams.get("reference");

//     if (!reference) {
//       setStatusMessage("Payment reference not found");
//       setStatusSubMessage(
//         "The payment could not be verified."
//       );
//       return;
//     }

//     verifyPayment(reference);
//   }, []);

//   const verifyPayment = async (reference) => {
//     try {
//       const res = await api.get(
//         `/paystack/verify/${reference}/`
//       );

//       if (res.data.success) {
//         setStatusMessage(
//           "Payment Successful!"
//         );

//         setStatusSubMessage(
//           `Your order #${res.data.order_id} has been created successfully.`
//         );

//         setTimeout(() => {
//           navigate("/orders");
//         }, 3000);

//       } else {
//         setStatusMessage(
//           "Payment Verification Failed"
//         );

//         setStatusSubMessage(
//           "We could not confirm your payment."
//         );
//       }

//     } catch (error) {

//       console.error(error);

//       setStatusMessage(
//         "Error Verifying Payment"
//       );

//       setStatusSubMessage(
//         "An unexpected error occurred."
//       );
//     }
//   };

//   return (
//     <section
//       className="py-5"
//       style={{
//         minHeight: "70vh",
//         backgroundColor: "#4b3bcb",
//       }}
//     >
//       <div className="container">
//         <div className="text-center text-white">

//           <h1 className="display-4 fw-bold mb-4">
//             {statusMessage}
//           </h1>

//           <p className="lead mb-4">
//             {statusSubMessage}
//           </p>

//           <div className="d-flex justify-content-center gap-3 flex-wrap">

//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/"
//               className="btn btn-outline-light btn-lg"
//             >
//               Continue Shopping
//             </Link>

//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default PaymentStatusPage;









// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../api";

// export default function PaymentStatus() {

//     const navigate = useNavigate();

//     useEffect(() => {

//         const verify = async () => {

//             const params =
//                 new URLSearchParams(window.location.search);

//             const reference =
//                 params.get("reference");

//             if (!reference) return;

//             try {

//                 const res = await api.get(
//                     `/paystack/verify/${reference}/`
//                 );

//                 if (res.data.success) {

//                     navigate(
//                         `/orders`
//                     );

//                 }

//             } catch (err) {

//                 console.error(err);

//             }

//         };

//         verify();

//     }, []);

//     return (
//     <section
//       className="py-5"
//       style={{
//         minHeight: "70vh",
//         backgroundColor: "#4b3bcb",
//       }}
//     >
//       <div className="container">
//         <div className="text-center text-white">
//           <h1 className="display-4 fw-bold mb-4">
//             {statusMessage}
//           </h1>

//           <p className="lead mb-4">
//             {statusSubMessage}
//           </p>

//           <div className="d-flex justify-content-center gap-3 flex-wrap">
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/"
//               className="btn btn-outline-light btn-lg"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PaymentStatusPage;




// import React, { useEffect, useState } from "react";
// import {
//   Link,
//   useLocation,
//   useSearchParams,
// } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = ({
//   setNumCartItems = () => {},
// }) => {
//   const location = useLocation();
//   const [searchParams] = useSearchParams();

//   const [statusMessage, setStatusMessage] =
//     useState("Verifying your payment...");

//   const [statusSubMessage, setStatusSubMessage] =
//     useState(
//       "Please wait while we confirm your payment."
//     );

//   useEffect(() => {
//     let isMounted = true;

//     const verifyPayment = async () => {
//       try {
//         // ==========================
//         // PAYSTACK CALLBACK
//         // ==========================
//         const reference =
//           searchParams.get("reference");

//         // ==========================
//         // FLUTTERWAVE CALLBACK
//         // ==========================
//         const txRef =
//           searchParams.get("tx_ref");

//         let response;

//         if (reference) {
//           console.log(
//             "Paystack Reference:",
//             reference
//           );

//           response = await api.get(
//             `/payment/verify/${reference}/`
//           );
//         } else if (txRef) {
//           console.log(
//             "Flutterwave Reference:",
//             txRef
//           );

//           response = await api.get(
//             `/verify-payment/${txRef}/`
//           );
//         } else {
//           setStatusMessage(
//             "Invalid Payment Request ❌"
//           );

//           setStatusSubMessage(
//             "No payment reference was supplied."
//           );

//           return;
//         }

//         if (!isMounted) return;

//         console.log(
//           "Verification Response:",
//           response.data
//         );

//         const success =
//           response.data?.success ||
//           response.data?.status === "success";

//         if (success) {
//           setStatusMessage(
//             "Payment Successful ✅"
//           );

//           setStatusSubMessage(
//             response.data?.message ||
//               "Your payment has been verified successfully."
//           );

//           // Clear Cart
//           localStorage.removeItem(
//             "cart_code"
//           );

//           setNumCartItems(0);
//         } else {
//           setStatusMessage(
//             "Payment Verification Failed ❌"
//           );

//           setStatusSubMessage(
//             response.data?.message ||
//               "Unable to verify payment."
//           );
//         }
//       } catch (error) {
//         console.error(
//           "Verification Error:",
//           error
//         );

//         if (!isMounted) return;

//         setStatusMessage(
//           "Verification Error ❌"
//         );

//         setStatusSubMessage(
//           error.response?.data?.message ||
//             error.response?.data?.error ||
//             error.message ||
//             "Something went wrong."
//         );
//       }
//     };

//     verifyPayment();

//     return () => {
//       isMounted = false;
//     };
//   }, [location, searchParams, setNumCartItems]);

//   return (
//     <section
//       className="py-5"
//       style={{
//         minHeight: "70vh",
//         backgroundColor: "#4b3bcb",
//       }}
//     >
//       <div className="container">
//         <div className="text-center text-white">
//           <h1 className="display-4 fw-bold mb-4">
//             {statusMessage}
//           </h1>

//           <p className="lead mb-4">
//             {statusSubMessage}
//           </p>

//           <div className="d-flex justify-content-center gap-3 flex-wrap">
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/"
//               className="btn btn-outline-light btn-lg"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PaymentStatusPage;







// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = ({ setNumCartItems = () => {} }) => {
//   const [statusMessage, setStatusMessage] = useState(
//     "Verifying your payment..."
//   );

//   const [statusSubMessage, setStatusSubMessage] = useState(
//     "Please wait while we confirm your payment with Flutterwave."
//   );

//   const location = useLocation();

//   useEffect(() => {
//     let isMounted = true;

//     const verifyPayment = async () => {
//       try {
//         const params = new URLSearchParams(location.search);

//         const txRef = params.get("tx_ref");
//         const transactionId = params.get("transaction_id");
//         const status = params.get("status");

//         console.log("Flutterwave Callback:", {
//           txRef,
//           transactionId,
//           status,
//         });

//         if (!txRef) {
//           if (!isMounted) return;

//           setStatusMessage("Invalid Payment Request ❌");
//           setStatusSubMessage(
//             "Transaction reference (tx_ref) was not provided."
//           );
//           return;
//         }

//         const response = await api.get(
//           `/verify-payment/${txRef}/`
//         );

//         console.log(response.data);

//         // const response = await api.get(
//         //   `/payment/callback/?tx_ref=${encodeURIComponent(txRef)}`
//         // );

//         if (!isMounted) return;

//         console.log("Verification Response:", response.data);

//         if (response.data?.success) {
//           setStatusMessage("Payment Successful ✅");

//           setStatusSubMessage(
//             response.data?.message ||
//               "Your payment was verified successfully."
//           );

//           localStorage.removeItem("cart_code");

//           if (typeof setNumCartItems === "function") {
//             setNumCartItems(0);
//           }
//         } else {
//           setStatusMessage("Payment Verification Failed ❌");

//           setStatusSubMessage(
//             response.data?.message ||
//               response.data?.error ||
//               "Unable to verify payment."
//           );
//         }
//       } catch (error) {
//         console.error("Payment verification error:", error);

//         if (!isMounted) return;

//         setStatusMessage("Verification Error ❌");

//         setStatusSubMessage(
//           error?.response?.data?.message ||
//             error?.response?.data?.error ||
//             error.message ||
//             "An unexpected error occurred."
//         );
//       }
//     };

//     verifyPayment();

//     return () => {
//       isMounted = false;
//     };
//   }, [location, setNumCartItems]);

//   return (
//     <section
//       className="py-5"
//       style={{
//         backgroundColor: "#4b3bcb",
//         minHeight: "70vh",
//       }}
//     >
//       <div className="container px-4 px-lg-5 my-5">
//         <div className="text-center text-white">
//           <h1 className="display-4 fw-bold mb-4">
//             {statusMessage}
//           </h1>

//           <p className="lead mb-4">
//             {statusSubMessage}
//           </p>

//           <div className="d-flex justify-content-center gap-3 flex-wrap">
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/shop"
//               className="btn btn-outline-light btn-lg"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default PaymentStatusPage;










// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = ({ setNumCartItems = () => {} }) => {
//   const [statusMessage, setStatusMessage] = useState(
//     "Verifying your payment..."
//   );

//   const [statusSubMessage, setStatusSubMessage] = useState(
//     "Please wait while we confirm your payment with Flutterwave."
//   );

//   const location = useLocation();

//   useEffect(() => {
//     let mounted = true;

//     const verifyPayment = async () => {
//       try {
//         const queryParams = new URLSearchParams(location.search);
//         // const txRef = queryParams.get("tx_ref");
//         const txRef = queryParams.get("tx_ref");
//         const transactionId = queryParams.get("transaction_id");

//         console.log({
//           txRef,
//           transactionId,
//         });

//         if (!txRef) {
//           if (!mounted) return;

//           setStatusMessage("Invalid Payment Request ❌");
//           setStatusSubMessage(
//             "Transaction reference was not provided."
//           );
//           return;
//         }

//         console.log("Verifying payment:", txRef);

//         // const response = await api.get(
//         //   `/payment_callback/?tx_ref=${encodeURIComponent(txRef)}`
//         // );


//         const response = await api.get(
//           `/payment/callback/?tx_ref=${encodeURIComponent(txRef)}`
//         );

//         if (!mounted) return;

//         console.log("Verification response:", response.data);

//         if (response.data?.success) {
//           setStatusMessage("Payment Successful ✅");

//           setStatusSubMessage(
//             response.data.message ||
//               "Your payment has been verified successfully."
//           );

//           // Clear cart
//           localStorage.removeItem("cart_code");

//           // Safely update cart count
//           if (typeof setNumCartItems === "function") {
//             setNumCartItems(0);
//           }
//         } else {
//           setStatusMessage("Payment Verification Failed ❌");

//           setStatusSubMessage(
//             response.data?.message ||
//               response.data?.error ||
//               "Unable to verify your payment."
//           );
//         }
//       } catch (error) {
//         if (!mounted) return;

//         console.error("Payment verification error:", error);

//         setStatusMessage("Verification Error ❌");

//         setStatusSubMessage(
//           error?.response?.data?.message ||
//             error?.response?.data?.error ||
//             error.message ||
//             "Something went wrong while verifying your payment."
//         );
//       }
//     };

//     verifyPayment();

//     return () => {
//       mounted = false;
//     };
//   }, [location, setNumCartItems]);

//   return (
//     <header
//       className="py-5"
//       style={{
//         backgroundColor: "#4b3bcb",
//         minHeight: "70vh",
//       }}
//     >
//       <div className="container px-4 px-lg-5 my-5">
//         <div className="text-center text-white">
//           <h2 className="display-4 fw-bold">
//             {statusMessage}
//           </h2>

//           <p className="lead fw-normal mb-4">
//             {statusSubMessage}
//           </p>

//           <div>
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg px-4 py-2 mx-2"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/shop"
//               className="btn btn-outline-light btn-lg px-4 py-2 mx-2"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default PaymentStatusPage;





// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import api from "../../api";

// const PaymentStatusPage = ({ setNumCartItems }) => {
//   const [statusMessage, setStatusMessage] = useState(
//     "Verifying your payment..."
//   );

//   const [statusSubMessage, setStatusSubMessage] = useState(
//     "Please wait while we confirm your payment with Flutterwave."
//   );

//   const location = useLocation();

//   useEffect(() => {
//     let mounted = true;

//     const verifyPayment = async () => {
//       try {
//         const queryParams = new URLSearchParams(location.search);
//         const txRef = queryParams.get("tx_ref");

//         if (!txRef) {
//           if (!mounted) return;

//           setStatusMessage("Invalid Payment Request");
//           setStatusSubMessage(
//             "Transaction reference was not provided."
//           );
//           return;
//         }

//         const response = await api.get(
//           `/payment_callback/?tx_ref=${encodeURIComponent(txRef)}`
//         );

//         if (!mounted) return;

//         if (response.data.success) {
//           setStatusMessage("Payment Successful ✅");

//           setStatusSubMessage(
//             response.data.message ||
//             "Your payment has been verified successfully."
//           );

//           localStorage.removeItem("cart_code");
//           setNumCartItems(0);
//         } else {
//           setStatusMessage("Payment Verification Failed ❌");

//           setStatusSubMessage(
//             response.data.message ||
//             "Unable to verify your payment."
//           );
//         }
//       } catch (error) {
//         if (!mounted) return;

//         console.error("Payment verification error:", error);

//         setStatusMessage("Verification Error ❌");

//         setStatusSubMessage(
//           error.response?.data?.message ||
//           error.response?.data?.error ||
//           "Something went wrong while verifying your payment."
//         );
//       }
//     };

//     verifyPayment();

//     return () => {
//       mounted = false;
//     };
//   }, [location, setNumCartItems]);

//   return (
//     <header
//       className="py-5"
//       style={{
//         backgroundColor: "#4b3bcb",
//         minHeight: "70vh",
//       }}
//     >
//       <div className="container px-4 px-lg-5 my-5">
//         <div className="text-center text-white">
//           <h2 className="display-4 fw-bold">
//             {statusMessage}
//           </h2>

//           <p className="lead fw-normal text-white-75 mb-4">
//             {statusSubMessage}
//           </p>

//           <div>
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg px-4 py-2 mx-2"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/shop"
//               className="btn btn-outline-light btn-lg px-4 py-2 mx-2"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default PaymentStatusPage;


// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import api from "../../api"; // adjust path if needed

// const PaymentStatusPage = ({setNumCartItems}) => {
//   const [statusMessage, setStatusMessage] = useState(
//     "Verifying your payment..."
//   );

//   const [statusSubMessage, setStatusSubMessage] = useState(
//     "Please wait while we confirm your payment with Flutterwave."
//   );

//   const location = useLocation();

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         const queryParams = new URLSearchParams(location.search);

//         const txRef = queryParams.get("tx_ref");

//         if (!txRef) {
//           setStatusMessage("Invalid Payment Request");
//           setStatusSubMessage("Transaction reference was not provided.");
//           return;
//         }

//         const response = await api.get(
//           `/payment_callback/?tx_ref=${txRef}`
//         );

//         if (response.data.success) {
//           setStatusMessage("Payment Successful ✅");

//           setStatusSubMessage(
//             response.data.message ||
//               "Your payment has been verified successfully."
              
//           );
//         } else {
//           setStatusMessage("Payment Verification Failed ❌");

//           setStatusSubMessage(
//             response.data.message ||
//               "Unable to verify your payment."
//           );
//         }
//       } catch (error) {
//         console.error("Payment verification error:", error);

//         setStatusMessage("Verification Error ❌");

//         setStatusSubMessage(
//           error.response?.data?.message ||
//             "Something went wrong while verifying your payment."
//         );
//       }
//     };
//     localStorage.removeItem("cart_code")
//     setNumCartItems(0)
//     verifyPayment();
//   }, [location]);

//   return (
//     <header
//       className="py-5"
//       style={{
//         backgroundColor: "#4b3bcb",
//         minHeight: "70vh",
//       }}
//     >
//       <div className="container px-4 px-lg-5 my-5">
//         <div className="text-center text-white">

//           <h2 className="display-4 fw-bold">
//             {statusMessage}
//           </h2>

//           <p className="lead fw-normal text-white-75 mb-4">
//             {statusSubMessage}
//           </p>

//           <div>
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg px-4 py-2 mx-2"
//             >
//               View Orders
//             </Link>

//             <Link
//               to="/shop"
//               className="btn btn-outline-light btn-lg px-4 py-2 mx-2"
//             >
//               Continue Shopping
//             </Link>
//           </div>

//         </div>
//       </div>
//     </header>
//   );
// };

// export default PaymentStatusPage;



// import {React, useEffect, useState} from "react";
// import { Link, useLocation} from "react-router-dom";



// const PaymentStatusPage = () => {

//   const [statusMessage, setStatusMessage] = useState('Verifying your payment');
//   const [statusSubMessage, setStatusSubMessage] = useState('Wait a moment, your payment is being verified!')
//   const location = useLocation();

//   useEffect(function(){
//     const queryParams = new URLSearchParams(location.search);
//     const status = queryParams.get('status');
//     const txRef = queryParams.get('tx_ref');
//     const transactionId = queryParams.get('transaction_id');

//       if(status && txRef && transactionId){
//         api.post(payment_verify/?status=${status}& tx_ref=${txRef}& transaction_Id={transactionId})
//   },[])

//   return (
//     <header className="py-5" style={{ backgroundColor: "#4b3bcb" }}>
//       <div className="container px-4 px-lg-5 my-5">
//         <div className="text-center text-white">
//           <h2 className="display-4 fw-bold">Verifying Payment!</h2>

//           <p className="lead fw-normal text-white-75 mb-4">
//             Give us a moment while we verify your payment.
//           </p>

//           <div>
//             <Link
//               to="/orders"
//               className="btn btn-light btn-lg px-4 py-2 mx-3"
//             >
//               View Order Details
//             </Link>

//             <Link
//               to="/shop"
//               className="btn btn-light btn-lg px-4 py-2"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default PaymentStatusPage;

