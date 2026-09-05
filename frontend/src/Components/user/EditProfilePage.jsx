import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiSave,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../api";
import styles from "./EditProfileForm.module.css";

const EditProfileForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/");

      setFormData((prev) => ({
        ...prev,
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        username: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        country: res.data.country || "",
        state: res.data.state || "",
        city: res.data.city || "",
        address: res.data.address || "",
      }));
    } catch (error) {
      console.error("Fetch User Error:", error);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password &&
      formData.password !== formData.confirm_password
    ) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      // Do not send confirm_password to the API.
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        address: formData.address,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await api.put("/profile/update/", payload);

      toast.success("Profile updated successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 700);
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error.response?.data || error
      );

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update your profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className={styles.loadingCard}>
        <div className={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>

      {/* Form Header */}
      <div className={styles.formHeader}>
        <div>
          <span className={styles.formEyebrow}>PERSONAL INFORMATION</span>
          <h2>Your Details</h2>
          <p>
            Update your information so we can serve you better.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* =========================
            PERSONAL INFORMATION
        ========================= */}

        <section className={styles.section}>

          <div className={styles.sectionTitle}>
            <div className={styles.sectionIcon}>
              <FiUser />
            </div>

            <div>
              <h3>Personal Information</h3>
              <p>Your basic account information</p>
            </div>
          </div>

          <div className={styles.grid}>

            <div className={styles.field}>
              <label htmlFor="first_name">
                First Name
              </label>

              <div className={styles.inputWrapper}>
                <FiUser />

                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="last_name">
                Last Name
              </label>

              <div className={styles.inputWrapper}>
                <FiUser />

                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="username">
                Username
              </label>

              <div className={styles.inputWrapper}>
                <span className={styles.inputSymbol}>@</span>

                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email">
                Email Address
              </label>

              <div className={styles.inputWrapper}>
                <FiMail />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">
                Phone Number
              </label>

              <div className={styles.inputWrapper}>
                <FiPhone />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            DELIVERY INFORMATION
        ========================= */}

        <section className={styles.section}>

          <div className={styles.sectionTitle}>
            <div className={styles.sectionIcon}>
              <FiMapPin />
            </div>

            <div>
              <h3>Delivery Information</h3>
              <p>Where should we deliver your orders?</p>
            </div>
          </div>

          <div className={styles.grid}>

            <div className={styles.field}>
              <label htmlFor="country">
                Country
              </label>

              <div className={styles.inputWrapper}>
                <FiMapPin />

                <input
                  id="country"
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="state">
                State
              </label>

              <div className={styles.inputWrapper}>
                <FiMapPin />

                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="city">
                City
              </label>

              <div className={styles.inputWrapper}>
                <FiMapPin />

                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="address">
                Delivery Address
              </label>

              <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
                <FiMapPin />

                <textarea
                  id="address"
                  name="address"
                  rows="4"
                  placeholder="Enter your complete delivery address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            PASSWORD
        ========================= */}

        <section className={styles.section}>

          <div className={styles.sectionTitle}>
            <div className={styles.sectionIcon}>
              <FiLock />
            </div>

            <div>
              <h3>Change Password</h3>
              <p>
                Leave these fields empty if you don't want to change your password.
              </p>
            </div>
          </div>

          <div className={styles.grid}>

            <div className={styles.field}>
              <label htmlFor="password">
                New Password
              </label>

              <div className={styles.inputWrapper}>
                <FiLock />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm_password">
                Confirm New Password
              </label>

              <div className={styles.inputWrapper}>
                <FiLock />

                <input
                  id="confirm_password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirm_password"
                  placeholder="Confirm new password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className={styles.actions}>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={saving}
          >
            <FiArrowLeft />
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
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Changes
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default EditProfileForm;