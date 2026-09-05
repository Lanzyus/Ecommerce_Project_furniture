import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api";




function useCartData() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // const tax = 4.0;

 const cartTotal = cartItems.reduce(
  (total, item) =>
    total +
    Number(
      item.product?.current_price ||
      item.product?.price ||
      0
    ) *
      item.quantity,
  0
);

const tax = Number(
  (cartTotal * 0.075).toFixed(2)

);


  const fetchCart = useCallback(async () => {
    const cart_code = localStorage.getItem("cart_code");

    if (!cart_code) {
      setCartItems([]);
      return;
    }

    setLoading(true);

    try {

      
      const res = await api.get(`/get_cart/?cart_code=${cart_code}`);

      setCartItems(res.data?.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // const cartTotal = useMemo(() => {
  //   return cartItems.reduce(
  //     (sum, item) => sum + Number(item.total || 0),
  //     0
  //   );
  // }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  return {
    cartItems,
    setCartItems,
    cartTotal,
    totalQuantity,
    tax,
    loading,
    refetchCart: fetchCart,
  };
}

export default useCartData;



// import { useState, useEffect } from "react";
// import api from "../api";

// const useCartData = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/cart/");
//       setCartItems(res.data);
//     } catch (err) {
//       console.error("Cart fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCart = async () => {
//   try {
//     const res = await api.get("/get_cart/");
//     setCartItems(res.data);
//   } catch (err) {
//     console.error("Cart fetch error:", err);
//   }
// };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   return {
//     cartItems,
//     setCartItems,
//     loading,
//     refetchCart: fetchCart,
//   };
// };

// export default useCartData;


// import { useEffect, useState, useCallback, useMemo } from "react";
// import api from "../api";

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) return;

//     setLoading(true);

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);
//       setCartItems(res.data.items || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [cart_code]);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   const cartTotal = useMemo(
//     () => cartItems.reduce((sum, i) => sum + Number(i.total || 0), 0),
//     [cartItems]
//   );

//   const totalQuantity = useMemo(
//     () => cartItems.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
//     [cartItems]
//   );

//   return {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart: fetchCart,
//   };
// }

// export default useCartData;


// import { useEffect, useState, useCallback, useMemo } from "react";
// import api from "../api";

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) {
//       console.error("Cart code not found");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);
//       setCartItems(res.data.items || []);
//     } catch (err) {
//       console.error(
//         "Error fetching cart:",
//         err.response?.data || err.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [cart_code]);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   const cartTotal = useMemo(
//     () =>
//       cartItems.reduce(
//         (sum, item) => sum + Number(item.total || 0),
//         0
//       ),
//     [cartItems]
//   );

//   const totalQuantity = useMemo(
//     () =>
//       cartItems.reduce(
//         (sum, item) => sum + Number(item.quantity || 0),
//         0
//       ),
//     [cartItems]
//   );

//   return {
//     cartItems,
//     setCartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart: fetchCart,
//   };
// }

// export default useCartData;

// import { useEffect, useState, useCallback } from "react";
// import api from "../api";

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [totalQuantity, setTotalQuantity] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) {
//       console.error("Cart code not found");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

//       const items = res.data.items || [];
//       setCartItems(items);
//     } catch (err) {
//       console.error(
//         "Error fetching cart:",
//         err.response?.data || err.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [cart_code]);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   // Recalculate totals whenever cartItems changes
//   useEffect(() => {
//     const total = cartItems.reduce(
//       (sum, item) => sum + Number(item.total || 0),
//       0
//     );

//     const quantity = cartItems.reduce(
//       (sum, item) => sum + Number(item.quantity || 0),
//       0
//     );

//     setCartTotal(total);
//     setTotalQuantity(quantity);
//   }, [cartItems]);

//   return {
//     cartItems,
//     setCartItems,
//     cartTotal,
//     setCartTotal,
//     totalQuantity,
//     setTotalQuantity,
//     tax,
//     loading,
//     refetchCart: fetchCart,
//   };
// }

// export default useCartData;

// import { useEffect, useState, useCallback } from "react";
// import api from "../api";

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [totalQuantity, setTotalQuantity] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) {
//       console.error("Cart code not found");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

//       const items = res.data.items || [];
//       setCartItems(items);
//     } catch (err) {
//       console.error("Error fetching cart:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [cart_code]);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   // ✅ Single source of truth: derived state from cartItems
//   useEffect(() => {
//     const total = cartItems.reduce(
//       (sum, item) => sum + Number(item.total || 0),
//       0
//     );

//     const quantity = cartItems.reduce(
//       (sum, item) => sum + Number(item.quantity || 0),
//       0
//     );

//     setCartTotal(total);
//     setTotalQuantity(quantity);
//   }, [cartItems]);

//   return {
//   cartItems,
//   setCartItems,
//   cartTotal,
//   setCartTotal,
//   totalQuantity,
//   setTotalQuantity,
//   tax,
//   loading,
//   refetchCart: fetchCart,
// };

//   // return {
//   //   cartItems,
//   //   cartTotal,
//   //   totalQuantity,
//   //   tax,
//   //   loading,
//   //   refetchCart: fetchCart,
//   // };
// }

// export default useCartData;

// import { useEffect, useState, useCallback } from "react";
// import api from "../api"

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [totalQuantity, setTotalQuantity] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) {
//       console.error("Cart code not found");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

//       setCartItems(res.data.items || []);
//       setCartTotal(res.data.sum_total || 0);
//       setTotalQuantity(res.data.quantity || 0);
//     } catch (err) {
//       console.error("Error fetching cart:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [cart_code]);

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);


  
//   return {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     loading,
//     refetchCart: fetchCart,
//   };
// }

// export default useCartData;



// import { useEffect, useState, useCallback } from "react";
// import api from "../../api";

// function useCartData() {
//   const [cartItems, setCartItems] = useState([]);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [totalQuantity, setTotalQuantity] = useState(0);

//   const tax = 4.0;
//   const cart_code = localStorage.getItem("cart_code");

//   const fetchCart = useCallback(async () => {
//     if (!cart_code) {
//       console.error("Cart code not found");
//       return;
//     }

//     try {
//       const res = await api.get(`/get_cart?cart_code=${cart_code}`);

//       setCartItems(res.data.items || []);
//       setCartTotal(res.data.sum_total || 0);
//       setTotalQuantity(res.data.quantity || 0);
//     } catch (err) {
//       console.error("Error fetching cart:", err.response?.data || err.message);
//     }
//   }, [cart_code]);
//   return {
//     cartItems,
//     cartTotal,
//     totalQuantity,
//     tax,
//     refetchCart: fetchCart,
//     loading,
//   };
// }

// export default useCartData;