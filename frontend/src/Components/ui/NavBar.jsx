import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiInstagram,
} from "react-icons/fi";

import { CartContext } from "../../Context/CartContext";
import AuthContext from "../../Context/AuthContext";

import NavBarLink from "./NavBarLink";
import styles from "./NavBar.module.css";

import logo from "../../assets/image/Sensation.png";

export default function NavBar() {
  const cart = useContext(CartContext) || {};
  const auth = useContext(AuthContext) || {};

  const { numCartItems = 0 } = cart;
  const { isAuthenticated = false } = auth;

  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      {/* =========================================
          TOP BAR
      ========================================== */}
      <div className={styles.topbar}>
        BESPOKE INTERIORS • CUSTOM FURNITURE • LAGOS, NIGERIA
      </div>

      {/* =========================================
          HEADER
      ========================================== */}
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* =====================================
              MOBILE MENU BUTTON
          ===================================== */}
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="main-navigation"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>

          {/* =====================================
              LOGO
          ===================================== */}
          <Link
            to="/"
            className={styles.brand}
            onClick={close}
            aria-label="Sensational Interiors home"
          >
            <span className={styles.brandMark}>
              <img
                src={logo}
                alt="Sensational Interiors logo"
              />
            </span>

            <span className={styles.brandText}>
              <strong className={styles.brandName}>
                SENSATIONAL
              </strong>

              <small className={styles.brandSubtitle}>
                INTERIORS_07
              </small>
            </span>
          </Link>

          {/* =====================================
              NAVIGATION
          ===================================== */}
          <nav
            id="main-navigation"
            className={`${styles.nav} ${
              open ? styles.navOpen : ""
            }`}
            aria-label="Main navigation"
          >
            {/* ===================================
                MAIN NAVIGATION
            =================================== */}
            <Link to="/" onClick={close}>
              Home
            </Link>

            <Link to="/about" onClick={close}>
              About
            </Link>

            <a href="/#services" onClick={close}>
              Services
            </a>

            <a href="/#projects" onClick={close}>
              Projects
            </a>

            <a href="/#journal" onClick={close}>
              Blog
            </a>

            <Link to="/contact" onClick={close}>
              Contact
            </Link>

            {/* ===================================
                ACCOUNT NAVIGATION
            ==================================== */}
            <div className={styles.accountNavigation}>
              <NavBarLink close={close} />
            </div>
          </nav>

          {/* =====================================
              RIGHT SIDE ACTIONS
          ===================================== */}
          <div className={styles.actions}>
            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/sensational_interiors07/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Sensational Interiors on Instagram"
              className={styles.instagram}
            >
              <FiInstagram />
            </a>

            {/* CONSULTATION */}
            <Link
              to="/contact"
              className={styles.consultation}
              onClick={close}
            >
              Book a Consultation
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              className={styles.cart}
              aria-label={`Shopping bag with ${
                Number(numCartItems) || 0
              } items`}
              onClick={close}
            >
              <FiShoppingBag />

              <span aria-hidden="true">
                {Number(numCartItems) || 0}
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

