import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import MainLayout from "./Layout/MainLayout";
import HomePage from "./Pages/HomePage";
import ShopPage from "./Pages/ShopPage";
import CollectionPage from "./Pages/CollectionPage";
import RoomsPage from "./Pages/RoomsPage";
import InspirationPage from "./Pages/InspirationPage";
import JournalPage from "./Pages/JournalPage";
import DesignServicesPage from "./Pages/DesignServicesPage";
import AppointmentPage from "./Pages/AppointmentPage";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Register from "./Pages/Register";
import EditProfilePage from "./Pages/Profile/EditProfilePage";
import ProductDetailPage from "./Components/product/ProductDetailPage";
import CartPage from "./Components/cart/CartPage";
import CheckoutPage from "./Components/checkout/CheckoutPage";
import LoginPage from "./Components/user/LoginPage";
import ProtectedRoute from "./Components/ui/ProtectedRoute";
import UserProfilePage from "./Components/user/UserProfilePage";
import PaymentStatusPage from "./Components/payment/PaymentStatusPage";
import SearchResultsPage from "./Components/ui/SearchResultsPage";
import WishlistPage from "./Components/product/WishlistPage";
import OrdersPage from "./Components/orders/OrdersPage";
import InvoicePage from "./Components/orders/InvoicePage";
import DeliveryPage from "./Components/delivery/DeliveryPage";
import NotFoundPage from "./Components/home/NotFoundPage";
import api from "./api";

const App = () => {
  const [numCartItems, setNumCartItems] = useState(0);
  const fetchCartStats = useCallback(async () => {
    try {
      const cartCode = localStorage.getItem("cart_code");
      if (!cartCode) return setNumCartItems(0);
      const response = await api.get("/get_cart_stat/", { params: { cart_code: cartCode } });
      setNumCartItems(response.data?.num_of_items || 0);
    } catch (error) {
      console.error("Cart stats error:", error.response?.data || error.message);
      setNumCartItems(0);
    }
  }, []);
  useEffect(() => { fetchCartStats(); }, [fetchCartStats]);

  return <BrowserRouter><Routes><Route element={<MainLayout numCartItems={numCartItems} />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/collections" element={<CollectionPage />} />
    <Route path="/collections/:collection" element={<CollectionPage />} />
    <Route path="/rooms" element={<RoomsPage />} />
    <Route path="/rooms/:room" element={<RoomsPage />} />
    <Route path="/inspiration" element={<InspirationPage />} />
    <Route path="/journal" element={<JournalPage />} />
    <Route path="/design-services" element={<DesignServicesPage />} />
    <Route path="/appointment" element={<AppointmentPage />} />
    <Route path="/products/:slug" element={<ProductDetailPage fetchCartStats={fetchCartStats} setNumCartItems={setNumCartItems} />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route path="/payment-status" element={<PaymentStatusPage setNumCartItems={setNumCartItems} />} />
    <Route path="/wishlist" element={<WishlistPage />} />
    <Route path="/search" element={<SearchResultsPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<Register />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
    <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    <Route path="/delivery" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
    <Route path="/invoice/:orderId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></BrowserRouter>;
};
export default App;
