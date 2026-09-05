import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const RegisterPage = () => {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      formData.password !==
      formData.confirm_password
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/register/",
        formData
      );

      setMessage(
        response.data.message ||
          "Account created successfully."
      );

      setFormData({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      const errors = err.response?.data;

      if (errors) {
        setError(
          Object.values(errors)
            .flat()
            .join(" ")
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-lg-7 col-md-9">

            <div className="card border-0 shadow-lg register-card">

              <div className="card-body p-5">

                <div className="text-center mb-4">

                  <h1 className="fw-bold text-primary">
                    Create Account
                  </h1>

                  <p className="text-muted">
                    Join NajaOpenMarket and start
                    shopping today.
                  </p>

                </div>

                {message && (
                  <div className="alert alert-success">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  <div className="row">

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        First Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Last Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="username"
                      value={formData.username}
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
                      className="form-control form-control-lg"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3 position-relative">
                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      className="form-control form-control-lg"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute end-0 top-50 mt-3 me-2"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  <div className="mb-4 position-relative">
                    <label className="form-label">
                      Confirm Password
                    </label>

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      className="form-control form-control-lg"
                      name="confirm_password"
                      value={
                        formData.confirm_password
                      }
                      onChange={handleChange}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute end-0 top-50 mt-3 me-2"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?
                  </p>

                  <Link
                    to="/login"
                    className="text-decoration-none fw-bold"
                  >
                    Sign In
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RegisterPage;














// import React, { useState } from "react";
// import api from "../api";

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     email: "",
//     password: "",
//     confirm_password: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));

//     setError("");
//     setMessage("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setMessage("");

//     if (
//       !formData.first_name ||
//       !formData.last_name ||
//       !formData.username ||
//       !formData.email ||
//       !formData.password ||
//       !formData.confirm_password
//     ) {
//       setError("All fields are required.");
//       return;
//     }

//     if (formData.password !== formData.confirm_password) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/register/",
//         formData
//       );

//       setMessage(
//         response.data.message ||
//           "Registration successful."
//       );

//       setFormData({
//         first_name: "",
//         last_name: "",
//         username: "",
//         email: "",
//         password: "",
//         confirm_password: "",
//       });

//     } catch (err) {
//       console.error(err);

//       if (err.response?.data) {
//         const errors = err.response.data;

//         if (typeof errors === "string") {
//           setError(errors);
//         } else {
//           const firstError = Object.values(errors)
//             .flat()
//             .join(" ");

//           setError(firstError);
//         }
//       } else {
//         setError(
//           "Unable to register. Please try again."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">

//           <div className="card shadow">
//             <div className="card-body">

//               <h2 className="text-center mb-4">
//                 Create Account
//               </h2>

//               {message && (
//                 <div className="alert alert-success">
//                   {message}
//                 </div>
//               )}

//               {error && (
//                 <div className="alert alert-danger">
//                   {error}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit}>

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="First Name"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="Last Name"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="Username"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="email"
//                   className="form-control mb-3"
//                   placeholder="Email Address"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="password"
//                   className="form-control mb-3"
//                   placeholder="Password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="password"
//                   className="form-control mb-3"
//                   placeholder="Confirm Password"
//                   name="confirm_password"
//                   value={formData.confirm_password}
//                   onChange={handleChange}
//                 />

//                 <button
//                   className="btn btn-dark w-100"
//                   type="submit"
//                   disabled={loading}
//                 >
//                   {loading
//                     ? "Registering..."
//                     : "Register"}
//                 </button>

//               </form>

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;











// import React, { useState } from "react";
// import api from "../../api";


// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     email: "",
//     password: "",
//     confirm_password: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const response = await api.post(
//       "/register/",
//       formData
//     );

//     alert(response.data.message);
//   } catch (error) {
//     console.error(error.response?.data);

//     alert("Registration failed");
//   }
// };


//   return (
//     <div className="container py-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">

//           <div className="card shadow">
//             <div className="card-body">

//               <h2 className="text-center mb-4">
//                 Create Account
//               </h2>

//               <form onSubmit={handleSubmit}>

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="First Name"
//                   name="first_name"
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="Last Name"
//                   name="last_name"
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="text"
//                   className="form-control mb-3"
//                   placeholder="Username"
//                   name="username"
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="email"
//                   className="form-control mb-3"
//                   placeholder="Email Address"
//                   name="email"
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="password"
//                   className="form-control mb-3"
//                   placeholder="Password"
//                   name="password"
//                   onChange={handleChange}
//                 />

//                 <input
//                   type="password"
//                   className="form-control mb-3"
//                   placeholder="Confirm Password"
//                   name="confirm_password"
//                   onChange={handleChange}
//                 />

//                 <button
//                   className="btn btn-dark w-100"
//                   type="submit"
//                 >
//                   Register
//                 </button>

//               </form>

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;