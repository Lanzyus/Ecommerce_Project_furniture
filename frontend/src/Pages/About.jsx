import React from "react";
import "./AboutPage.css";

const About = () => {
  return (
    <main className="sensational-about">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="about-hero-image"></div>

        <div className="about-hero-overlay"></div>

        <div className="container about-hero-content">
          <p className="about-eyebrow">SENSATIONAL INTERIORS</p>

          <h1>
            Beautiful Spaces.
            <br />
            Exceptional Living.
          </h1>

          <p className="about-hero-text">
            We transform ordinary spaces into sophisticated,
            comfortable and timeless interiors designed around
            the people who live in them.
          </p>

          <div className="about-hero-actions">
            <a href="/shop" className="about-btn about-btn-light">
              Explore Our Collection
            </a>

            <a href="/contact" className="about-btn about-btn-outline">
              Start a Project
            </a>
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line"></div>
        </div>
      </section>


      {/* ================= INTRO ================= */}
      <section className="about-introduction">
        <div className="container">

          <div className="about-intro-grid">

            <div className="about-intro-title">
              <p className="section-label">ABOUT US</p>

              <h2>
                Creating interiors
                <br />
                that feel like home.
              </h2>
            </div>

            <div className="about-intro-copy">
              <p>
                At Sensational Interiors, we believe that the
                spaces around us have the power to influence how
                we live, feel and experience everyday life.
              </p>

              <p>
                Our approach combines beautiful aesthetics,
                thoughtful functionality and attention to detail
                to create interiors that are both visually
                captivating and genuinely comfortable.
              </p>

              <p>
                Whether you are furnishing a new home,
                refreshing an existing space or creating an
                environment for your business, we help bring
                your vision to life with carefully considered
                interior solutions.
              </p>

              <a href="/contact" className="about-text-link">
                DISCOVER OUR APPROACH
                <span>→</span>
              </a>
            </div>

          </div>

        </div>
      </section>


      {/* ================= IMAGE STORY ================= */}
      <section className="about-story">
        <div className="container">

          <div className="story-header">
            <div>
              <p className="section-label">OUR PHILOSOPHY</p>

              <h2>
                Where style meets
                <br />
                functionality.
              </h2>
            </div>

            <p>
              We don't believe luxury is simply about how a
              space looks. True luxury is about how effortlessly
              a space works for you.
            </p>
          </div>


          <div className="story-images">

            <div className="story-image story-image-large">
              <img
                src="/src/assets/image/Elegant interior.PNG"
                alt="Elegant interior designed by Sensational Interiors"
              />

              <span className="image-number">01</span>
            </div>

            <div className="story-image story-image-small">
              <img
                src="/src/assets/image/Luxury Interior.PNG"
                alt="Luxury interior details"
              />

              <span className="image-number">02</span>
            </div>

          </div>

        </div>
      </section>


      {/* ================= VALUES ================= */}
      <section className="about-values">

        <div className="container">

          <div className="values-heading">
            <p className="section-label">WHAT WE BELIEVE</p>

            <h2>
              Designed with
              <br />
              intention.
            </h2>

            <p>
              Every space deserves a thoughtful approach.
              These principles guide everything we create.
            </p>
          </div>


          <div className="values-grid">

            <article className="value-card">
              <span>01</span>

              <h3>Timeless Design</h3>

              <p>
                We create interiors that remain beautiful
                beyond temporary trends, combining classic
                elements with contemporary design.
              </p>
            </article>


            <article className="value-card">
              <span>02</span>

              <h3>Personal Expression</h3>

              <p>
                Your home should tell your story. We design
                spaces that reflect your personality, taste
                and lifestyle.
              </p>
            </article>


            <article className="value-card">
              <span>03</span>

              <h3>Attention to Detail</h3>

              <p>
                From furniture selection to finishing touches,
                we pay attention to the details that transform
                a good interior into a remarkable one.
              </p>
            </article>


            <article className="value-card">
              <span>04</span>

              <h3>Comfort & Function</h3>

              <p>
                Beautiful spaces should also work beautifully.
                We balance aesthetics with comfort and everyday
                practicality.
              </p>
            </article>

          </div>

        </div>
      </section>


      {/* ================= SERVICES ================= */}
      <section className="about-services">

        <div className="container">

          <div className="services-top">

            <div>
              <p className="section-label">WHAT WE DO</p>

              <h2>
                Everything you need
                <br />
                to create your space.
              </h2>
            </div>

            <p>
              From individual furniture pieces to complete
              interior transformations, our services are
              designed to help you create a space that feels
              uniquely yours.
            </p>

          </div>


          <div className="services-list">

            <div className="service-row">
              <span className="service-number">01</span>

              <h3>Interior Design</h3>

              <p>
                Thoughtful concepts and interior solutions
                created around your space and lifestyle.
              </p>

              <span className="service-arrow">↗</span>
            </div>


            <div className="service-row">
              <span className="service-number">02</span>

              <h3>Furniture</h3>

              <p>
                Carefully selected pieces that bring comfort,
                character and sophistication to your space.
              </p>

              <span className="service-arrow">↗</span>
            </div>


            <div className="service-row">
              <span className="service-number">03</span>

              <h3>Space Styling</h3>

              <p>
                Décor, accessories and finishing details that
                bring your interior together.
              </p>

              <span className="service-arrow">↗</span>
            </div>


            <div className="service-row">
              <span className="service-number">04</span>

              <h3>Custom Interiors</h3>

              <p>
                Bespoke solutions created specifically for
                your requirements and the character of your space.
              </p>

              <span className="service-arrow">↗</span>
            </div>

          </div>

        </div>
      </section>


      {/* ================= PROCESS ================= */}
      <section className="about-process">

        <div className="container">

          <div className="process-heading">
            <p className="section-label">OUR PROCESS</p>

            <h2>
              From your vision
              <br />
              to reality.
            </h2>
          </div>


          <div className="process-grid">

            <div className="process-item">
              <div className="process-circle">01</div>

              <h3>Consultation</h3>

              <p>
                We begin by understanding your needs,
                preferences, space and vision.
              </p>
            </div>


            <div className="process-item">
              <div className="process-circle">02</div>

              <h3>Concept</h3>

              <p>
                We develop a design direction that brings
                your ideas together into a cohesive vision.
              </p>
            </div>


            <div className="process-item">
              <div className="process-circle">03</div>

              <h3>Selection</h3>

              <p>
                Furniture, materials, textures and details
                are carefully selected for your space.
              </p>
            </div>


            <div className="process-item">
              <div className="process-circle">04</div>

              <h3>Transformation</h3>

              <p>
                We bring the concept together and transform
                your space into something truly special.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ================= FEATURED IMAGE ================= */}
      <section className="about-feature">

        <div className="feature-image">

          <img
            src="/assets/image/interior-feature.jpg"
            alt="Sensational Interiors project"
          />

          <div className="feature-overlay"></div>

          <div className="feature-content">

            <p className="about-eyebrow">
              THE SENSATIONAL EXPERIENCE
            </p>

            <h2>
              Your space.
              <br />
              Your story.
              <br />
              Beautifully told.
            </h2>

            <a href="/projects" className="about-btn about-btn-light">
              View Our Work
            </a>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="about-cta">

        <div className="container">

          <div className="cta-inner">

            <p className="section-label">
              LET'S CREATE SOMETHING BEAUTIFUL
            </p>

            <h2>
              Ready to transform
              <br />
              your space?
            </h2>

            <p>
              Tell us about your project and let's create
              an interior that feels unmistakably yours.
            </p>

            <a href="/contact" className="about-btn about-btn-dark">
              Book a Consultation
            </a>

          </div>

        </div>

      </section>

    </main>
  );
};

