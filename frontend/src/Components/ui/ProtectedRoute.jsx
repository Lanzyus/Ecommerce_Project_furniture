// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import { Navigate, useLocation } from "react-router-dom";
// import Spinner from "./spinner";

// const ProtectedRoute = ({ children }) => {
//   const [isAuthorized, setIsAuthorized] = useState(null);
//   const location = useLocation();

//   useEffect(() => {
//     auth().catch(() => setIsAuthorized(false));
//   }, []);

//   const refreshToken = async () => {
//     const refresh = localStorage.getItem("refresh");

//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8001/api/token/refresh/",
//         {
//           refresh,
//         }
//       );

//       localStorage.setItem("access", res.data.access);
//       setIsAuthorized(true);
//     } catch (error) {
//       console.error(error);
//       setIsAuthorized(false);
//     }
//   };

//   const auth = async () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthorized(false);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       if (decoded.exp < Date.now() / 1000) {
//         await refreshToken();
//       } else {
//         setIsAuthorized(true);
//       }
//     } catch (error) {
//       setIsAuthorized(false);
//     }
//   };

//   if (isAuthorized === null) {
//     return <Spinner />;
//   }

//   return isAuthorized ? (
//     children
//   ) : (
//     <Navigate
//       to="/login"
//       state={{ from: location }}
//       replace
//     />
//   );
// };

// export default ProtectedRoute;


import React, { useState, useEffect } from "react";
import api from "../../api";
import { jwtDecode } from "jwt-decode";
import Spinner from "./Spinner";
import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  
  const location = useLocation()

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    

    try {
     
      const res = await axios.post(
        "http://127.0.0.1:8001/token/refresh/",
        {
          refresh,
        }
      );

      if (res.status === 200) {
        localStorage.setItem("access", res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem("access"); // or your auth logic
    // const token = localStorage.getItem("access");

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp;
      const now = Date.now() / 1000;

      if (now > expiry) {
        await refreshToken();
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <Spinner />;
  }

  return isAuthorized ? children : <Navigate to="/login" state={{from:location}} replace />;
};

export default ProtectedRoute;