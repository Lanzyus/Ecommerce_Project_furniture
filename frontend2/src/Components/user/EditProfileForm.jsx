import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const EditProfileForm = () => {
  const navigate = useNavigate();

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
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password &&
      formData.password !== formData.confirm_password
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.put("/profile/update/", formData);

      alert("Profile updated successfully");

      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h4>Edit Profile</h4>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-control"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-control"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Country</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mb-3">
              <label>Address</label>
              <textarea
                name="address"
                rows="3"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                className="form-control"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>

          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;