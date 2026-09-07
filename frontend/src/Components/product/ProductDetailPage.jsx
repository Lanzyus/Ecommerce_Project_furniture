import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api, { BASE_URL } from "../../api";

import ProductPagePlaceholder from "./ProductPagePlaceHolder";
import ProductGallery from "./ProductGallery.jsx";
import RelatedProducts from "./RelatedProducts";


import { useContext } from "react";
import { CartContext } from "../../Context/CartContext";


const ProductDetailPage = () => {

  const {
    fetchCartStats
  } = useContext(CartContext);

  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);

  const [addingToCart, setAddingToCart] =
    useState(false);

  const [addingWishlist, setAddingWishlist] =
    useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const token = localStorage.getItem("access");

  // =============================
  // FETCH PRODUCT
  // =============================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/products/${slug}/`
        );

        setProduct(res.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // =============================
  // CHECK CART
  // =============================
  useEffect(() => {
    const checkCart = async () => {
      try {
        if (!product?.id) return;

        const cartCode =
          localStorage.getItem("cart_code");

        if (!cartCode) return;

        const res = await api.get(
          "/product_in_cart/",
          {
            params: {
              cart_code: cartCode,
              product_id: product.id,
            },
          }
        );

        setInCart(
          res.data.product_in_cart || false
        );
      } catch (err) {
        console.error(err);
      }
    };

    checkCart();
  }, [product]);

  // =============================
  // ADD TO CART
  // =============================
  const addToCart = async () => {
    try {
      setAddingToCart(true);

      let cartCode =
        localStorage.getItem("cart_code");

      if (!cartCode) {
        cartCode = crypto.randomUUID();

        localStorage.setItem(
          "cart_code",
          cartCode
        );
      }

      await api.post("/add_item/", {
        cart_code: cartCode,
        product_id: product.id,
        quantity,
      });

      console.log(
        "Product added. Refreshing count..."
      );

      await fetchCartStats();

      setInCart(true);

      if (fetchCartStats) {
        await fetchCartStats();
      }

      toast.success(
        `${product.name} added to cart`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to add product"
      );
    } finally {
      setAddingToCart(false);
    }
  };
  window.dispatchEvent(
    new Event("cartUpdated")
);

  // =============================
  // BUY NOW
  // =============================
  const handleBuyNow = async () => {
    try {
      let cartCode =
        localStorage.getItem("cart_code");

      if (!cartCode) {
        cartCode = crypto.randomUUID();

        localStorage.setItem(
          "cart_code",
          cartCode
        );
      }

      await api.post("/add_item/", {
        cart_code: cartCode,
        product_id: product.id,
        quantity,
      });

      if (fetchCartStats) {
        await fetchCartStats();
      }

      navigate("/checkout");
    } catch (err) {
      toast.error(
        "Unable to proceed to checkout"
      );
    }
  };

  // =============================
  // WISHLIST
  // =============================
  const addToWishlist = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }

      setAddingWishlist(true);

      await api.post(
        `/wishlist/add/${product.id}/`
      );

      toast.success(
        `${product.name} added to wishlist`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Wishlist failed"
      );
    } finally {
      setAddingWishlist(false);
    }
  };

  // =============================
  // REVIEW
  // =============================
  const submitReview = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }

      setSubmittingReview(true);

      await api.post(
        `/reviews/add/${product.id}/`,
        {
          rating,
          comment,
        }
      );

      toast.success("Review submitted");

      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Review failed"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =============================
  // MEDIA
  // =============================
  const primaryMedia = useMemo(() => {
    if (!product?.media?.length) {
      return null;
    }

    return (
      product.media.find(
        (item) => item.is_primary
      ) || product.media[0]
    );
  }, [product]);

  const mediaUrl = primaryMedia?.file
    ? primaryMedia.file.startsWith("http")
      ? primaryMedia.file
      : `${BASE_URL}${primaryMedia.file}`
    : "";

  // =============================
  // UI STATES
  // =============================
  if (loading) {
    return <ProductPagePlaceholder />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const displayPrice =
    product.current_price || product.price;
  const originalPrice =
    product.price || displayPrice;

  const discountPercentage =
    originalPrice > displayPrice
      ? Math.round(
          ((originalPrice - displayPrice) /
            originalPrice) *
            100
        )
      : 0;

  return (
    
    <div className="container py-4">
      <div className="row g-4">
        {/* Gallery */}
        <div className="col-lg-5">
          <ProductGallery
            media={product.media}
            image={mediaUrl}
          />
        </div>

        {/* Details */}
        <div className="col-lg-4">
          {/* <h2>{product.name}</h2> */}
          <h2>{product.name}</h2>

            <div className="mb-3">
              <span className="text-warning fs-5">
                ★★★★★
              </span>

              <span className="ms-2 fw-bold">
                {product.average_rating || 0}
              </span>

              <span className="text-muted ms-2">
                ({product.review_count || 0} Reviews)
              </span>
            </div>

          <p>
            {product.short_description}
          </p>

          {/* <h3 className="text-success">
            ₦
            {Number(
              displayPrice
            ).toLocaleString()}
          </h3> */}
<div className="mb-3">

  {originalPrice > displayPrice && (
    <div
      style={{
        textDecoration: "line-through",
        color: "#999",
        fontSize: "18px",
        fontWeight: "500",
      }}
    >
      ₦{Number(originalPrice).toLocaleString()}
    </div>
  )}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "5px",
    }}
  >
    <span
      style={{
        color: "#ff4d00",
        fontSize: "34px",
        fontWeight: "700",
      }}
    >
      ₦{Number(displayPrice).toLocaleString()}
    </span>

    {discountPercentage > 0 && (
      <span
        className="badge bg-danger"
        style={{
          fontSize: "14px",
          padding: "8px 12px",
        }}
      >
        -{discountPercentage}%
      </span>
    )}
  </div>

</div>

          <hr />

          <h5>Description</h5>

          <p>
            {product.description}
          </p>

<h4 className="mt-5">
  Specifications
