import React, { useEffect, useState } from "react";
import api from "../../api";
import Spinner from "../ui/spinner";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist/");
      setWishlist(response.data);
    } catch (error) {
      console.error(
        "Wishlist Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner loading={true} />;
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="alert alert-info">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="row">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="col-md-3 mb-4"
            >
              <div className="card h-100">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="card-img-top"
                  style={{
                    height: "220px",
                    objectFit: "contain",
                  }}
                />

                <div className="card-body">
                  <h6>{item.product?.name}</h6>

                  <p className="text-danger fw-bold">
                    ₦
                    {Number(
                      item.product?.current_price || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
