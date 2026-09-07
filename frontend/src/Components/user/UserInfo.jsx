import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./UserInfo.module.css";

import api, { BASE_URL } from "../../api";

import Spinner from "../ui/spinner";

import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

import { Link } from "react-router-dom";

import pic from "../../assets/profile_pic.jpg";


// ============================================================
// PROFILE IMAGE SETTINGS
// ============================================================

const MAX_PROFILE_IMAGE_SIZE = 25 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


// ============================================================
// EMPTY USER
// ============================================================

const EMPTY_USER = {
  id: null,
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  profile_picture: "",
  profile_picture_url: "",
  is_seller: false,
};


// ============================================================
// USER INFO
// ============================================================

const UserInfo = () => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [userInfo, setUserInfo] =
    useState(EMPTY_USER);

  const [orderItems, setOrderItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


  // ==========================================================
  // REFS
  // ==========================================================

  const fileInputRef =
    useRef(null);


  // ==========================================================
  // GET ACCESS TOKEN
  // ==========================================================

  const getAccessToken = () => {

    return (
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );

  };


  // ==========================================================
  // NORMALIZE USER DATA
  // ==========================================================
  //
  // Backend may return:
  //
  // {
  //    id: 1,
  //    username: "...",
  //    phone: "...",
  // }
  //
  // OR:
  //
  // {
  //    message: "...",
  //    user: {
  //       id: 1,
  //       username: "...",
  //       phone: "..."
  //    }
  // }
  //
  // ==========================================================

  const normalizeUser = useCallback(
    (responseData) => {

      const data =
        responseData?.user ||
        responseData ||
        {};


      return {

        id:
          data.id ??
          null,

        username:
          data.username ??
          "",

        first_name:
          data.first_name ??
          data.firstName ??
          "",

        last_name:
          data.last_name ??
          data.lastName ??
          "",

        email:
          data.email ??
          "",

        phone:
          data.phone ??
          data.phone_number ??
          "",

        country:
          data.country ??
          "",

        state:
          data.state ??
          "",

        city:
          data.city ??
          "",

        address:
          data.address ??
          "",

        profile_picture:
          data.profile_picture ??
          data.profile_image ??
          "",

        profile_picture_url:
          data.profile_picture_url ??
          data.profile_picture ??
          data.profile_image ??
          "",

        is_seller:
          Boolean(
            data.is_seller
          ),

      };

    },
    []
  );


  // ==========================================================
  // BUILD PROFILE IMAGE URL
  // ==========================================================

  const getProfileImageUrl = useCallback(
    (user) => {

      if (!user) {
        return pic;
      }


      const image =
        user.profile_picture_url ||
        user.profile_picture ||
        user.profile_image ||
        "";


      if (
        typeof image !== "string" ||
        !image.trim()
      ) {
        return pic;
      }


      const cleanImage =
        image.trim();


      // ------------------------------------------------------
      // FULL URL
      // ------------------------------------------------------

      if (
        cleanImage.startsWith("http://") ||
        cleanImage.startsWith("https://")
      ) {

        return cleanImage;

      }


      // ------------------------------------------------------
      // DATA URL
      // ------------------------------------------------------

      if (
        cleanImage.startsWith("data:")
      ) {

        return cleanImage;

      }


      // ------------------------------------------------------
      // RELATIVE DJANGO MEDIA URL
      // ------------------------------------------------------

      if (
        cleanImage.startsWith("/")
      ) {

        return `${BASE_URL}${cleanImage}`;

      }


      // ------------------------------------------------------
      // NORMAL RELATIVE PATH
      // ------------------------------------------------------

      return `${BASE_URL}/${cleanImage}`;

    },
    []
  );


  // ==========================================================
  // NORMALIZE ORDERS
  // ==========================================================

  const normalizeOrders = (
    responseData
  ) => {

    if (
      Array.isArray(responseData)
    ) {

      return responseData;

    }


    if (
      Array.isArray(
        responseData?.orders
      )
    ) {

      return responseData.orders;

    }


    if (
      Array.isArray(
        responseData?.results
      )
    ) {

      return responseData.results;

    }


    if (
      Array.isArray(
        responseData?.data
      )
    ) {

      return responseData.data;

    }


    if (
      Array.isArray(
        responseData?.order_items
      )
    ) {

      return responseData.order_items;

    }


    if (
      Array.isArray(
        responseData?.items
      )
    ) {

      return responseData.items;

    }


    return [];

  };


  // ==========================================================
  // FETCH USER
  // ==========================================================

  const fetchUser = useCallback(
    async () => {

      const response =
        await api.get(
          "/user/"
        );


      console.log(
        "========== USER FROM SERVER =========="
      );

      console.log(
        response.data
      );


      const normalizedUser =
        normalizeUser(
          response.data
        );


      console.log(
        "========== NORMALIZED USER =========="
      );

      console.log(
        normalizedUser
      );

      console.log(
        "PHONE:",
        normalizedUser.phone
      );

      console.log(
        "COUNTRY:",
        normalizedUser.country
      );

      console.log(
        "STATE:",
        normalizedUser.state
      );

      console.log(
        "CITY:",
        normalizedUser.city
      );

      console.log(
        "ADDRESS:",
        normalizedUser.address
      );

      console.log(
        "PROFILE:",
        normalizedUser.profile_picture_url
      );


      setUserInfo(
        normalizedUser
      );


      return normalizedUser;

    },
    [normalizeUser]
  );


  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  const fetchOrders = useCallback(
    async () => {

      try {

        const response =
          await api.get(
            "/my-orders/"
          );


        console.log(
          "========== ORDERS FROM SERVER =========="
        );

        console.log(
          response.data
        );


        const orders =
          normalizeOrders(
            response.data
          );


        console.log(
          "NORMALIZED ORDERS:",
          orders
        );


        setOrderItems(
          orders
        );

      }

      catch (error) {

        console.error(
          "ERROR FETCHING ORDERS:",
          error?.response?.data ||
          error?.message ||
          error
        );


        // Orders failing should NOT
        // destroy the profile page.

        setOrderItems([]);

      }

    },
    []
  );


  // ==========================================================
  // FETCH ALL PROFILE DATA
  // ==========================================================

  const fetchUserData = useCallback(
    async () => {

      const token =
        getAccessToken();


      if (!token) {

        console.error(
          "No access token found."
        );

        setUserInfo(
          EMPTY_USER
        );

        setOrderItems([]);

        setLoading(false);

        return;

      }


      try {

        setLoading(true);

        setErrorMessage("");


        // ----------------------------------------------------
        // USER IS THE IMPORTANT REQUEST
        // ----------------------------------------------------

        await fetchUser();


        // ----------------------------------------------------
        // ORDERS ARE SEPARATE
        // ----------------------------------------------------

        await fetchOrders();

      }

      catch (error) {

        console.error(
          "ERROR FETCHING PROFILE DATA:",
          error?.response?.data ||
          error?.message ||
          error
        );


        const status =
          error?.response?.status;


        if (
          status === 401 ||
          status === 403
        ) {

          setErrorMessage(
            "Your session has expired. Please log in again."
          );

        }

        else {

          setErrorMessage(
            "Unable to load your profile information."
          );

        }

      }

      finally {

        setLoading(false);

      }

    },
    [
      fetchOrders,
      fetchUser,
    ]
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    fetchUserData();

  }, [fetchUserData]);


  // ==========================================================
  // CLEAN PREVIEW URL WHEN COMPONENT UNMOUNTS
  // ==========================================================

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(
          previewUrl
        );

      }

    };

  }, [previewUrl]);


  // ==========================================================
  // SELECT PROFILE IMAGE
  // ==========================================================

  const handleImageChange = async (
    event
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    console.log(
      "========== SELECTED PROFILE IMAGE =========="
    );

    console.log(
      "NAME:",
      file.name
    );

    console.log(
      "SIZE:",
      file.size
    );

    console.log(
      "TYPE:",
      file.type
    );


    // ======================================================
    // VALIDATE IMAGE TYPE
    // ======================================================

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {

      alert(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );


      event.target.value =
        "";


      return;

    }


    // ======================================================
    // VALIDATE IMAGE SIZE
    // ======================================================

    if (
      file.size >
      MAX_PROFILE_IMAGE_SIZE
    ) {

      alert(
        "Profile picture must not exceed 25 MB."
      );


      event.target.value =
        "";


      return;

    }


    // ======================================================
    // REMOVE PREVIOUS PREVIEW
    // ======================================================

    if (previewUrl) {

      URL.revokeObjectURL(
        previewUrl
      );

    }


    // ======================================================
    // CREATE PREVIEW
    // ======================================================

    const objectUrl =
      URL.createObjectURL(
        file
      );


    setPreviewUrl(
      objectUrl
    );


    // ======================================================
    // UPLOAD AUTOMATICALLY
    // ======================================================

    await uploadProfilePicture(
      file
    );

  };


  // ==========================================================
  // UPLOAD PROFILE IMAGE
  // ==========================================================

  const uploadProfilePicture = async (
    file
  ) => {

    if (!file) {

      alert(
        "Please select a profile picture first."
      );

      return;

    }


    try {

      setUploading(true);

      setErrorMessage("");


      // ====================================================
      // FORM DATA
      // ====================================================

      const formData =
        new FormData();


      formData.append(
        "profile_picture",
        file
      );


      console.log(
        "========== UPLOADING PROFILE IMAGE =========="
      );

      console.log(
        "FILE:",
        file.name
      );


      // ====================================================
      // SEND TO DJANGO
      // ====================================================

      /*
        IMPORTANT:

        Do NOT manually add:

        Content-Type:
        multipart/form-data

        Axios will create the correct
        multipart boundary automatically.
      */

      const response =
        await api.patch(
          "/profile/update/",
          formData
        );


      console.log(
        "========== PROFILE UPDATE RESPONSE =========="
      );

      console.log(
        response.data
      );


      // ====================================================
      // UPDATE FROM RESPONSE
      // ====================================================

      const responseUser =
        normalizeUser(
          response.data
        );


      setUserInfo(
        (previousUser) => ({
          ...previousUser,
          ...responseUser,
        })
      );


      // ====================================================
      // GET FRESH USER FROM DATABASE
      // ====================================================

      const latestUser =
        await fetchUser();


      console.log(
        "========== USER AFTER IMAGE UPLOAD =========="
      );

      console.log(
        latestUser
      );


      // ====================================================
      // REMOVE TEMPORARY PREVIEW
      // ====================================================

      setPreviewUrl(
        ""
      );


      // ====================================================
      // RESET INPUT
      // ====================================================

      if (
        fileInputRef.current
      ) {

        fileInputRef.current.value =
          "";

      }


      alert(
        "Profile picture uploaded successfully."
      );

    }

    catch (error) {

      console.error(
        "========== PROFILE IMAGE UPLOAD ERROR =========="
      );

      console.error(
        error?.response?.data ||
        error?.message ||
        error
      );


      const errorData =
        error?.response?.data;


      let message =
        "Failed to upload profile picture.";


      if (
        typeof errorData ===
        "string"
      ) {

        message =
          errorData;

      }

      else if (
        errorData?.profile_picture
      ) {

        const value =
          errorData.profile_picture;

        message =
          Array.isArray(value)
            ? value[0]
            : value;

      }

      else if (
        errorData?.detail
      ) {

        message =
          errorData.detail;

      }

      else if (
        errorData?.error
      ) {

        message =
          errorData.error;

      }

      else if (
        errorData?.message
      ) {

        message =
          errorData.message;

      }


      setErrorMessage(
        message
      );


      alert(
        message
      );


      // ----------------------------------------------------
      // Remove failed preview
      // ----------------------------------------------------

      setPreviewUrl(
        ""
      );

    }

    finally {

      setUploading(
        false
      );

    }

  };


  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const profileImage =
    previewUrl ||
    getProfileImageUrl(
      userInfo
    );


  // ==========================================================
  // USER NAME
  // ==========================================================

  const firstName =
    userInfo?.first_name ||
    "";

  const lastName =
    userInfo?.last_name ||
    "";


  const fullName =
    `${firstName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim() ||
    userInfo?.username ||
    "User";


  const username =
    userInfo?.username
      ? `@${userInfo.username}`
      : "";


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div
        className={
          styles.loading
        }
      >

        <Spinner
          loading={true}
        />

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className={
        styles.profile
      }
    >


      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {errorMessage && (

        <div
          className="alert alert-warning"
          role="alert"
        >

          {errorMessage}

        </div>

      )}


      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <section
        className={
          styles.profileTop
        }
      >

        <div
          className={
            styles.identity
          }
        >


          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <div
            className={
              styles.avatarWrapper
            }
          >

            <img
              src={profileImage}
              alt={`${fullName} profile`}
              className={
                styles.avatar
              }

              onError={(event) => {

                console.error(
                  "PROFILE IMAGE FAILED:",
                  event.currentTarget.src
                );


                event.currentTarget.onerror =
                  null;


                event.currentTarget.src =
                  pic;

              }}
            />


            {/* ===============================================
                CAMERA BUTTON
            ================================================ */}

            <button
              type="button"

              className={
                styles.avatarCamera
              }

              title={
                uploading
                  ? "Uploading profile picture..."
                  : "Change profile picture"
              }

              aria-label={
                uploading
                  ? "Uploading profile picture"
                  : "Change profile picture"
              }

              disabled={
                uploading
              }

              onClick={() => {

                if (
                  !uploading &&
                  fileInputRef.current
                ) {

                  fileInputRef.current.click();

                }

              }}
            >

              {uploading ? (

                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />

              ) : (

                <span
                  className={
                    styles.cameraIcon
                  }
                >
                  📷
                </span>

              )}

            </button>


            {/* ===============================================
                FILE INPUT
            ================================================ */}

            <input
              ref={fileInputRef}

              type="file"

              accept="
                image/jpeg,
                image/png,
                image/webp
              "

              onChange={
                handleImageChange
              }

              className={
                styles.fileInput
              }
            />

          </div>


          {/* =================================================
              USER INFORMATION
          ================================================== */}

          <div
            className={
              styles.identityInfo
            }
          >

            <span
              className={
                styles.smallLabel
              }
            >
              WELCOME BACK
            </span>


            <h2>
              {fullName}
            </h2>


            {username && (

              <p>
                {username}
              </p>

            )}

          </div>


        </div>


        {/* =================================================
            EDIT PROFILE
        ================================================== */}

        <Link
          to="/profile/edit"
          className={
            styles.editButton
          }
        >

          <span
            className={
              styles.editIcon
            }
          >
            ✎
          </span>

          Edit Profile

        </Link>


      </section>


      {/* =====================================================
          ACCOUNT INFORMATION
      ====================================================== */}

      <section
        className={
          styles.accountGrid
        }
      >


        {/* =================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div
          className={
            styles.infoCard
          }
        >

          <div
            className={
              styles.cardHeading
            }
          >

            <div>

              <span
                className={
                  styles.cardEyebrow
                }
              >
                ACCOUNT
              </span>

              <h3>
                Personal Information
              </h3>

            </div>

          </div>


          <div
            className={
              styles.details
            }
          >

            {/* FULL NAME */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                Full Name
              </span>

              <strong>
                {fullName}
              </strong>

            </div>


            {/* USERNAME */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                Username
              </span>

              <strong>
                {userInfo.username ||
                  "N/A"}
              </strong>

            </div>


            {/* EMAIL */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                Email
              </span>

              <strong>
                {userInfo.email ||
                  "N/A"}
              </strong>

            </div>


            {/* PHONE */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                Phone
              </span>

              <strong>
                {userInfo.phone ||
                  "N/A"}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            LOCATION DETAILS
        ================================================== */}

        <div
          className={
            styles.infoCard
          }
        >

          <div
            className={
              styles.cardHeading
            }
          >

            <div>

              <span
                className={
                  styles.cardEyebrow
                }
              >
                DELIVERY
              </span>

              <h3>
                Location Details
              </h3>

            </div>

          </div>


          <div
            className={
              styles.details
            }
          >

            {/* STATE */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                State
              </span>

              <strong>
                {userInfo.state ||
                  "N/A"}
              </strong>

            </div>


            {/* CITY */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                City
              </span>

              <strong>
                {userInfo.city ||
                  "N/A"}
              </strong>

            </div>


            {/* COUNTRY */}

            <div
              className={
                styles.detail
              }
            >

              <span>
                Country
              </span>

              <strong>
                {userInfo.country ||
                  "N/A"}
              </strong>

            </div>


            {/* ADDRESS */}

            <div
              className={`
                ${styles.detail}
                ${styles.fullWidth || ""}
              `}
            >

              <span>
                Address
              </span>

              <strong>
                {userInfo.address ||
                  "N/A"}
              </strong>

            </div>

          </div>

        </div>


      </section>


      {/* =====================================================
          ORDER HISTORY
      ====================================================== */}

      <section
        className={
          styles.ordersSection
        }
      >

        <div
          className={
            styles.ordersHeading
          }
        >

          <div>

            <span
              className={
                styles.cardEyebrow
              }
            >
              YOUR ACTIVITY
            </span>


            <h2>
              Order History
            </h2>


            <p>
              View your recent orders and
              purchase activity.
            </p>

          </div>


          {orderItems.length > 0 && (

            <span
              className={
                styles.orderCount
              }
            >

              {orderItems.length}

              {" "}

              {orderItems.length === 1
                ? "Order"
                : "Orders"}

            </span>

          )}

        </div>


        {/* =================================================
            ORDER LIST
        ================================================== */}

        {orderItems.length > 0 ? (

          <OrderHistoryItemContainer
            orderitems={
              orderItems
            }
          />

        ) : (

          <div
            className={
              styles.emptyOrders
            }
          >

            <div
              className={
                styles.emptyIcon
              }
            >
              🛍
            </div>


            <h3>
              No Order History
            </h3>


            <p>
              Your orders and purchase history
              will appear here.
            </p>


            <Link
              to="/shop"
              className={
                styles.shopButton
              }
            >
              Continue Shopping
            </Link>

          </div>

        )}

      </section>


    </div>

  );

};


export default UserInfo;









// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import styles from "./UserInfo.module.css";

// import api, {
//   BASE_URL,
// } from "../../api";

// import Spinner from "../ui/Spinner";

// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// import { Link } from "react-router-dom";

// import pic from "../../assets/profile_pic.jpg";


// // ============================================================
// // PROFILE IMAGE SETTINGS
// // ============================================================

// const MAX_PROFILE_IMAGE_SIZE =
//   25 * 1024 * 1024;


// // ============================================================
// // USER INFO
// // ============================================================

// const UserInfo = () => {

//   // ==========================================================
//   // STATE
//   // ==========================================================

//   const [userInfo, setUserInfo] = useState({});
//   const [orderItems, setOrderItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState("");

//   const fileInputRef = useRef(null);


//   // ==========================================================
//   // BUILD PROFILE IMAGE URL
//   // ==========================================================

//   const getProfileImageUrl = (user) => {

//     if (!user) {
//       return pic;
//     }

//     const image =
//       user.profile_picture_url ||
//       user.profile_picture ||
//       "";

//     // No image
//     if (!image) {
//       return pic;
//     }

//     // Complete URL
//     if (
//       image.startsWith("http://") ||
//       image.startsWith("https://")
//     ) {
//       return image;
//     }

//     // Relative Django media URL
//     if (image.startsWith("/")) {
//       return `${BASE_URL}${image}`;
//     }

//     // Relative path
//     return `${BASE_URL}/${image}`;
//   };


//   // ==========================================================
//   // FETCH USER + ORDER HISTORY
//   // ==========================================================

//   const fetchUserData = async () => {

//     try {

//       setLoading(true);

//       // ------------------------------------------------------
//       // CHECK LOGIN
//       // ------------------------------------------------------

//       const token =
//         localStorage.getItem("access") ||
//         localStorage.getItem("access_token") ||
//         localStorage.getItem("token");

//       if (!token) {

//         console.error(
//           "No access token found"
//         );

//         setLoading(false);

//         return;
//       }


//       // ------------------------------------------------------
//       // FETCH USER
//       // ------------------------------------------------------

//       const userResponse =
//         await api.get("/user/");

//       console.log(
//         "USER RESPONSE:",
//         userResponse.data
//       );


//       // ------------------------------------------------------
//       // FETCH ORDERS
//       // ------------------------------------------------------

//       const ordersResponse =
//         await api.get("/my-orders/");

//       console.log(
//         "ORDERS RESPONSE:",
//         ordersResponse.data
//       );


//       // ------------------------------------------------------
//       // SAVE USER
//       // ------------------------------------------------------

//       setUserInfo(
//         userResponse.data || {}
//       );


//       // ======================================================
//       // NORMALIZE ORDER RESPONSE
//       // ======================================================

//       const orderData =
//         ordersResponse.data;

//       let orders = [];


//       if (
//         Array.isArray(orderData)
//       ) {

//         orders =
//           orderData;

//       }

//       else if (
//         Array.isArray(orderData?.orders)
//       ) {

//         orders =
//           orderData.orders;

//       }

//       else if (
//         Array.isArray(orderData?.results)
//       ) {

//         orders =
//           orderData.results;

//       }

//       else if (
//         Array.isArray(orderData?.data)
//       ) {

//         orders =
//           orderData.data;

//       }

//       else if (
//         Array.isArray(orderData?.order_items)
//       ) {

//         orders =
//           orderData.order_items;

//       }


//       console.log(
//         "NORMALIZED ORDER HISTORY:",
//         orders
//       );


//       setOrderItems(
//         orders
//       );

//     }

//     catch (error) {

//       console.error(
//         "ERROR FETCHING PROFILE DATA:",
//         error.response?.data ||
//         error.message ||
//         error
//       );

//     }

//     finally {

//       setLoading(false);

//     }
//   };


//   // ==========================================================
//   // INITIAL LOAD
//   // ==========================================================

//   useEffect(() => {

//     fetchUserData();

//   }, []);


//   // ==========================================================
//   // CLEAN UP PREVIEW URL
//   // ==========================================================

//   useEffect(() => {

//     return () => {

//       if (previewUrl) {

//         URL.revokeObjectURL(
//           previewUrl
//         );

//       }

//     };

//   }, [previewUrl]);


//   // ==========================================================
//   // UPLOAD PROFILE PICTURE
//   // ==========================================================

//   const uploadProfilePicture = async (
//     file,
//     temporaryPreview
//   ) => {

//     if (!file) {
//       return;
//     }


//     try {

//       setUploading(true);


//       // ------------------------------------------------------
//       // FORM DATA
//       // ------------------------------------------------------

//       const formData =
//         new FormData();

//       formData.append(
//         "profile_picture",
//         file
//       );


//       console.log(
//         "UPLOADING PROFILE PICTURE:",
//         file.name
//       );


//       // ------------------------------------------------------
//       // SEND TO DJANGO
//       // ------------------------------------------------------

//       const response =
//         await api.patch(
//           "/profile/update/",
//           formData
//         );


//       console.log(
//         "PROFILE UPDATE RESPONSE:",
//         response.data
//       );


//       // ------------------------------------------------------
//       // GET UPDATED USER
//       // ------------------------------------------------------

//       const latestUserResponse =
//         await api.get(
//           "/user/"
//         );


//       console.log(
//         "UPDATED USER:",
//         latestUserResponse.data
//       );


//       // ------------------------------------------------------
//       // UPDATE STATE
//       // ------------------------------------------------------

//       setUserInfo(
//         latestUserResponse.data || {}
//       );


//       // ------------------------------------------------------
//       // REMOVE TEMPORARY PREVIEW
//       // ------------------------------------------------------

//       if (temporaryPreview) {

//         URL.revokeObjectURL(
//           temporaryPreview
//         );

//       }

//       setPreviewUrl("");


//       // ------------------------------------------------------
//       // RESET INPUT
//       // ------------------------------------------------------

//       if (fileInputRef.current) {

//         fileInputRef.current.value =
//           "";

//       }


//       console.log(
//         "PROFILE PICTURE UPLOADED SUCCESSFULLY"
//       );

//     }

//     catch (error) {

//       console.error(
//         "PROFILE PICTURE UPLOAD ERROR:",
//         error.response?.data ||
//         error.message ||
//         error
//       );


//       alert(
//         error.response?.data?.detail ||
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         "Failed to upload profile picture. Please try again."
//       );

//     }

//     finally {

//       setUploading(false);

//     }
//   };


//   // ==========================================================
//   // SELECT PROFILE PICTURE
//   // ==========================================================

//   const handleImageChange = async (
//     event
//   ) => {

//     const file =
//       event.target.files?.[0];


//     if (!file) {
//       return;
//     }


//     // ========================================================
//     // VALID FILE TYPE
//     // ========================================================

//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/webp",
//     ];


//     if (
//       !allowedTypes.includes(
//         file.type
//       )
//     ) {

//       alert(
//         "Please select a JPG, JPEG, PNG or WEBP image."
//       );

//       event.target.value = "";

//       return;
//     }


//     // ========================================================
//     // VALID FILE SIZE
//     // ========================================================

//     if (
//       file.size >
//       MAX_PROFILE_IMAGE_SIZE
//     ) {

//       alert(
//         "Profile picture must not exceed 25 MB."
//       );

//       event.target.value = "";

//       return;
//     }


//     // ========================================================
//     // REMOVE PREVIOUS PREVIEW
//     // ========================================================

//     if (previewUrl) {

//       URL.revokeObjectURL(
//         previewUrl
//       );

//     }


//     // ========================================================
//     // CREATE PREVIEW
//     // ========================================================

//     const objectUrl =
//       URL.createObjectURL(
//         file
//       );


//     setPreviewUrl(
//       objectUrl
//     );


//     // ========================================================
//     // AUTOMATIC UPLOAD
//     // ========================================================

//     await uploadProfilePicture(
//       file,
//       objectUrl
//     );
//   };


//   // ==========================================================
//   // PROFILE IMAGE
//   // ==========================================================

//   const profileImage =
//     previewUrl ||
//     getProfileImageUrl(
//       userInfo
//     );


//   // ==========================================================
//   // USER NAME
//   // ==========================================================

//   const firstName =
//     userInfo?.first_name || "";

//   const lastName =
//     userInfo?.last_name || "";

//   const fullName =
//     `${firstName} ${lastName}`.trim() ||
//     userInfo?.username ||
//     "User";


//   // ==========================================================
//   // USERNAME
//   // ==========================================================

//   const username =
//     userInfo?.username
//       ? `@${userInfo.username}`
//       : "";


//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {

//     return (
//       <div className={styles.loading}>
//         <Spinner loading={true} />
//       </div>
//     );

//   }


//   // ==========================================================
//   // PAGE
//   // ==========================================================

//   return (

//     <div className={styles.profile}>


//       {/* =====================================================
//           PROFILE HEADER
//       ====================================================== */}

//       <section className={styles.profileTop}>


//         {/* ===================================================
//             LEFT SIDE
//         ==================================================== */}

//         <div className={styles.identity}>


//           {/* =================================================
//               PROFILE IMAGE
//           ================================================== */}

//           <div className={styles.avatarWrapper}>

//             <img
//               src={profileImage}
//               alt={`${fullName} profile`}
//               className={styles.avatar}

//               onError={(event) => {

//                 console.error(
//                   "PROFILE IMAGE FAILED:",
//                   event.currentTarget.src
//                 );

//                 event.currentTarget.src =
//                   pic;

//               }}
//             />


//             {/* ===============================================
//                 CAMERA BUTTON
//             =============================================== */}

//             <button
//               type="button"
//               className={styles.avatarCamera}

//               title={
//                 uploading
//                   ? "Uploading profile picture..."
//                   : "Change profile picture"
//               }

//               aria-label="Change profile picture"

//               disabled={uploading}

//               onClick={() => {

//                 if (
//                   !uploading &&
//                   fileInputRef.current
//                 ) {

//                   fileInputRef.current.click();

//                 }

//               }}
//             >

//               {uploading ? (

//                 <span
//                   className="spinner-border spinner-border-sm"
//                   role="status"
//                   aria-hidden="true"
//                 />

//               ) : (

//                 <span
//                   className={styles.cameraIcon}
//                 >
//                   📷
//                 </span>

//               )}

//             </button>


//             {/* ===============================================
//                 HIDDEN FILE INPUT
//             =============================================== */}

//             <input
//               ref={fileInputRef}
//               type="file"

//               accept="
//                 image/jpeg,
//                 image/jpg,
//                 image/png,
//                 image/webp
//               "

//               onChange={
//                 handleImageChange
//               }

//               className={styles.fileInput}
//             />

//           </div>


//           {/* =================================================
//               USER IDENTITY
//           ================================================== */}

//           <div className={styles.identityInfo}>

//             <span className={styles.smallLabel}>
//               WELCOME BACK
//             </span>

//             <h2>
//               {fullName}
//             </h2>

//             {username && (

//               <p>
//                 {username}
//               </p>

//             )}

//           </div>

//         </div>


//         {/* ===================================================
//             EDIT PROFILE
//         ==================================================== */}

//         <Link
//           to="/profile/edit"
//           className={styles.editButton}
//         >

//           <span className={styles.editIcon}>
//             ✎
//           </span>

//           Edit Profile

//         </Link>

//       </section>


//       {/* =====================================================
//           ACCOUNT INFORMATION
//       ====================================================== */}

//       <section className={styles.accountGrid}>


//         {/* ===================================================
//             PERSONAL INFORMATION
//         ==================================================== */}

//         <div className={styles.infoCard}>

//           <div className={styles.cardHeading}>

//             <div>

//               <span className={styles.cardEyebrow}>
//                 ACCOUNT
//               </span>

//               <h3>
//                 Personal Information
//               </h3>

//             </div>

//             <div className={styles.cardIcon}>
//               ♙
//             </div>

//           </div>


//           <div className={styles.details}>


//             <div className={styles.detail}>

//               <span>
//                 Full Name
//               </span>

//               <strong>
//                 {fullName}
//               </strong>

//             </div>


//             <div className={styles.detail}>

//               <span>
//                 Username
//               </span>

//               <strong>
//                 {userInfo.username || "N/A"}
//               </strong>

//             </div>


//             <div className={styles.detail}>

//               <span>
//                 Email
//               </span>

//               <strong>
//                 {userInfo.email || "N/A"}
//               </strong>

//             </div>


//             <div className={styles.detail}>

//               <span>
//                 Phone
//               </span>

//               <strong>
//                 {userInfo.phone || "N/A"}
//               </strong>

//             </div>

//           </div>

//         </div>


//         {/* ===================================================
//             LOCATION INFORMATION
//         ==================================================== */}

//         <div className={styles.infoCard}>

//           <div className={styles.cardHeading}>

//             <div>

//               <span className={styles.cardEyebrow}>
//                 DELIVERY
//               </span>

//               <h3>
//                 Location Details
//               </h3>

//             </div>

//             <div className={styles.cardIcon}>
//               ⌖
//             </div>

//           </div>


//           <div className={styles.details}>


//             <div className={styles.detail}>

//               <span>
//                 City
//               </span>

//               <strong>
//                 {userInfo.city || "N/A"}
//               </strong>

//             </div>


//             <div className={styles.detail}>

//               <span>
//                 Country
//               </span>

//               <strong>
//                 {userInfo.country || "N/A"}
//               </strong>

//             </div>


//             <div
//               className={`${styles.detail} ${styles.fullWidth}`}
//             >

//               <span>
//                 Address
//               </span>

//               <strong>
//                 {userInfo.address || "N/A"}
//               </strong>

//             </div>

//           </div>

//         </div>

//       </section>


//       {/* =====================================================
//           ORDER / SALES HISTORY
//       ====================================================== */}

//       <section className={styles.ordersSection}>


//         {/* ===================================================
//             ORDERS HEADER
//         ==================================================== */}

//         <div className={styles.ordersHeading}>

//           <div>

//             <span className={styles.cardEyebrow}>
//               YOUR ACTIVITY
//             </span>

//             <h2>
//               Sales History
//             </h2>

//             <p>
//               View your recent orders and
//               purchase activity.
//             </p>

//           </div>


//           {orderItems.length > 0 && (

//             <span className={styles.orderCount}>

//               {orderItems.length}

//               {" "}

//               {orderItems.length === 1
//                 ? "Order"
//                 : "Orders"}

//             </span>

//           )}

//         </div>


//         {/* ===================================================
//             ORDERS
//         ==================================================== */}

//         {orderItems.length > 0 ? (

//           <OrderHistoryItemContainer
//             orderitems={
//               orderItems
//             }
//           />

//         ) : (

//           <div className={styles.emptyOrders}>

//             <div className={styles.emptyIcon}>
//               🛍
//             </div>

//             <h3>
//               No Sales History
//             </h3>

//             <p>
//               Your orders and sales
//               history will appear here.
//             </p>

//             <Link
//               to="/shop"
//               className={styles.shopButton}
//             >
//               Continue Shopping
//             </Link>

//           </div>

//         )}

//       </section>

//     </div>

//   );
// };


// export default UserInfo;












// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import styles from "./UserInfo.module.css";

// import api, {
//   BASE_URL,
// } from "../../api";

// import Spinner from "../ui/Spinner";

// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";

// import { Link } from "react-router-dom";

// import pic from "../../assets/profile_pic.jpg";


// // ============================================================
// // PROFILE IMAGE SETTINGS
// // ============================================================

// // Maximum profile picture size: 25 MB
// const MAX_PROFILE_IMAGE_SIZE =
//   25 * 1024 * 1024;


// // ============================================================
// // USER INFO
// // ============================================================

// const UserInfo = () => {

//   // ==========================================================
//   // STATE
//   // ==========================================================

//   const [userInfo, setUserInfo] =
//     useState({});

//   const [orderItems, setOrderItems] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [uploading, setUploading] =
//     useState(false);

//   const [previewUrl, setPreviewUrl] =
//     useState("");

//   const fileInputRef =
//     useRef(null);


//   // ==========================================================
//   // BUILD PROFILE IMAGE URL
//   // ==========================================================

//   const getProfileImageUrl = (user) => {

//     if (!user) {
//       return pic;
//     }

//     const image =
//       user.profile_picture_url ||
//       user.profile_picture ||
//       "";

//     // --------------------------------------------------------
//     // No profile image
//     // --------------------------------------------------------

//     if (!image) {
//       return pic;
//     }

//     // --------------------------------------------------------
//     // Already a complete URL
//     // --------------------------------------------------------

//     if (
//       image.startsWith("http://") ||
//       image.startsWith("https://")
//     ) {
//       return image;
//     }

//     // --------------------------------------------------------
//     // Relative Django media URL
//     // Example:
//     // /media/profile_pictures/image.jpg
//     // --------------------------------------------------------

//     if (image.startsWith("/")) {
//       return `${BASE_URL}${image}`;
//     }

//     // --------------------------------------------------------
//     // Relative path without /
//     // --------------------------------------------------------

//     return `${BASE_URL}/${image}`;
//   };


//   // ==========================================================
//   // FETCH USER + SALES HISTORY
//   // ==========================================================

//   const fetchUserData = async () => {

//     try {

//       setLoading(true);


//       // ------------------------------------------------------
//       // CHECK LOGIN
//       // ------------------------------------------------------

//       const token =
//         localStorage.getItem("access") ||
//         localStorage.getItem("access_token") ||
//         localStorage.getItem("token");


//       if (!token) {

//         console.error(
//           "No access token found"
//         );

//         setLoading(false);

//         return;
//       }


//       // ------------------------------------------------------
//       // FETCH USER
//       // ------------------------------------------------------

//       const userResponse =
//         await api.get("/user/");


//       console.log(
//         "USER RESPONSE:",
//         userResponse.data
//       );


//       // ------------------------------------------------------
//       // FETCH ORDERS / SALES HISTORY
//       // ------------------------------------------------------

//       const ordersResponse =
//         await api.get("/my-orders/");


//       console.log(
//         "ORDERS RESPONSE:",
//         ordersResponse.data
//       );


//       // ------------------------------------------------------
//       // SAVE USER INFORMATION
//       // ------------------------------------------------------

//       setUserInfo(
//         userResponse.data || {}
//       );


//       // ======================================================
//       // NORMALIZE ORDER RESPONSE
//       // ======================================================

//       const orderData =
//         ordersResponse.data;


//       let orders = [];


//       // ------------------------------------------------------
//       // Response is directly an array
//       // ------------------------------------------------------

//       if (
//         Array.isArray(orderData)
//       ) {

//         orders =
//           orderData;

//       }


//       // ------------------------------------------------------
//       // Response:
//       // { orders: [] }
//       // ------------------------------------------------------

//       else if (
//         Array.isArray(
//           orderData?.orders
//         )
//       ) {

//         orders =
//           orderData.orders;

//       }


//       // ------------------------------------------------------
//       // Response:
//       // { results: [] }
//       // ------------------------------------------------------

//       else if (
//         Array.isArray(
//           orderData?.results
//         )
//       ) {

//         orders =
//           orderData.results;

//       }


//       // ------------------------------------------------------
//       // Response:
//       // { data: [] }
//       // ------------------------------------------------------

//       else if (
//         Array.isArray(
//           orderData?.data
//         )
//       ) {

//         orders =
//           orderData.data;

//       }


//       // ------------------------------------------------------
//       // Response:
//       // { order_items: [] }
//       // ------------------------------------------------------

//       else if (
//         Array.isArray(
//           orderData?.order_items
//         )
//       ) {

//         orders =
//           orderData.order_items;

//       }


//       console.log(
//         "NORMALIZED SALES / ORDER HISTORY:",
//         orders
//       );


//       setOrderItems(
//         orders
//       );


//     } catch (error) {

//       console.error(
//         "ERROR FETCHING PROFILE DATA:",
//         error.response?.data ||
//         error.message ||
//         error
//       );

//     } finally {

//       setLoading(false);

//     }
//   };


//   // ==========================================================
//   // INITIAL LOAD
//   // ==========================================================

//   useEffect(() => {

//     fetchUserData();

//   }, []);


//   // ==========================================================
//   // UPLOAD PROFILE PICTURE
//   // ==========================================================

//   const uploadProfilePicture = async (
//     file,
//     temporaryPreview
//   ) => {

//     if (!file) {
//       return;
//     }


//     try {

//       setUploading(true);


//       // ======================================================
//       // CREATE FORM DATA
//       // ======================================================

//       const formData =
//         new FormData();


//       formData.append(
//         "profile_picture",
//         file
//       );


//       console.log(
//         "UPLOADING PROFILE PICTURE:",
//         file.name
//       );


//       // ======================================================
//       // SEND IMAGE TO DJANGO
//       // ======================================================

//       const response =
//         await api.patch(
//           "/profile/update/",
//           formData
//         );


//       console.log(
//         "PROFILE UPDATE RESPONSE:",
//         response.data
//       );


//       // ======================================================
//       // GET UPDATED USER FROM SERVER
//       // ======================================================

//       const latestUserResponse =
//         await api.get(
//           "/user/"
//         );


//       console.log(
//         "USER AFTER PROFILE IMAGE UPLOAD:",
//         latestUserResponse.data
//       );


//       // ======================================================
//       // UPDATE USER STATE
//       // ======================================================

//       setUserInfo(
//         latestUserResponse.data || {}
//       );


//       // ======================================================
//       // REMOVE TEMPORARY PREVIEW
//       // ======================================================

//       if (temporaryPreview) {

//         URL.revokeObjectURL(
//           temporaryPreview
//         );

//       }


//       setPreviewUrl("");


//       // ======================================================
//       // RESET FILE INPUT
//       // ======================================================

//       if (
//         fileInputRef.current
//       ) {

//         fileInputRef.current.value =
//           "";

//       }


//       console.log(
//         "PROFILE PICTURE UPLOADED SUCCESSFULLY"
//       );


//     } catch (error) {

//       console.error(
//         "PROFILE PICTURE UPLOAD ERROR:",
//         error.response?.data ||
//         error.message ||
//         error
//       );


//       // ------------------------------------------------------
//       // Keep the preview visible so the user can see
//       // what was selected, but inform them that upload failed.
//       // ------------------------------------------------------

//       alert(
//         error.response?.data?.detail ||
//         error.response?.data?.error ||
//         error.response?.data?.message ||
//         "Failed to upload profile picture. Please try again."
//       );

//     } finally {

//       setUploading(false);

//     }
//   };


//   // ==========================================================
//   // SELECT PROFILE PICTURE
//   // ==========================================================

//   const handleImageChange = async (
//     event
//   ) => {

//     const file =
//       event.target.files?.[0];


//     // --------------------------------------------------------
//     // No file selected
//     // --------------------------------------------------------

//     if (!file) {
//       return;
//     }


//     console.log(
//       "SELECTED PROFILE IMAGE:",
//       file.name,
//       file.size,
//       file.type
//     );


//     // ========================================================
//     // VALID IMAGE TYPE
//     // ========================================================

//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/webp",
//     ];


//     if (
//       !allowedTypes.includes(
//         file.type
//       )
//     ) {

//       alert(
//         "Please select a JPG, JPEG, PNG or WEBP image."
//       );


//       event.target.value =
//         "";


//       return;
//     }


//     // ========================================================
//     // VALID IMAGE SIZE
//     // ========================================================

//     if (
//       file.size >
//       MAX_PROFILE_IMAGE_SIZE
//     ) {

//       alert(
//         "Profile picture must not exceed 25 MB."
//       );


//       event.target.value =
//         "";


//       return;
//     }


//     // ========================================================
//     // REMOVE OLD TEMPORARY PREVIEW
//     // ========================================================

//     if (previewUrl) {

//       URL.revokeObjectURL(
//         previewUrl
//       );

//     }


//     // ========================================================
//     // CREATE NEW PREVIEW
//     // ========================================================

//     const objectUrl =
//       URL.createObjectURL(
//         file
//       );


//     // Show image immediately
//     setPreviewUrl(
//       objectUrl
//     );


//     // ========================================================
//     // AUTOMATICALLY UPLOAD
//     // ========================================================

//     await uploadProfilePicture(
//       file,
//       objectUrl
//     );
//   };


//   // ==========================================================
//   // PROFILE IMAGE
//   // ==========================================================

//   const profileImage =
//     previewUrl ||
//     getProfileImageUrl(
//       userInfo
//     );


//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {

//     return (
//       <Spinner
//         loading={true}
//       />
//     );

//   }


//   // ==========================================================
//   // PAGE
//   // ==========================================================

//   return (

//     <div className="container">

//       <div className="row mb-4">


//         {/* ==================================================
//             PROFILE CARD
//         ================================================== */}

//         <div
//           className={`col-md-3 py-3 card ${styles.textCenter}`}
//         >


//           {/* ================================================
//               PROFILE IMAGE CONTAINER
//           ================================================= */}

//           <div
//             style={{
//               position: "relative",
//               width: "170px",
//               height: "170px",
//               margin: "0 auto 20px",
//             }}
//           >


//             {/* ==============================================
//                 PROFILE IMAGE
//             =============================================== */}

//             <img
//               src={profileImage}
//               alt="Profile"
//               className={`img-fluid rounded-circle ${styles.profileImage}`}
//               style={{
//                 width: "170px",
//                 height: "170px",
//                 objectFit: "cover",

//                 border:
//                   "4px solid #ffffff",

//                 boxShadow:
//                   "0 4px 18px rgba(0, 0, 0, 0.18)",

//                 display:
//                   "block",

//                 backgroundColor:
//                   "#f5f5f5",
//               }}

//               onError={(event) => {

//                 console.error(
//                   "PROFILE IMAGE FAILED:",
//                   event.currentTarget.src
//                 );

//                 event.currentTarget.src =
//                   pic;

//               }}
//             />


//             {/* ==============================================
//                 CAMERA BUTTON
//             =============================================== */}

//             <button
//               type="button"

//               title={
//                 uploading
//                   ? "Uploading profile picture..."
//                   : "Change profile picture"
//               }

//               aria-label="Change profile picture"

//               disabled={
//                 uploading
//               }

//               onClick={() => {

//                 if (
//                   !uploading &&
//                   fileInputRef.current
//                 ) {

//                   fileInputRef.current.click();

//                 }

//               }}

//               style={{
//                 position:
//                   "absolute",

//                 right:
//                   "-2px",

//                 bottom:
//                   "4px",

//                 width:
//                   "48px",

//                 height:
//                   "48px",

//                 borderRadius:
//                   "50%",

//                 border:
//                   "3px solid #ffffff",

//                 backgroundColor:
//                   "#008060",

//                 color:
//                   "#ffffff",

//                 display:
//                   "flex",

//                 alignItems:
//                   "center",

//                 justifyContent:
//                   "center",

//                 fontSize:
//                   "20px",

//                 cursor:
//                   uploading
//                     ? "not-allowed"
//                     : "pointer",

//                 boxShadow:
//                   "0 4px 12px rgba(0, 0, 0, 0.20)",

//                 transition:
//                   "transform 0.2s ease, background-color 0.2s ease",

//                 opacity:
//                   uploading
//                     ? 0.75
//                     : 1,
//               }}
//             >

//               {uploading ? (

//                 <span
//                   className="spinner-border spinner-border-sm"
//                   role="status"
//                   aria-hidden="true"
//                 />

//               ) : (

//                 "📷"

//               )}

//             </button>


//           </div>


//           {/* =================================================
//               HIDDEN FILE INPUT
//           ================================================= */}

//           <input
//             ref={
//               fileInputRef
//             }

//             type="file"

//             accept="
//               image/jpeg,
//               image/jpg,
//               image/png,
//               image/webp
//             "

//             onChange={
//               handleImageChange
//             }

//             style={{
//               display: "none",
//             }}
//           />


//           {/* =================================================
//               USER NAME
//           ================================================= */}

//           <h4 className="mt-3">

//             {userInfo.first_name || ""}

//             {" "}

//             {userInfo.last_name || ""}

//           </h4>


//           {/* =================================================
//               EMAIL
//           ================================================= */}

//           <p className="text-muted">

//             {userInfo.email ||
//               "No email available"}

//           </p>


//           {/* =================================================
//               EDIT PROFILE
//           ================================================= */}

//           <Link
//             to="/profile/edit"

//             className="btn btn-outline-primary btn-sm mt-2"
//           >

//             Edit Profile

//           </Link>

//         </div>


//         {/* ==================================================
//             ACCOUNT INFORMATION
//         ================================================== */}

//         <div className="col-md-9">


//           {/* =================================================
//               ACCOUNT OVERVIEW
//           ================================================= */}

//           <div className="card">


//             <div
//               className="card-header"

//               style={{
//                 backgroundColor:
//                   "#6050DC",

//                 color:
//                   "#fff",
//               }}
//             >

//               <h5 className="mb-0">
//                 Account Overview
//               </h5>

//             </div>


//             <div className="card-body">


//               <div className="row">


//                 {/* ==========================================
//                     LEFT INFORMATION
//                 =========================================== */}

//                 <div className="col-md-6">


//                   {/* FULL NAME */}

//                   <p>

//                     <strong>
//                       Full Name:
//                     </strong>

//                     {" "}

//                     {userInfo.first_name ||
//                       ""}

//                     {" "}

//                     {userInfo.last_name ||
//                       ""}

//                   </p>


//                   {/* EMAIL */}

//                   <p>

//                     <strong>
//                       Email:
//                     </strong>

//                     {" "}

//                     {userInfo.email ||
//                       "N/A"}

//                   </p>


//                   {/* USERNAME */}

//                   <p>

//                     <strong>
//                       Username:
//                     </strong>

//                     {" "}

//                     {userInfo.username ||
//                       "N/A"}

//                   </p>


//                 </div>


//                 {/* ==========================================
//                     RIGHT INFORMATION
//                 =========================================== */}

//                 <div className="col-md-6">


//                   {/* PHONE */}

//                   <p>

//                     <strong>
//                       Phone:
//                     </strong>

//                     {" "}

//                     {userInfo.phone ||
//                       "N/A"}

//                   </p>


//                   {/* CITY */}

//                   <p>

//                     <strong>
//                       City:
//                     </strong>

//                     {" "}

//                     {userInfo.city ||
//                       "N/A"}

//                   </p>


//                   {/* COUNTRY */}

//                   <p>

//                     <strong>
//                       Country:
//                     </strong>

//                     {" "}

//                     {userInfo.country ||
//                       "N/A"}

//                   </p>


//                   {/* ADDRESS */}

//                   <p>

//                     <strong>
//                       Address:
//                     </strong>

//                     {" "}

//                     {userInfo.address ||
//                       "N/A"}

//                   </p>


//                 </div>


//               </div>


//             </div>


//           </div>


//           {/* =================================================
//               SALES HISTORY
//           ================================================= */}

//           <div className="mt-4">


//             <div className="card">


//               {/* SALES HEADER */}

//               <div
//                 className="card-header"

//                 style={{
//                   backgroundColor:
//                     "#6050DC",

//                   color:
//                     "#fff",
//                 }}
//               >

//                 <h5 className="mb-0">
//                   Sales History
//                 </h5>

//               </div>


//               {/* SALES BODY */}

//               <div className="card-body">


//                 {orderItems.length > 0 ? (

//                   <OrderHistoryItemContainer
//                     orderitems={
//                       orderItems
//                     }
//                   />

//                 ) : (

//                   <div
//                     className="text-center text-muted py-4"
//                   >

//                     <h6>
//                       No Sales History
//                     </h6>

//                     <p className="mb-0">

//                       Your orders and sales
//                       history will appear
//                       here.

//                     </p>

//                   </div>

//                 )}


//               </div>


//             </div>


//           </div>


//         </div>


//       </div>


//     </div>

//   );
// };


// export default UserInfo;












// import React, { useEffect, useState } from "react";
// import styles from "./UserInfo.module.css";
// import pic from "../../assets/profile_pic.jpg";
// import api from "../../api";
// import Spinner from "../ui/Spinner";
// import OrderHistoryItemContainer from "./OrderHistoryItemContainer";
// import { Link } from "react-router-dom";

// const UserInfo = () => {
//   const [userInfo, setUserInfo] = useState({});
//   const [orderItems, setOrderItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     const fetchUserData = async () => {
//       try {
//         const token = localStorage.getItem("access");

//         if (!token) {
//           console.error("No access token found");
//           return;
//         }

//         // Fetch User Info
//         const userResponse = await api.get("/user/");

//         // Fetch Orders
//         const ordersResponse = await api.get("/my-orders/");

//         console.log("User:", userResponse.data);
//         console.log("Orders:", ordersResponse.data);

//         if (mounted) {
//           setUserInfo(userResponse.data);

//           // API returns an array
//           // setOrderItems(
//           //   Array.isArray(ordersResponse.data)
//           //     ? ordersResponse.data
//           //     : []
//           // );
//         setOrderItems(
//           ordersResponse.data.orders || []  
//         );
//         console.log(
//           "Orders Array:",
//           ordersResponse.data.orders
//         );
//         }
//       } catch (error) {
//         console.error(
//           "Error fetching data:",
//           error.response?.data || error.message
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserData();

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
//             alt="Profile"
//             className={`img-fluid rounded-circle mb-3 mx-auto ${styles.profileImage}`}
//           />

//           <h4>
//             {userInfo.first_name || ""} {userInfo.last_name || ""}
//           </h4>

//         <p className="text-muted">
//           {userInfo.email || "No email available"}
//         </p>

//         <Link
//           to="/profile/edit"
//           className="btn btn-primary btn-sm mt-2"
//         >
//           Edit Profile
//         </Link>
//           {/* <p className="text-muted">
//             {userInfo.email || "No email available"}
//           </p> */}
//         </div>

//         {/* Account Info */}
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

//           {/* Orders */}
//           <div className="mt-4">
//             <OrderHistoryItemContainer
//               orderitems={orderItems}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfo;


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