</h4>

    <table className="table">
      <tbody>

        {product.specifications?.map(
          (spec) => (
            <tr key={spec.id}>
              <th>{spec.name}</th>

              <td>{spec.value}</td>
            </tr>
          )
        )}

      </tbody>
    </table>

          <h5>Review Product</h5>

          <select
            className="form-select mb-2"
            value={rating}
            onChange={(e) =>
              setRating(
                Number(e.target.value)
              )
            }
          >
            <option value="5">
              ★★★★★
            </option>
            <option value="4">
              ★★★★
            </option>
            <option value="3">
              ★★★
            </option>
            <option value="2">
              ★★
            </option>
            <option value="1">
              ★
            </option>
          </select>

          <textarea
            className="form-control mb-2"
            rows="4"
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
          />

          <button
            className="btn btn-primary me-2"
            onClick={submitReview}
            disabled={submittingReview}
          >
            {submittingReview
              ? "Submitting..."
              : "Submit Review"}
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={addToWishlist}
            disabled={addingWishlist}
          >
            ❤️ Wishlist
          </button>
          
        </div>

        {/* Buy Box */}
        <div className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* <h2 className="text-danger">
                ₦
                {Number(
                  displayPrice
                ).toLocaleString()}
              </h2> */}

          <div className="mb-3">

            {originalPrice > displayPrice && (
              <div
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: "16px",
                }}
              >
                ₦{Number(originalPrice).toLocaleString()}
              </div>
            )}

            <h2
              style={{
                color: "#ff4d00",
                fontWeight: "700",
              }}
            >
              ₦{Number(displayPrice).toLocaleString()}
            </h2>

            {discountPercentage > 0 && (
              <span className="badge bg-danger">
                Save {discountPercentage}%
              </span>
            )}

          </div>

              <div className="mb-3">
                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <button
                className="btn btn-warning w-100 mb-2"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>

              <button
                className="btn btn-dark w-100"
                onClick={addToCart}
                disabled={
                  addingToCart || inCart
                }
              >
                {addingToCart
                  ? "Adding..."
                  : inCart
                  ? "Already In Cart"
                  : "Add To Cart"}
              </button>
            </div>
          </div>
        </div>


      {/* CUSTOMER REVIEWS */}

      <div className="mt-5">

        <h3 className="mb-4">
          Customer Reviews
          ({product.review_count || 0})
        </h3>

        {product.reviews?.length > 0 ? (

          product.reviews.map((review) => (

            <div
              key={review.id}
              className="card shadow-sm mb-3"
            >
              <div className="card-body">

                <div className="d-flex justify-content-between">

                  <h6 className="fw-bold">
                    {review.user}
                  </h6>

                  <small className="text-muted">
                    {new Date(
                      review.created_at
                    ).toLocaleDateString()}
                  </small>

                </div>

                <div className="text-warning mb-2">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p className="mb-0">
                  {review.comment}
                </p>

              </div>
            </div>

          ))

        ) : (

    <div className="alert alert-info">
      No reviews yet.
      Be the first customer to review this product.
    </div>

  )}

<h4 className="mt-4">
  Questions & Answers
</h4>

{product.questions?.map(
  (question) => (
    <div
      key={question.id}
      className="border p-3 mb-2"
    >
      <strong>
        {question.username}
      </strong>

      <p>{question.question}</p>

      {question.answer && (
        <div className="alert alert-success">
          {question.answer}
        </div>
      )}
    </div>
  )
)}

</div>


      </div>

      <div className="mt-5">
        <RelatedProducts
          products={
            product.similar_products || []
          }
        />
      </div>

      
    </div>
  );
};

export default ProductDetailPage;










//     import React, { useEffect, useState, useMemo } from "react";
//     import { useParams, useNavigate } from "react-router-dom";
//     import api, { BASE_URL } from "../../api";
//     import { toast } from "react-toastify";
//     import { useNavigate } from "react-router-dom";
    
//     import ProductPagePlaceholder from "./ProductPagePlaceHolder";
//     import RelatedProducts from "./RelatedProducts";
//     import ProductGallery from "./ProductGallery";

//     const ProductDetailPage = ({
//       setNumCartItems,
//       fetchCartStats,
//     }) => {
//       const { slug } = useParams();

//       const [product, setProduct] = useState(null);
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState("");
//       const [inCart, setInCart] = useState(false);
//       const [addingToCart, setAddingToCart] = useState(false);

//       const [quantity, setQuantity] = useState(1);
//       const navigate = useNavigate();

//       const [rating, setRating] = useState(5);
//       const [comment, setComment] = useState("");
//       const [submittingReview, setSubmittingReview] = useState(false);
//       const [addingWishlist, setAddingWishlist] = useState(false);

//       const token = localStorage.getItem("access");

//       // =====================================
//       // FETCH PRODUCT
//       // =====================================
//       useEffect(() => {
//         const fetchProduct = async () => {
//           try {
//             setLoading(true);
//             setError("");

//             const response = await api.get(
//               `/products/${slug}/`
//             );

//             setProduct(response.data);
//           } catch (err) {
//             console.error("Product Fetch Error:", err);

//             if (err.response) {
//               setError(
//                 err.response.data?.detail ||
//                   err.response.data?.error ||
//                   `Server Error (${err.response.status})`
//               );
//             } else if (err.request) {
//               setError(
//                 "Unable to connect to backend server."
//               );
//             } else {
//               setError(
//                 err.message ||
//                   "An unexpected error occurred."
//               );
//             }
//           } finally {
//             setLoading(false);
//           }
//         };

//         if (slug) {
//           fetchProduct();
//         }
//       }, [slug]);

//       // =====================================
//       // CHECK CART
//       // =====================================
//       useEffect(() => {
//         const checkCartStatus = async () => {
//           try {
//             if (!product?.id) return;

//             const cartCode =
//               localStorage.getItem("cart_code");

//             if (!cartCode) return;

//             const response = await api.get(
//               "/product_in_cart/",
//               {
//                 params: {
//                   cart_code: cartCode,
//                   product_id: product.id,
//                 },
//               }
//             );

//             setInCart(
//               response.data.product_in_cart || false
//             );
//           } catch (err) {
//             console.error(
//               "Cart Check Error:",
//               err.response?.data || err.message
//             );
//           }
//         };

//         checkCartStatus();
//       }, [product]);

//       // =====================================
//       // ADD TO CART
//       // =====================================

//       const addToCart = async () => {
       
        
//       const confirmed = window.confirm(
//         `Do you want to add "${product.name}" to cart?`
//       );

//       if (!confirmed) return;
//         // const confirmed = window.confirm(
//         // `Do you want to Add "${product.name}" to cart?`
//         // );

//         try {
//           if (!product?.id) {
//             return;
//           }

//           setAddingToCart(true);

//           let cartCode =
//             localStorage.getItem("cart_code");

//           if (!cartCode) {
//             cartCode = crypto.randomUUID();

//             localStorage.setItem(
//               "cart_code",
//               cartCode
//             );
//           }

//         const response = await api.post(
//           "/add_item/",
//           {
//             cart_code: cartCode,
//             product_id: product.id,
//             quantity,
//           }
//         );

//           // const response = await api.post(
//           //   "/add_item/",
//           //   {
//           //     cart_code: cartCode,
//           //     product_id: product.id,
//           //   }
//           // );

