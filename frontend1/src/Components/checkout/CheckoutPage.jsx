import React from "react";
import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";
import useCartData from "../../hooks/useCartData";

function CheckoutPage() {
  const {
    cartItems,
    cartTotal,
    totalQuantity,
    tax,
    loading,
    refetchCart,
  } = useCartData();

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="row">

        <OrderSummary
          cartItems={cartItems}
        />

        <PaymentSection
          cartItems={cartItems}
          cartTotal={cartTotal}
          totalQuantity={totalQuantity}
          tax={tax}
          refetchCart={refetchCart}
        />

      </div>
    </div>
  );
}

export default CheckoutPage;














// import React from "react";
// import OrderSummary from "./OrderSummary";
// import PaymentSection from "./PaymentSection";
// import useCartData from "../../hooks/useCartData";

// function CheckoutPage() {
//   const {cartItems,cartTotal,totalQuantity,tax,loading, refetchCart,} = useCartData();


//   return (
//     <div className="container my-3">
//       <div className="row">
//         <OrderSummary  cartItems={cartItems} />
//         <PaymentSection />
//       </div>
//     </div>
//   );
// }

// export default CheckoutPage;



// import React from 'react'
// import OrderSummary from './OrderSummary'
// import PaymentSection from './PaymentSection'

// function CheckoutPage() {
//   return (
//     <div className="container my-3">
//   <div className="row">
//     <OrderSummary />
//     <PaymentSection/>
//   </div>
// </div> 
//   )
// }

// export default CheckoutPage

