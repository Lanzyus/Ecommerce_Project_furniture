import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiTruck,
  FiUser,
  FiHome,
} from "react-icons/fi";

import AuthContext from "../../Context/AuthContext";
import styles from "./NavBar.module.css";

const NavBarLink = ({ close }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const getUserName = () => {
    if (!user) return "User";

    const firstName =
      user.firstName ||
      user.first_name ||
      "";

    const lastName =
      user.lastName ||
      user.last_name ||
      "";

    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }

    return user.username || "User";
  };

  const handleLogout = () => {
    logout();
    close?.();
    navigate("/");
  };

  return (
    <div className={styles.accountLinks}>

      {isAuthenticated && user ? (
        <>
          {/* USER */}
          <NavLink
            to="/profile"
            className={styles.accountLink}
            onClick={close}
          >
            <FiUser />
            <span>Hi, {getUserName()}</span>
          </NavLink>

          {/* ORDERS */}
          <NavLink
            to="/orders"
            className={styles.accountLink}
            onClick={close}
          >
            <FiPackage />
            <span>Orders</span>
          </NavLink>

          {/* DELIVERY */}
          <NavLink
            to="/delivery"
            className={styles.accountLink}
            onClick={close}
          >
            <FiTruck />
            <span>Delivery</span>
          </NavLink>

          {/* HOME */}
          <NavLink
            to="/"
            className={styles.accountLink}
            onClick={close}
          >
            <FiHome />
            <span>Home</span>
          </NavLink>

          {/* LOGOUT */}
          <button
            type="button"
            className={styles.navLogout}
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </>
      ) : (
        /* LOGGED OUT */
        <NavLink
          to="/login"
          className={styles.navLogin}
          onClick={close}
        >
          <FiLogIn />
          <span>Login</span>
        </NavLink>
      )}

    </div>
  );
};

export default NavBarLink;


// import { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import {
//   FiLogIn,
//   FiLogOut,
//   FiPackage,
//   FiTruck,
//   FiUser,
// } from "react-icons/fi";

// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = ({ close }) => {
//   const auth = useContext(AuthContext) || {};

//   const {
//     isAuthenticated = false,
//     user = null,
//     logout,
//   } = auth;

//   const navigate = useNavigate();

//   // ==========================================================
//   // USERNAME
//   // ==========================================================

//   const getUserName = () => {
//     if (!user) {
//       return "User";
//     }

//     const firstName =
//       user.firstName ||
//       user.first_name ||
//       "";

//     const lastName =
//       user.lastName ||
//       user.last_name ||
//       "";

//     const fullName =
//       `${firstName} ${lastName}`.trim();

//     if (fullName) {
//       return fullName;
//     }

//     return (
//       user.username ||
//       "User"
//     );
//   };

//   // ==========================================================
//   // NAVIGATION CLASS
//   // ==========================================================

//   const navClass = ({ isActive }) =>
//     isActive ? "active" : "";

//   // ==========================================================
//   // LOGOUT
//   // ==========================================================

//   const handleLogout = async () => {
//     try {
//       await logout?.();
//     } catch (error) {
//       console.error(
//         "Logout error:",
//         error
//       );
//     }

//     close?.();

//     navigate("/");
//   };

//   return (
//     <>
//       {/* ======================================================
//           USER ACCOUNT
//       ====================================================== */}

//       {isAuthenticated && user ? (
//         <>
//           {/* USER */}

//           <NavLink
//             to="/profile"
//             className={navClass}
//             onClick={close}
//           >
//             <FiUser />

//             <span>
//               Hi, {getUserName()}
//             </span>
//           </NavLink>

//           {/* ORDERS */}

//           <NavLink
//             to="/orders"
//             className={navClass}
//             onClick={close}
//           >
//             <FiPackage />

//             <span>
//               Orders
//             </span>
//           </NavLink>

//           {/* DELIVERY */}

//           <NavLink
//             to="/delivery"
//             className={navClass}
//             onClick={close}
//           >
//             <FiTruck />

//             <span>
//               Delivery
//             </span>
//           </NavLink>

//           {/* LOGOUT */}

//           <button
//             type="button"
//             onClick={handleLogout}
//             className="navLogout"
//           >
//             <FiLogOut />

//             <span>
//               Logout
//             </span>
//           </button>
//         </>
//       ) : (
//         /* =====================================================
//            LOGGED OUT
//         ====================================================== */

//         <NavLink
//           to="/login"
//           className="navLogin"
//           onClick={close}
//         >
//           <FiLogIn />

//           <span>
//             Login
//           </span>
//         </NavLink>
//       )}
//     </>
//   );
// };

// export default NavBarLink;










// import { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { FiLogIn, FiLogOut, FiPackage, FiTruck, FiUser } from "react-icons/fi";
// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = ({ close }) => {
//   const { isAuthenticated, user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const navClass = ({ isActive }) =>
//     isActive ? "active" : "";

