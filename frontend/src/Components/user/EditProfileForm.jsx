import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiCheck, FiX } from "react-icons/fi";
import api, { BASE_URL } from "../../api";
import styles from "./EditProfileForm.module.css";

import defaultProfile from "../../assets/profile_pic.jpg";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EditProfileForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  const [currentPictureUrl, setCurrentPictureUrl] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // BUILD PROFILE IMAGE URL
  // ============================================================

  const getProfileImageUrl = (user) => {
    const image =
      user?.profile_picture_url ||
      user?.profile_picture ||
      "";

    if (!image) {
      return defaultProfile;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${BASE_URL}${image}`;
    }

    return `${BASE_URL}/${image}`;
  };

  // ============================================================
  // FETCH USER
  // ============================================================

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/user/");
        const user = response.data;

        setFormData({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          country: user.country || "",
          state: user.state || "",
          city: user.city || "",
          address: user.address || "",
          password: "",
          confirm_password: "",
        });

        setCurrentPictureUrl(
          getProfileImageUrl(user)
        );
      } catch (error) {
        console.error(
          "FETCH PROFILE ERROR:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // ============================================================
  // HANDLE TEXT INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SELECT PROFILE PICTURE
  // ============================================================

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Supported formats
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    // Maximum file size
    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Profile picture must not exceed 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");

    // Remove previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setProfilePicture(file);
    setPreviewUrl(objectUrl);
  };

  // ============================================================
  // OPEN FILE SELECTOR
  // ============================================================

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // ============================================================
  // REMOVE SELECTED NEW IMAGE
  // ============================================================

  const removeSelectedPicture = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfilePicture(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // SUBMIT PROFILE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Password validation
    if (
      formData.password &&
      formData.password !== formData.confirm_password
    ) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      // IMPORTANT:
      // We use FormData because we are uploading an image.
      const data = new FormData();

      data.append(
        "first_name",
        formData.first_name
      );

      data.append(
        "last_name",
        formData.last_name
      );

      data.append(
        "username",
        formData.username
      );

      data.append(
        "email",
        formData.email
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "country",
        formData.country
      );

      data.append(
        "state",
        formData.state
      );

      data.append(
        "city",
        formData.city
      );

      data.append(
        "address",
        formData.address
      );

      // Only send password if user entered one
      if (formData.password) {
        data.append(
          "password",
          formData.password
        );
      }

      // ========================================================
      // PROFILE PICTURE
      // ========================================================

      if (profilePicture) {
        data.append(
          "profile_picture",
          profilePicture,
          profilePicture.name
        );
      }

      console.log(
        "Updating profile..."
      );

      const response = await api.put(
        "/profile/update/",
        data
      );

      console.log(
        "PROFILE UPDATE RESPONSE:",
        response.data
      );

      // ========================================================
      // GET UPDATED USER
      // ========================================================

      const latestUserResponse =
        await api.get("/user/");

      const updatedUser =
        latestUserResponse.data;

      // Update current image
      setCurrentPictureUrl(
        getProfileImageUrl(updatedUser)
      );

      // Clear selected image
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
      setProfilePicture(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear passwords
      setFormData((previous) => ({
        ...previous,
        password: "",
        confirm_password: "",
      }));

      alert(
        "Profile updated successfully."
      );

      navigate("/profile");
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Profile update failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // ============================================================
  // IMAGE TO DISPLAY
  // ============================================================

  const displayedPicture =
    previewUrl ||
    currentPictureUrl ||
    defaultProfile;

  // ============================================================
  // COMPONENT
  // ============================================================

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ====================================================
            BACK BUTTON
        ==================================================== */}

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/profile")}
        >
          <FiArrowLeft />
          Back to Profile
        </button>

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              ACCOUNT SETTINGS
            </span>

            <h1>Edit Profile</h1>

            <p>
              Update your personal information,
              profile photo and account details.
            </p>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className={styles.errorBox}>
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <FiX />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >

          {/* ==================================================
              PROFILE PHOTO
          ================================================== */}

          <section className={styles.photoSection}>

            <div className={styles.sectionTitle}>
              <div>
                <span className={styles.eyebrow}>
                  PROFILE
                </span>

                <h2>Profile Photo</h2>

                <p>
                  Choose a professional photo
                  for your account.
                </p>
              </div>
            </div>

            <div className={styles.photoContent}>

              <div className={styles.photoWrapper}>

                <img
                  src={displayedPicture}
                  alt="Profile"
                  className={styles.profileImage}
                  onError={(event) => {
                    event.currentTarget.src =
                      defaultProfile;
                  }}
                />

                <button
                  type="button"
                  className={styles.cameraButton}
                  onClick={openFileSelector}
                  title="Change profile photo"
                >
                  <FiCamera />
                </button>

              </div>

              <div className={styles.photoInfo}>

                <h3>
                  {profilePicture
                    ? "New photo selected"
                    : "Your profile photo"}
                </h3>

                <p>
                  JPG, PNG or WEBP.
                  Maximum size: 5 MB.
                </p>

                <div className={styles.photoActions}>

                  <button
                    type="button"
                    className={styles.changeButton}
                    onClick={openFileSelector}
                  >
                    <FiCamera />
                    {profilePicture
                      ? "Change Photo"
                      : "Upload Photo"}
                  </button>

                  {profilePicture && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={
                        removeSelectedPicture
                      }
                    >
                      <FiX />
                      Remove
                    </button>
                  )}

                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePictureChange}
                  className={styles.hiddenInput}
                />

              </div>

            </div>
          </section>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className={styles.section}>

            <div className={styles.sectionHeading}>
              <span className={styles.number}>
                01
              </span>

              <div>
                <h2>Personal Information</h2>
                <p>
                  Your basic account information.
                </p>
              </div>
            </div>

            <div className={styles.grid}>

              <div className={styles.field}>
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                />
              </div>

              <div className={styles.field}>
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                />
              </div>

              <div className={styles.field}>
                <label>Username</label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
              </div>

              <div className={styles.field}>
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>

              <div className={styles.field}>
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>

            </div>
          </section>

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <section className={styles.section}>

            <div className={styles.sectionHeading}>
              <span className={styles.number}>
                02
              </span>

              <div>
                <h2>Delivery Information</h2>
                <p>
                  Where should your orders be delivered?
                </p>
              </div>
            </div>

            <div className={styles.grid}>

              <div className={styles.field}>
                <label>Country</label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>

              <div className={styles.field}>
                <label>State</label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className={styles.field}>
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter your delivery address"
                />
              </div>

            </div>
          </section>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <section className={styles.section}>

            <div className={styles.sectionHeading}>
              <span className={styles.number}>
                03
              </span>

              <div>
                <h2>Change Password</h2>
                <p>
                  Leave these fields empty if you
                  don't want to change your password.
                </p>
              </div>
            </div>

            <div className={styles.grid}>

              <div className={styles.field}>
                <label>New Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>

              <div className={styles.field}>
                <label>Confirm Password</label>

                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>

            </div>
          </section>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className={styles.formActions}>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate("/profile")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <FiCheck />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiArrowLeft } from "react-icons/fi";
// import api from "../../api";

// const EditProfileForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     email: "",
//     phone: "",
//     country: "",
//     state: "",
//     city: "",
//     address: "",
//     password: "",
//     confirm_password: "",
//   });

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const res = await api.get("/user/");

//       setFormData((prev) => ({
//         ...prev,
//         first_name: res.data.first_name || "",
//         last_name: res.data.last_name || "",
//         username: res.data.username || "",
//         email: res.data.email || "",
//         phone: res.data.phone || "",
//         country: res.data.country || "",
//         state: res.data.state || "",
//         city: res.data.city || "",
//         address: res.data.address || "",
//       }));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // BACK TO PROFILE
//   const handleBack = () => {
//     navigate("/profile");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       formData.password &&
//       formData.password !== formData.confirm_password
//     ) {
//       alert("Passwords do not match");
//       return;
//     }

//     try {
//       await api.put("/profile/update/", formData);

//       alert("Profile updated successfully");

//       navigate("/profile");
//     } catch (error) {
//       console.error(error);
//       alert("Update failed");
//     }
//   };

//   return (
//     <div className="card shadow">

//       {/* Header */}
//       <div
//         className="card-header text-white"
//         style={{
//           backgroundColor: "#302a24",
//           padding: "20px 25px",
//         }}
//       >
//         <div className="d-flex align-items-center justify-content-between">

//           <h4 className="mb-0">
//             Edit Profile
//           </h4>

//           {/* BACK BUTTON */}
//           <button
//             type="button"
//             onClick={handleBack}
//             className="btn btn-light d-flex align-items-center gap-2"
//           >
//             <FiArrowLeft />
//             Back to Profile
//           </button>

//         </div>
//       </div>

//       <div className="card-body p-4">

//         <form onSubmit={handleSubmit}>

//           <div className="row">

//             {/* First Name */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 First Name
//               </label>

//               <input
//                 type="text"
//                 name="first_name"
//                 className="form-control"
//                 value={formData.first_name}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Last Name */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Last Name
//               </label>

//               <input
//                 type="text"
//                 name="last_name"
//                 className="form-control"
//                 value={formData.last_name}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Username */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Username
//               </label>

//               <input
//                 type="text"
//                 name="username"
//                 className="form-control"
//                 value={formData.username}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Email */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Email Address
//               </label>

//               <input
//                 type="email"
//                 name="email"
//                 className="form-control"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Phone */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Phone
//               </label>

//               <input
//                 type="text"
//                 name="phone"
//                 className="form-control"
//                 value={formData.phone}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Country */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Country
//               </label>

//               <input
//                 type="text"
//                 name="country"
//                 className="form-control"
//                 value={formData.country}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* State */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 State
//               </label>

//               <input
//                 type="text"
//                 name="state"
//                 className="form-control"
//                 value={formData.state}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* City */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 City
//               </label>

//               <input
//                 type="text"
//                 name="city"
//                 className="form-control"
//                 value={formData.city}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Address */}
//             <div className="col-12 mb-3">
//               <label className="form-label">
//                 Address
//               </label>

//               <textarea
//                 name="address"
//                 rows="3"
//                 className="form-control"
//                 value={formData.address}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Password */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Password
//               </label>

//               <input
//                 type="password"
//                 name="password"
//                 className="form-control"
//                 value={formData.password}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Confirm Password */}
//             <div className="col-md-6 mb-3">
//               <label className="form-label">
//                 Confirm Password
//               </label>

//               <input
//                 type="password"
//                 name="confirm_password"
//                 className="form-control"
//                 value={formData.confirm_password}
//                 onChange={handleChange}
//               />
//             </div>

//           </div>

//           {/* Bottom Actions */}
//           <div className="d-flex justify-content-between align-items-center mt-4">

//             <button
//               type="button"
//               onClick={handleBack}
//               className="btn btn-outline-secondary d-flex align-items-center gap-2"
//             >
//               <FiArrowLeft />
//               Back to Profile
//             </button>

//             <button
//               type="submit"
//               className="btn text-white px-4"
//               style={{
//                 backgroundColor: "#302a24",
//               }}
//             >
//               Save Changes
//             </button>

//           </div>

//         </form>

//       </div>
//     </div>
//   );
// };

// export default EditProfileForm;