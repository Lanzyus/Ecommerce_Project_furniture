import React from "react";
import UserInfo from "./UserInfo";
import OrderHistoryItem from "./OrderHistoryItem";
import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

const UserProfilePage = () => {
  return (
    <div className="container my-5">
      {/* Profile Header */}
      <UserInfo />

      {/* Order History */}
      {/* <OrderHistoryItemContainer/> */}
    </div>
  );
};

export default UserProfilePage;



// import React from 'react'
// import UserInfo from './UserInfo'
// import OrderHistoryItem from './OrderHistoryItem.jsX'


// const UserProfilePage = () => {
//   return (
   
//        <div className="container my-5">
//       {/* Profile Header */}

//       <UserInfo />

//       {/* Order History */}
//       <OrderHistoryItemContainer />

//     </div>
    
//   )
// }

// export default UserProfilePage
