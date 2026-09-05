import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="card h-100 shadow-sm">
      <img
        src={product.primary_image}
        alt={product.name}
        className="card-img-top"
        style={{
          height: "220px",
          objectFit: "contain",
        }}
      />

      <div className="card-body">
        <h6>{product.name}</h6>

        <p className="fw-bold text-danger">
          ₦{Number(product.current_price).toLocaleString()}
        </p>

        <Link
          to={`/products/${product.slug}`}
          className="btn btn-primary w-100"
        >
          View Product
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;