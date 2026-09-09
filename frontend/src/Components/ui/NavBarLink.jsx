import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiTruck,
  FiUser,
} from "react-icons/fi";

import AuthContext from "../../Context/AuthContext";
import styles from "./NavBar.module.css";

const NavBarLink = ({ close }) => {
  const auth = useContext(AuthContext) || {};

  const {
    isAuthenticated = false,
    user = null,
    logout,
  } = auth;

  const navigate = useNavigate();

  const getUserName = () => {
    if (!user) {
      return "User";
    }

    const firstName =
      user.firstName ||
      user.first_name ||
      "";

    const lastName =
      user.lastName ||
      user.last_name ||
      "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return user.username || "User";
  };

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (error) {
      console.error("Logout error:", error);
    }

    close?.();

    navigate("/");
  };

  return (
    <div className={styles.accountLinks}>

      {isAuthenticated && user ? (
        <>
          {/* =================================
              FIRST ITEM = HI USER
          ================================== */}
          <NavLink
            to="/profile"
            className={styles.accountLink}
            onClick={close}
          >
            <FiUser />

            <span>
              Hi, {getUserName()}
            </span>
          </NavLink>

          {/* ORDERS */}
          <NavLink
            to="/orders"
            className={styles.accountLink}
            onClick={close}
          >
            <FiPackage />

            <span>
              Orders
            </span>
          </NavLink>

          {/* DELIVERY */}
          <NavLink
            to="/delivery"
            className={styles.accountLink}
            onClick={close}
          >
            <FiTruck />

            <span>
              Delivery
            </span>
          </NavLink>

          {/* LOGOUT */}
          <button
            type="button"
            className={styles.navLogout}
            onClick={handleLogout}
          >
            <FiLogOut />

            <span>
              Logout
            </span>
          </button>
        </>
      ) : (
        /* =================================
           LOGGED OUT
        ================================== */
        <NavLink
          to="/login"
          className={styles.navLogin}
          onClick={close}
        >
          <FiLogIn />

          <span>
            Login
          </span>
        </NavLink>
      )}

    </div>
  );
};

export default NavBarLink;
