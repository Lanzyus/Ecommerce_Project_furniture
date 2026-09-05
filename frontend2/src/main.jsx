import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App.jsx";
import "./App.css";

import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";

window.addEventListener("error", (e) => {
  if (
    e.message &&
    e.message.includes("message channel closed")
  ) {
    e.preventDefault();
  }
});

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);









// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";

// import App from "./App.jsx";
import "./App.css";
// import { AuthProvider } from "./Context/AuthContext";
// import {CartContext} from "./Context/CartContext"

// window.addEventListener("error", (e) => {
//   if (
//     e.message &&
//     e.message.includes("message channel closed")
//   ) {
//     e.preventDefault();
//   }
// });

// createRoot(
//   document.getElementById("root")
// ).render(
//   <StrictMode>
//     <CartProvider>
//       <App />
//     </CartProvider>
//   </StrictMode>
// );









// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";

// import App from "./App.jsx";
import "./App.css";

// window.addEventListener("error", (e) => {
//   if (e.message.includes("message channel closed")) {
//     e.preventDefault();
//   }
// });

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );