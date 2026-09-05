import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import MainLayout from "./Layout/MainLayout";
import HomePage from "./Components/home/HomePage";
import NotFoundPage from "./Components/home/NotFoundPage";
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

import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Register from "./Pages/Register";
import EditProfilePage from "./Pages/Profile/EditProfilePage";
import InvoicePage from "./Components/orders/InvoicePage";
import DeliveryPage from "./Components/delivery/DeliveryPage";
import { CartProvider } from "./Context/CartContext";


import api from "./api";
import { AuthProvider } from "./Context/AuthContext";

const App = () => {
  const [numCartItems, setNumCartItems] = useState(0);

  
const fetchCartStats = useCallback(async () => {
  try {
    const cart_code = localStorage.getItem("cart_code");

    if (!cart_code) {
      setNumCartItems(0);
      return;
    }

    const res = await api.get("/get_cart_stat/", { params: { cart_code } })

    // const res = await api.get("/api/get_cart_stat/", {
    //   params: { cart_code },
    // });

    setNumCartItems(res.data?.num_of_items || 0);
  } catch (err) {
    console.error("Cart stat error:", err.response?.data || err.message);
    setNumCartItems(0);
  }
}, []);

  useEffect(() => {
    fetchCartStats();
  }, [fetchCartStats]);

  return (

  
  
    <BrowserRouter>
     <AuthProvider>
      

      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              // numCartItems={numCartItems}
              // fetchCartStats={fetchCartStats}
            />
          }
        >
          <Route
            index
            element={<HomePage fetchCartStats={fetchCartStats} />}
          />

          <Route
            path="products/:slug"
            element={
              <ProductDetailPage
                setNumCartItems={setNumCartItems}
                fetchCartStats={fetchCartStats}
              />
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

        <Route
          path="delivery"
          element={
            <ProtectedRoute>
              <DeliveryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice/:orderId"
          element={<InvoicePage />}
        />

          <Route path="login" element={<LoginPage />} />

          <Route path="about" element={<About />} />

          <Route path="contact" element={<Contact />} />

          <Route path="register" element={<Register />} />

          <Route
            path="profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

         <Route path="/profile" element={<UserProfilePage />} />
         <Route path="/payment-status" element={<PaymentStatusPage  setNumCartItems = {setNumCartItems}/>} />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={<WishlistPage />}
          />


          <Route
            path="/search"
            element={<SearchResultsPage />}
          />

          <Route
            path="cart"
            element={
              <CartPage
                setNumCartItems={setNumCartItems}
                fetchCartStats={fetchCartStats}
              />
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
        
      </AuthProvider>
    </BrowserRouter>

    
  
  );
};

export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./Components/home/HomePage";
// import NotFoundPage from "./Components/home/NotFoundPage";
// import ProductDetailPage from "./Components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";
// import CheckoutPage from "./Components/checkout/CheckoutPage";
// import LoginPage from "./Components/user/LoginPage";
// import ProtectedRoute from "./Components/ui/ProtectedRoute";

// import api from "./api";

// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(
//         `/get_cart_stat/?cart_code=${cart_code}`
//       );  

//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

// const fetchCartStats = useCallback(async () => {
  //   const cart_code = localStorage.getItem("cart_code");

  //   if (!cart_code) {
  //     setNumCartItems(0);
  //     return;
  //   }
  //   try {
  //   const res = await api.get("/api/get_cart_stat/", {
  //     params: { cart_code }
  //   });

  //   // const res = await api.get(
  //   // `/get_cart_stat/?cart_code=${cart_code}`
  //   // );
  
  //     setNumCartItems(res.data?.num_of_items || 0);
  //   } catch (err) {
  //     console.error("Cart stat error:", err);
  //     setNumCartItems(0); // important fallback
  //   }
  // }, []);


//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout
//               numCartItems={numCartItems}
//               fetchCartStats={fetchCartStats}
//             />
//           }
//         >
//           <Route
//             index
//             element={
//               <HomePage
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="products/:slug"
//             element={
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route path="login" element={<LoginPage />} />

//           <Route
//             path="checkout"
//             element={
//               <ProtectedRoute>
//                 <CheckoutPage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route path="*" element={<NotFoundPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./Components/home/HomePage";
// import NotFoundPage from "./Components/home/NotFoundPage";
// import ProductDetailPage from "./Components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";
// import CheckoutPage from "./Components/checkout/CheckoutPage";
// import LoginPage from "./Components/user/LoginPage"
// import ProtectedRoute from "./Components/ui/ProtectedRoute";

// import api from "./api";

// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(`/get_cart_stat?cart_code=${cart_code}`);

//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout
//               numCartItems={numCartItems}
//               fetchCartStats={fetchCartStats}
//             />
//           }
//         >
//           <Route
//             index
//             element={<HomePage fetchCartStats={fetchCartStats} />}
//           />

//           <Route
//             path="products/:slug"
//             element={
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />
//           <Route path="login" element={<LoginPage />} />


//           <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route path="*" element={<NotFoundPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./components/home/HomePage";
// import NotFoundPage from "./components/home/NotFoundPage";
// import ProductDetailPage from "./components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";

// import api from "./api";
// import CheckoutPage from "./Components/checkout/CheckoutPage";

// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(
//         `/get_cart_stat?cart_code=${cart_code}`
//       );

//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout
//               numCartItems={numCartItems}
//               fetchCartStats={fetchCartStats}
//             />
//           }
//         >
//           <Route
//             index
//             element={<HomePage fetchCartStats={fetchCartStats} />}
//           />

//           <Route
//             path="products/:slug"
//             element={
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//  <Route
//             path="checkout"
//             element={
//               <CheckoutPage
                
//               />
//             }
//           />
          

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route path="*" element={<NotFoundPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./components/home/HomePage";
// import NotFoundPage from "./components/home/NotFoundPage";
// import ProductDetailPage from "./components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";

// import api from "./api";

// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(
//         `/get_cart_stat?cart_code=${cart_code}`
//       );


//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout 
//               numCartItems={numCartItems}
//               setNumCartItems={setNumCartItems}
//             />
//           }
//         >
//           <Route
//             index
//             element={
//               <HomePage fetchCartStats={fetchCartStats} />
//             }
//           />

//           <Route
//             path="products/:slug"
//             element={
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="*"
//             element={<NotFoundPage />}
//           />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./components/home/HomePage";
// import NotFoundPage from "./components/home/NotFoundPage";
// import ProductDetailPage from "./components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";

// import api from "./api";

// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(
//         `/get_cart_stat?cart_code=${cart_code}`
//       );

//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout numCartItems={numCartItems} />
//           }
//         >
//           <Route
//             index
//             element={
//               <HomePage
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="products/:slug"
//             element={
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="*"
//             element={<NotFoundPage />}
//           />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./components/home/HomePage";
// import NotFoundPage from "./components/home/NotFoundPage";
// import ProductDetailPage from "./components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";

// import api from "./api";

// import { useState } from "react";
// import NavBar from "./components/ui/NavBar";

// function App() {
//   const [numCartItems, setNumCartItems] = useState(0);

//   return (
//     <>
     
//       {/* other components */}
//     </>
//   );
// }

// export default App;




// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);

//   const fetchCartStats = useCallback(async () => {
//     const cart_code = localStorage.getItem("cart_code");

//     if (!cart_code) {
//       setNumCartItems(0);
//       return;
//     }

//     try {
//       const res = await api.get(
//         `/get_cart_stat?cart_code=${cart_code}`
//       );

//       setNumCartItems(res.data?.num_of_items || 0);
//     } catch (err) {
//       console.error("Cart stat error:", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCartStats();
//   }, [fetchCartStats]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             <MainLayout
//               numCartItems={numCartItems}
//             />
//           }
//         >
//           <Route
//             index
//             element={
//               <HomePage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="products/:slug"
//             element={
              
//               <ProductDetailPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route
//             path="cart"
//             element={
//               <CartPage
//                 setNumCartItems={setNumCartItems}
//                 fetchCartStats={fetchCartStats}
//               />
//             }
//           />

//           <Route path="*" element={<NotFoundPage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect, useState } from "react";

// import MainLayout from "./Layout/MainLayout";
// import HomePage from "./components/home/HomePage";
// import NotFoundPage from "./components/home/NotFoundPage";
// import ProductDetailPage from "./components/product/ProductDetailPage";
// import CartPage from "./Components/cart/CartPage";

// // Import your API instance
// import api from "./api"; // Adjust the path if needed


// const App = () => {
//   const [numCartItems, setNumCartItems] = useState(0);
  
//   const cart_code = localStorage.getItem("cart_code");

//   useEffect(() => {
//     if (cart_code) {
//       api
//         .get(`/get_cart_stat?cart_code=${cart_code}`)
//         .then((res) => {
//           console.log(res.data);

//           // Update cart count if returned by backend
//           if (res.data?.num_of_items !== undefined) {
//             setNumCartItems(res.data.num_of_items);
//           }
//         })
//         .catch((err) => {
//           console.error(err.message);
//         });
//     }
//   }, [cart_code]);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route
//           path="/"
//           element={<MainLayout numCartItems={numCartItems} />}
//         >
//           <Route index element={<HomePage />} />
//           <Route
//             path="products/:slug"
//             element={<ProductDetailPage setNumCartItems = {setNumCartItems} />}
//           />
//           <Route path="*" element={<NotFoundPage />} />
//           <Route path="cart" element= {<CartPage  setNumCartItems= {setNumCartItems}/>} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;