//           console.log(
//             "Add To Cart Response:",
//             response.data
//           );

//           setInCart(true);

//           // Refresh cart count from server
//           if (
//             typeof fetchCartStats === "function"
//           ) {
//             await fetchCartStats();
//           }

//           // Success notification
//           toast.success(
//             `${product.name} added to cart successfully`
//           );

//         } catch (err) {
//           console.error(
//             "Add To Cart Error:",
//             err.response?.data || err
//           );

//           toast.error(
//             err.response?.data?.detail ||
//             err.response?.data?.error ||
//             "Failed to add item to cart."
//           );
//         } finally {
//           setAddingToCart(false);
//         }
//       };




//       import { useNavigate } from "react-router-dom";

//   // =====================================
//   // PRODUCTDETAIL
//   // =====================================
//     const ProductDetailPage = () => {
//       const navigate = useNavigate();

//       const handleBuyNow = () => {
//         navigate("/checkout");
//       };

//       return (
//         <>
//           <button
//             className="btn btn-warning w-100 mb-2"
//             onClick={handleBuyNow}
//           >
//             Buy Now
//           </button>

//           <button
//             className="btn btn-primary w-100"
//           >
//             Add to Cart
//           </button>
//         </>
//       );
//     };

//     export default ProductDetailPage;
//       // =====================================
//       // MEDIA
//       // =====================================
//       const primaryMedia = useMemo(() => {
//         if (!product?.media?.length) return null;

//         return (
//           product.media.find(
//             (item) => item.is_primary
//           ) || product.media[0]
//         );
//       }, [product]);

//       const mediaUrl = primaryMedia?.file
//         ? primaryMedia.file.startsWith("http")
//           ? primaryMedia.file
//           : `${BASE_URL}${primaryMedia.file}`
//         : "/placeholder.jpg";
//     // =====================================
//       // REVIEW
//       // =====================================

//     const submitReview = async () => {
//       try {
//         if (!token) {
//           toast.error("Please login first");
//           return;
//         }

//         setSubmittingReview(true);

//         await api.post(
//           `/reviews/add/${product.id}/`,
//           {
//             rating,
//             comment,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         toast.success("Review submitted successfully");

//         setComment("");
//         setRating(5);
//       } catch (err) {
//         toast.error(
//           err.response?.data?.detail ||
//           "Failed to submit review"
//         );
//       } finally {
//         setSubmittingReview(false);
//       }
//     };

//       // =====================================
//       // WISHLISTS
//       // =====================================

//      const addToWishlist = async () => {
//       try {
//         if (!token) {
//           toast.error("Please login first");
//           return;
//         }

//         setAddingWishlist(true);

//         await api.post(
//           `/wishlist/add/${product.id}/`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         toast.success(
//           `${product.name} added to wishlist`
//         );
//       } catch (err) {
//         toast.error(
//           err.response?.data?.detail ||
//           "Failed to add wishlist"
//         );
//       } finally {
//         setAddingWishlist(false);
//       }
//     };

//      // =====================================
//      // UI STATES
//      // =====================================
//       const buyNow = async () => {
//         await addToCart();
//         navigate("/checkout");
//       };


//       // =====================================
//       // UI STATES
//       // =====================================
//       if (loading) {
//         return <ProductPagePlaceholder />;
//       }

//       if (error) {
//         return (
//           <div className="container py-5">
//             <div className="alert alert-danger">
//               {error}
//             </div>
//           </div>
//         );
//       }

//       if (!product) {
//         return (
//           <div className="container py-5">
//             <div className="alert alert-warning">
//               Product not found.
//             </div>
//           </div>
//         );
//       }

//       const displayPrice =
//         product.current_price || product.price;

//       const isDiscounted =
//         product.discounted_price &&
//         Number(product.discounted_price) <
//           Number(product.price);

// return (

//   <div className="container-fluid py-4">

// ```
// <div className="row g-4">

//   {/* PRODUCT GALLERY */}
//   <div className="col-lg-5">

//     <ProductGallery
//       media={product.media}
//     />

//   </div>

//   {/* PRODUCT INFORMATION */}
//   <div className="col-lg-4">

//     <div className="mb-3">

//       <h2 className="fw-bold">
//         {product.name}
//       </h2>
//       <div className="mb-3">
//   <span className="text-warning">
//     ★★★★★
//   </span>

//   <span className="ms-2">
//     {product.average_rating || 0}
//   </span>

//   <span className="text-muted ms-2">
//     ({product.review_count || 0} Reviews)
//   </span>
// </div>

//       <p className="text-muted">
//         {product.short_description}
//       </p>

//     </div>

//     {/* PRICE */}

//     <div className="mb-4">

//       {isDiscounted && (
//         <div>

//           <span className="text-decoration-line-through text-danger fs-5">
//             ₦
//             {Number(
//               product.price
//             ).toLocaleString()}
//           </span>

//         </div>
//       )}

//       <h2 className="fw-bold text-success">
//         ₦
//         {Number(
//           displayPrice
//         ).toLocaleString()}
//       </h2>

//     </div>

//     {/* DESCRIPTION */}

//     <div className="mb-4">

//       <h5>
//         Product Description
//       </h5>

//       <p>
//         {product.description ||
//           "No description available."}
//       </p>

//     </div>

//     {/* PRODUCT DETAILS */}

//     <div className="card border-0 shadow-sm">

//       <div className="card-body">

//         <h5>
//           Product Details
//         </h5>

//         <hr />

//         <p>
//           <strong>Brand:</strong>{" "}
//           {product.brand || "N/A"}
//         </p>

//         <p>
//           <strong>Stock:</strong>{" "}
//           {product.stock_quantity > 0
//             ? `${product.stock_quantity} Available`
//             : "Out of Stock"}
//         </p>

//         <p>
//           <strong>Category:</strong>{" "}
//           {product.category?.name ||
//             "N/A"}
//         </p>

//       </div>

// <div className="review-card">
//   {/* <h4>Write a Review</h4> */}
// {/* 
//  <select
//   className="review-select"
//   value={rating}
//   onChange={(e) =>
//     setRating(Number(e.target.value))
//   }
// >
//   <option value="5">★★★★★ Excellent</option>
//   <option value="4">★★★★ Very Good</option>
//   <option value="3">★★★ Good</option>
//   <option value="2">★★ Fair</option>
//   <option value="1">★ Poor</option>
// </select>

//   <textarea
//   className="review-textarea"
//   placeholder="Share your experience..."
//   value={comment}
//   onChange={(e) =>
//     setComment(e.target.value)
//   }
// />  

