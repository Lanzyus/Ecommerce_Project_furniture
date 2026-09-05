import { useState } from "react";
import {
  FiCreditCard,
  FiLock,
  FiShield,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

import styles from "./PaymentSection.module.css";

import api from "../../api";

const PaymentSection = ({
  cartTotal = 0,
  totalQuantity = 0,
  tax = 0,
}) => {

  const cart_code = localStorage.getItem("cart_code");

  const [paymentLoading, setPaymentLoading] =
    useState(null);

  const subTotal = Number(cartTotal || 0);

  const cartTax = Number(tax || 0);

  const total = subTotal + cartTax;


  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });


  /* =====================================================
     PAYSTACK
  ===================================================== */

  const initializePaystack = async () => {

    if (!cart_code) {
      alert("Your cart could not be found.");
      return;
    }

    try {

      setPaymentLoading("paystack");

      const response = await api.post(
        "/paystack/initialize/",
        {
          cart_code,
        }
      );


      if (
        response.data?.status === true &&
        response.data?.data?.authorization_url
      ) {

        window.location.href =
          response.data.data.authorization_url;

      } else {

        alert(
          response.data?.message ||
          response.data?.error ||
          "Unable to initialize Paystack."
        );

      }

    } catch (error) {

      console.error(
        "Paystack Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Paystack initialization failed."
      );

    } finally {

      setPaymentLoading(null);

    }
  };


  /* =====================================================
     FLUTTERWAVE
  ===================================================== */

  const makePayment = async () => {

    if (!cart_code) {
      alert("Your cart could not be found.");
      return;
    }

    try {

      setPaymentLoading("flutterwave");

      const token =
        localStorage.getItem("access");


      const response = await api.post(
        "/payment/initiate/",
        {
          cart_code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const paymentLink =
        response?.data?.data?.link;


      if (!paymentLink) {

        alert(
          response.data?.message ||
          "Flutterwave did not return a payment link."
        );

        return;
      }


      window.location.href = paymentLink;

    } catch (error) {

      console.error(
        "Flutterwave Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to initialize Flutterwave payment."
      );

    } finally {

      setPaymentLoading(null);

    }
  };


  return (
    <aside className={styles.paymentCard}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className={styles.header}>

        <span>PAYMENT</span>

        <h2>Choose how to pay</h2>

        <p>
          Select a secure payment method to complete
          your purchase.
        </p>

      </div>


      {/* =================================================
          TOTAL
      ================================================= */}

      <div className={styles.totalBox}>

        <div>
          <span>ORDER TOTAL</span>

          <strong>
            ₦{formatCurrency(total)}
          </strong>
        </div>

        <div className={styles.quantity}>
          {totalQuantity}{" "}
          {totalQuantity === 1 ? "item" : "items"}
        </div>

      </div>


      {/* =================================================
          PAYMENT METHODS
      ================================================= */}

      <div className={styles.methods}>

        {/* PAYSTACK */}

        <button
          type="button"
          className={`${styles.paymentButton} ${styles.paystack}`}
          onClick={initializePaystack}
          disabled={paymentLoading !== null}
        >

          <span className={styles.buttonIcon}>
            <FiCreditCard />
          </span>

          <span className={styles.buttonText}>
            <strong>
              {paymentLoading === "paystack"
                ? "Connecting..."
                : "Pay with Paystack"}
            </strong>

            <small>
              Card, bank transfer & more
            </small>
          </span>

          {paymentLoading === "paystack" ? (
            <span className={styles.miniSpinner} />
          ) : (
            <FiArrowRight className={styles.arrow} />
          )}

        </button>


        {/* FLUTTERWAVE */}

        <button
          type="button"
          className={`${styles.paymentButton} ${styles.flutterwave}`}
          onClick={makePayment}
          disabled={paymentLoading !== null}
        >

          <span className={styles.buttonIcon}>
            <FiCreditCard />
          </span>

          <span className={styles.buttonText}>
            <strong>
              {paymentLoading === "flutterwave"
                ? "Connecting..."
                : "Pay with Flutterwave"}
            </strong>

            <small>
              Secure card & bank payment
            </small>
          </span>

          {paymentLoading === "flutterwave" ? (
            <span className={styles.miniSpinner} />
          ) : (
            <FiArrowRight className={styles.arrow} />
          )}

        </button>

      </div>


      {/* =================================================
          SECURITY
      ================================================= */}

      <div className={styles.security}>

        <div>
          <FiLock />
          <span>Secure payment</span>
        </div>

        <div>
          <FiShield />
          <span>Protected checkout</span>
        </div>

      </div>


      {/* =================================================
          TRUST MESSAGE
      ================================================= */}

      <div className={styles.trust}>

        <div className={styles.check}>
          <FiCheck />
        </div>

        <div>
          <strong>Your payment is protected</strong>

          <p>
            You will be redirected to the selected
            payment provider to safely complete your
            transaction.
          </p>
        </div>

      </div>

    </aside>
  );
};

export default PaymentSection;











// import { useState } from "react";
// import styles from "./PaymentSection.module.css";
// import api from "../../api";

// const PaymentSection = () => {
//   const cart_code = localStorage.getItem("cart_code");
//   const [loading, setLoading] = useState(false);

//   // ===============================
//   // PAYSTACK
//   // ===============================
//   const initializePaystack = async () => {
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/paystack/initialize/",
//         {
//           cart_code,
//         }
//       );

//       console.log("Paystack Response:", response.data);

//       if (
//         response.data?.status === true &&
//         response.data?.data?.authorization_url
//       ) {
//         window.location.href =
//           response.data.data.authorization_url;
//       } else {
//         alert(
//           response.data?.message ||
//           response.data?.error ||
//           "Unable to initialize Paystack."
//         );
//       }
//     } catch (error) {
//       console.error("Paystack Error:", error);
//       console.error("Response Data:", error.response?.data);
//       console.error("Status:", error.response?.status);

//       alert(
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         "Paystack initialization failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===============================
//   // FLUTTERWAVE
//   // ===============================

//     const makePayment = async () => {
//     try {
//       setLoading(true);

//       const token = localStorage.getItem("access");

//       const response = await api.post(
//         "/payment/initiate/",
//         {
//           cart_code,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Flutterwave Response:", response.data);

//       const paymentLink = response?.data?.data?.link;

//       console.log("Flutterwave Link:", paymentLink);

//       if (!paymentLink) {
//         alert("Flutterwave did not return a payment link.");
//         return;
//       }

//       // Redirect to Flutterwave hosted payment page
//       window.location.href = paymentLink;

//     } catch (error) {
//       console.error("Flutterwave Error:", error);

//       console.error(
//         "Flutterwave Response:",
//         error.response?.data
//       );

//       alert(
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Unable to initialize Flutterwave payment."
//       );

//     } finally {
//       setLoading(false);
//     }
//   };
//   // const makePayment = async () => {
//   //   try {
//   //     setLoading(true);

//   //     const response = await api.post(
//   //       "/payment/initiate/",
//   //       {
//   //         cart_code,
//   //       }
//   //     );

//   //     console.log(
//   //       "Flutterwave Response:",
//   //       response.data
//   //     );

//   //     if (response.data?.data?.link) {
//   //       window.location.href =
//   //         response.data.data.link;
//   //     } else {
//   //       alert(
//   //         "Unable to initialize Flutterwave payment."
//   //       );
//   //     }
//   //   } catch (error) {
//   //     console.error(
//   //       "Flutterwave Error:",
//   //       error.response?.data || error
//   //     );

//   //     alert(
//   //       error.response?.data?.error ||
//   //       error.response?.data?.details ||
//   //       error.response?.data?.message ||
//   //       "Flutterwave initialization failed."
//   //     );
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   return (
//     <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{
//             backgroundColor: "#605EDC",
//             color: "white",
//           }}
//         >
//           <h5 className="mb-0">
//             Payment Options
//           </h5>
//         </div>

//         <div className="card-body">

//           <button
//             className={`btn btn-success w-100 mb-3 ${styles.paystackButton}`}
//             onClick={initializePaystack}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with Paystack
//               </>
//             )}
//           </button>

//           <hr />

//           <button
//             className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
//             type="button"
//           >
//             <i className="bi bi-paypal"></i>
//             {" "}Pay with PayPal
//           </button>

//           <hr />

//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             onClick={makePayment}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with Flutterwave
//               </>
//             )}
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSection;






// import { useState } from "react";
// import styles from "./PaymentSection.module.css";
// import api from "../../api";

// const PaymentSection = () => {
//   const cart_code = localStorage.getItem("cart_code");
//   const [loading, setLoading] = useState(false);

//   // ===============================
//   // PAYSTACK
//   // ===============================
//   const initializePaystack = async () => {
//      headers = {
//     "Authorization":
//     f"Bearer {settings.PAYSTACK_SECRET_KEY}",
//     "Content-Type": "application/json",
//     }
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/paystack/initialize/",
//         {
//           cart_code,
//         }
//       );

//       console.log("Paystack Response:", response.data);

//       if (
//         response.data?.status &&
//         response.data?.data?.authorization_url
//       ) {
//         window.location.href =
//           response.data.data.authorization_url;
//       } else {
//         alert(
//           response.data?.message ||
//           "Unable to initialize Paystack."
//         );
//       }
//     } catch (error) {
//       console.error("Paystack Error:", error);
//       console.error(
//         "Response Data:",
//         error.response?.data
//       );
//       console.error(
//         "Status:",
//         error.response?.status
//       );

//       alert(
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         JSON.stringify(error.response?.data) ||
//         "Paystack initialization failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===============================
//   // FLUTTERWAVE
//   // ===============================
//   const makePayment = async () => {
//    headers = {
//     "Authorization":
//     f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
//     "Content-Type": "application/json",
//     }
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/payment/initiate/",
//         {
//           cart_code,
//         }
//       );

//       console.log(
//         "Flutterwave Response:",
//         response.data
//       );

//       if (response.data?.data?.link) {
//         window.location.href =
//           response.data.data.link;
//       } else {
//         alert(
//           "Unable to initialize Flutterwave payment."
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Flutterwave Error:",
//         error.response?.data || error
//       );

//       alert(
//         error.response?.data?.error ||
//         error.response?.data?.details ||
//         error.response?.data?.message ||
//         "Flutterwave initialization failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{
//             backgroundColor: "#605EDC",
//             color: "white",
//           }}
//         >
//           <h5 className="mb-0">
//             Payment Options
//           </h5>
//         </div>

//         <div className="card-body">

//           {/* PAYSTACK */}
//           <button
//             className={`btn btn-success w-100 mb-3 ${styles.paystackButton}`}
//             onClick={initializePaystack}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with Paystack
//               </>
//             )}
//           </button>

//           <hr />

//           {/* PAYPAL */}
//           <button
//             className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
//             type="button"
//           >
//             <i className="bi bi-paypal"></i>
//             {" "}Pay with PayPal
//           </button>

//           <hr />

//           {/* FLUTTERWAVE */}
//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             onClick={makePayment}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with Flutterwave
//               </>
//             )}
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSection;









// import { useState } from "react";
// import styles from "./PaymentSection.module.css";
// import api from "../../api";

// const PaymentSection = () => {
//   const cart_code = localStorage.getItem("cart_code");
//   const [loading, setLoading] = useState(false);

//   // ===============================
//   // PAYSTACK
//   // ===============================
//   const initializePaystack = async () => {
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/paystack/initialize/",
//         {
//           cart_code,
//         }
//       );

//       console.log("Paystack Response:", response.data);

//       if (
//         response.data?.status &&
//         response.data?.data?.authorization_url
//       ) {
//         window.location.href =
//           response.data.data.authorization_url;
//       } else {
//         alert(
//           response.data?.message ||
//           "Unable to initialize Paystack."
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Paystack Error:",
//         error.response?.data || error
//       );

//       alert(
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         "Paystack initialization failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===============================
//   // FLUTTERWAVE
//   // ===============================
//   const makePayment = async () => {
//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/payment/initiate/",
//         {
//           cart_code,
//         }
//       );

//       console.log(
//         "Flutterwave Response:",
//         response.data
//       );

//       if (
//         response.data?.data?.link
//       ) {
//         window.location.href =
//           response.data.data.link;
//       } else {
//         alert(
//           "Unable to initialize Flutterwave payment."
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Flutterwave Error:",
//         error.response?.data || error
//       );

//       alert(
//         error.response?.data?.error ||
//         error.response?.data?.details ||
//         error.response?.data?.message ||
//         "Flutterwave initialization failed."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{
//             backgroundColor: "#605EDC",
//             color: "white",
//           }}
//         >
//           <h5 className="mb-0">
//             Payment Options
//           </h5>
//         </div>

//         <div className="card-body">

//           {/* PAYSTACK */}
//           <button
//             className={`btn btn-success w-100 mb-3 ${styles.paystackButton}`}
//             onClick={initializePaystack}
//             disabled={loading}
//             type="button"
//           >
//             {loading
//               ? "Processing..."
//               : "Pay with Paystack"}
//           </button>

//           <hr />

//           {/* PAYPAL */}
//           <button
//             className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
//             type="button"
//           >
//             <i className="bi bi-paypal"></i>
//             {" "}Pay with PayPal
//           </button>

//           <hr />

//           {/* FLUTTERWAVE */}
//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             onClick={makePayment}
//             disabled={loading}
//             type="button"
//           >
//             {loading
//               ? "Processing..."
//               : "Pay with Flutterwave"}
//           </button>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSection;











// import { useState } from "react";
// import styles from "./PaymentSection.module.css";
// import api from "../../api";

// const PaymentSection = () => {
//   const cart_code = localStorage.getItem("cart_code");
//   const [loading, setLoading] = useState(false);


//   const initializePaystack = async () => {
//   try {
//     setLoading(true);

//     const response = await api.post(
//       "/paystack/initialize/",
//       {
//         cart_code,
//       }
//     );

//     console.log(response.data);

//     if (
//       response.data.status &&
//       response.data.data.authorization_url
//     ) {
//       window.location.href =
//         response.data.data.authorization_url;
//     } else {
//       alert("Unable to initialize Paystack");
//     }
//   } catch (error) {
//     console.error(error);
//     alert(
//       error.response?.data?.error ||
//       "Payment initialization failed"
//     );
//   } finally {
//     setLoading(false);
//   }
// };
//   const makePayment = async () => {
//     try {
//       setLoading(true);

//       // const response = await api.post(
//       //   "initiate_payment/",
//       //   {
//       //     cart_code,
//       //   }
//       // );

//       const response = await api.post(
//         "/payment/initiate/", 
//         {
//           cart_code,
//         });

//       console.log("Payment Response:", response.data);

//       if (
//         response.data?.data &&
//         response.data.data.link
//       ) {
//         window.location.href = response.data.data.link;
//       } else {
//         alert("Unable to initialize payment.");
//       }
//     } catch (error) {
//       console.error("Payment Error:", error);

//       const errorMessage =
//         error.response?.data?.error ||
//         error.response?.data?.details ||
//         error.message;

//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
// catch (error) {
//   console.error("Error Response:", error.response?.data);
//   console.error("Error Status:", error.response?.status);

//   alert(
//     error.response?.data?.error ||
//     JSON.stringify(error.response?.data)
//   );
// }

//   return (
//     <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{
//             backgroundColor: "#605EDC",
//             color: "white",
//           }}
//         >
//           <h5 className="mb-0">Payment Options</h5>
//         </div>

//         <div className="card-body">
//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             // onClick={initializePaystack}
//             onClick={handlePaystack}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with PayStack
//               </>
//             )}
//           </button>
//           <hr/>
//           <button
//             className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
//             type="button"
//           >
//             <i className="bi bi-paypal"></i> Pay with PayPal
//           </button>
// <hr/>
//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             onClick={makePayment}
//             disabled={loading}
//             type="button"
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               <>
//                 <i className="bi bi-credit-card"></i>
//                 {" "}Pay with Flutterwave
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSection;


// import { useState } from "react"
// import styles from "./PaymentSection.module.css"
// import api from "../../api"



// const PaymentSection = () => {

//   const cart_code = localStorage.getItem("cart_code")
//   const [loading, setLoading] = useState(false)

//   function makePayment(){
//     api.post(`initiate_payment/`, {cart_code})
//     .then(res => {
//       console.log(res.data)
//     })

//     .catch(err => {
//       console.log(err.message)
//     })
//   }

//   return (
//     <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div
//           className="card-header"
//           style={{ backgroundColor: "#605EDC", color: "white" }}
//         >
//           <h5 className="mb-0">Payment Options</h5>
//         </div>

//         <div className="card-body">
//           {/* PayPal Button */}
//           <button
//             className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
//             id="paypal-button"
//             type="button"
//           >
//             <i className="bi bi-paypal"></i> Pay with PayPal
//           </button>

//           {/* Flutterwave Button */}
//           <button
//             className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
//             onClick={makePayment}
//             id="flutterwave-button"
//             type="button"
//           >
//             <i className="bi bi-credit-card"></i> Pay with Flutterwave
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSection;



// import React from 'react'
// import styles from './PaymentSection.module.css'


// const PaymentSection = () => {
//   return (
//      <div className="col-md-4">
//       <div className={`card ${styles.card}`}>
//         <div className="card-header" style={{ backgroundColor: '#605EDC', color: 'white' }}>
//           <h5>Payment Options</h5>
//         </div>
//         <div className="card-body">
//           {/* PayPal Button */}
//           <button className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`} id="paypal-button">
//             <i className="bi bi-paypal"></i> Pay with PayPal
//           </button>

//           {/* Flutterwave Button */}
//           <button className={`btn btn-warning w-100 ${styles.flutterwaveButton}`} id="flutterwave-button">
//             <i className="bi bi-credit-card"></i> Pay with Flutterwave
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PaymentSection
