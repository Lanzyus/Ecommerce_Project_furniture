import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronRight,
  FiSearch,
  FiInstagram,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";

import api, { BASE_URL } from "../../api";
import { getProductImage } from "../../utils/productImage";
import styles from "./SensationalHome.module.css";

import heroFallback from "../../assets/sensational/hero-interior.jpg";
import livingFallback from "../../assets/sensational/project-living.jpg";
import bedroomFallback from "../../assets/sensational/project-bedroom.jpg";
import diningFallback from "../../assets/sensational/project-dining.jpg";
import officeFallback from "../../assets/sensational/project-office.jpg";

import roomLiving from "../../assets/sensational/room-living.jpg";
import roomBedroom from "../../assets/sensational/room-bedroom.jpg";
import roomDining from "../../assets/sensational/room-dining.jpg";
import roomOffice from "../../assets/sensational/room-office.jpg";
import roomDecor from "../../assets/sensational/room-decor.jpg";
import roomOutdoor from "../../assets/sensational/room-outdoor.jpg";


const fallbackProjects = [
  {
    title: "Modern Elegance",
    type: "Living Room",
    image: livingFallback,
  },
  {
    title: "Serene Retreat",
    type: "Bedroom",
    image: bedroomFallback,
  },
  {
    title: "Dining in Style",
    type: "Dining Room",
    image: diningFallback,
  },
  {
    title: "Executive Office",
    type: "Commercial",
    image: officeFallback,
  },
];


const fallbackRooms = [
  {
    title: "Living Room",
    image: roomLiving,
  },
  {
    title: "Bedroom",
    image: roomBedroom,
  },
  {
    title: "Dining Room",
    image: roomDining,
  },
  {
    title: "Home Office",
    image: roomOffice,
  },
  {
    title: "Home Decor",
    image: roomDecor,
  },
  {
    title: "Outdoor",
    image: roomOutdoor,
  },
];


const services = [
  {
    number: "01",
    title: "Interior Design",
    text: "Complete interior solutions tailored to your lifestyle, taste and space.",
  },
  {
    number: "02",
    title: "Custom Furniture",
    text: "Bespoke furniture crafted with considered proportions, materials and finish.",
  },
  {
    number: "03",
    title: "Home Styling",
    text: "The finishing touches that bring warmth, personality and cohesion to your home.",
  },
  {
    number: "04",
    title: "Space Planning",
    text: "Smart layouts that balance movement, comfort, function and beauty.",
  },
];


const normaliseImage = (value) => {
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};


