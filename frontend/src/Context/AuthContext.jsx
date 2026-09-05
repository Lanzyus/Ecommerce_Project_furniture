import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export default AuthContext;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [user, setUser] = useState(null);

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);

      console.log("Decoded Token:", decoded);

      // return {
      //   id: decoded.user_id,
      //   username: decoded.username,
      //   email: decoded.email,
      //   first_name: decoded.first_name,
      //   last_name: decoded.last_name,
      //   phone: decoded.phone,
      //   city: decoded.city,
      //   country: decoded.country,
      //   address: decoded.address,
      //   exp: decoded.exp,
      // };
      return {
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        phone: decoded.phone,
        city: decoded.city,
        country: decoded.country,
        address: decoded.address,

        // Admin information
        is_staff: decoded.is_staff || false,
        is_superuser:
          decoded.is_superuser || false,

        exp: decoded.exp,
      };
    } catch (error) {
      console.error(
        "Token decode error:",
        error
      );

      return null;
    }
  };

  const login = (
    accessToken,
    refreshToken
  ) => {
    try {
      console.log(
        "Saving Access Token:",
        accessToken
      );

      localStorage.setItem(
        "access",
        accessToken
      );

      if (refreshToken) {
        localStorage.setItem(
          "refresh",
          refreshToken
        );
      }

      console.log(
        "Stored Access Token:",
        localStorage.getItem("access")
      );

      const userData =
        decodeToken(accessToken);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );
    }
  };

  const logout = () => {
    console.log("Logging out...");

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token =
      localStorage.getItem("access");

    console.log(
      "AuthContext token on load:",
      token
    );

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    const userData = decodeToken(token);

    if (!userData) {
      logout();
      return;
    }

    const currentTime =
      Date.now() / 1000;

    if (userData.exp < currentTime) {
      console.log(
        "Token expired. Logging out."
      );

      logout();
      return;
    }

    setUser(userData);
    setIsAuthenticated(true);

    console.log(
      "User authenticated:",
      userData
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

















// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const decodeToken = (token) => {
//     try {
//       const decoded = jwtDecode(token);

//       return {
//         id: decoded.user_id,
//         username: decoded.username,
//         email: decoded.email,
//         first_name: decoded.first_name,
//         last_name: decoded.last_name,
//         phone: decoded.phone,
//         city: decoded.city,
//         country: decoded.country,
//         address: decoded.address,
//         exp: decoded.exp,
//       };
//     } catch (error) {
//       console.error("Token decode error:", error);
//       return null;
//     }
//   };

//   const login = (accessToken, refreshToken) => {
//     localStorage.setItem("access", accessToken);

//     if (refreshToken) {
//       localStorage.setItem("refresh", refreshToken);
//     }

//     const userData = decodeToken(accessToken);

//     if (userData) {
//       setUser(userData);
//       setIsAuthenticated(true);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");

//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("access");
//     console.log("AuthContext token:", token);
//     if (!token) {
//       return;
//     }

//     const userData = decodeToken(token);

//     if (!userData) {
//       logout();
//       return;
//     }

//     if (userData.exp < Date.now() / 1000) {
//       logout();
//       return;
//     }

//     setUser(userData);
//     setIsAuthenticated(true);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }





// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const decodeToken = (token) => {
//     try {
//       const decoded = jwtDecode(token);

//       return {
//         id: decoded.user_id,
//         username: decoded.username,
//         email: decoded.email,
//         first_name: decoded.first_name,
//         last_name: decoded.last_name,
//         phone: decoded.phone,
//         city: decoded.city,
//         country: decoded.country,
//         address: decoded.address,
//         exp: decoded.exp,
//       };
//     } catch (error) {
//       console.error("Token decode error:", error);
//       return null;
//     }
//   };

//   const login = (accessToken, refreshToken = null) => {
//     localStorage.setItem("access", accessToken);

//     if (refreshToken) {
//       localStorage.setItem("refresh", refreshToken);
//     }

//     const userData = decodeToken(accessToken);

//     if (userData) {
//       setUser(userData);
//       setIsAuthenticated(true);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");

//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       return;
//     }

//     const userData = decodeToken(token);

//     if (!userData) {
//       logout();
//       return;
//     }

//     if (userData.exp < Date.now() / 1000) {
//       logout();
//       return;
//     }

//     setUser(userData);
//     setIsAuthenticated(true);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }


// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();
// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   // ---------------- Decode token ----------------
//   const decodeToken = (token) => {
//     try {
//       const decoded = jwtDecode(token);

//       return {
//         id: decoded.user_id,
//         username: decoded.username,
//         email: decoded.email,
//         firstName: decoded.first_name,
//         lastName: decoded.last_name,
//         phone: decoded.phone,
//         address: decoded.address,
//         city: decoded.city,
//         country: decoded.country,
//         exp: decoded.exp,
//       };
//     } catch (error) {
//       console.error("Token decode failed:", error);
//       return null;
//     }
//   };

//   // ---------------- Set user from token ----------------
//   const setUserFromToken = (token) => {
//     const userData = decodeToken(token);
//     if (!userData) return;

//     setUser(userData);
//   };

//   // ---------------- Login ----------------
//   const login = (accessToken) => {
//     localStorage.setItem("access", accessToken);
//     setUserFromToken(accessToken);
//     setIsAuthenticated(true);
//   };

//   // ---------------- Logout ----------------
//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   // ---------------- Check auth on load ----------------
//   useEffect(() => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       logout();
//       return;
//     }

//     const userData = decodeToken(token);

//     if (!userData) {
//       logout();
//       return;
//     }

//     // check expiry
//     if (userData.exp < Date.now() / 1000) {
//       logout();
//       return;
//     }

//     setUser(userData);
//     setIsAuthenticated(true);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }


// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   // ---------------- Decode user ----------------
//   const decodeUser = (token) => {
//     const decoded = jwtDecode(token);

//      console.log("Decoded Token:", decoded);

//     return {
//       id: decoded.user_id,
//       username: decoded.username,
//       email: decoded.email,
//       firstName: decoded.first_name,
//       lastName: decoded.last_name,
//       phone: decoded.phone,
//       address: decoded.address,
//       city: decoded.city,
//       country: decoded.country,
//     };
//   };

//   // ---------------- Set user ----------------
//   const setUserFromToken = (token) => {
//     const userData = decodeUser(token);
//     setUser(userData);
//   };

//   // ---------------- Login ----------------
//   const login = (accessToken) => {
//     localStorage.setItem("access", accessToken);

//     setUserFromToken(accessToken);
//     setIsAuthenticated(true);
//   };

//   // ---------------- Logout ----------------
//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");

//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   // ---------------- Check auth on load ----------------
//   useEffect(() => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       // check expiry
//       if (decoded.exp < Date.now() / 1000) {
//         logout();
//         return;
//       }

//       setUserFromToken(token);
//       setIsAuthenticated(true);
//     } catch (err) {
//       console.log("Invalid token");
//       logout();
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }









// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const setUserFromToken = (token) => {
//     const decoded = jwtDecode(token);

//     console.log("Decoded Token:", decoded);

//     setUser({
//       id: decoded.user_id,
//       username: decoded.username || "Users",
//       email: decoded.email || "",
//       firstName: decoded.first_name || "",
//       lastName: decoded.last_name || "",
//     });
//   };

//   // const userinfo = localStorage.getItem("user")

//   const checkAuth = () => {
//     const token = localStorage.getItem("access");
    
//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       if (decoded.exp < Date.now() / 1000) {
//         logout();
//         return;
//       }

//       setIsAuthenticated(true);
//       setUserFromToken(token);
//     } catch (error) {
//       console.error(error);
//       logout();
//     }
//   };


//   const login = (accessToken) => {
//     localStorage.setItem("access", accessToken);

//     const decoded = jwtDecode(accessToken);

//     setUser({
//       username: decoded.username,
//       first_name: decoded.first_name,
//       last_name: decoded.last_name,
//       email: decoded.email,
//       user_id: decoded.user_id,
//     });

//     setIsAuthenticated(true);
//   };
  

//   // const login = (access, refresh) => {
//   //   localStorage.setItem("access", access);
//   //   if (refresh) {
//   //     localStorage.setItem("refresh", refresh);
//   //   }
//   //   setIsAuthenticated(true);
//   //   setUserFromToken(access);
//   //  setUser({
//   //       username: localStorage.getItem("username"),
//   //     });

  
//   // };

//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");

//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   const AuthValue = {isAuthenticated,setIsAuthenticated}

//   useEffect(() => {
//   const token = localStorage.getItem("access");

//   if (token) {
//     try {
//       const decoded = jwtDecode(token);

//       setUser({
//         username: decoded.username,
//         first_name: decoded.first_name,
//         last_name: decoded.last_name,
//         email: decoded.email,
//         user_id: decoded.user_id,
//       });

//       setIsAuthenticated(true);
//     } catch (err) {
//       console.log("Invalid token");
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   }
// }, []);

