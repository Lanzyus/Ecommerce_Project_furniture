import React from "react";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "../components/ui/NavBar";
import Footer from "../components/ui/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({ numCartItems = 0 }) => {
  return (
    <>
     
      <ToastContainer />
      <main>
        <NavBar numCartItems={numCartItems} />
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;