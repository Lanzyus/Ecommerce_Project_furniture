import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import { CartContext } from "../../Context/CartContext";
import AuthContext from "../../Context/AuthContext";

import styles from "./NavBar.module.css";

const NavBar = () => {
  const cart = useContext(CartContext) || {};
  const { numCartItems = 0 } = cart;

  const { isAuthenticated, user, logout } =
    useContext(AuthContext) || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();

  const closeMenus = () => {
    setMenuOpen(false);
    setActiveMenu(null);
  };

  const toggleMenu = (menu) => {
    setActiveMenu((current) =>
      current === menu ? null : menu
    );
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/");
  };

  const getUserName = () => {
    if (!user) return "Account";

    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
    }

    return user.username || "Account";
  };

  return (
    <header className={styles.header}>

      {/* Announcement */}
      <div className={styles.announcement}>
        FREE SHIPPING WORLDWIDE
      </div>

      <div className={styles.navShell}>

        <div className={styles.navInner}>

          {/* Mobile Menu */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close menu" : "Open menu"
            }
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          {/* LEFT NAVIGATION */}
          <nav
            className={styles.leftNav}
            aria-label="Primary navigation"
          >

            {/* SHOP */}
            <button
              className={`${styles.navItem} ${
                activeMenu === "shop"
                  ? styles.navItemActive
                  : ""
              }`}
              onClick={() => toggleMenu("shop")}
            >
              Shop
              <FiChevronDown />
            </button>

            {/* COLLECTIONS */}
            <button
              className={`${styles.navItem} ${
                activeMenu === "collections"
                  ? styles.navItemActive
                  : ""
              }`}
              onClick={() => toggleMenu("collections")}
            >
              Collections
              <FiChevronDown />
            </button>

            {/* ROOMS */}
            <button
              className={`${styles.navItem} ${
                activeMenu === "rooms"
                  ? styles.navItemActive
                  : ""
              }`}
              onClick={() => toggleMenu("rooms")}
            >
              Rooms
              <FiChevronDown />
            </button>

            <Link to="/journal">
              Journal
            </Link>

            <Link to="/about">
              About
            </Link>
          </nav>

          {/* LOGO */}
          <Link
            to="/"
            className={styles.logo}
            aria-label="Merich Vintage home"
            onClick={closeMenus}
          >
            <span>MERICH</span>
            <small>VINTAGE</small>
          </Link>

          {/* RIGHT ACTIONS */}
          <div className={styles.actions}>

            <button
              onClick={() => {
                closeMenus();
                navigate("/search");
              }}
              aria-label="Search"
            >
              <FiSearch />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              onClick={closeMenus}
            >
              <FiHeart />
            </Link>

            <Link
              to="/cart"
              className={styles.cartLink}
              aria-label="Shopping bag"
              onClick={closeMenus}
            >
              <FiShoppingBag />

              {Number(numCartItems) > 0 && (
                <span className={styles.cartCount}>
                  {numCartItems}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              aria-label="Account"
              onClick={closeMenus}
            >
              <FiUser />
            </Link>

          </div>
        </div>

        {/* ================================================= */}
        {/* SHOP MEGA MENU */}
        {/* ================================================= */}

        {activeMenu === "shop" && (
          <div className={styles.megaMenu}>

            <div className={styles.megaInner}>

              <div className={styles.megaHeader}>
                <div>
                  <span>SHOP</span>
                  <h3>
                    Find something for every room.
                  </h3>
                </div>

                <Link
                  to="/shop"
                  onClick={closeMenus}
                >
                  View All Products →
                </Link>
              </div>

              <div className={styles.categoryGrid}>

                <CategoryCard
                  image="/images/categories/living-room.jpg"
                  title="Living Room"
                  link="/shop?category=living-room"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/dining.jpg"
                  title="Dining"
                  link="/shop?category=dining"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/bedroom.jpg"
                  title="Bedroom"
                  link="/shop?category=bedroom"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/office.jpg"
                  title="Office"
                  link="/shop?category=office"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/outdoor.jpg"
                  title="Outdoor"
                  link="/shop?category=outdoor"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/lighting.jpg"
                  title="Lighting"
                  link="/shop?category=lighting"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/storage.jpg"
                  title="Storage"
                  link="/shop?category=storage"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/home-decor.jpg"
                  title="Home Decor"
                  link="/shop?category=home-decor"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/entryway.jpg"
                  title="Entryway"
                  link="/shop?category=entryway"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/kids-nursery.jpg"
                  title="Kids & Nursery"
                  link="/shop?category=kids-nursery"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/bar-entertainment.jpg"
                  title="Bar & Entertainment"
                  link="/shop?category=bar-entertainment"
                  onClick={closeMenus}
                />

                <CategoryCard
                  image="/images/categories/furniture-sets.jpg"
                  title="Furniture Sets"
                  link="/shop?category=furniture-sets"
                  onClick={closeMenus}
                />

              </div>

            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* COLLECTIONS MEGA MENU */}
        {/* ================================================= */}

        {activeMenu === "collections" && (
          <div className={styles.simpleMegaMenu}>

            <div className={styles.collectionColumns}>

              <div>
                <span className={styles.menuLabel}>
                  COLLECTIONS
                </span>

                <Link
                  to="/collection/new-arrivals"
                  onClick={closeMenus}
                >
                  New Arrivals
                </Link>

                <Link
                  to="/collection/best-sellers"
                  onClick={closeMenus}
                >
                  Best Sellers
                </Link>

                <Link
                  to="/collection/trending"
                  onClick={closeMenus}
                >
                  Trending
                </Link>

                <Link
                  to="/collection/statement-pieces"
                  onClick={closeMenus}
                >
                  Statement Pieces
                </Link>
              </div>

              <div>
                <span className={styles.menuLabel}>
                  STYLE
                </span>

                <Link
                  to="/collection/modern"
                  onClick={closeMenus}
                >
                  Modern Collection
                </Link>

                <Link
                  to="/collection/classic"
                  onClick={closeMenus}
                >
                  Classic Collection
                </Link>

                <Link
                  to="/collection/minimalist"
                  onClick={closeMenus}
                >
                  Minimalist Collection
                </Link>

                <Link
                  to="/collection/luxury"
                  onClick={closeMenus}
                >
                  Luxury Collection
                </Link>
              </div>

              <div className={styles.saleColumn}>

                <span>
                  SPECIAL
                </span>

                <h3>
                  Exceptional pieces.
                  Exceptional prices.
                </h3>

                <Link
                  to="/collection/sale"
                  onClick={closeMenus}
                >
                  Shop Sale →
                </Link>

              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* ROOMS MEGA MENU */}
        {/* ================================================= */}

        {activeMenu === "rooms" && (
          <div className={styles.simpleMegaMenu}>

            <div className={styles.roomGrid}>

              <RoomLink
                title="Living Room"
                image="/images/rooms/living-room.jpg"
                link="/rooms/living-room"
                onClick={closeMenus}
              />

              <RoomLink
                title="Bedroom"
                image="/images/rooms/bedroom.jpg"
                link="/rooms/bedroom"
                onClick={closeMenus}
              />

              <RoomLink
                title="Dining Room"
                image="/images/rooms/dining-room.jpg"
                link="/rooms/dining-room"
                onClick={closeMenus}
              />

              <RoomLink
                title="Home Office"
                image="/images/rooms/home-office.jpg"
                link="/rooms/home-office"
                onClick={closeMenus}
              />

              <RoomLink
                title="Outdoor"
                image="/images/rooms/outdoor.jpg"
                link="/rooms/outdoor"
                onClick={closeMenus}
              />

              <RoomLink
                title="Entryway"
                image="/images/rooms/entryway.jpg"
                link="/rooms/entryway"
                onClick={closeMenus}
              />

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* MOBILE NAV */}
        {/* ================================================= */}

        <div
          className={`${styles.mobileNav} ${
            menuOpen
              ? styles.mobileNavOpen
              : ""
          }`}
        >

          <Link
            to="/shop"
            onClick={closeMenus}
          >
            Shop
          </Link>

          <Link
            to="/collection/new-arrivals"
            onClick={closeMenus}
          >
            New Arrivals
          </Link>

          <Link
            to="/collection/best-sellers"
            onClick={closeMenus}
          >
            Best Sellers
          </Link>

          <Link
            to="/rooms"
            onClick={closeMenus}
          >
            Rooms
          </Link>

          <Link
            to="/journal"
            onClick={closeMenus}
          >
            Journal
          </Link>

          <Link
            to="/about"
            onClick={closeMenus}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={closeMenus}
          >
            Contact
          </Link>

          <Link
            to="/wishlist"
            onClick={closeMenus}
          >
            Wishlist
          </Link>

          {/* LOGGED IN */}
          {isAuthenticated && user ? (
            <>

              <div className={styles.mobileDivider} />

              <span className={styles.mobileUser}>
                Hi, {getUserName()}
              </span>

              <Link
                to="/orders"
                onClick={closeMenus}
              >
                Orders
              </Link>

              <Link
                to="/delivery"
                onClick={closeMenus}
              >
                Delivery
              </Link>

              <Link
                to="/invoices"
                onClick={closeMenus}
              >
                Invoices
              </Link>

              <button
                className={styles.mobileLogout}
                onClick={handleLogout}
              >
                Logout
              </button>

            </>
          ) : (
            <>
              <div className={styles.mobileDivider} />

              <Link
                to="/login"
                onClick={closeMenus}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenus}
              >
                Create Account
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
};


/* ================================================= */
/* CATEGORY CARD */
/* ================================================= */

const CategoryCard = ({
  image,
  title,
  link,
  onClick,
}) => {
  return (
    <Link
      to={link}
      className={styles.categoryCard}
      onClick={onClick}
    >
      <div className={styles.categoryImage}>
        <img
          src={image}
          alt={title}
        />
      </div>

      <div className={styles.categoryTitle}>
        {title}
        <span>→</span>
      </div>
    </Link>
  );
};


/* ================================================= */
/* ROOM LINK */
/* ================================================= */

const RoomLink = ({
  title,
  image,
  link,
  onClick,
}) => {
  return (
    <Link
      to={link}
      className={styles.roomCard}
      onClick={onClick}
    >
      <img
        src={image}
        alt={title}
      />

      <div className={styles.roomOverlay}>
        <span>{title}</span>
        <strong>Explore →</strong>
      </div>
    </Link>
  );
};

export default NavBar;










// import React, { useContext } from "react";
// import { FaCartShopping } from "react-icons/fa6";
// import { Link } from "react-router-dom";

// import styles from "./NavBar.module.css";
// import NavBarLink from "./NavBarLink";
// import SearchBar from "./SearchBar";

// import { CartContext } from "../../Context/CartContext";

// // import { CartContext } from "../../Context/CartContext";

// const NavBar = () => {
//   const cart = useContext(CartContext);

//     console.log("NAVBAR RENDER", cart);

//   // const cart = useContext(CartContext);

//   // console.log(
//   //   "Navbar Context:",
//   //   cart
//   // );

//   const { numCartItems } = cart;
    
//   return (
//     <nav
//       className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 ${styles.s}`}
//     >
//       <div className="container">

//         <Link
//           className="navbar-brand fw-bold text-uppercase"
//           to="/"
//         >
//           NaijaOpenMarket
//         </Link>

//         <div className="mx-auto">
//           <SearchBar />
//         </div>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarContent"
//           aria-controls="navbarContent"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div
//           className="collapse navbar-collapse"
//           id="navbarContent"
//         >
//           <NavBarLink />

//           <Link
//             to="/cart"
//             className="btn btn-dark ms-3 rounded-pill position-relative"
//           >
//             <FaCartShopping size={20} />

//             {numCartItems > 0 && (
//               <span
//                 className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//               >
//                 {numCartItems}
//                 <span className="visually-hidden">
//                   items in cart
//                 </span>
//               </span>
//             )}
//           </Link>

//         </div>
//       </div>
//     </nav>
//   );
// };

// export default NavBar;


















// import React from "react";
// import { FaCartShopping } from "react-icons/fa6";
// import { Link } from "react-router-dom";
// import styles from "./NavBar.module.css";
// import NavBarLink from "./NavBarLink";
// import SearchBar from "./SearchBar";


// // import { useContext } from "react";
// // import { CartContext } from "../../Context/CartContext";





// const NavBar = ({ numCartItems = 0 }) => {
//   // const { numCartItems } = useContext(CartContext);

//   return (
//     <nav
//       className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 ${styles.s}`}
//     >
//       <div className="container">
//         <Link
//           className="navbar-brand fw-bold text-uppercase"
//           to="/"
//         >
//           NaijaOpenMarket
//         </Link>

//       <div className="mx-auto">
//         <SearchBar />
//       </div>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarContent"
//           aria-controls="navbarContent"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div
//           className="collapse navbar-collapse"
//           id="navbarContent"
//         >
//           <NavBarLink />

//           <Link
//             to="/cart"
//             className="btn btn-dark ms-3 rounded-pill position-relative"
//           >
//             <FaCartShopping size={20} />

//             {Number(numCartItems) > 0 && (
//               <span
//                 className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//               >
//                 {numCartItems}
//                 <span className="visually-hidden">
//                   items in cart
//                 </span>
//               </span>
//             )}
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default NavBar;


// import React from "react";
// import { FaCartShopping } from "react-icons/fa6";
// import { Link } from "react-router-dom";
// import styles from "./NavBar.module.css";
// import NavBarLink from "./NavBarLink";

// const NavBar = ({ numCartItems = 0 }) => {
//   return (
//     <nav
//       className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 ${styles.s}`}
//     >
//       <div className="container">
//         <Link className="navbar-brand fw-bold text-uppercase" to="/">
//           SHOPit
//         </Link>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarContent"
//           aria-controls="navbarContent"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarContent">
//           <NavBarLink />

//           <Link
//             to="/cart"
//             className="btn btn-dark ms-3 rounded-pill position-relative"
//           >
//             <FaCartShopping />

//             {numCartItems > 0 && (
//               <span
//                 className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//               >
//                 {numCartItems}
//               </span>
//             )}
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default NavBar;