export default About;

















// import React from "react";
// import NaijaOpenMarketLogo from "../assets/image/NaijaOpenMarket.png";

// const AboutPage = () => {
//   return (
//     <div className="container py-5">

//       {/* Hero Section */}
//       <div className="text-center mb-5">
//         <h1 className="display-4 fw-bold text-primary">
//           About NaijaOpenMarket
//         </h1>

//         <p className="lead text-muted mt-3">
//           Empowering buyers and sellers through a trusted,
//           secure, and innovative online marketplace designed
//           to make shopping easier, faster, and more accessible
//           for everyone.
//         </p>
//       </div>

//       {/* About Company */}
//       <div className="row align-items-center mb-5">
//         <div className="col-lg-6">
//           <h2>Who We Are</h2>

//           <p>
//             NaijaOpenMarket is a modern online marketplace
//             dedicated to connecting customers with quality
//             products from trusted vendors across multiple
//             categories. We provide a convenient platform
//             where individuals and businesses can buy and
//             sell products with confidence.
//           </p>

//           <p>
//             Our platform was created with the vision of
//             transforming online commerce by providing
//             a seamless shopping experience that combines
//             affordability, reliability, security, and
//             excellent customer service.
//           </p>

//           <p>
//             Whether you're shopping for electronics,
//             fashion, home essentials, groceries,
//             beauty products, or unique local items,
//             NaijaOpenMarket brings everything together
//             in one convenient destination.
//           </p>
//         </div>

