import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [numCartItems, setNumCartItems] = useState(0);

  const fetchCartStats = useCallback(async () => {
    try {
      const cart_code = localStorage.getItem("cart_code");

      if (!cart_code) {
        setNumCartItems(0);
        return;
      }

      const res = await api.get("/get_cart_stat/", {
        params: {
          cart_code,
        },
      });

      setNumCartItems(res.data?.num_of_items || 0);
    } catch (err) {
      console.error(
        "Cart stats error:",
        err.response?.data || err.message
      );

      setNumCartItems(0);
    }
  }, []);

  useEffect(() => {
    fetchCartStats();

    const handleCartUpdate = () => {
      fetchCartStats();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );
    };
  }, [fetchCartStats]);

  return (
    <CartContext.Provider
      value={{
        numCartItems,
        setNumCartItems,
        fetchCartStats,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};








// import { createContext, useState, useEffect } from "react";
// import api from "../api";

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [numCartItems, setNumCartItems] = useState(0);



// const fetchCartStats = async () => {

//   const cart_code =
//     localStorage.getItem("cart_code");

//   if (!cart_code) {

//     setNumCartItems(0);

//     return;
//   }

//   try {

//     const res = await api.get(
//       `/get_cart_stat?cart_code=${cart_code}`
//     );

//     setNumCartItems(
//       res.data.num_of_items || 0
//     );

//   } catch (err) {

//     console.error(err);

//     setNumCartItems(0);
//   }
// };


//   useEffect(() => {

//   fetchCartStats();

//   const handleCartUpdate = () => {
//     fetchCartStats();
//   };

//   window.addEventListener(
//     "cartUpdated",
//     handleCartUpdate
//   );

//   return () => {
//     window.removeEventListener(
//       "cartUpdated",
//       handleCartUpdate
//     );
//   };

// }, []);

//   console.log(
//   "CartProvider Render:",
//   numCartItems
//   );
//   return (
//     <CartContext.Provider
//       value={{
//         numCartItems,
//         setNumCartItems,
//         fetchCartStats,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };








// import { createContext, useState, useEffect } from "react";
// import api from "../api";

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {

    
//     const [numCartItems, setNumCartItems] = useState(0);

//     const fetchCartStats = async () => {

//   const cart_code =
//     localStorage.getItem("cart_code");

//   console.log(
//     "Fetching cart stats..."
//   );

//   const res = await api.get(
//     `/get_cart_stat?cart_code=${cart_code}`
//   );

//   console.log(
//     "Cart API Response:",
//     res.data
//   );

//   // setNumCartItems(
//   //   res.data.num_of_items || 0
//   // );

//   console.log(
//   "CartContext API:",
//   res.data
//   );

//   setNumCartItems(
//   res.data.num_of_items || 0
//   );

//   console.log(
//   "Setting count:",
//   res.data.num_of_items
//   );
  
  
// };
    // const fetchCartStats = async () => {

    //     const cart_code =
    //         localStorage.getItem("cart_code");

    //     if (!cart_code) {
    //         setNumCartItems(0);
    //         return;
    //     }

    //     try {
    //         const res = await api.get(
    //             `/get_cart_stat?cart_code=${cart_code}`
    //         );

    //         setNumCartItems(
    //             res.data.num_of_items
    //         );

    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

//     useEffect(() => {
//         fetchCartStats();
//     }, []);

//     return (
        
//         <CartContext.Provider
//             value={{
//                 numCartItems,
//                 setNumCartItems,
//                 fetchCartStats
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };