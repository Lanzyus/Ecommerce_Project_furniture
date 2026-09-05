import React from "react";
import HomeCard from "../home/HomeCard";
import styles from "./RelatedProducts.module.css";

const RelatedProducts = ({ products = [] }) => {
  return (
    <section className={styles.relatedProductsSection}>
      <div className="container">

        <div className={styles.sectionHeader}>
          <h2>Related Products</h2>
          <p>You may also like these items</p>
        </div>

        {products?.length > 0 ? (
          <div className="row g-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6"
              >
                <HomeCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyRelated}>
            No related products found.
          </div>
        )}

      </div>
    </section>
  );
};

export default RelatedProducts;









// import React from "react";
// import HomeCard from "../home/HomeCard";

// const RelatedProducts = ({ products = [] }) => {
//   return (
//     <section className="py-5 bg-light">
//       <div className="container text-center justify-content-center">
//         <h3 className="mb-4 fw-bold">Related Products</h3>

//         <div className="row g-3 justify-content-center">
//           {products.length > 0 ? (
//             products.map((product) => (
//               <div
//                 key={product.id}
//                 className="col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center"
//               >
//                 <HomeCard product={product} />
//               </div>
//             ))
//           ) : (
//             <div className="col-12">
//               <p className="text-muted">No related products found.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RelatedProducts;

// import React from "react";
// import HomeCard from "../home/HomeCard";

// const RelatedProducts = ({ products = [] }) => {
//   return (
//     <section className="py-5 bg-light">
//       <div className="container">
//         <h3 className="mb-4 fw-bold">Related Products</h3>

//         <div className="row g-3">
//           {Array.isArray(products) && products.length > 0 ? (
//             products.map((product) => (
//               <div className="col-md-3 col-sm-6" key={product.id}>
//                 <HomeCard product={product} />
//               </div>
//             ))
//           ) : (
//             <div className="col-12">
//               <p className="text-muted">No related products found.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RelatedProducts;




// import React from "react";
// import HomeCard from "../home/HomeCard"

// const RelatedProducts = () => {
//   return (
//     <section className="py-3 bg-light">
//       <div className="container px-4 px-lg-5 mt-3">
//         <h2 className="fw-bolder mb-4">Related products</h2>

//         <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
//           <HomeCard />
//           <HomeCard />
//           <HomeCard />
//           <HomeCard />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RelatedProducts;