//   const handleLogout = () => {
//     logout();
//     close?.();
//     navigate("/");
//   };

//   const getUserName = () => {
//     if (!user) return "User";

//     if (user.firstName || user.lastName) {
//       return `${user.firstName || ""} ${user.lastName || ""}`.trim();
//     }

//     return user.username || "User";
//   };

//   return (
//     <>
//       {/* =========================
//           LOGGED IN
//       ========================== */}
//       {isAuthenticated && user ? (
//         <>
//           <NavLink
//             to="/profile"
//             className={navClass}
//             onClick={close}
//           >
//             <FiUser />
//             <span>Hi, {getUserName()}</span>
//           </NavLink>

//           <NavLink
//             to="/orders"
//             className={navClass}
//             onClick={close}
//           >
//             <FiPackage />
//             <span>Orders</span>
//           </NavLink>

//           <NavLink
//             to="/delivery"
//             className={navClass}
//             onClick={close}
//           >
//             <FiTruck />
//             <span>Delivery</span>
//           </NavLink>

//           <button
//             type="button"
//             onClick={handleLogout}
//             className="navLogout"
//           >
//             <FiLogOut />
//             <span>Logout</span>
//           </button>
//         </>
//       ) : (
//         /* =========================
//            LOGGED OUT
//         ========================== */
//         <NavLink
//           to="/login"
//           className="navLogin"
//           onClick={close}
//         >
//           <FiLogIn />
//           <span>Login</span>
//         </NavLink>
//       )}
//     </>
//   );
// };

// export default NavBarLink;














// import { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = () => {
//   const { isAuthenticated, user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const navClass = ({ isActive }) =>
//     isActive ? "nav-link active fw-semibold" : "nav-link fw-semibold";

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//       {isAuthenticated && user ? (
//         <>
//           <li className="nav-item">
//             <NavLink to="/profile" className={navClass}>
//               Hi,{" "}
//               {user.firstName || user.lastName
//                 ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
//                 : user.username || "User"}
//             </NavLink>
//           </li>

//          <li className="nav-item">
//           <NavLink
//             to="/orders"
//             className={navClass}
//           >
//             Order
//           </NavLink>
//         </li>

//         <li className="nav-item">
//           <NavLink
//             to="/delivery"
//             className={navClass}
//           >
//             Delivery
//           </NavLink>
//         </li>

//           {/* <li className="nav-item">
//             <NavLink to="/orders" className={navClass}>Order</NavLink>
//           </li>
//           <li className="nav-item">
//             <NavLink to="/delivery" className={navClass}>Delivery</NavLink>
//           </li> */}

//           <li className="nav-item">
//             <button
//               onClick={handleLogout}
//               className="nav-link fw-semibold btn btn-link"
//             >
//               Logout
//             </button>
//           </li>
//         </>
//       ) : (
//         <>
//           <li className="nav-item">
//             <NavLink to="/" className={navClass}>Home</NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/about" className={navClass}>About</NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/contact" className={navClass}>Contact</NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/register" className={navClass}>Register</NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/login" className={navClass}>Login</NavLink>
//           </li>
//         </>
//       )}
//     </ul>
//   );
// };

// export default NavBarLink;












// import { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = () => {
//   const auth = useContext(AuthContext);
//   const navigate = useNavigate();

//   const isAuthenticated = auth?.isAuthenticated;
//   const logout = auth?.logout;

//   // Get user from context first
//   let user = auth?.user;

//   // Fallback to JWT if context user is null
//   if (!user) {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         user = jwtDecode(token);
//       } catch (error) {
//         console.error("Invalid token:", error);
//       }
//     }
//   }

//   const navClass = ({ isActive }) =>
//     isActive ? "nav-link active fw-semibold" : "nav-link fw-semibold";

//   const handleLogout = () => {
//     logout?.();
//     navigate("/");
//   };

//   function logout(){
//     localStorage.removeItem("access")
    
//   }

//   console.log("isAuthenticated:", isAuthenticated);
//   console.log("user:", user);

//   return ( 
//     <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//       {isAuthenticated && user ? (
//         <>
//           <li className="nav-item">
//             <NavLink to="/profile" className={navClass}>
//               {/* Hi, {user?.first_name || user?.username || "User"} */}
//                 Hi, {user?.first_name || user?.last_name
//                   ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
//                   : user?.username || "User"}

//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <button
//               onClick={handleLogout}
//               className="nav-link fw-semibold btn btn-link"
//             >
//               Logout
//             </button>
//           </li>
//         </>
//       ) : (
//         <>
//           <li className="nav-item">
//             <NavLink to="/" className={navClass}>
//               Home
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/about" className={navClass}>
//               About
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/contact" className={navClass}>
//               Contact
//             </NavLink>
//           </li>

