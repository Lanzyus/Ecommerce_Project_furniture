
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../../api";
import Spinner from "./spinner";
import "./SearchResultsPage.css";

const SearchResultsPage = () => {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);

  const search = queryParams.get("search") || "";
  const category = queryParams.get("category") || "";
  const brand = queryParams.get("brand") || "";
  const minPrice = queryParams.get("min_price") || "";
  const maxPrice = queryParams.get("max_price") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = {};

        if (search) params.search = search;
        if (category) params.category = category;
        if (brand) params.brand = brand;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const response = await api.get("/products/", {
          params,
        });

        setProducts(response.data);
      } catch (error) {
        console.error(
          "Search Error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, brand, minPrice, maxPrice]);

  if (loading) {
    return <Spinner loading={true} />;
  }

  return (
    <div className="container py-5 search-page">
      <div className="mb-4">
        <h2 className="fw-bold">
          Search Results
        </h2>

        <p className="text-muted">
          {products.length} product(s) found
          {search && (
            <> for "<strong>{search}</strong>"</>
          )}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <h4>No products found</h4>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2"
            >
                        
              <div className="card product-card h-100 border-0">

                <Link
                  to={`/products/${product.slug}`}
                >
                  {/* <img
                    src={
                      product?.media?.[0]?.file
                        ? `http://127.0.0.1:8001${product.media[0].file}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="card-img-top product-image"
                  /> */}
               <img
                  src={
                    product?.media?.[0]?.file_url ||
                    product?.primary_image ||
                    "/placeholder.jpg"
                  }
                  alt={product.name}
                  className="card-img-top product-image"
                />
                </Link>

                <div className="card-body">
                  <Link
                    to={`/products/${product.slug}`}
                    className="text-decoration-none text-dark"
                  >
                    <h6 className="product-title">
                      {product.name}
                    </h6>
                  </Link>

                  <h5 className="text-danger fw-bold">
                    ₦
                    {Number(
                      product.current_price || 0
                    ).toLocaleString()}
                  </h5>

                  <Link
                    to={`/products/${product.slug}`}
                    className="btn btn-primary w-100 mt-2"
                  >
                    View Product
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;


// // GET /api/products/?search=phone
// // GET /api/products/?category=electronics
// // GET /api/products/?brand=samsung
// // GET /api/products/?min_price=10000&max_price=50000

// import React, { useEffect, useState } from "react";
// import { useLocation, Link } from "react-router-dom";
// import api from "../../api";
// import Spinner from "./Spinner";
// import { BASE_URL } from "../../api";


// const SearchResultsPage = () => {
//   const location = useLocation();

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const queryParams = new URLSearchParams(location.search);

//   const search = queryParams.get("search") || "";
//   const category = queryParams.get("category") || "";
//   const brand = queryParams.get("brand") || "";
//   const minPrice = queryParams.get("min_price") || "";
//   const maxPrice = queryParams.get("max_price") || "";

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);

//         const params = {};

//         if (search) params.search = search;
//         if (category) params.category = category;
//         if (brand) params.brand = brand;
//         if (minPrice) params.min_price = minPrice;
//         if (maxPrice) params.max_price = maxPrice;

//         const response = await api.get("/products/", {
//           params,
//         });

//         setProducts(response.data);
//       } catch (error) {
//         console.error(
//           "Search Error:",
//           error.response?.data || error.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [search, category, brand, minPrice, maxPrice]);

//   if (loading) {
//     return <Spinner loading={true} />;
//   }

  
//   return (
//     <div className="row">
// {products.map((product) => (
//   <div
//     key={product.id}
//     className="col-md-3 mb-4"
//   >
//     <div className="card h-100">

//       <Link
//         to={`/products/${product.slug}`}
//         className="text-decoration-none"
//       >
//         {/* <img
//           src={`${BASE_URL}${product.primary_image}`}
//           alt={product.name}
//           className="card-img-top"
//           style={{
//             height: "220px",
//             objectFit: "cover",
//           }}
//         /> */}
//           <img
//             src={
//               product?.media?.[0]?.file
//                 ? `http://127.0.0.1:8001${product.media[0].file}`
//                 : "/placeholder.jpg"
//             }
//             alt={product?.name || "Product Image"}
//             className="card-img-top"
//             style={{
//               height: "180px",
//               objectFit: "cover",
//             }}
//           />
            
           

    
//         {/* <img
//           src={product.primary_image}
//           alt={product.name}
//           className="card-img-top"
//           style={{
//             height: "220px",
//             objectFit: "cover",
//           }}
//         /> */}
//       </Link>

//       <div className="card-body">

//         <Link
//           to={`/products/${product.slug}`}
//           className="text-decoration-none text-dark"
//         >
//           <h6>{product.name}</h6>
//         </Link>

//         <p className="fw-bold">
//           ₦{Number(product.current_price).toLocaleString()}
//         </p>

//       </div>
//     </div>
//   </div>
// ))}
//   {/* {products.map((product) => (
//     <div
//       key={product.id}
//       className="col-lg-3 col-md-4 col-sm-6 mb-4"
//     >
//       <div className="card h-100">
//         <img
//           src={product.primary_image}
//           alt={product.name}
//           className="card-img-top"
//           style={{
//             height: "220px",
//             objectFit: "contain",
//           }}
//         />

//         <div className="card-body">
//           <h6>{product.name}</h6>

//           <p className="fw-bold text-danger">
//             ₦
//             {Number(
//               product.current_price || 0
//             ).toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </div>
//   ))} */}
// </div>
//   );
// };

// export default SearchResultsPage;