export default function HomePage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
  let mounted = true;

  const loadHomeData = async () => {
    const results = await Promise.allSettled([
      api.get("/products/"),
      api.get("/categories/"),
      api.get("/banners/"),
    ]);

    if (!mounted) return;

    const [
      productResult,
      categoryResult,
      bannerResult,
    ] = results;

    // ==============================
    // PRODUCTS
    // ==============================
    if (productResult.status === "fulfilled") {
      console.log(
        "PRODUCT API RESPONSE:",
        productResult.value.data
      );

      const data = productResult.value.data;

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      console.log(
        "PRODUCT LIST:",
        productList
      );

      setProducts(productList);
    } else {
      console.error(
        "PRODUCT API FAILED:",
        productResult.reason
      );

      setProducts([]);
    }

    // ==============================
    // CATEGORIES
    // ==============================
    if (categoryResult.status === "fulfilled") {
      const data = categoryResult.value.data;

      const categoryList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setCategories(categoryList);
    } else {
      console.error(
        "CATEGORY API FAILED:",
        categoryResult.reason
      );

      setCategories([]);
    }

    // ==============================
    // BANNERS
    // ==============================
    if (bannerResult.status === "fulfilled") {
      const data = bannerResult.value.data;

      const bannerList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setBanners(bannerList);
    } else {
      console.error(
        "BANNER API FAILED:",
        bannerResult.reason
      );

      setBanners([]);
    }
  };

  loadHomeData();

  return () => {
    mounted = false;
  };
}, []);
  // useEffect(() => {
  //   let mounted = true;

  //   Promise.allSettled([
  //     api.get("/products/"),
  //     api.get("/categories/"),
  //     api.get("/banners/"),
  //   ]).then(
  //     ([productResult, categoryResult, bannerResult]) => {
  //       if (!mounted) return;

  //       if (productResult.status === "fulfilled") {
  //         setProducts(
  //           productResult.value.data || []
  //         );
  //       }

  //       if (categoryResult.status === "fulfilled") {
  //         setCategories(
  //           categoryResult.value.data || []
  //         );
  //       }

  //       if (bannerResult.status === "fulfilled") {
  //         setBanners(
  //           bannerResult.value.data || []
  //         );
  //       }
  //     }
  //   );

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);


  const featuredProducts = useMemo(
    () => products.slice(0, 4),
    [products]
  );


  const heroImage =
    normaliseImage(banners[0]?.image) ||
    heroFallback;


  const roomItems = useMemo(() => {
    if (!categories.length) {
      return fallbackRooms;
    }

    return categories
      .slice(0, 6)
      .map((category, index) => ({
        id: category.id,
        title: category.name,
        slug: category.slug,
        image:
          normaliseImage(category.image) ||
          fallbackRooms[index]?.image,
        subcategories:
          category.subcategories || [],
      }));
  }, [categories]);


  const handleSearch = (e) => {
    e.preventDefault();

    const value = searchTerm.trim();

    if (!value) {
      navigate("/search");
      return;
    }

    navigate(
      `/search?search=${encodeURIComponent(value)}`
    );
  };


  return (
    <div className={styles.page}>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={styles.hero}
        style={{
          "--hero-image": `url(${heroImage})`,
        }}
      >
        <div className={styles.heroOverlay} />

        <div className={styles.container}>

          <div className={styles.heroCopy}>

            <span className={styles.eyebrow}>
              SENSATIONAL INTERIORS
            </span>

            <h1>
              Your Space.
              <br />
              Beautifully
              <br />
              <em>Transformed.</em>
            </h1>

            <span className={styles.goldRule} />

            <p>
              We create timeless interiors and
              custom furniture that reflect your
              style and elevate your everyday living.
            </p>


            {/* SEARCH */}

            <form
              className={styles.heroSearch}
              onSubmit={handleSearch}
            >
              <FiSearch />

              <input
                type="search"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search furniture, décor, sofas..."
                aria-label="Search products"
              />

              <button type="submit">
                Search
              </button>
            </form>


            <div className={styles.heroActions}>

              <Link
                to="/search"
                className={styles.goldButton}
              >
                Shop Collection
                <FiArrowRight />
              </Link>

              <Link
                to="/contact"
                className={styles.outlineButton}
              >
                Start a Project
              </Link>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <section className={styles.categorySection}>

        <div className={styles.container}>

          <div className={styles.sectionHeadingRow}>

            <div>
              <span className={styles.eyebrow}>
                FIND YOUR STYLE
              </span>

              <h2>
                Shop by Category
              </h2>
            </div>

            <Link
              to="/search"
              className={styles.textLink}
            >
              View All Products
              <FiArrowRight />
            </Link>

          </div>


          <div className={styles.categoryGrid}>

            {roomItems.map((category) => {

              const isActive =
                activeCategory === category.id;

              return (
                <div
                  className={`${styles.categoryCard} ${
                    isActive
                      ? styles.categoryCardActive
                      : ""
                  }`}
                  key={category.id || category.title}
                >

                  <Link
                    to={`/search?category=${category.slug}`}
                    className={styles.categoryImageWrap}
                  >

                    <img
                      src={category.image}
                      alt={category.title}
                    />

                    <div
                      className={
                        styles.categoryOverlay
                      }
                    />

                    <div
                      className={
                        styles.categoryTitle
                      }
                    >
                      <span>
                        {category.title}
                      </span>

                      <FiArrowRight />
                    </div>

                  </Link>


                  {/* SUBCATEGORIES */}

                  {category.subcategories?.length > 0 && (
                    <div
                      className={
                        styles.subcategoryPanel
                      }
                    >

                      <div
                        className={
                          styles.subcategoryHeader
                        }
                      >

                        <span>
                          Shop {category.title}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveCategory(
                              isActive
                                ? null
                                : category.id
                            )
                          }
                        >
                          {isActive
                            ? "Close"
                            : "Explore"}
                        </button>

                      </div>


                      <div
                        className={
                          styles.subcategoryList
                        }
                      >

                        {category.subcategories
                          .slice(0, 6)
                          .map((subcategory) => (
                            <Link
                              key={
                                subcategory.id
                              }
                              to={`/search?category=${category.slug}&subcategory=${subcategory.slug}`}
                              className={
                                styles.subcategoryLink
                              }
                            >
                              <span>
                                {subcategory.name}
                              </span>

                              <FiChevronRight />
                            </Link>
                          ))}

                      </div>


                      <Link
                        to={`/search?category=${category.slug}`}
                        className={
                          styles.viewCategory
                        }
                      >
                        View all{" "}
                        {category.title}
                        <FiArrowRight />
                      </Link>

                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section
        className={styles.services}
        id="services"
      >

        <div className={styles.container}>

          <div
            className={
              styles.sectionHeadingCenter
            }
          >

            <span className={styles.eyebrow}>
              WHAT WE DO
            </span>

            <h2>
              Design. Create. Transform.
            </h2>

          </div>


          <div className={styles.serviceGrid}>

            {services.map((service) => (
              <article
                className={styles.service}
                key={service.number}
              >

                <span
                  className={
                    styles.serviceNumber
                  }
                >
                  {service.number}
                </span>

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.text}
                </p>

              </article>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section
        className={styles.projects}
        id="projects"
      >

        <div className={styles.container}>

          <div
            className={
              styles.sectionHeadingRow
            }
          >

            <div>

              <span className={styles.eyebrow}>
                FEATURED COLLECTION
              </span>

              <h2>
                Pieces worth coming home to
              </h2>

            </div>


            <Link
              to="/search"
              className={styles.textLink}
            >
              Shop All
              <FiArrowRight />
            </Link>

          </div>


          <div className={styles.projectGrid}>

            {(featuredProducts.length
              ? featuredProducts.map(
                  (product, index) => ({
                    title: product.name,

                    type:
                      product.category_name ||
                      "Interior Collection",

                    image:
                      getProductImage(
                        product
                      ) === "/placeholder.jpg"
                        ? fallbackProjects[
                            index
                          ]?.image
                        : getProductImage(
                            product
                          ),

                    slug: product.slug,
                  })
                )
              : fallbackProjects
            ).map((project, index) => (

              <Link
                key={`${project.title}-${index}`}
                to={
                  project.slug
                    ? `/products/${project.slug}`
                    : "/search"
                }
                className={
                  styles.projectCard
                }
              >

                <div
                  className={
                    styles.projectImageWrap
                  }
                >

                  <img
                    src={
                      project.image ||
                      project.fallback?.image
                    }
                    alt={project.title}
                  />

                  <span
                    className={
                      styles.projectArrow
                    }
                  >
                    <FiArrowRight />
                  </span>

                </div>


                <h3>
                  {project.title}
                </h3>

                <p>
                  {project.type}
                </p>

              </Link>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          SHOP BY ROOM
      ===================================================== */}

      <section
        className={styles.roomSection}
        id="shop"
      >

        <div className={styles.container}>

          <div
            className={styles.roomHeading}
          >
            <span />
            <h2>
              Shop by Room
            </h2>
            <span />
          </div>


          <div className={styles.roomGrid}>

            {roomItems.map((room) => (

              <Link
                key={room.title}
                to={
                  room.slug
                    ? `/search?category=${room.slug}`
                    : "/search"
                }
                className={styles.roomCard}
              >

                <img
                  src={room.image}
                  alt={room.title}
                />

                <div
                  className={styles.roomLabel}
                >
                  {room.title}

                  <FiChevronRight />

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          PRODUCT PREVIEW
      ===================================================== */}

      <section
        className={styles.shopPreview}
      >

        <div className={styles.container}>

          <div
            className={
              styles.sectionHeadingRow
            }
          >

            <div>

              <span className={styles.eyebrow}>
                CURATED FOR YOUR HOME
              </span>

              <h2>
                Furniture with intention.
              </h2>

            </div>

            <Link
              to="/search"
              className={styles.textLink}
            >
              Shop Collection
              <FiArrowRight />
            </Link>

          </div>


          {products.length > 0 && (

            <div
              className={
                styles.productStrip
              }
            >

              {products
                .slice(0, 4)
                .map((product) => (

                  <Link
                    to={`/products/${product.slug}`}
                    key={product.id}
                    className={
                      styles.productMiniCard
                    }
                  >

                    <div>

                      <img
                        src={getProductImage(
                          product
                        )}
                        alt={product.name}
                      />

                    </div>

                    <span>
                      {product.name}
                    </span>

                    <strong>
                      ₦
                      {Number(
                        product.current_price ??
                          product.price ??
                          0
                      ).toLocaleString()}
                    </strong>

                  </Link>

                ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          STATEMENT
      ===================================================== */}

      <section
        className={styles.statement}
        id="journal"
      >

        <div className={styles.container}>

          <span className={styles.eyebrow}>
            THE SENSATIONAL APPROACH
          </span>

          <h2>
            Luxury is not about more.
            <br />
            <em>
              It is about better.
            </em>
          </h2>

          <p>
            Thoughtful design, beautiful materials
            and spaces that feel unmistakably yours.
          </p>

          <Link
            to="/contact"
            className={styles.goldButton}
          >
            Book a Consultation
            <FiArrowRight />
          </Link>

        </div>

      </section>


      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section
        className={styles.contactBar}
      >

        <div>
          <FiMapPin />
          <span>
            Lagos, Nigeria
          </span>
        </div>

        <div>
          <FiPhone />
          <span>
            +234 000 000 0000
          </span>
        </div>

        <div>
          <FiMail />
          <span>
            hello@sensationalinteriors.com
          </span>
        </div>

        <a
          href="https://www.instagram.com/sensational_interiors07/"
          target="_blank"
          rel="noreferrer"
        >
          <FiInstagram />
          <span>
            @sensational_interiors07
          </span>
        </a>

      </section>

    </div>
  );
}











// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { FiArrowRight, FiChevronRight, FiInstagram, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
// import api, { BASE_URL } from "../../api";
// import { getProductImage } from "../../utils/productImage";
// import styles from "./SensationalHome.module.css";

// import heroFallback from "../../assets/sensational/hero-interior.jpg";
// import livingFallback from "../../assets/sensational/project-living.jpg";
// import bedroomFallback from "../../assets/sensational/project-bedroom.jpg";
// import diningFallback from "../../assets/sensational/project-dining.jpg";
// import officeFallback from "../../assets/sensational/project-office.jpg";
// import roomLiving from "../../assets/sensational/room-living.jpg";
// import roomBedroom from "../../assets/sensational/room-bedroom.jpg";
// import roomDining from "../../assets/sensational/room-dining.jpg";
// import roomOffice from "../../assets/sensational/room-office.jpg";
// import roomDecor from "../../assets/sensational/room-decor.jpg";
// import roomOutdoor from "../../assets/sensational/room-outdoor.jpg";

// const fallbackProjects = [
//   { title: "Modern Elegance", type: "Living Room", image: livingFallback },
//   { title: "Serene Retreat", type: "Bedroom", image: bedroomFallback },
//   { title: "Dining in Style", type: "Dining Room", image: diningFallback },
//   { title: "Executive Office", type: "Commercial", image: officeFallback },
// ];

// const fallbackRooms = [
//   { title: "Living Room", image: roomLiving },
//   { title: "Bedroom", image: roomBedroom },
//   { title: "Dining Room", image: roomDining },
//   { title: "Home Office", image: roomOffice },
//   { title: "Home Decor", image: roomDecor },
//   { title: "Outdoor", image: roomOutdoor },
// ];

// const services = [
//   { number: "01", title: "Interior Design", text: "Complete interior solutions tailored to your lifestyle, taste and space." },
//   { number: "02", title: "Custom Furniture", text: "Bespoke furniture crafted with considered proportions, materials and finish." },
//   { number: "03", title: "Home Styling", text: "The finishing touches that bring warmth, personality and cohesion to your home." },
//   { number: "04", title: "Space Planning", text: "Smart layouts that balance movement, comfort, function and beauty." },
// ];

// const normaliseImage = (value) => {
//   if (!value) return null;
//   if (value.startsWith("http://") || value.startsWith("https://")) return value;
//   return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
// };

// export default function HomePage() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [banners, setBanners] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     Promise.allSettled([
//       api.get("/products/"),
//       api.get("/categories/"),
//       api.get("/banners/"),
//     ]).then(([productResult, categoryResult, bannerResult]) => {
//       if (!mounted) return;
//       if (productResult.status === "fulfilled") setProducts(productResult.value.data || []);
//       if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data || []);
//       if (bannerResult.status === "fulfilled") setBanners(bannerResult.value.data || []);
//     });
//     return () => { mounted = false; };
//   }, []);

//   const featuredProducts = useMemo(() => products.slice(0, 4), [products]);
//   const roomItems = useMemo(() => {
//     if (!categories.length) return fallbackRooms;
//     return categories.slice(0, 6).map((category, index) => ({
//       title: category.name,
//       image: normaliseImage(category.image) || fallbackRooms[index]?.image,
//       slug: category.slug,
//     }));
//   }, [categories]);

//   const heroImage = normaliseImage(banners[0]?.image) || heroFallback;

//   return (
//     <div className={styles.page}>
//       <section className={styles.hero} style={{ "--hero-image": `url(${heroImage})` }}>
//         <div className={styles.heroOverlay} />
//         <div className={styles.container}>
//           <div className={styles.heroCopy}>
//             <span className={styles.eyebrow}>SENSATIONAL INTERIORS</span>
//             <h1>Your Space.<br />Beautifully<br /><em>Transformed.</em></h1>
//             <span className={styles.goldRule} />
//             <p>We create timeless interiors and custom furniture that reflect your style and elevate your everyday living.</p>
//             <div className={styles.heroActions}>
//               <Link to="/about" className={styles.goldButton}>Explore Our Work <FiArrowRight /></Link>
//               <Link to="/contact" className={styles.outlineButton}>Start a Project</Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className={styles.services} id="services">
//         <div className={styles.container}>
//           <div className={styles.sectionHeadingCenter}>
//             <span className={styles.eyebrow}>WHAT WE DO</span>
//             <h2>Design. Create. Transform.</h2>
//           </div>
//           <div className={styles.serviceGrid}>
//             {services.map((service) => (
//               <article className={styles.service} key={service.number}>
//                 <span className={styles.serviceNumber}>{service.number}</span>
//                 <h3>{service.title}</h3>
//                 <p>{service.text}</p>
//               </article>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className={styles.projects} id="projects">
//         <div className={styles.container}>
//           <div className={styles.sectionHeadingRow}>
//             <div>
//               <span className={styles.eyebrow}>FEATURED PROJECTS</span>
//               <h2>Spaces we’re proud of</h2>
//             </div>
//             <Link to="/about" className={styles.textLink}>View All Projects <FiArrowRight /></Link>
//           </div>

//           <div className={styles.projectGrid}>
//             {(featuredProducts.length ? featuredProducts.map((product, index) => ({
//               title: product.name,
//               type: product.category_name || "Interior Collection",
//               image: getProductImage(product) === "/placeholder.jpg" ? fallbackProjects[index]?.image : getProductImage(product),
//               slug: product.slug,
//               product,
//               fallback: fallbackProjects[index],
//             })) : fallbackProjects).map((project, index) => (
//               <Link key={`${project.title}-${index}`} to={project.slug ? `/products/${project.slug}` : "/about"} className={styles.projectCard}>
//                 <div className={styles.projectImageWrap}>
//                   <img src={project.image || project.fallback?.image} alt={project.title} />
//                   <span className={styles.projectArrow}><FiArrowRight /></span>
//                 </div>
//                 <h3>{project.title}</h3>
//                 <p>{project.type}</p>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className={styles.roomSection} id="shop">
//         <div className={styles.container}>
//           <div className={styles.roomHeading}><span /> <h2>Shop by Room</h2> <span /></div>
//           <div className={styles.roomGrid}>
//             {roomItems.map((room) => (
//               <Link key={room.title} to={room.slug ? `/search?category=${room.slug}` : "/search"} className={styles.roomCard}>
//                 <img src={room.image} alt={room.title} />
//                 <div className={styles.roomLabel}>{room.title}<FiChevronRight /></div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className={styles.shopPreview}>
//         <div className={styles.container}>
//           <div className={styles.sectionHeadingRow}>
//             <div>
//               <span className={styles.eyebrow}>CURATED FOR YOUR HOME</span>
//               <h2>Furniture with intention.</h2>
//             </div>
//             <Link to="/search" className={styles.textLink}>Shop Collection <FiArrowRight /></Link>
//           </div>
//           {products.length > 0 && (
//             <div className={styles.productStrip}>
//               {products.slice(0, 4).map((product) => (
//                 <Link to={`/products/${product.slug}`} key={product.id} className={styles.productMiniCard}>
//                   <div><img src={getProductImage(product)} alt={product.name} /></div>
//                   <span>{product.name}</span>
//                   <strong>₦{Number(product.current_price ?? product.price ?? 0).toLocaleString()}</strong>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       <section className={styles.statement} id="journal">
//         <div className={styles.container}>
//           <span className={styles.eyebrow}>THE SENSATIONAL APPROACH</span>
//           <h2>Luxury is not about more.<br /><em>It is about better.</em></h2>
//           <p>Thoughtful design, beautiful materials and spaces that feel unmistakably yours.</p>
//           <Link to="/contact" className={styles.goldButton}>Book a Consultation <FiArrowRight /></Link>
//         </div>
//       </section>

//       <section className={styles.contactBar}>
//         <div><FiMapPin /><span>Lagos, Nigeria</span></div>
//         <div><FiPhone /><span>+234 000 000 0000</span></div>
//         <div><FiMail /><span>hello@sensationalinteriors.com</span></div>
//         <a href="https://www.instagram.com/sensational_interiors07/" target="_blank" rel="noreferrer"><FiInstagram /><span>@sensational_interiors07</span></a>
//       </section>
//     </div>
//   );
// }
