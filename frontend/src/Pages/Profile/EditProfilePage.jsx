import React, {
  useEffect,
  useState,
} from "react";

import api from "../../api";

const EditProfilePage = () => {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [formData, setFormData] =
    useState({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
    });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response =
        await api.get(
          "/profile/update/"
        );

      setFormData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await api.put(
          "/profile/update/",
          formData
        );

      setMessage(
        response.data.message
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-md-8">

          <div className="card shadow">

            <div className="card-body">

              <h2 className="mb-4">
                Edit Profile
              </h2>

              {message && (
                <div className="alert alert-info">
                  {message}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
              >

                <div className="row">

                  <div className="col-md-6 mb-3">
                    <label>
                      First Name
                    </label>

                    <input
                      type="text"
                      name="first_name"
                      value={
                        formData.first_name
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label>
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      value={
                        formData.last_name
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control"
                    />
                  </div>

                </div>

                <div className="mb-3">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label>Phone</label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    className="form-control"
                    rows="3"
                  />
                </div>

                <div className="row">

                  <div className="col-md-4 mb-3">
                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={
                        formData.state
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label>
                      Country
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={
                        formData.country
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-dark"
                >
                  {loading
                    ? "Saving..."
                    : "Update Profile"}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EditProfilePage;