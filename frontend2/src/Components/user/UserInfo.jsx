import React, { useEffect, useState } from "react";
import styles from "./UserInfo.module.css";
import pic from "../../assets/profile_pic.jpg";
import api from "../../api";
import Spinner from "../ui/Spinner";
import OrderHistoryItemContainer from "./OrderHistoryItemContainer";
import { Link } from "react-router-dom";

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          console.error("No access token found");
          return;
        }

        // Fetch User Info
        const userResponse = await api.get("/user/");

        // Fetch Orders
        const ordersResponse = await api.get("/my-orders/");

        console.log("User:", userResponse.data);
        console.log("Orders:", ordersResponse.data);

        if (mounted) {
          setUserInfo(userResponse.data);

          // API returns an array
          // setOrderItems(
          //   Array.isArray(ordersResponse.data)
          //     ? ordersResponse.data
          //     : []
          // );
        setOrderItems(
          ordersResponse.data.orders || []  
        );
        console.log(
          "Orders Array:",
          ordersResponse.data.orders
        );
        }
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Spinner loading={true} />;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        {/* Profile Card */}
        <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
          <img
            src={pic}
            alt="Profile"
            className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
          />

          <h4>
            {userInfo.first_name || ""} {userInfo.last_name || ""}
          </h4>

        <p className="text-muted">
          {userInfo.email || "No email available"}
        </p>

        <Link
          to="/profile/edit"
          className="btn btn-primary btn-sm mt-2"
        >
          Edit Profile
        </Link>
          {/* <p className="text-muted">
            {userInfo.email || "No email available"}
          </p> */}
        </div>

        {/* Account Info */}
        <div className="col-md-9">
          <div className="card">
            <div
              className="card-header"
              style={{
                backgroundColor: "#6050DC",
                color: "#fff",
              }}
            >
              <h5 className="mb-0">Account Overview</h5>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {userInfo.first_name} {userInfo.last_name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {userInfo.email || "N/A"}
                  </p>

                  <p>
                    <strong>Username:</strong>{" "}
                    {userInfo.username || "N/A"}
                  </p>
                </div>

                <div className="col-md-6">
                  <p>
                    <strong>Phone:</strong>{" "}
                    {userInfo.phone || "N/A"}
                  </p>

                  <p>
                    <strong>City:</strong>{" "}
                    {userInfo.city || "N/A"}
                  </p>

                  <p>
                    <strong>Country:</strong>{" "}
                    {userInfo.country || "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {userInfo.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="mt-4">
            <OrderHistoryItemContainer
              orderitems={orderItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;


// import React, { useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import pic from "../../assets/profile_pic.jpg";
// import api from "../../api";
// import Spinner from "../ui/Spinner";
// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// const UserInfo = () => {
//   const [userInfo, setUserInfo] = useState({});
//   const [orderitems, setOrderItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     const fetchUserInfo = async () => {
//       try {
//         const token = localStorage.getItem("access");

//         console.log("Access Token:", token);

//         if (!token) {
//           console.error("No access token found.");
//           setLoading(false);
//           return;
//         }

//         // const response = await api.get("user_info/");
//         // const response = await api.get("/user/");
//         // setUserInfo(response.data);

//         const response = await api.get("/user/");

//         console.log("FULL RESPONSE");
//         console.log(response.data);


//         if (mounted) {
//           console.log("User Info Response:", response.data);

//           setUserInfo(response.data);

//           console.log("Orders:", response.data.orders);
//           console.log("Items:", response.data.items);

//           setOrderItems(
//             response.data.orders?.length
//               ? response.data.orders
//               : response.data.items || []
//           );

   
//           // setOrderItems(
//           //   response.data.orders ||
//           //     response.data.items ||
//           //     []
//           // );
//         }
//       } catch (error) {
//         console.error(
//           "Error fetching user info:",
//           error.response?.data || error.message
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserInfo();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) {
//     return <Spinner loading={true} />;
//   }

//   return (
//     <div className="container">
//       <div className="row mb-4">
//         <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//           <img
//             src={pic}
//             alt="profile"
//             className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//           />

//           <h4>
//             {userInfo.first_name} {userInfo.last_name}
//           </h4>

//           <p className="text-muted">
//             {userInfo.email || "No email available"}
//           </p>
//         </div>

//         <div className="col-md-9">
//           <div className="card">
//             <div
//               className="card-header"
//               style={{
//                 backgroundColor: "#6050DC",
//                 color: "#fff",
//               }}
//             >
//               <h5 className="mb-0">Account Overview</h5>
//             </div>

//             <div className="card-body">
//               <div className="row">
//                 <div className="col-md-6">
//                   <p>
//                     <strong>Full Name:</strong>{" "}
//                     {userInfo.first_name} {userInfo.last_name}
//                   </p>

//                   <p>
//                     <strong>Email:</strong>{" "}
//                     {userInfo.email || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Username:</strong>{" "}
//                     {userInfo.username || "N/A"}
//                   </p>
//                 </div>

//                 <div className="col-md-6">
//                   <p>
//                     <strong>Phone:</strong>{" "}
//                     {userInfo.phone || "N/A"}
//                   </p>

//                   <p>
//                     <strong>City:</strong>{" "}
//                     {userInfo.city || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Country:</strong>{" "}
//                     {userInfo.country || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Address:</strong>{" "}
//                     {userInfo.address || "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-4">
//             <OrderHistoryItemContainer
//               orderitems={orderitems}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;




// import React, { useContext, useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import AuthContext from "../../Context/AuthContext";
// import pic from "../../assets/profile_pic.jpg";
// import api from "../../api";
// import Spinner from "../ui/Spinner";
// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// const UserInfo = () => {
//   const { user } = useContext(AuthContext);

//   const [orderitems, setOrderItems] = useState([]);
//   const [userInfo, setUserInfo] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     const fetchUserInfo = async () => {
//       const token = localStorage.getItem("access");

//       if (!token) {
//         console.error("No access token found.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await api.get("user_info/", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (mounted) {
//           setUserInfo(res.data);
//           // setOrderItems(res.data.items || []);
//           setOrderItems(res.data.orders || []);
//         }
//       } catch (error) {
//         console.error(
//           "Error fetching user info:",
//           error.response?.data || error.message
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserInfo();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) {
//     return <Spinner loading={true} />;
//   }

//   return (
//     <div className="container">
//       <div className="row mb-4">

//         <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//           <img
//             src={pic}
//             alt="profile"
//             className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//           />

//           <h4>
//             {userInfo.first_name} {userInfo.last_name}
//           </h4>

//           <p className="text-muted">
//             {userInfo.email || "No email available"}
//           </p>
//         </div>

//         <div className="col-md-9">
//           <div className="card">
//             <div
//               className="card-header"
//               style={{
//                 backgroundColor: "#6050DC",
//                 color: "#fff",
//               }}
//             >
//               <h5 className="mb-0">Account Overview</h5>
//             </div>

//             <div className="card-body">
//               <div className="row">

//                 <div className="col-md-6">
//                   <p>
//                     <strong>Full Name:</strong>{" "}
//                     {userInfo.first_name} {userInfo.last_name}
//                   </p>

//                   <p>
//                     <strong>Email:</strong>{" "}
//                     {userInfo.email || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Username:</strong>{" "}
//                     {userInfo.username || "N/A"}
//                   </p>
//                 </div>

//                 <div className="col-md-6">
//                   <p>
//                     <strong>Phone:</strong>{" "}
//                     {userInfo.phone || "N/A"}
//                   </p>

//                   <p>
//                     <strong>City:</strong>{" "}
//                     {userInfo.city || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Country:</strong>{" "}
//                     {userInfo.country || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Address:</strong>{" "}
//                     {userInfo.address || "N/A"}
//                   </p>
//                 </div>

//               </div>
//             </div>
//           </div>

//           <div className="mt-4">
//             <OrderHistoryItemContainer orderitems={orderitems} />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;

// import React, { useContext, useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import AuthContext from "../../Context/AuthContext";
// import pic from "../../assets/profile_pic.jpg";
// import api from "../../api";
// import Spinner from "../ui/Spinner";
// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// const UserInfo = () => {
//   const { user } = useContext(AuthContext);

//   const [orderitems, setOrderItems] = useState([]);
//   const [userInfo, setUserInfo] = useState({});
//   const [loading, setLoading] = useState(true);

//   console.log(localStorage.getItem("access"));

//   useEffect(() => {
//     let mounted = true;

//     const fetchUserInfo = async () => {
//       try {
//         setLoading(true);
    
//         const res = await api.get("user_info");

//         const data = res?.data || {};

//         if (mounted) {
//           setUserInfo(data);
//           setOrderItems(data?.items || []);
//          }
//       } catch (error) {
//         console.error(
//           "Error fetching user info:",
//           error?.response?.data || error.message
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserInfo();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) {
//     return <Spinner loading={true} />;
//   }

//   return (
//     <div className="container">
//       <div className="row mb-4">

//         {/* Profile Card */}
//         <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//           <img
//             src={pic}
//             alt="profile"
//             className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//           />

//           <h4>
//             {userInfo?.first_name} {userInfo?.last_name}
//           </h4>

//           <p className="text-muted">
//             {userInfo?.email || "No email available"}
//           </p>

//           <button
//             className="btn mt-2"
//             style={{ backgroundColor: "#6050DC", color: "#fff" }}
//           >
//             Edit Profile
//           </button>
//         </div>

//         {/* Account Overview */}
//         <div className="col-md-9">
//           <div className="card">
//             <div
//               className="card-header"
//               style={{ backgroundColor: "#6050DC", color: "#fff" }}
//             >
//               <h5 className="mb-0">Account Overview</h5>
//             </div>

//             <div className="card-body">
//               <div className="row">

//                 <div className="col-md-6">
//                   <p>
//                     <strong>Full Name:</strong>{" "}
//                     {userInfo?.first_name} {userInfo?.username} {userInfo?.last_name}
//                   </p>

//                   <p>
//                     <strong>Email:</strong> {userInfo?.email || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Username:</strong> {userInfo?.username || "N/A"}
//                   </p>
//                 </div>

//                 <div className="col-md-6">
//                   <p>
//                     <strong>Phone:</strong>{" "}
//                     {userInfo?.phone || user?.phone || "N/A"}
//                   </p>

//                   <p>
//                     <strong>City:</strong>{" "}
//                     {userInfo?.city || user?.city || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Country:</strong>{" "}
//                     {userInfo?.country || user?.country || "N/A"}
//                   </p>
//                 </div>

//               </div>
//             </div>
//           </div>

//           {/* Order History */}
//           <div className="mt-4">
//             <OrderHistoryItemContainer orderitems={orderitems} />
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;

// import React, { useContext, useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import AuthContext from "../../Context/AuthContext";
// import pic from "../../assets/profile_pic.jpg"
// import api from "../../api"
// import Spinner from "../ui/spinner"
// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// const UserInfo = () => {
//   const { user } = useContext(AuthContext);
//   const [orderitems, setOrderItems] = useState([])
//   const [user_info, setUser_info] = useState({})
//   const [loading, setLoading]= useState(false)

//   useEffect(function(){
//     setLoading(true)
//     api.get("user_info")
//     .then(res =>{
//       console.log(res.data)
//       setUser_info(res.data)
//       setOrderItems(res.data.items)
//       setLoading(false)
//     })
//     .catch(err => {
//       console.log(err.message)
//       setLoading(false)
//     })
//   }, [])
// if(loading){
//   return <Spinner loading={loading} />
// }

//   return (
//     <div className="row mb-4">
//     <UserInfo user_info={user_info}/>
//     <OrderHistoryItemContainer  orderitems={orderitems}/>

//       {/* Profile Card */}
//       <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//         <img
//         src={pic}
//           alt="profile"
//           className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//         />

//         <h4>
//           {user_info?.first_name} {user_info?.last_name}
//         </h4>

//         <p className="text-muted">{user_info?.email}</p>

//         <button
//           className="btn mt-2"
//           style={{ backgroundColor: "#6050DC", color: "white" }}
//         >
//           Edit Profile
//         </button>
//       </div>

//       {/* Account Overview */}
//       <div className="col-md-9">
//         <div className="card">
//           <div
//             className="card-header"
//             style={{ backgroundColor: "#6050DC", color: "white" }}
//           >
//             <h5>Account Overview</h5>
//           </div>

//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <p>
//                   <strong>Full Name:</strong>{" "}
//                   {user_info?.first_name} {user_info?.username} {user_info?.last_name}
//                 </p>
//                 <p>
//                   <strong>Email:</strong> {user_info?.email}
//                 </p>
//                 <p>
//                   <strong>Username:</strong> {user_info?.username}
//                 </p>
//               </div>

//               <div className="col-md-6">
//                 <p>
//                   <strong>Phone:</strong> {user?.phone || "N/A"}
//                 </p>
//                 <p>
//                   <strong>City:</strong> {user?.city || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Country:</strong> {user ?.country || "N/A"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;




// import React, { useContext, useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import AuthContext from "../../Context/AuthContext";
// import pic from "../../assets/profile_pic.jpg"
// import api from "../../api"

// const UserInfo = () => {
//   const { user } = useContext(AuthContext);

//   const [user_info, setUser_info] = useState({})
//   const [loading, setLoading]= useState(false)

//   useEffect(function(){
//     setLoading(true)
//     api.get("user_info")
//     .then(res =>{
//       console.log(res.data)
//       setUser_info(res.data)
//       setLoading(false)
//     })
//     .catch(err => {
//       console.log(err.message)
//       setLoading(false)
//     })
//   }, [])

//   return (
//     <div className="row mb-4">
//       {/* Profile Card */}
//       <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//         <img
//         src={pic}
//           // src={
//           //   user?.profile_image?.trim()
//           //     ? user.profile_image
//           //     : "/default-avatar.png"
//           // }
//           alt="profile"
//           className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//         />

//         <h4>
//           {user?.first_name} {user?.last_name}
//         </h4>

//         <p className="text-muted">{user?.email}</p>

//         <button
//           className="btn mt-2"
//           style={{ backgroundColor: "#6050DC", color: "white" }}
//         >
//           Edit Profile
//         </button>
//       </div>

//       {/* Account Overview */}
//       <div className="col-md-9">
//         <div className="card">
//           <div
//             className="card-header"
//             style={{ backgroundColor: "#6050DC", color: "white" }}
//           >
//             <h5>Account Overview</h5>
//           </div>

//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <p>
//                   <strong>Full Name:</strong>{" "}
//                   {user?.first_name} {user?.last_name}
//                 </p>
//                 <p>
//                   <strong>Email:</strong> {user?.email}
//                 </p>
//                 <p>
//                   <strong>Username:</strong> {user?.username}
//                 </p>
//               </div>

//               <div className="col-md-6">
//                 <p>
//                   <strong>Phone:</strong> {user?.phone || "N/A"}
//                 </p>
//                 <p>
//                   <strong>City:</strong> {user?.city || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Country:</strong> {user?.country || "N/A"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;



// import React from 'react'
// import styles from "./UserInfo.module.css";
// import { useContext } from "react";
// import AuthContext from "../../Context/AuthContext";

// const UserInfo = () => {
//   return (
   
//     <div className="row mb-4">
//       <div className={`col-md-3 py-3 card ${styles.textCenter}`}>
//         {/* <img
//           src=""
//           alt="User Profile"
//           className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//         /> */}
//         <img
//           src={user?.profile_image?.trim() ? user.profile_image : null}
//           alt="profile"
//         />
//         <h4>John Doe</h4>
//         <p className="text-muted">john.doe@example.com</p>
//         <button className="btn mt-2" style={{ backgroundColor: '#6050DC', color: 'white' }}>Edit Profile</button>
//       </div>

//       <div className="col-md-9">
//         <div className="card">
//           <div className="card-header" style={{ backgroundColor: '#6050DC', color: 'white' }}>
//             <h5>Account Overview</h5>
//           </div>
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <p>
//                   <strong>Full Name:</strong> John Doe
//                 </p>
//                 <p>
//                   <strong>Email:</strong> john.doe@example.com
//                 </p>
//                 <p>
//                   <strong>Phone:</strong> +123 456 7890
//                 </p>
//               </div>
//               <div className="col-md-6">
//                 <p>
//                   <strong>City:</strong> New York
//                 </p>
//                 <p>
//                   <strong>Country:</strong> USA
//                 </p>
//                 <p>
//                   <strong>Member Since:</strong> January 2023
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UserInfo


