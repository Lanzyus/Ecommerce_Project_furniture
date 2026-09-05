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

export default function NavBar() {
  const cart = useContext(CartContext) || {};
  const auth = useContext(AuthContext) || {};

  const { numCartItems = 0 } = cart;
  const { isAuthenticated } = auth;

  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };


  

  return (
    <>
      {/* =========================================
          TOP BAR
      ========================================= */}
      <div className={styles.topbar}>
        BESPOKE INTERIORS • CUSTOM FURNITURE • LAGOS, NIGERIA
      </div>

      {/* =========================================
          HEADER
      ========================================= */}
      <header className={styles.header}>
        <div className={styles.inner}>

          {/* MOBILE MENU */}
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
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
        >
          <span className={styles.brandMark}>
            <img
              src="/src/assets/image/Sensation.PNG"
              alt="Luxury interior details"
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

          {/* <Link
            to="/"
            className={styles.brand}
            onClick={close}
          >
            <span className={styles.brandMark}>
              ♧
            </span>

            <strong className={styles.brandName}>
              SENSATIONAL
            </strong>

            <small className={styles.brandSubtitle}>
              INTERIORS_07
            </small>
          </Link> */}

          {/* <Link
            to="/"
            className={styles.brand}
            onClick={close}
          >
            <span className={styles.brandMark}>
              ♧
            </span>

            <strong>SENSATIONAL</strong>

            <small>INTERIORS_07</small>
          </Link> */}

          {/* =====================================
              NAVIGATION
          ===================================== */}
          <nav
            className={`${styles.nav} ${
              open ? styles.navOpen : ""
            }`}
          >

            {/* ===================================
                LOGGED OUT MAIN NAVIGATION
            =================================== */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  onClick={close}
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  onClick={close}
                >
                  About
                </Link>

                <a
                  href="/#services"
                  onClick={close}
                >
                  Services
                </a>

                <a
                  href="/#projects"
                  onClick={close}
                >
                  Projects
                </a>

                <a
                  href="/#journal"
                  onClick={close}
                >
                  Blog
                </a>

                <Link
                  to="/contact"
                  onClick={close}
                >
                  Contact
                </Link>
              </>
            )}

            {/* ===================================
                ACCOUNT NAVIGATION
            =================================== */}
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
              rel="noreferrer"
              aria-label="Instagram"
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
              aria-label="Shopping bag"
              onClick={close}
            >
              <FiShoppingBag />

              <span>
                {Number(numCartItems) || 0}
              </span>
            </Link>

          </div>

        </div>
      </header>
    </>
  );
}








// import React, { useContext, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   FiMenu,
//   FiX,
//   FiShoppingBag,
//   FiInstagram,
// } from "react-icons/fi";

// import { CartContext } from "../../Context/CartContext";
// import AuthContext from "../../Context/AuthContext";

// import NavBarLink from "./NavBarLink";
// import styles from "./NavBar.module.css";

// export default function NavBar() {
//   const cart = useContext(CartContext) || {};
//   const auth = useContext(AuthContext) || {};

//   const { numCartItems = 0 } = cart;
//   const { isAuthenticated } = auth;

//   const [open, setOpen] = useState(false);

//   const close = () => setOpen(false);

//   return (
//     <>
//       {/* =========================
//           TOP BAR
//       ========================== */}
//       <div className={styles.topbar}>
//         BESPOKE INTERIORS • CUSTOM FURNITURE • LAGOS, NIGERIA
//       </div>

//       {/* =========================
//           NAVBAR
//       ========================== */}
//       <header className={styles.header}>
//         <div className={styles.inner}>

//           {/* MOBILE MENU */}
//           <button
//             className={styles.mobileToggle}
//             onClick={() => setOpen(!open)}
//             aria-label="Toggle menu"
//             type="button"
//           >
//             {open ? <FiX /> : <FiMenu />}
//           </button>

//           {/* LOGO */}
//           <Link
//             to="/"
//             className={styles.brand}
//             onClick={close}
//           >
//             <span className={styles.brandMark}>♧</span>

//             <strong>SENSATIONAL</strong>

//             <small>INTERIORS</small>
//           </Link>

//           {/* =========================
//               NAVIGATION
//           ========================== */}
//           <nav
//             className={`${styles.nav} ${
//               open ? styles.navOpen : ""
//             }`}
//           >
//             <Link
//               className={styles.active}
//               to="/"
//               onClick={close}
//             >
//               Home
//             </Link>

//             <Link
//               to="/about"
//               onClick={close}
//             >
//               About
//             </Link>

//             <a
//               href="/#services"
//               onClick={close}
//             >
//               Services
//             </a>

//             <a
//               href="/#projects"
//               onClick={close}
//             >
//               Projects
//             </a>

//             <a
//               href="/#journal"
//               onClick={close}
//             >
//               Blog
//             </a>

//             <Link
//               to="/contact"
//               onClick={close}
//             >
//               Contact
//             </Link>

//             {/* =========================
//                 AUTHENTICATION
//             ========================== */}

//             <div className={styles.accountNavigation}>
//               <NavBarLink close={close} />
//             </div>
//           </nav>

//           {/* =========================
//               RIGHT ACTIONS
//           ========================== */}
//           <div className={styles.actions}>

//             {/* INSTAGRAM */}
//             <a
//               href="https://www.instagram.com/sensational_interiors07/"
//               target="_blank"
//               rel="noreferrer"
//               aria-label="Instagram"
//               className={styles.instagram}
//             >
//               <FiInstagram />
//             </a>

//             {/* CONSULTATION */}
//             <Link
//               to="/contact"
//               className={styles.consultation}
//             >
//               Book a Consultation
//             </Link>

//             {/* CART */}
//             <Link
//               to="/cart"
//               className={styles.cart}
//               aria-label="Shopping bag"
//             >
//               <FiShoppingBag />

//               <span>
//                 {Number(numCartItems) || 0}
//               </span>
//             </Link>

//           </div>
//         </div>
//       </header>
//     </>
//   );
// }









// import React, { useContext, useState } from "react";
// import { Link } from "react-router-dom";
// import { FiMenu, FiX, FiShoppingBag, FiInstagram } from "react-icons/fi";
// import { CartContext } from "../../Context/CartContext";
// import styles from "./NavBar.module.css";

// export default function NavBar() {
//   const cart = useContext(CartContext) || {};
//   const { numCartItems = 0 } = cart;
//   const [open, setOpen] = useState(false);
//   const close = () => setOpen(false);

//   return (
//     <>
//       <div className={styles.topbar}>BESPOKE INTERIORS • CUSTOM FURNITURE • LAGOS, NIGERIA</div>
//       <header className={styles.header}>
//         <div className={styles.inner}>
//           <button className={styles.mobileToggle} onClick={() => setOpen(!open)} aria-label="Toggle menu">
//             {open ? <FiX /> : <FiMenu />}
//           </button>
//           <Link to="/" className={styles.brand} onClick={close}>
//             <span className={styles.brandMark}>♧</span>
//             <strong>SENSATIONAL</strong>
//             <small>INTERIORS</small>
//           </Link>
//           <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
//             <Link className={styles.active} to="/" onClick={close}>Home</Link>
//             <Link to="/about" onClick={close}>About</Link>
//             <a href="/#services" onClick={close}>Services</a>
//             <a href="/#projects" onClick={close}>Projects</a>
//             <a href="/#shop" onClick={close}>Shop</a>
//             <a href="/#journal" onClick={close}>Blog</a>
//             <Link to="/contact" onClick={close}>Contact</Link>
//           </nav>
//           <div className={styles.actions}>
//             <a href="https://www.instagram.com/sensational_interiors07/" target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.instagram}><FiInstagram /></a>
//             <Link to="/contact" className={styles.consultation}>Book a Consultation</Link>
//             <Link to="/cart" className={styles.cart} aria-label="Shopping bag"><FiShoppingBag /><span>{Number(numCartItems) || 0}</span></Link>
//           </div>
//         </div>
//       </header>
//     </>
//   );
// }
