import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../Components/ui/NavBar";
import Footer from "../Components/ui/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MainLayout = ({ numCartItems = 0 }) => (
  <div className="josephs-app">
    <ToastContainer position="bottom-right" autoClose={2800} />
    <NavBar numCartItems={numCartItems} />
    <main className="site-main"><Outlet /></main>
    <Footer />
  </div>
);
export default MainLayout;
