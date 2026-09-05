import React, { useState, useContext } from "react";
import "./LoginPage.css";
import api from "../../api";
import Error from "../ui/Error";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthContext from "../../Context/AuthContext";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api.post("token/", {
        username,
        password,
      });

      console.log("Login Response:", res.data);

      const { access, refresh } = res.data;

      if (!access || !refresh) {
        throw new Error("Access or refresh token missing.");
      }

      // Save tokens and update context
      login(access, refresh);

      setUsername("");
      setPassword("");

      const from = location.state?.from?.pathname || "/";

      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container my-5">
      {error && <Error error={error} />}

      <div className="login-card shadow">
        <h2 className="login-title">Welcome Back</h2>

        <p className="login-subtitle">
          Please login to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>

            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer mt-3">
          <p>
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </p>

          <p>
            Don't have an account?{" "}
            <Link to="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;




// import React, { useState, useContext } from "react";
// import "./LoginPage.css";
// import api from "../../api";
// import Error from "../ui/Error";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const LoginPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { login } = useContext(AuthContext);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.post("token/", {
//         username,
//         password,
//       });

//       console.log("Login Response:", res.data);

//       const { access, refresh } = res.data;

//       if (!access || !refresh) {
//         throw new Error("Access or refresh token missing from response");
//       }

//       // Save tokens
//       localStorage.setItem("access", access);
//       localStorage.setItem("refresh", refresh);

//       console.log(
//         "Stored Access Token:",
//         localStorage.getItem("access")
//       );

//       // Update AuthContext
//       login(access);

//       // Clear form
//       setUsername("");
//       setPassword("");

//       // Redirect user
//       const from = location.state?.from?.pathname || "/";
//       navigate(from, { replace: true });

//     } catch (err) {
//       console.error("Login Error:", err);

//       if (err.response) {
//         setError(
//           err.response.data?.detail ||
//           err.response.data?.error ||
//           "Login failed"
//         );
//       } else {
//         setError(err.message || "Network error");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container my-5">
//       {error && <Error error={error} />}

//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>

//         <p className="login-subtitle">
//           Please login to your account
//         </p>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>

//             <input
//               id="username"
//               type="text"
//               className="form-control"
//               placeholder="Enter username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               className="form-control"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer mt-3">
//           <p>
//             <Link to="/forgot-password">
//               Forgot Password?
//             </Link>
//           </p>

//           <p>
//             Don't have an account?{" "}
//             <Link to="/register">
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;







// import React, { useState, useContext } from "react";
// import "./LoginPage.css";
// import api from "../../api";
// import Error from "../ui/Error";
// import { useLocation, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const LoginPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const { login } = useContext(AuthContext);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.post("/token/", {
//         username,
//         password,
//       });

//       console.log("Login Response:", res.data);

//       // Save refresh token
//       localStorage.setItem("refresh", res.data.refresh);

//       // Save access token through AuthContext
//       login(res.data.access);

//       // Verify token was saved
//       console.log(
//         "Stored Access Token:",
//         localStorage.getItem("access")
//       );

//       setUsername("");
//       setPassword("");

//       const from = location.state?.from?.pathname || "/";

//       navigate(from, { replace: true });

//     } catch (err) {
//       console.error("Login Error:", err);

//       setError(
//         err.response?.data?.detail ||
//         "Invalid username or password"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container my-5">
//       {error && <Error error={error} />}

//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>
//         <p className="login-subtitle">
//           Please login to your account
//         </p>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>

//             <input
//               id="username"
//               type="text"
//               value={username}
//               onChange={(e) =>
//                 setUsername(e.target.value)
//               }
//               className="form-control"
//               placeholder="Enter username"
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) =>
//                 setPassword(e.target.value)
//               }
//               className="form-control"
//               placeholder="Enter password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>
//             <a href="#">Forgot Password?</a>
//           </p>

//           <p>
//             Don't have an account?{" "}
//             <a href="#">Sign up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;




// import React, { useState, useContext } from "react";
// import "./LoginPage.css";
// import api from "../../api";
// import Error from "../ui/Error";
// import { useLocation, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const LoginPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ✅ SAFE CONTEXT USAGE (ONLY ONCE)
//   const auth = useContext(AuthContext);
//   const login = auth?.login;

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   setLoading(true);
//   setError("");

//   try {
//     const res = await api.post("/token/", {
//     username,
//     password,
//     });

//     console.log(res.data); 

//     login(
//       res.data.access,
//       res.data.refresh
//     );

//     setUsername("");
//     setPassword("");

//     const from =
//       location.state?.from?.pathname || "/";

//     navigate(from, { replace: true });

//   } catch (err) {
//     console.error(err);

//     setError(
//       err.response?.data?.detail ||
//       "Invalid username or password"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setError("");

//   //   try {
//   //     const res = await api.post("/token/", {
//   //       username,
//   //       password,
//   //     });

//   //     // ❗ IMPORTANT: update context properly
//   //     if (login) {
//   //       login(res.data.access);
//   //     }

//   //     // store refresh token
//   //     localStorage.setItem("refresh", res.data.refresh);
//   //     localStorage.setItem("access", res.data.access);

//   //     // reset form
//   //     setUsername("");
//   //     setPassword("");

//   //     // redirect after login
//   //     const from = location.state?.from?.pathname || "/";
//   //     navigate(from, { replace: true });

//   //   } catch (err) {
//   //     console.error(err);
//   //     setError(err.response?.data?.detail || "Login failed");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   return (
//     <div className="login-container my-5">
//       {error && <Error error={error} />}

//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>
//         <p className="login-subtitle">Please login to your account</p>

//         <form onSubmit={handleSubmit}>
//           {/* Username */}
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               id="username"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="form-control"
//               placeholder="Enter username"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="form-control"
//               placeholder="Enter password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>
//             <a href="#">Forgot Password?</a>
//           </p>
//           <p>
//             Don't have an account? <a href="#">Sign up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// import React, { useState, useContext } from "react";
// import "./LoginPage.css";
// import api from "../../api";
// import Error from "../ui/Error";
// import { useLocation, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";



// const LoginPage = () => {
//   const { login } = useContext(AuthContext);
//   const location = useLocation();
//   const navigate = useNavigate(); // ✅ FIXED (was missing parentheses)

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.post("/token/", {
//         username,
//         password,
//       });   
      
//       login(res.data.access);

//       localStorage.setItem("username", username);


//       login(res.data.access);
//       localStorage.setItem("refresh", res.data.refresh);

//       // localStorage.setItem("access", res.data.access);
//       // localStorage.setItem("refresh", res.data.refresh);

//       setUsername("");
//       setPassword("");

//       const from = location.state?.from?.pathname || "/";

//       navigate(from, { replace: true }); // ✅ FIXED typo: replace
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.detail || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container my-5">
//       {error && <Error error={error} />}

//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>
//         <p className="login-subtitle">Please login to your account</p>

//         <form onSubmit={handleSubmit}>
//           {/* Username */}
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               id="username"   // ✅ FIXED (was email before)
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="form-control"
//               placeholder="Enter your username"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}   // ✅ FIXED (was valus)
//               onChange={(e) => setPassword(e.target.value)}
//               className="form-control"
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>
//             <a href="#">Forgot Password?</a>
//           </p>
//           <p>
//             Don't have an account? <a href="#">Sign up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// import React, { useState, useContext } from "react";
// import "./LoginPage.css";
// import api from "../../api";
// import Error from "../ui/Error";
// import { useLocation, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const LoginPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ✅ SAFE CONTEXT USAGE (ONLY ONCE)
//   const auth = useContext(AuthContext);
//   const login = auth?.login;

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.post("/token/", {
//         username,
//         password,
//       });

//       // ❗ IMPORTANT: update context properly
//       if (login) {
//         login(res.data.access);
//       }

//       // store refresh token
//       localStorage.setItem("refresh", res.data.refresh);
//       localStorage.setItem("access", res.data.access);

//       // reset form
//       setUsername("");
//       setPassword("");

//       // redirect after login
//       const from = location.state?.from?.pathname || "/";
//       navigate(from, { replace: true });

//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.detail || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container my-5">
//       {error && <Error error={error} />}

//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>
//         <p className="login-subtitle">Please login to your account</p>

//         <form onSubmit={handleSubmit}>
//           {/* Username */}
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               id="username"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="form-control"
//               placeholder="Enter username"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="form-control"
//               placeholder="Enter password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="btn btn-primary w-100"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>
//             <a href="#">Forgot Password?</a>
//           </p>
//           <p>
//             Don't have an account? <a href="#">Sign up</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;



// import React, { useState } from 'react'
// import "./LoginPage.css"
// import api from "../../api";
// import Error from "../ui/Error"
// import { useLocation, useNavigate } from "react-router-dom"

// const LoginPage = () => {
//   const location = useLocation()
//   const navigate = useNavigate

//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")

// const userInfo = {
//   username,
//   password
// };

// function handleSubmit(e) {
//   e.preventDefault();
//   setLoading(true)

//   api.post("token/", userInfo)
//     .then((res) => {
//       console.log(res.data);
//       localStorage.setItem("access",res.data.access)
//       localStorage.setItem("refresh",res.data.refresh)
//       setUsername("")
//       setPassword("")
//       setLoading(false)
//       setError("")

//     const from = location.state.from.pathname || "/";
//     navigate(from, {repalce:true});
//     })
//     .catch((err) => {
//       console.log(err.message);
//       setLoading(false)
//       setError(err.message)
//     });
// }


//   return (
//     <div className="login-container my-5">
//       {error && <error error={error}/> }
//       <div className="login-card shadow">
//         <h2 className="login-title">Welcome Back</h2>
//         <p className="login-subtitle">Please login to your account</p>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="username" className="form-label">Username</label>
//             <input type="username" value = {username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="form-control" id="email" placeholder="Enter your username" required />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">Password</label>
//             <input type="password" valus={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="form-control" id="password" placeholder="Enter your password" required />
//           </div>

//           <button type="submit" className="btn btn-primary w-100"  disabled={loading} >Login</button>
//         </form>
//         <div className="login-footer">
//           <p><a href="#">Forgot Password?</a></p>
//           <p>Don't have an account? <a href="#">Sign up</a></p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LoginPage


