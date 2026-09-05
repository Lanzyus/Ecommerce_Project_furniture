import { useEffect, useState } from "react";
import Header from "./Header";
import CardContainer from "./CardContainer";
import api from "../../api";
import PlaceholderContainer from "../ui/PlaceholderContainer";
import Error from "../ui/Error";
import { generateCartCode } from "../../GenerateCartCode";
import HeroSection from "./HeroSection";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currency] = useState("NGN");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10000;

  // Initialize cart code once
  useEffect(() => {
    let cart = localStorage.getItem("cart_code");

    if (!cart) {
      cart = generateCartCode();
      localStorage.setItem("cart_code", cart);
    }

    console.log("Cart ready:", cart);
  }, []);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products/");
        setProducts(response.data);
      } catch (err) {
        console.error("Product fetch error:", err);

        if (err.response) {
          setError(
            err.response.data?.detail ||
            err.response.data?.error ||
            `Server Error (${err.response.status})`
          );
        } else if (err.request) {
          setError("Unable to connect to server.");
        } else {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Pagination Logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct =
    indexOfLastProduct - itemsPerPage;

  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(
    products.length / itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
  <>
    <Header />

    {error && <Error error={error} />}

    {loading ? (
      <PlaceholderContainer />
    ) : (
      <>
        {/* HERO CAROUSEL */}
        <HeroSection />

        {/* PRODUCTS */}
        <CardContainer
          products={currentProducts}
          currency={currency}
        />

        {totalPages > 1 && (
          <div className="container my-4">
            <div className="d-flex justify-content-center align-items-center gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="fw-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-outline-primary"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </>
);
};
export default HomePage;






















// import { useEffect, useState } from "react";
// import Header from "./Header";
// import CardContainer from "./CardContainer";
// import api from "../../api";
// import PlaceholderContainer from "../ui/PlaceholderContainer";
// import Error from "../ui/Error";
// import { generateCartCode } from "../../GenerateCartCode";
// import HeroSection from "./HeroSection";

// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [currency] = useState("NGN");

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   // Initialize cart code once
//   useEffect(() => {
//     let cart = localStorage.getItem("cart_code");

//     if (!cart) {
//       cart = generateCartCode();
//       localStorage.setItem("cart_code", cart);
//     }

//     console.log("Cart ready:", cart);
//   }, []);

//   // Load products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.get("/products/");
//         setProducts(response.data);
//       } catch (err) {
//         console.error("Product fetch error:", err);

//         if (err.response) {
//           setError(
//             err.response.data?.detail ||
//             err.response.data?.error ||
//             `Server Error (${err.response.status})`
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

//     fetchProducts();
//   }, []);

//   // Pagination Logic
//   const indexOfLastProduct = currentPage * itemsPerPage;
//   const indexOfFirstProduct =
//     indexOfLastProduct - itemsPerPage;

//   const currentProducts = products.slice(
//     indexOfFirstProduct,
//     indexOfLastProduct
//   );

//   const totalPages = Math.ceil(
//     products.length / itemsPerPage
//   );

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prev) => prev - 1);
//     }
//   };

//   return (
//   <>
//     <Header />

//     {error && <Error error={error} />}

//     {loading ? (
//       <PlaceholderContainer />
//     ) : (
//       <>
//         {/* HERO CAROUSEL */}
//         <HeroSection />

//         {/* PRODUCTS */}
//         <CardContainer
//           products={currentProducts}
//           currency={currency}
//         />

//         {totalPages > 1 && (
//           <div className="container my-4">
//             <div className="d-flex justify-content-center align-items-center gap-3">
//               <button
//                 className="btn btn-outline-secondary"
//                 onClick={prevPage}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>

//               <span className="fw-bold">
//                 Page {currentPage} of {totalPages}
//               </span>

//               <button
//                 className="btn btn-outline-primary"
//                 onClick={nextPage}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </>
//     )}
//   </>
// );
//   // return (
//   //   <>
//   //     <Header />

//   //     {error && <Error error={error} />}

//   //     {loading ? (
//   //       <PlaceholderContainer />
//   //     ) : (
//   //       <>
//   //         <CardContainer
//   //           products={currentProducts}
//   //           currency={currency}
//   //         />

//   //         {totalPages > 1 && (
//   //           <div className="container my-4">
//   //             <div className="d-flex justify-content-center align-items-center gap-3">
//   //               <button
//   //                 className="btn btn-outline-secondary"
//   //                 onClick={prevPage}
//   //                 disabled={currentPage === 1}
//   //               >
//   //                 Previous
//   //               </button>

//   //               <span className="fw-bold">
//   //                 Page {currentPage} of {totalPages}
//   //               </span>

//   //               <button
//   //                 className="btn btn-outline-primary"
//   //                 onClick={nextPage}
//   //                 disabled={currentPage === totalPages}
//   //               >
//   //                 Next
//   //               </button>
//   //             </div>
//   //           </div>
//   //         )}
//   //       </>
//   //     )}
//   //   </>
//   // );
// };

// export default HomePage;

// import { useEffect, useState } from "react";
// import Header from "./Header";
// import CardContainer from "./CardContainer";
// import api from "../../api";
// import PlaceholderContainer from "../ui/PlaceholderContainer";
// import Error from "../ui/Error";
// import { generateCartCode } from "../../GenerateCartCode";
// // import { generateCartCode } from "../GenerateCartCode";


// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [currency] = useState("NGN");

//   // Initialize cart code once
//   useEffect(() => {
//       let cart = localStorage.getItem("cart_code");

//       if (!cart) {
//           cart = generateCartCode();
//           localStorage.setItem("cart_code", cart);
//       }

//       console.log("Cart ready:", cart);
//   }, []);



//   // Load products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await api.get("/products/");
//         setProducts(response.data);
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

//     fetchProducts();
//   }, []);

//   return (
//     <>
//       <Header />

//       {error && <Error error={error} />}

//       {loading ? (
//         <PlaceholderContainer />
//       ) : (
//         <CardContainer
//           products={products}
//           currency={currency}
//         />
//       )}
//     </>
//   );
// };

// export default HomePage;