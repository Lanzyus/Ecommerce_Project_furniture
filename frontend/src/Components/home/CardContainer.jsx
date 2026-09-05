import { useState } from "react";
import HomeCard from "./HomeCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

// Helper function
const chunkArray = (array, size) => {
  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
};

const CardContainer = ({ products }) => {
  const [currency, setCurrency] = useState("NGN");
  const [page, setPage] = useState(0);

  // 8 products per slider
  const sliders = chunkArray(products, 8);

  // 2 sliders per page
  const pages = chunkArray(sliders, 2);

  return (
    <section className="py-5" id="shop">
      <h4 className="text-center mb-4">Our Products</h4>

      {/* Currency */}
      <div className="text-center mb-4">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="NGN">Naira (₦)</option>
          <option value="USD">Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">Pound (£)</option>
          <option value="JPY">Yen (¥)</option>
        </select>
      </div>

      <div className="container-fluid">

        {pages[page]?.map((sliderProducts, index) => (
          <div className="mb-5" key={index}>
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={15}
              slidesPerView={6}
              slidesPerGroup={6}
              loop={false}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                576: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                768: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                },
                992: {
                  slidesPerView: 5,
                  slidesPerGroup: 5,
                },
                1200: {
                  slidesPerView: 6,
                  slidesPerGroup: 6,
                },
              }}
            >
              {sliderProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <HomeCard
                    product={product}
                    currency={currency}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}

        {/* Page Navigation */}
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">

          <button
            className="btn btn-outline-secondary"
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous Page
          </button>

          <span className="fw-bold">
            Page {page + 1} of {pages.length}
          </span>

          <button
            className="btn btn-outline-primary"
            disabled={page === pages.length - 1}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next Page
          </button>

        </div>

      </div>
    </section>
  );
};

export default CardContainer;











// import React, { useState } from "react";
// import HomeCard from "./HomeCard";

// const CardContainer = ({ products }) => {
//   const [currency, setCurrency] = useState("NGN");

//   return (
//     <section className="py-5" id="shop">
//       <h4 style={{ textAlign: "center" }}>Our Products</h4>

//       {/* Currency Switch */}
//       <div style={{ textAlign: "center", marginBottom: "20px" }}>
//         <select
//           value={currency}
//           onChange={(e) => setCurrency(e.target.value)}
//         >
//           <option value="NGN">Naira (₦)</option>
//           <option value="USD">Dollar ($)</option>
//           <option value="EUR">Euro (€)</option>
//           <option value="GBP">Pound (£)</option>
//           <option value="JPY">Yen (¥)</option>
//         </select>
//       </div>

// <div className="container-fluid px-3">
//   <div className="row g-2">
//     {products.map((product) => (
//       <div
//         key={product.id}
//         className="col-6 col-sm-4 col-md-3 col-lg-2"
//       >
//         <HomeCard product={product} />
//       </div>
//     ))}
//   </div>
// </div>

//       {/* <div className="container px-4 px-lg-5 mt-5"> */}
//       {/* <div   className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2">
//         <div className="row justify-content-center">
//           {products?.map((product) => (
//             <HomeCard
//               key={product.id}
//               product={product}
//               currency={currency}
//             />
//           ))}
//         </div>
//       </div> */}
//     </section>
//   );
// };

// export default CardContainer;