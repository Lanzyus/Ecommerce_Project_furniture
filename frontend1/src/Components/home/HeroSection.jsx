import React, { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import api, { BASE_URL } from "../../api";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners/");
      setBanners(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Carousel fade>

      {banners.map((banner) => (

        <Carousel.Item key={banner.id}>

          <img
            src={`${BASE_URL}${banner.image}`}
            alt={banner.title}
            className="d-block w-100"
            style={{
              height: "400px",
              objectFit: "cover",
            }}
          />

          <Carousel.Caption>
            <h3>{banner.title}</h3>
            <p>{banner.description}</p>
          </Carousel.Caption>

        </Carousel.Item>

      ))}

    </Carousel>
  );
};

export default HeroSection;


// import { useEffect, useState } from "react";
// import { Carousel } from "react-bootstrap";
// import api from "../../api";
// import styles from "./HeroSection.module.css";

// const HeroSection = () => {
//   const [banners, setBanners] = useState([]);

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const fetchBanners = async () => {
//     try {
//       const response = await api.get("/banners/");
//       setBanners(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   if (!banners?.length) return null;

//   return (
//     <section className={styles.heroSection}>
//       <Carousel
//         fade
//         interval={4000}
//         indicators
//       >
//         {banners.map((banner) => (
//           <Carousel.Item key={banner.id}>
//             <img
//               src={banner.image}
//               alt={banner.title}
//               className={styles.heroImage}
//             />
//           </Carousel.Item>
//         ))}
//       </Carousel>
//     </section>
//   );
// };

// export default HeroSection;






// import { useEffect, useState } from "react";
// import { Carousel } from "react-bootstrap";
// import api from "../../api";

// const HeroSection = () => {
//   const [banners, setBanners] = useState([]);

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const fetchBanners = async () => {
//     try {
//       const response = await api.get("/banners/");

//       console.log("Banners:", response.data);

//       setBanners(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   if (!banners.length) {
//     return null;
//   }

//   return (
  
//     <section className="hero-section">
//       <Carousel
//         fade
//         interval={4000}
//         controls={false}
//         indicators={true}
//       >
//         {banners.map((banner) => (
//           <Carousel.Item key={banner.id}>
//             <img
//               src={banner.image}
//               alt={banner.title}
//               className="d-block w-100"
//               style={{
//                 height: "550px",
//                 objectFit: "cover",
//               }}
//             />
//           </Carousel.Item>
//         ))}
//       </Carousel>
//     </section>

// //       <section className="hero-section">
// //         <Carousel
// //             className="hero-carousel"
// //             fade
// //             interval={4000}
// //             controls={false}
// //             indicators={true}
// //         >
// //             {banners.map((banner) => (
// //             <Carousel.Item key={banner.id}>
// //                 <img
// //                 src={banner.image}
// //                 alt={banner.title}
// //                 className="hero-image"
// //                 />
// //             </Carousel.Item>
// //             ))}
// //         </Carousel>

// //   {/* <div className="hero-content">
// //     <h1>Welcome to Your Favorite Store</h1>
// //     <p>
// //       Discover the latest trends with our exclusive collection
// //     </p>
// //     <a href="#shop" className="btn btn-light btn-lg">
// //       Shop Now
// //     </a>
// //   </div> */}
// //  </section>
//   );
// };

// export default HeroSection;


// import { useEffect, useState } from "react";
// import { Carousel } from "react-bootstrap";
// import api from "../../api";

// const HeroSection = () => {
//   const [banners, setBanners] = useState([]);

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const fetchBanners = async () => {
//     try {
//       const response = await api.get(
//         "/banners/"
//       );

//       setBanners(response.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <section className="hero-section">

//       <Carousel
//         controls={false}
//         indicators={true}
//         fade
//         interval={4000}
//       >
//       {banners.map((banner) => (
//         <Carousel.Item
//               key={banner.id}
//             >
//               <img
//                 src={`http://127.0.0.1:8001${banner.image}`}
//                 className="d-block w-100"
//                 alt={banner.title}
//               />
//             </Carousel.Item>
//           ))}
//         </Carousel>

//       <div className="hero-overlay" />

//       {/* <div className="hero-content">
//         <h1>
//           Welcome to Your Favorite Store
//         </h1>

//         <p>
//           Discover the latest trends
//         </p>
//       </div> */}

//     </section>
//   );
// };

// export default HeroSection;









// import { Carousel } from "react-bootstrap";
// import style from "./HeroSection.module.css"

// const HeroSection = () => {
//   return (
//     <section className="hero-section position-relative">
//       {/* Background Carousel */}
//       <Carousel
//         controls={false}
//         indicators={false}
//         fade
//         interval={4000}
//         className="hero-carousel"
//       >
//         <Carousel.Item>
//           <img
//             src="http://127.0.0.1:8001/media/banners/banner1.jpg"
//             className="d-block w-100"
//             alt="Banner 1"
//           />
//         </Carousel.Item>

//         <Carousel.Item>
//           <img
//             src="http://127.0.0.1:8001/media/banners/banner2.jpg"
//             className="d-block w-100"
//             alt="Banner 2"
//           />
//         </Carousel.Item>

//         <Carousel.Item>
//           <img
//             src="http://127.0.0.1:8001/media/banners/banner3.jpg"
//             className="d-block w-100"
//             alt="Banner 3"
//           />
//         </Carousel.Item>
//       </Carousel>

//       {/* Overlay */}
//       <div className="hero-overlay"></div>

//       {/* Content */}
//       {/* <div className="hero-content"> */}
//         {/* <h1>Welcome to Your Favorite Store</h1>

//         <p>
//           Discover the latest trends with our exclusive
//           collection
//         </p>

//         <button className="btn btn-light btn-lg rounded-pill">
//           Shop Now
//         </button> */}
//       {/* </div> */}
//     </section>
//   );
// };

// export default HeroSection;