//   // useEffect(() => {
//   //   checkAuth();
//   // }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }


// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const checkAuth = () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       if (decoded.exp < Date.now() / 1000) {
//         localStorage.removeItem("access");
//         localStorage.removeItem("refresh");

//         setIsAuthenticated(false);
//         setUser(null);
//         return;
//       }

//       setIsAuthenticated(true);

//       setUser({
//         username:
//           decoded.username ||
//           decoded.user ||
//           decoded.user_id ||
//           "User",
//       });
//     } catch (err) {
//       console.error(err);

//       localStorage.removeItem("access");
//       localStorage.removeItem("refresh");

//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   };

//   const login = (token) => {
//     localStorage.setItem("access", token);

//     try {
//       const decoded = jwtDecode(token);

//       setIsAuthenticated(true);

//       setUser({
//         username:
//           decoded.username ||
//           decoded.user ||
//           decoded.user_id ||
//           "User",
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");

//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import api from "../api";

// const AuthContext = createContext();
// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   // ✅ 1. FETCH USER (DEFINE FIRST)
//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem("access");

//       if (!token) return;

//       const res = await api.get("/user/profile/", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setUser({
//         username: res.data.username,
//       });

//       setIsAuthenticated(true);
//     } catch (err) {
//       console.error("fetchUser error:", err);
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   };

