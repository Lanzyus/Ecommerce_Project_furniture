import { useState } from "react";
import styles from "./PaymentSection.module.css";
import api from "../../api";

const PaymentSection = () => {
  const cart_code = localStorage.getItem("cart_code");
  const [loading, setLoading] = useState(false);

  // ===============================
  // PAYSTACK
  // ===============================
  const initializePaystack = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/paystack/initialize/",
        {
          cart_code,
        }
      );

      console.log("Paystack Response:", response.data);

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
      console.error("Paystack Error:", error);
      console.error("Response Data:", error.response?.data);
      console.error("Status:", error.response?.status);

      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Paystack initialization failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FLUTTERWAVE
  // ===============================

    const makePayment = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access");

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

      console.log("Flutterwave Response:", response.data);

      const paymentLink = response?.data?.data?.link;

      console.log("Flutterwave Link:", paymentLink);

      if (!paymentLink) {
        alert("Flutterwave did not return a payment link.");
        return;
      }

      // Redirect to Flutterwave hosted payment page
      window.location.href = paymentLink;

    } catch (error) {
      console.error("Flutterwave Error:", error);

      console.error(
        "Flutterwave Response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to initialize Flutterwave payment."
      );

    } finally {
      setLoading(false);
    }
  };
  // const makePayment = async () => {
  //   try {
  //     setLoading(true);

  //     const response = await api.post(
  //       "/payment/initiate/",
  //       {
  //         cart_code,
  //       }
  //     );

  //     console.log(
  //       "Flutterwave Response:",
  //       response.data
  //     );

  //     if (response.data?.data?.link) {
  //       window.location.href =
  //         response.data.data.link;
  //     } else {
  //       alert(
  //         "Unable to initialize Flutterwave payment."
  //       );
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Flutterwave Error:",
  //       error.response?.data || error
  //     );

  //     alert(
  //       error.response?.data?.error ||
  //       error.response?.data?.details ||
  //       error.response?.data?.message ||
  //       "Flutterwave initialization failed."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="col-md-4">
      <div className={`card ${styles.card}`}>
        <div
          className="card-header"
          style={{
            backgroundColor: "#605EDC",
            color: "white",
          }}
        >
          <h5 className="mb-0">
            Payment Options
          </h5>
        </div>

        <div className="card-body">

          <button
            className={`btn btn-success w-100 mb-3 ${styles.paystackButton}`}
            onClick={initializePaystack}
            disabled={loading}
            type="button"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <i className="bi bi-credit-card"></i>
                {" "}Pay with Paystack
              </>
            )}
          </button>

          <hr />

          <button
            className={`btn btn-primary w-100 mb-3 ${styles.paypalButton}`}
            type="button"
          >
            <i className="bi bi-paypal"></i>
            {" "}Pay with PayPal
          </button>

          <hr />

          <button
            className={`btn btn-warning w-100 ${styles.flutterwaveButton}`}
            onClick={makePayment}
            disabled={loading}
            type="button"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <i className="bi bi-credit-card"></i>
                {" "}Pay with Flutterwave
              </>
            )}
          </button>

        </div>
      </div>
    </div>
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