//   <button
//   className="submit-btn"
//   onClick={submitReview}
//   disabled={submittingReview}
// >
//   {submittingReview
//     ? "Submitting..."
//     : "Submit Review"}
// </button>

// <button
//   className="wishlist-btn"
//   onClick={addToWishlist}
//   disabled={addingWishlist}
// >
//   {addingWishlist
//     ? "Adding..."
//     : "❤️ Add To Wishlist"}
// </button> */}
// <hr/>
// <div className="review-section">
//   <h4 className="review-title">
//     Write a Review
//   </h4>

//   <div className="review-form">
//     <select
//       className="review-select"
//       value={rating}
//       onChange={(e) =>
//         setRating(e.target.value)
//       }
//     >
//       <option value="5">
//         ★★★★★ Excellent
//       </option>
//       <option value="4">
//         ★★★★ Very Good
//       </option>
//       <option value="3">
//         ★★★ Good
//       </option>
//       <option value="2">
//         ★★ Fair
//       </option>
//       <option value="1">
//         ★ Poor
//       </option>
//     </select>
//   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//     <textarea
//       className="review-textarea"
//       placeholder="Share your experience..."
//       value={comment}
//       onChange={(e) =>
//         setComment(e.target.value)
//       }
//     />
//   <br/>
//     <div className="review-buttons">
//       <button
//         className="submit-review-btn"
//         onClick={submitReview}
//       >
//         Submit Review
//       </button>
// <hr/>
//       <button
//         className="wishlist-btn"
//         onClick={addToWishlist}
//       >
//         ❤️ Add To Wishlist
//       </button>
//     </div>
//   </div>
// </div>

// </div>
//     </div>

//   </div>

//   {/* TEMU STYLE BUY BOX */}

//   <div className="col-lg-3">

//     <div
//       className="card shadow-sm border-0"
//       style={{
//         position: "sticky",
//         top: "20px",
//       }}
//     >

//       <div className="card-body">

//         <h2 className="text-danger fw-bold">
//           ₦
//           {Number(
//             displayPrice
//           ).toLocaleString()}
//         </h2>

//         {isDiscounted && (
//           <small className="text-success">
//             Discount Available
//           </small>
//         )}

//         <hr />

// <div className="mb-3">
// {/* 
//   <label>
//     Quantity
//   </label> */}

//   <div className="d-flex gap-2">

//     {/* <button
//       className="btn btn-outline-secondary"
//       onClick={() =>
//         setQuantity(
//           Math.max(1, quantity - 1)
//         )
//       }
//     >
//       -
//     </button> */}

   

//   </div>

// </div>

        
//         <button
//           className="btn btn-warning w-100 mb-2"
//           onClick={handleBuyNow}
//         >
//           Buy Now
//         </button>
//         <button
//           className="btn btn-dark w-100"
//           onClick={addToCart}
//           disabled={
//             inCart ||
//             addingToCart ||
//             product.stock_quantity <= 0
//           }
//         >
//           {addingToCart
//             ? "Adding..."
//             : inCart
//             ? "Already In Cart"
//             : "Add To Cart"}
//         </button>

//         <hr />

  
//         <p>
//           🚚 Free Shipping
//         </p>

//         <p>
//           🔒 Secure Checkout
//         </p>

//         <p>
//           📦 Stock:
//           {" "}
//           {product.stock_quantity}
//         </p>

//         <p>
//           ⭐ Quality Guaranteed
//         </p>

//       </div>

//     </div>

//   </div>

// </div>

// {/* RELATED PRODUCTS */}

// <div className="mt-5">

//   <RelatedProducts
//     products={
//       product.similar_products || []
//     }
//   />

// </div>
// ```

//   </div>
// );



//     };

//     export default ProductDetailPage;











//     import React, { useEffect, useState, useMemo } from "react";
//     import { useParams } from "react-router-dom";
//     import api, { BASE_URL } from "../../api";

//     import ProductPagePlaceholder from "./ProductPagePlaceHolder";
//     import RelatedProducts from "./RelatedProducts";
//     import ProductGallery from "./ProductGallery";

//     const ProductDetailPage = ({
//       setNumCartItems,
//       fetchCartStats,
//     }) => {
//       const { slug } = useParams();

//       const [product, setProduct] = useState(null);
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState("");
//       const [inCart, setInCart] = useState(false);
//       const [addingToCart, setAddingToCart] = useState(false);

//       // =====================================
//       // FETCH PRODUCT
//       // =====================================
//       useEffect(() => {
//         const fetchProduct = async () => {
//           try {
//             setLoading(true);
//             setError("");

//             const response = await api.get(
//               `/products/${slug}/`
//             );

//             setProduct(response.data);
//           } catch (err) {
//             console.error("Product Fetch Error:", err);

//             if (err.response) {
//               setError(
//                 err.response.data?.detail ||
//                   err.response.data?.error ||
//                   `Server Error (${err.response.status})`
//               );
//             } else if (err.request) {
//               setError(
//                 "Unable to connect to backend server."
//               );
//             } else {
//               setError(
//                 err.message ||
//                   "An unexpected error occurred."
//               );
//             }
//           } finally {
//             setLoading(false);
//           }
//         };

//         if (slug) {
//           fetchProduct();
//         }
//       }, [slug]);

//       // =====================================
//       // CHECK CART
//       // =====================================
//       useEffect(() => {
//         const checkCartStatus = async () => {
//           try {
//             if (!product?.id) return;

//             const cartCode =
//               localStorage.getItem("cart_code");

//             if (!cartCode) return;

//             const response = await api.get(
//               "/product_in_cart/",
//               {
//                 params: {
//                   cart_code: cartCode,
//                   product_id: product.id,
//                 },
//               }
//             );

//             setInCart(
//               response.data.product_in_cart || false
//             );
//           } catch (err) {
//             console.error(
//               "Cart Check Error:",
//               err.response?.data || err.message
//             );
//           }
//         };

//         checkCartStatus();
//       }, [product]);

//       // =====================================
//       // ADD TO CART
//       // =====================================

//       const addToCart = async () => {
//         const confirmed = window.confirm(
//         `Do you want to Add "${product.name}" to cart?`
//         );

//         try {
//           if (!product?.id) {
//             return;
//           }

//           setAddingToCart(true);

//           let cartCode =
//             localStorage.getItem("cart_code");

//           if (!cartCode) {
//             cartCode = crypto.randomUUID();

//             localStorage.setItem(
//               "cart_code",
//               cartCode
//             );
//           }

//           const response = await api.post(
//             "/add_item/",
//             {
//               cart_code: cartCode,
//               product_id: product.id,
//             }
//           );