//   // ✅ 2. CHECK AUTH
//   const checkAuth = () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       const isValid = decoded.exp > Date.now() / 1000;

//       if (isValid) {
//         setIsAuthenticated(true);
//         fetchUser(); // ✅ now defined
//       } else {
//         localStorage.removeItem("access");
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     } catch (err) {
//       localStorage.removeItem("access");
//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   };

//   // ✅ 3. LOGIN
//   const login = (token) => {
//     localStorage.setItem("access", token);
//     setIsAuthenticated(true);
//     fetchUser(); // ✅ now safe
//   };

//   // logout
//   const logout = () => {
//     localStorage.removeItem("access");
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// const AuthContext = createContext();

// export default AuthContext;

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const checkAuth = () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       const isValid = decoded.exp > Date.now() / 1000;

//       if (isValid) {
//         setIsAuthenticated(true);
//         setUser({
//           username: decoded.username || decoded.user || "User",
//         });
//       } else {
//         localStorage.removeItem("access");
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     } catch (err) {
//       localStorage.removeItem("access");
//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("access");
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   const login = (token) => {
//     localStorage.setItem("access", token);
//     checkAuth();
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const value = {
//     isAuthenticated,
//     user,
//     setIsAuthenticated,
//     checkAuth,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);

//   const checkAuth = () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       setIsAuthenticated(false);
//       setUser(null);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       const isValid = decoded.exp > Date.now() / 1000;

//       setIsAuthenticated(isValid);

//       if (isValid) {
//         setUser({ username: decoded.username || "User" });
//       } else {
//         setUser(null);
//       }
//     } catch (err) {
//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const value = {
//     isAuthenticated,
//     setIsAuthenticated,
//     user,
//     checkAuth,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }



// // import { createContext,  useEffect, useState } from "react"
// // import { jwtDecode } from "jwt-decode"

// // export const AuthContext = createContext(false)

// // export function AuthProvider({children}) {

// //   const [isAuthenticated, setIsAuthenticated] = useState(false)

// //   const handleAuth = () => {
// //     const token = localStorage.getItem("access")
// //     if (token) {
// //       const decoded = jwtDecode(token)
// //       const expiry_date = decoded.exp
// //       const current_time = Date.now() / 1000
// //       if (expiry_date >= current_time) {
// //         setIsAuthenticated(true)
// //       }
// //     }
// //   }

// // useEffect(function(){
// //     handleAuth
// // }, [])

// // const AuthValue = (isAuthenticated, setIsAuthenticated)

// //   return <AuthContext.Provider value={AuthValue}>
// //     {children}
// //   </AuthContext.Provider>
// // }