//            <li className="nav-item">
//             <NavLink to="/register" className={navClass}>
//               Register
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/login" className={navClass}>
//               Login
//             </NavLink>
//           </li>

//         </>
//       )}
//     </ul>
//   );
// };

// export default NavBarLink;


// import { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = () => {
//   const auth = useContext(AuthContext);
//   const navigate = useNavigate();

//   const isAuthenticated = auth?.isAuthenticated;
//   const user = auth?.user;
//   const logout = auth?.logout;

//   const navClass = ({ isActive }) =>
//     isActive ? "nav-link active fw-semibold" : "nav-link fw-semibold";

//   const handleLogout = () => {
//     logout?.();
//     navigate("/login");
//   };

//   console.log("isAuthenticated:", isAuthenticated);
//   console.log("user:", user);

//   return (
//     <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//       {isAuthenticated  && user  ? (
//         <>
//           <li className="nav-item">
//             <NavLink to="/profile" className={navClass}>
//               Hi, {user?.username || "User"}
//              {/* Hi, {user?.firstName || user?.username || "User"} */}
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <button
//               onClick={handleLogout}
//               className="nav-link fw-semibold btn btn-link"
//             >
//               Logout
//             </button>
//           </li>
//         </>
//       ) : (
//         <>
//           <li className="nav-item">
//             <NavLink to="/login" className={navClass}>
//               Login
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/register" className={navClass}>
//               Register
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/" className={navClass}>
//               Home
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/about" className={navClass}>
//               About
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/contact" className={navClass}>
//               Contact
//             </NavLink>
//           </li>
//         </>
//       )}
//     </ul>
//   );
// };

// export default NavBarLink;

// import { useContext } from "react";
// import { NavLink } from "react-router-dom";
// import AuthContext from "../../Context/AuthContext";

// const NavBarLink = () => {
//   const auth = useContext(AuthContext);

//   const isAuthenticated = auth?.isAuthenticated;
//   const user = auth?.user;

//   const navClass = ({ isActive }) =>
//     isActive ? "nav-link active fw-semibold" : "nav-link fw-semibold";

//   return (
//     <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//       {isAuthenticated ? (
//         <>
//           {/* Logged-in user */}
//           <li className="nav-item">
//             <NavLink to="/profile" className={navClass}>
//               Hi, {user?.username || "User"}
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/logout" className={navClass}>
//               Logout
//             </NavLink>
//           </li>
//         </>
//       ) : (
//         <>
//           {/* Guest links */}
//           <li className="nav-item">
//             <NavLink to="/login" className={navClass}>
//               Login
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/register" className={navClass}>
//               Register
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/" className={navClass}>
//               Home
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/about" className={navClass}>
//               About
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/contact" className={navClass}>
//               Contact
//             </NavLink>
//           </li>
//         </>
//       )}
//     </ul>
//   );
// };

// export default NavBarLink;


// import { useContext } from "react";
// import { NavLink } from "react-router-dom";
// import { AuthContext } from "../../Context/AuthContext";

// const NavBarLink = () => {
//   const auth = useContext(AuthContext);

//   if (!auth) return null; // prevents crash

//   const { isAuthenticated, user } = auth;

//   const navClass = ({ isActive }) =>
//     isActive ? "nav-link active fw-semibold" : "nav-link fw-semibold";

//   return (
//     <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//       {isAuthenticated ? (
//         <>
//           <li className="nav-item">
//             <NavLink to="/profile" className={navClass}>
//               Hi, {user?.username || "User"}
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/logout" className={navClass}>
//               Logout
//             </NavLink>
//           </li>
//         </>
//       ) : (
//         <>
//           <li className="nav-item">
//             <NavLink to="/login" className={navClass}>
//               Login
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/register" className={navClass}>
//               Register
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/" className={navClass}>
//               Home
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/about" className={navClass}>
//               About
//             </NavLink>
//           </li>

//           <li className="nav-item">
//             <NavLink to="/contact" className={navClass}>
//               Contact
//             </NavLink>
//           </li>
//         </>
//       )}
//     </ul>
//   );
// };

// export default NavBarLink;


// and

// import React from 'react'
// import { Link } from 'react-router-dom'

// const NavLink = () => {
//   return (
//     <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
        
//             <li className='nav-item'>
//                 <a className='nav-link active fw-semibold' href='/'>Home</a>
//             </li>

//             <li className='nav-item'>
//                 <Link to='/profile' className='nav-link fw-semibold' href='#'>
//                     Shop
//                 </Link>
//             </li>

//             <li className='nav-item'>
//                 <a className='nav-link fw-semibold' href='#'>About</a>
//             </li>

//             <li className='nav-item'>
//                 <a className='nav-link fw-semibold' href='#'>Contact</a>
//             </li>
//         </ul>
//   )
// }

// export default NavLink