//         <div className="col-lg-6">
//           <img
//             src={NaijaOpenMarketLogo}
//             alt="About NaijaOpenMarket"
//             className="img-fluid rounded shadow"
//           />
//           {/* <img
//             src="/assets/image/NaijaOpenMarket.png"
//             alt="About NajaOpenMarket"
//             className="img-fluid rounded shadow"
//           /> */}
//         </div>
//       </div>

//       {/* Mission & Vision */}
//       <div className="row mb-5">

//         <div className="col-md-6 mb-4">
//           <div className="card h-100 shadow-sm border-0">
//             <div className="card-body">
//               <h3 className="text-primary">
//                 Our Mission
//               </h3>

//               <p>
//                 To provide a secure, reliable, and
//                 customer-focused marketplace that
//                 empowers businesses and individuals
//                 to trade efficiently while enjoying
//                 exceptional value and convenience.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6 mb-4">
//           <div className="card h-100 shadow-sm border-0">
//             <div className="card-body">
//               <h3 className="text-primary">
//                 Our Vision
//               </h3>

//               <p>
//                 To become Africa's most trusted and
//                 innovative digital marketplace by
//                 connecting millions of buyers and
//                 sellers through technology-driven
//                 commerce solutions.
//               </p>
//             </div>
//           </div>
//         </div>

//       </div>

//       {/* Why Choose Us */}
//       <div className="mb-5">
//         <h2 className="text-center mb-4">
//           Why Choose NaijaOpenMarket?
//         </h2>

//         <div className="row">

//           <div className="col-md-4 mb-4">
//             <div className="card shadow-sm h-100">
//               <div className="card-body text-center">
//                 <h4>Quality Products</h4>

//                 <p>
//                   We carefully vet sellers and products
//                   to ensure customers receive genuine,
//                   high-quality items that meet their
//                   expectations.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-4 mb-4">
//             <div className="card shadow-sm h-100">
//               <div className="card-body text-center">
//                 <h4>Fast Delivery</h4>

//                 <p>
//                   Our logistics network ensures that
//                   products are delivered quickly and
//                   efficiently, bringing convenience
//                   directly to your doorstep.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-4 mb-4">
//             <div className="card shadow-sm h-100">
//               <div className="card-body text-center">
//                 <h4>Secure Payments</h4>

//                 <p>
//                   We offer trusted payment solutions
//                   that protect both buyers and sellers,
//                   ensuring every transaction is safe
//                   and secure.
//                 </p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Core Values */}
//       <div className="mb-5">
//         <h2 className="text-center mb-4">
//           Our Core Values
//         </h2>

//         <div className="row">

//           <div className="col-md-3 mb-4">
//             <div className="card h-100 border-0 shadow-sm">
//               <div className="card-body">
//                 <h5>Integrity</h5>

//                 <p>
//                   We operate with honesty,
//                   transparency, and accountability
//                   in all our dealings.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-3 mb-4">
//             <div className="card h-100 border-0 shadow-sm">
//               <div className="card-body">
//                 <h5>Customer Focus</h5>

//                 <p>
//                   Our customers are at the center
//                   of every decision we make.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-3 mb-4">
//             <div className="card h-100 border-0 shadow-sm">
//               <div className="card-body">
//                 <h5>Innovation</h5>

//                 <p>
//                   We continuously improve our
//                   platform to deliver better
//                   shopping experiences.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="col-md-3 mb-4">
//             <div className="card h-100 border-0 shadow-sm">
//               <div className="card-body">
//                 <h5>Reliability</h5>

//                 <p>
//                   We strive to provide dependable
//                   services that customers and
//                   sellers can trust.
//                 </p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="bg-light rounded p-5 text-center">
//         <h2 className="mb-4">
//           Growing Every Day
//         </h2>

//         <div className="row">

//           <div className="col-md-3 mb-3">
//             <h2 className="text-primary fw-bold">
//               10K+
//             </h2>
//             <p>Products Listed</p>
//           </div>

//           <div className="col-md-3 mb-3">
//             <h2 className="text-primary fw-bold">
//               5K+
//             </h2>
//             <p>Happy Customers</p>
//           </div>

//           <div className="col-md-3 mb-3">
//             <h2 className="text-primary fw-bold">
//               500+
//             </h2>
//             <p>Trusted Vendors</p>
//           </div>

//           <div className="col-md-3 mb-3">
//             <h2 className="text-primary fw-bold">
//               99%
//             </h2>
//             <p>Customer Satisfaction</p>
//           </div>

//         </div>
//       </div>

//     </div>
//   );
// };

// export default AboutPage;