//           console.log(
//             "Add To Cart Response:",
//             response.data
//           );

//           setInCart(true);

//           // Refresh cart count from server
//           if (
//             typeof fetchCartStats === "function"
//           ) {
//             await fetchCartStats();
//           }

//           // Success notification
//           toast.success(
//             `${product.name} added to cart successfully`
//           );

//         } catch (err) {
//           console.error(
//             "Add To Cart Error:",
//             err.response?.data || err
//           );

//           toast.error(
//             err.response?.data?.detail ||
//             err.response?.data?.error ||
//             "Failed to add item to cart."
//           );
//         } finally {
//           setAddingToCart(false);
//         }
//       };

//       // const addToCart = async () => {
//       //   try {
//       //     if (!product?.id) return;

//       //     setAddingToCart(true);

//       //     let cartCode =
//       //       localStorage.getItem("cart_code");

//       //     if (!cartCode) {
//       //       cartCode = crypto.randomUUID();
//       //       localStorage.setItem(
//       //         "cart_code",
//       //         cartCode
//       //       );
//       //     }

//       //     await api.post("/add_item/", {
//       //       cart_code: cartCode,
//       //       product_id: product.id,
//       //     });

//       //     setInCart(true);

//       //     if (
//       //       typeof fetchCartStats === "function"
//       //     ) {
//       //       await fetchCartStats();
//       //     }

//       //     if (
//       //       typeof setNumCartItems === "function"
//       //     ) {
//       //       setNumCartItems((prev) => prev + 1);
//       //     }
//       //   } catch (err) {
//       //     console.error(
//       //       "Add To Cart Error:",
//       //       err.response?.data || err
//       //     );

//       //     alert(
//       //       err.response?.data?.detail ||
//       //         err.response?.data?.error ||
//       //         "Failed to add item to cart."
//       //     );
//       //   } finally {
//       //     setAddingToCart(false);
//       //   }
//       // };

//       // =====================================
//       // MEDIA
//       // =====================================
//       const primaryMedia = useMemo(() => {
//         if (!product?.media?.length) return null;

//         return (
//           product.media.find(
//             (item) => item.is_primary
//           ) || product.media[0]
//         );
//       }, [product]);

//       const mediaUrl = primaryMedia?.file
//         ? primaryMedia.file.startsWith("http")
//           ? primaryMedia.file
//           : `${BASE_URL}${primaryMedia.file}`
//         : "/placeholder.jpg";

//       // =====================================
//       // UI STATES
//       // =====================================
//       if (loading) {
//         return <ProductPagePlaceholder />;
//       }

//       if (error) {
//         return (
//           <div className="container py-5">
//             <div className="alert alert-danger">
//               {error}
//             </div>
//           </div>
//         );
//       }

//       if (!product) {
//         return (
//           <div className="container py-5">
//             <div className="alert alert-warning">
//               Product not found.
//             </div>
//           </div>
//         );
//       }

//       const displayPrice =
//         product.current_price || product.price;

//       const isDiscounted =
//         product.discounted_price &&
//         Number(product.discounted_price) <
//           Number(product.price);

// return (

//   <div className="container-fluid py-4">

// ```
// <div className="row g-4">

//   {/* PRODUCT GALLERY */}
//   <div className="col-lg-5">

//     <ProductGallery
//       media={product.media}
//     />

//   </div>

//   {/* PRODUCT INFORMATION */}
//   <div className="col-lg-4">

//     <div className="mb-3">

//       <h2 className="fw-bold">
//         {product.name}
//       </h2>

//       <p className="text-muted">
//         {product.short_description}
//       </p>

//     </div>

//     {/* PRICE */}

//     <div className="mb-4">

//       {isDiscounted && (
//         <div>

//           <span className="text-decoration-line-through text-danger fs-5">
//             ₦
//             {Number(
//               product.price
//             ).toLocaleString()}
//           </span>

//         </div>
//       )}

//       <h2 className="fw-bold text-success">
//         ₦
//         {Number(
//           displayPrice
//         ).toLocaleString()}
//       </h2>

//     </div>

//     {/* DESCRIPTION */}

//     <div className="mb-4">

//       <h5>
//         Product Description
//       </h5>

//       <p>
//         {product.description ||
//           "No description available."}
//       </p>

//     </div>

//     {/* PRODUCT DETAILS */}

//     <div className="card border-0 shadow-sm">

//       <div className="card-body">

//         <h5>
//           Product Details
//         </h5>

//         <hr />

//         <p>
//           <strong>Brand:</strong>{" "}
//           {product.brand || "N/A"}
//         </p>

//         <p>
//           <strong>Stock:</strong>{" "}
//           {product.stock_quantity > 0
//             ? `${product.stock_quantity} Available`
//             : "Out of Stock"}
//         </p>

//         <p>
//           <strong>Category:</strong>{" "}
//           {product.category?.name ||
//             "N/A"}
//         </p>

//       </div>

//     </div>

//   </div>

//   {/* TEMU STYLE BUY BOX */}

//   <div className="col-lg-3">

//     <div
//       className="card shadow-sm border-0"
//       style={{
//         position: "sticky",
//         top: "20px",
//       }}
//     >

//       <div className="card-body">

//         <h2 className="text-danger fw-bold">
//           ₦
//           {Number(
//             displayPrice
//           ).toLocaleString()}
//         </h2>

//         {isDiscounted && (
//           <small className="text-success">
//             Discount Available
//           </small>
//         )}

//         <hr />

//         <button
//           className="btn btn-warning w-100 mb-2"
//         >
//           Buy Now
//         </button>

//         <button
//           className="btn btn-dark w-100"
//           onClick={addToCart}
//           disabled={
//             inCart ||
//             addingToCart ||
//             product.stock_quantity <= 0
//           }
//         >
//           {addingToCart
//             ? "Adding..."
//             : inCart
//             ? "Already In Cart"
//             : "Add To Cart"}
//         </button>

//         <hr />

//         <p>
//           🚚 Free Shipping
//         </p>

//         <p>
//           🔒 Secure Checkout
//         </p>

//         <p>
//           📦 Stock:
//           {" "}
//           {product.stock_quantity}
//         </p>

//         <p>
//           ⭐ Quality Guaranteed
//         </p>

//       </div>

//     </div>

//   </div>

// </div>

// {/* RELATED PRODUCTS */}

// <div className="mt-5">

//   <RelatedProducts
//     products={
//       product.similar_products || []
//     }
//   />

// </div>
// ```

//   </div>
// );



//     };

//     export default ProductDetailPage;










