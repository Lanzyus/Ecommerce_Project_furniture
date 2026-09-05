import React, { useState } from "react";
import api from "../api";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await api.post(
        "/contact/",
        formData
      );

      setSuccess(
        response.data.message ||
          "Your message has been sent successfully. We will get back to you shortly."
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to send your message at this time. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">

      {/* Page Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">
          Contact Us
        </h1>

        <p className="lead text-muted">
          We'd love to hear from you. Send us a message
          and our team will respond as soon as possible.
        </p>
      </div>

      <div className="row g-4">

        {/* Contact Form */}
        <div className="col-lg-7">
          <div className="card shadow border-0">
            <div className="card-body p-4">

              <h3 className="mb-4">
                Send Us a Message
              </h3>

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Subject
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Message
                  </label>

                  <textarea
                    className="form-control"
                    rows="6"
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="col-lg-5">

          <div className="card shadow border-0 mb-4">
            <div className="card-body">

              <h4 className="mb-3">
                Contact Information
              </h4>

              <p>
                📍 <strong>Address:</strong><br />
                Lagos, Nigeria
              </p>

              <p>
                📞 <strong>Phone:</strong><br />
                +234 0803 518 5273
              </p>

              <p>
                ✉ <strong>Email:</strong><br />
                support@naijaopenmarket.com
              </p>

            </div>
          </div>

          <div className="card shadow border-0 mb-4">
            <div className="card-body">

              <h4 className="mb-3">
                Business Hours
              </h4>

              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>

            </div>
          </div>

          <div className="card shadow border-0">
            <div className="card-body">

              <h4 className="mb-3">
                Follow Us
              </h4>

              <div className="d-flex gap-3 fs-4">
                <span>📘</span>
                <span>📸</span>
                <span>🐦</span>
                <span>💼</span>
              </div>

              <p className="mt-3 text-muted">
                Stay connected with us on social media
                for the latest products, promotions,
                and updates.
              </p>

            </div>
          </div>

        </div>

      </div>

      {/* FAQ Section */}
      <div className="mt-5">
        <h2 className="text-center mb-4">
          Frequently Asked Questions
        </h2>

        <div className="accordion" id="contactFAQ">

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
              >
                How long does it take to receive a response?
              </button>
            </h2>

            <div
              id="faq1"
              className="accordion-collapse collapse show"
            >
              <div className="accordion-body">
                We typically respond to inquiries within
                24 hours during business days.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq2"
              >
                Can I track my order?
              </button>
            </h2>

            <div
              id="faq2"
              className="accordion-collapse collapse"
            >
              <div className="accordion-body">
                Yes. Once your order has been shipped,
                tracking information will be provided.
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ContactPage;









// import React, { useState } from "react";
// import api from "../api";

// const ContactPage = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);

//     try {
//       const response = await api.post(
//         "/contact/",
//         formData
//       );

//       alert(
//         response.data.message ||
//           "Message sent successfully!"
//       );

//       setFormData({
//         name: "",
//         email: "",
//         subject: "",
//         message: "",
//       });
//     } catch (error) {
//       console.error(
//         "Contact Error:",
//         error.response?.data || error.message
//       );

//       alert(
//         error.response?.data?.message ||
//           "Failed to send message."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">
//       <h1 className="mb-4">Contact Us</h1>

//       <div className="row">
//         <div className="col-md-6">
//           <form onSubmit={handleSubmit}>
//             <input
//               type="text"
//               className="form-control mb-3"
//               placeholder="Your Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="email"
//               className="form-control mb-3"
//               placeholder="Email Address"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="text"
//               className="form-control mb-3"
//               placeholder="Subject"
//               name="subject"
//               value={formData.subject}
//               onChange={handleChange}
//               required
//             />

//             <textarea
//               className="form-control mb-3"
//               rows="5"
//               placeholder="Message"
//               name="message"
//               value={formData.message}
//               onChange={handleChange}
//               required
//             />

//             <button
//               className="btn btn-dark"
//               type="submit"
//               disabled={loading}
//             >
//               {loading
//                 ? "Sending..."
//                 : "Send Message"}
//             </button>
//           </form>
//         </div>

//         <div className="col-md-6">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h4>Contact Information</h4>

//               <p>📍 Lagos, Nigeria</p>
//               <p>📞 +234 xxx xxx xxxx</p>
//               <p>✉ support@shopit.com</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContactPage;










// import React, { useState } from "react";

// const ContactPage = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

// import api from "../api";

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await api.post(
//       "/contact/",
//       formData
//     );

//     alert(response.data.message);

//     setFormData({
//       name: "",
//       email: "",
//       subject: "",
//       message: "",
//     });

//   } catch (error) {
//     console.error(error.response?.data);

//     alert("Failed to send message");
//   }
// };

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();

//   //   console.log(formData);

//   //   alert("Message sent successfully!");
//   // };

//   return (
//     <div className="container py-5">

//       <h1 className="mb-4">Contact Us</h1>

//       <div className="row">

//         <div className="col-md-6">

//           <form onSubmit={handleSubmit}>

//             <input
//               type="text"
//               className="form-control mb-3"
//               placeholder="Your Name"
//               name="name"
//               onChange={handleChange}
//             />

//             <input
//               type="email"
//               className="form-control mb-3"
//               placeholder="Email Address"
//               name="email"
//               onChange={handleChange}
//             />

//             <input
//               type="text"
//               className="form-control mb-3"
//               placeholder="Subject"
//               name="subject"
//               onChange={handleChange}
//             />

//             <textarea
//               className="form-control mb-3"
//               rows="5"
//               placeholder="Message"
//               name="message"
//               onChange={handleChange}
//             />

//             <button
//               className="btn btn-dark"
//               type="submit"
//             >
//               Send Message
//             </button>

//           </form>

//         </div>

//         <div className="col-md-6">

//           <div className="card shadow-sm">
//             <div className="card-body">

//               <h4>Contact Information</h4>

//               <p>📍 Lagos, Nigeria</p>
//               <p>📞 +234 xxx xxx xxxx</p>
//               <p>✉ support@shopit.com</p>

//             </div>
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default ContactPage;