// import React, { useEffect, useState, useMemo } from "react";
    // import { useParams } from "react-router-dom";
    // import api, { BASE_URL } from "../../api";

    // import ProductPagePlaceholder from "./ProductPagePlaceHolder";
    // import RelatedProducts from "./RelatedProducts";
    // import ProductGallery from "./ProductGallery";

    // const ProductDetailPage = ({
    //   setNumCartItems,
    //   fetchCartStats,
    // }) => {
    //   const { slug } = useParams();

    //   const [product, setProduct] = useState(null);
    //   const [loading, setLoading] = useState(true);
    //   const [error, setError] = useState("");
    //   const [inCart, setInCart] = useState(false);
    //   const [addingToCart, setAddingToCart] = useState(false);

    //   // =====================================
    //   // FETCH PRODUCT
    //   // =====================================
    //   useEffect(() => {
    //     const fetchProduct = async () => {
    //       try {
    //         setLoading(true);
    //         setError("");

    //         const response = await api.get(
    //           `/products/${slug}/`
    //         );

    //         setProduct(response.data);
    //       } catch (err) {
    //         console.error("Product Fetch Error:", err);

    //         if (err.response) {
    //           setError(
    //             err.response.data?.detail ||
    //               err.response.data?.error ||
    //               `Server Error (${err.response.status})`
    //           );
    //         } else if (err.request) {
    //           setError(
    //             "Unable to connect to backend server."
    //           );
    //         } else {
    //           setError(
    //             err.message ||
    //               "An unexpected error occurred."
    //           );
    //         }
    //       } finally {
    //         setLoading(false);
    //       }
    //     };

    //     if (slug) {
    //       fetchProduct();
    //     }
    //   }, [slug]);

    //   // =====================================
    //   // CHECK CART
    //   // =====================================
    //   useEffect(() => {
    //     const checkCartStatus = async () => {
    //       try {
    //         if (!product?.id) return;

    //         const cartCode =
    //           localStorage.getItem("cart_code");

    //         if (!cartCode) return;

    //         const response = await api.get(
    //           "/product_in_cart/",
    //           {
    //             params: {
    //               cart_code: cartCode,
    //               product_id: product.id,
    //             },
    //           }
    //         );

    //         setInCart(
    //           response.data.product_in_cart || false
    //         );
    //       } catch (err) {
    //         console.error(
    //           "Cart Check Error:",
    //           err.response?.data || err.message
    //         );
    //       }
    //     };

    //     checkCartStatus();
    //   }, [product]);

    //   // =====================================
    //   // ADD TO CART
    //   // =====================================
    //   const addToCart = async () => {
    //     try {
    //       if (!product?.id) return;

    //       setAddingToCart(true);

    //       let cartCode =
    //         localStorage.getItem("cart_code");

    //       if (!cartCode) {
    //         cartCode = crypto.randomUUID();
    //         localStorage.setItem(
    //           "cart_code",
    //           cartCode
    //         );
    //       }

    //       await api.post("/add_item/", {
    //         cart_code: cartCode,
    //         product_id: product.id,
    //       });

    //       setInCart(true);

    //       if (
    //         typeof fetchCartStats === "function"
    //       ) {
    //         await fetchCartStats();
    //       }

    //       if (
    //         typeof setNumCartItems === "function"
    //       ) {
    //         setNumCartItems((prev) => prev + 1);
    //       }
    //     } catch (err) {
    //       console.error(
    //         "Add To Cart Error:",
    //         err.response?.data || err
    //       );

    //       alert(
    //         err.response?.data?.detail ||
    //           err.response?.data?.error ||
    //           "Failed to add item to cart."
    //       );
    //     } finally {
    //       setAddingToCart(false);
    //     }
    //   };

    //   // =====================================
    //   // MEDIA
    //   // =====================================
    //   const primaryMedia = useMemo(() => {
    //     if (!product?.media?.length) return null;

    //     return (
    //       product.media.find(
    //         (item) => item.is_primary
    //       ) || product.media[0]
    //     );
    //   }, [product]);

    //   const mediaUrl = primaryMedia?.file
    //     ? primaryMedia.file.startsWith("http")
    //       ? primaryMedia.file
    //       : `${BASE_URL}${primaryMedia.file}`
    //     : "/placeholder.jpg";

    //   // =====================================
    //   // UI STATES
    //   // =====================================
    //   if (loading) {
    //     return <ProductPagePlaceholder />;
    //   }

    //   if (error) {
    //     return (
    //       <div className="container py-5">
    //         <div className="alert alert-danger">
    //           {error}
    //         </div>
    //       </div>
    //     );
    //   }

    //   if (!product) {
    //     return (
    //       <div className="container py-5">
    //         <div className="alert alert-warning">
    //           Product not found.
    //         </div>
    //       </div>
    //     );
    //   }

    //   const displayPrice =
    //     product.current_price || product.price;

    //   const isDiscounted =
    //     product.discounted_price &&
    //     Number(product.discounted_price) <
    //       Number(product.price);

    //   return (
    //     <div className="container py-4">
    //       <div className="row g-4">

    //         {/* MEDIA */}
    // {/* <div className="col-lg-5"> */}
    // <div className="col-md-6">

    //   <ProductGallery
    //     media={product.media}
    //   />

    // </div>

    //         {/* <div className="col-md-6">

    //           {primaryMedia?.media_type ===
    //           "video" ? (
    //             <video
    //               controls
    //               className="w-100 rounded shadow"
    //             >
    //               <source
    //                 src={mediaUrl}
    //                 type="video/mp4"
    //               />
    //             </video>
    //           ) : (
    //             <img
    //               src={mediaUrl}
    //               alt={product.name}
    //               className="img-fluid rounded shadow"
    //               onError={(e) => {
    //                 e.target.src =
    //                   "/placeholder.jpg";
    //               }}
    //             />
    //           )}

    //         </div> */}

    //         {/* DETAILS */}
    //         <div className="col-md-6">

    //           <h2>{product.name}</h2>

    //           <p className="text-muted">
    //             {product.short_description}
    //           </p>

    //           <div className="mb-3">

    //             {isDiscounted && (
    //               <h5 className="text-danger text-decoration-line-through">
    //                 ₦
    //                 {Number(
    //                   product.price
    //                 ).toLocaleString()}
    //               </h5>
    //             )}

    //             <h3 className="text-success">
    //               ₦
    //               {Number(
    //                 displayPrice
    //               ).toLocaleString()}
    //             </h3>

    //           </div>

    //           <p>
    //             {product.description ||
    //               "No description available"}
    //           </p>

    //           <p>
    //             <strong>Brand:</strong>{" "}
    //             {product.brand || "N/A"}
    //           </p>

    //           <p>
    //             <strong>Stock:</strong>{" "}
    //             {product.stock_quantity > 0
    //               ? `${product.stock_quantity} Available`
    //               : "Out of Stock"}
    //           </p>

    //           <button
    //             className="btn btn-dark"
    //             onClick={addToCart}
    //             disabled={
    //               inCart ||
    //               addingToCart ||
    //               product.stock_quantity <= 0
    //             }
    //           >
    //             {addingToCart
    //               ? "Adding..."
    //               : inCart
    //               ? "Already In Cart"
    //               : "Add To Cart"}
    //           </button>

    //         </div>
    //       </div>

    //       <RelatedProducts
    //         products={
    //           product.similar_products || []
    //         }
    //       />
    //     </div>
    //   );
    // };

    // export default ProductDetailPage;





// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api, { BASE_URL } from "../../api";

// import ProductPagePlaceholder from "./ProductPagePlaceHolder";
// import RelatedProducts from "./RelatedProducts";

// const ProductDetailPage = ({
//   setNumCartItems,
//   fetchCartStats,
// }) => {
//   const { slug } = useParams();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [inCart, setInCart] = useState(false);

//   // =====================================
//   // FETCH PRODUCT
//   // =====================================
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.get(`/products/${slug}/`);

//         console.log("Product Data:", response.data);

//         setProduct(response.data);
//       } catch (err) {
//         console.error("Product Fetch Error:", err);

//         if (err.response) {
//           setError(
//             err.response.data?.detail ||
//             err.response.data?.error ||
//             `Server Error (${err.response.status})`
//           );
//         } else if (err.request) {
//           setError("Cannot connect to backend server.");
//         } else {
//           setError(err.message);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug) {
//       fetchProduct();
//     }
//   }, [slug]);

//   // =====================================
//   // CHECK PRODUCT IN CART
//   // =====================================
//   useEffect(() => {
//     const checkProductInCart = async () => {
//       try {
//         if (!product?.id) return;

//         const cartCode = localStorage.getItem("cart_code");

//         if (!cartCode) return;

//         const response = await api.get("/product_in_cart/", {
//           params: {
//             cart_code: cartCode,
//             product_id: product.id,
//           },
//         });

//         console.log("Product In Cart:", response.data);

//         setInCart(response.data.product_in_cart);
//       } catch (err) {
//         console.error(
//           "Product In Cart Error:",
//           err.response?.data || err.message
//         );
//       }
//     };

//     checkProductInCart();
//   }, [product]);

//   // =====================================
//   // ADD TO CART
//   // =====================================
//   const addToCart = async () => {
//     try {
//       if (!product?.id) return;

//       let cartCode = localStorage.getItem("cart_code");

//       if (!cartCode) {
//         cartCode = `CART-${crypto.randomUUID()}`;
//         localStorage.setItem("cart_code", cartCode);
//       }

//       const payload = {
//         cart_code: cartCode,
//         product_id: product.id,
//       };

//       console.log("Sending Payload:", payload);

//       const response = await api.post(
//         "/add_item/",
//         payload
//       );

//       console.log("Add To Cart Success:", response.data);

//       setInCart(true);

//       if (typeof fetchCartStats === "function") {
//         await fetchCartStats();
//       }

//       if (typeof setNumCartItems === "function") {
//         setNumCartItems((prev) => prev + 1);
//       }

//       alert("Product added successfully");
//     } catch (err) {
//       console.error("Add To Cart Error");

//       console.error("Status:", err.response?.status);
//       console.error("Data:", err.response?.data);
//       console.error("Full Error:", err);

//       alert(
//         err.response?.data?.detail ||
//         err.response?.data?.error ||
//         "Failed to add product to cart"
//       );
//     }
//   };

//   // =====================================
//   // LOADING
//   // =====================================
//   if (loading) {
//     return <ProductPagePlaceholder />;
//   }

//   // =====================================
//   // ERROR
//   // =====================================
//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   // =====================================
//   // NO PRODUCT
//   // =====================================
//   if (!product) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-warning">
//           Product not found.
//         </div>
//       </div>
//     );
//   }

//   // const imageUrl = product.image
//   //   ? product.image.startsWith("http")
//   //     ? product.image
//   //     : `${BASE_URL}${product.image}`
//   //   : "/placeholder.jpg";

// const primaryImage =
//   product?.media?.find(
//     (item) => item.is_primary
//   ) || product?.media?.[0];

// const imageUrl = primaryImage?.file
//   ? primaryImage.file.startsWith("http")
//     ? primaryImage.file
//     : `http://127.0.0.1:8001${primaryImage.file}`
//   : "/placeholder.jpg";


//   return (
//     <div className="container py-4">
//       <div className="row">

//         <div className="col-md-6">
//           <img
//             src={imageUrl}
//             alt={product.name}
//             className="img-fluid rounded shadow"
//             onError={(e) => {
//               e.target.src = "/placeholder.jpg";
//             }}
//           />
//         </div>

//         <div className="col-md-6">
//           <h2>{product.name}</h2>

//           <p>
//             {product.description ||
//               "No description available"}
//           </p>

//           <h4 className="text-success">
//             ₦{Number(product.price).toLocaleString()}
//           </h4>

//           <button
//             className="btn btn-dark"
//             onClick={addToCart}
//             disabled={inCart}
//           >
//             {inCart
//               ? "Already In Cart"
//               : "Add To Cart"}
//           </button>
//         </div>

//       </div>

//       <RelatedProducts
//         products={product.similar_products || []}
//       />
//     </div>
//   );
// };

// export default ProductDetailPage;


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api, { BASE_URL } from "../../api";

// import ProductPagePlaceholder from "./ProductPagePlaceHolder";
// import RelatedProducts from "./RelatedProducts";

// const ProductDetailPage = ({
//   setNumCartItems,
//   fetchCartStats,
// }) => {
//   const { slug } = useParams();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [inCart, setInCart] = useState(false);

//   const cartCode = localStorage.getItem("cart_code");

//   // Fetch product
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.get(`/products/${slug}/`);
//         setProduct(response.data);
//       } catch (err) {
//         console.error("Product fetch error:", err);

//         if (err.response) {
//           setError(
//             err.response.data?.detail ||
//               err.response.data?.error ||
//               `Server Error (${err.response.status})`
//           );
//         } else if (err.request) {
//           setError("Unable to connect to server.");
//         } else {
//           setError(err.message || "Something went wrong.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug) {
//       fetchProduct();
//     }
//   }, [slug]);

//   // Check if product is already in cart
//   useEffect(() => {
//     if (!product?.id || !cartCode) return;

//     const checkCart = async () => {
//       try {
//         const res = await api.get(
//           `/product_in_cart/?cart_code=${cartCode}&product_id=${product.id}`
//         );

//         setInCart(res.data.product_in_cart);
//       } catch (err) {
//         console.log("Cart check error:", err.message);
//       }
//     };

//     checkCart();
//   }, [product, cartCode]);

//   const addToCart = async () => {
//     try {
//       if (!product?.id) return;

//       let code = localStorage.getItem("cart_code");

//       if (!code) {
//         code = crypto.randomUUID();
//         localStorage.setItem("cart_code", code);
//       }

//       const payload = {
//         cart_code: code,
//         product_id: product.id,
//       };

//       const response = await api.post("/add_item/", payload);

//       console.log("Cart Response:", response.data);

//       setInCart(true);

//       // Refresh cart count from backend
//       if (typeof fetchCartStats === "function") {
//         await fetchCartStats();
//       }

//       alert("Product added to cart");
//     } catch (err) {
//       console.error("Add To Cart Error:", err);

//       alert(
//         err.response?.data?.detail ||
//           err.response?.data?.error ||
//           "Failed to add product"
//       );
//     }
//   };

//   if (loading) {
//     return <ProductPagePlaceholder />;
//   }

//   if (error) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-danger">
//           <strong>Error:</strong> {error}
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="container py-5">
//         <div className="alert alert-warning">
//           Product not found.
//         </div>
//       </div>
//     );
//   }

//   const imageUrl = product?.image
//     ? product.image.startsWith("http")
//       ? product.image
//       : `${BASE_URL}${product.image}`
//     : "/placeholder.jpg";

//   return (
//     <div className="container py-4">
//       <div className="row align-items-center">
//         <div className="col-md-6 mb-4">
//           <img
//             src={imageUrl}
//             alt={product?.name || "Product"}
//             className="img-fluid rounded shadow-sm"
//             onError={(e) => {
//               e.currentTarget.src = "/placeholder.jpg";
//             }}
//           />
//         </div>

//         <div className="col-md-6">
//           <h2>{product?.name}</h2>

//           <p className="text-muted">
//             {product?.description ||
//               "No description available."}
//           </p>

//           <h4 className="fw-bold text-success">
//             ₦{Number(product?.price || 0).toLocaleString()}
//           </h4>

//           <button
//             className="btn btn-dark mt-3"
//             onClick={addToCart}
//             disabled={inCart}
//           >
//             {inCart
//               ? "Product Added To Cart"
//               : "Add To Cart"}
//           </button>
//         </div>
//       </div>

//       <RelatedProducts
//         products={product?.similar_products || []}
//       />
//     </div>
//   );
// };

// export default ProductDetailPage;


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api, { BASE_URL } from "../../api";

// import ProductPagePlaceholder from "./ProductPagePlaceHolder";
// import RelatedProducts from "./RelatedProducts";

// const ProductDetailPage = ({setNumCartItems}) => {
//     const { slug } = useParams();

//     const [product, setProduct] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [inCart, setInCart] = useState(false);

//     const cartCode = localStorage.getItem("cart_code");

//     // Fetch product
//     useEffect(() => {
//         const fetchProduct = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const response = await api.get(`/products/${slug}/`);
//                 setProduct(response.data);

//             } catch (err) {
//                 console.error("Product fetch error:", err);

//                 if (err.response) {
//                     setError(
//                         err.response.data?.detail ||
//                         err.response.data?.error ||
//                         `Server Error (${err.response.status})`
//                     );
//                 } else if (err.request) {
//                     setError("Unable to connect to server.");
//                 } else {
//                     setError(err.message || "Something went wrong.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (slug) fetchProduct();
//     }, [slug]);

//     // Check if product is in cart (runs AFTER product loads)
//     useEffect(() => {
//         if (!product?.id || !cartCode) return;

//         api.get(
//             `/product_in_cart?cart_code=${cartCode}&product_id=${product.id}`
//         )
//             .then(res => {
//                 setInCart(res.data.product_in_cart);
//             })
//             .catch(err => {
//                 console.log("Cart check error:", err.message);
//             });

//     }, [product, cartCode]);

//     const addToCart = async () => {
//         try {
//             if (!product?.id) return;

//             let code = localStorage.getItem("cart_code");

//             if (!code) {
//                 code = crypto.randomUUID();
//                 localStorage.setItem("cart_code", code);
//             }

//             const payload = {
//                 cart_code: code,
//                 product_id: product.id,
//             };

//             const response = await api.post("/add_item/", payload);

//             console.log("Cart Response:", response.data);
//             setInCart(true);
//             alert("Product added to cart");
//             setNumCartItems(curr => curr + 1);

//         } catch (err) {
//             console.error("Add To Cart Error:", err);

//             alert(
//                 err.response?.data?.detail ||
//                 err.response?.data?.error ||
//                 "Failed to add product"
//             );
//         }
//     };

//     if (loading) return <ProductPagePlaceholder />;

//     if (error) {
//         return (
//             <div className="container py-5">
//                 <div className="alert alert-danger">
//                     <strong>Error:</strong> {error}
//                 </div>
//             </div>
//         );
//     }

//     if (!product) {
//         return (
//             <div className="container py-5">
//                 <div className="alert alert-warning">
//                     Product not found.
//                 </div>
//             </div>
//         );
//     }

//     const imageUrl = product?.image
//         ? product.image.startsWith("http")
//             ? product.image
//             : `${BASE_URL}${product.image}`
//         : "/placeholder.jpg";

//     return (
//         <div className="container py-4">
//             <div className="row align-items-center">

//                 <div className="col-md-6 mb-4">
//                     <img
//                         src={imageUrl}
//                         alt={product?.name || "Product"}
//                         className="img-fluid rounded shadow-sm"
//                         onError={(e) => {
//                             e.currentTarget.src = "/placeholder.jpg";
//                         }}
//                     />
//                 </div>

//                 <div className="col-md-6">
//                     <h2>{product?.name}</h2>

//                     <p className="text-muted">
//                         {product?.description || "No description available."}
//                     </p>

//                     <h4 className="fw-bold text-success">
//                         ₦{Number(product?.price || 0).toLocaleString()}
//                     </h4>

//                     <button
//                         className="btn btn-dark mt-3"
//                         onClick={addToCart}
//                         disabled={inCart}
//                     >
//                         {inCart ? "Product Added To Cart" : "Add To Cart"}
//                     </button>
//                 </div>
//             </div>

//             <RelatedProducts products={product?.similar_products || []} />
//         </div>
//     );
// };

// export default ProductDetailPage;
