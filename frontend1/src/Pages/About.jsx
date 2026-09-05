import React from "react";
import NaijaOpenMarketLogo from "../assets/image/NaijaOpenMarket.png";

const AboutPage = () => {
  return (
    <div className="container py-5">

      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">
          About NaijaOpenMarket
        </h1>

        <p className="lead text-muted mt-3">
          Empowering buyers and sellers through a trusted,
          secure, and innovative online marketplace designed
          to make shopping easier, faster, and more accessible
          for everyone.
        </p>
      </div>

      {/* About Company */}
      <div className="row align-items-center mb-5">
        <div className="col-lg-6">
          <h2>Who We Are</h2>

          <p>
            NaijaOpenMarket is a modern online marketplace
            dedicated to connecting customers with quality
            products from trusted vendors across multiple
            categories. We provide a convenient platform
            where individuals and businesses can buy and
            sell products with confidence.
          </p>

          <p>
            Our platform was created with the vision of
            transforming online commerce by providing
            a seamless shopping experience that combines
            affordability, reliability, security, and
            excellent customer service.
          </p>

          <p>
            Whether you're shopping for electronics,
            fashion, home essentials, groceries,
            beauty products, or unique local items,
            NaijaOpenMarket brings everything together
            in one convenient destination.
          </p>
        </div>

        <div className="col-lg-6">
          <img
            src={NaijaOpenMarketLogo}
            alt="About NaijaOpenMarket"
            className="img-fluid rounded shadow"
          />
          {/* <img
            src="/assets/image/NaijaOpenMarket.png"
            alt="About NajaOpenMarket"
            className="img-fluid rounded shadow"
          /> */}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="row mb-5">

        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h3 className="text-primary">
                Our Mission
              </h3>

              <p>
                To provide a secure, reliable, and
                customer-focused marketplace that
                empowers businesses and individuals
                to trade efficiently while enjoying
                exceptional value and convenience.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h3 className="text-primary">
                Our Vision
              </h3>

              <p>
                To become Africa's most trusted and
                innovative digital marketplace by
                connecting millions of buyers and
                sellers through technology-driven
                commerce solutions.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Why Choose Us */}
      <div className="mb-5">
        <h2 className="text-center mb-4">
          Why Choose NaijaOpenMarket?
        </h2>

        <div className="row">

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <h4>Quality Products</h4>

                <p>
                  We carefully vet sellers and products
                  to ensure customers receive genuine,
                  high-quality items that meet their
                  expectations.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <h4>Fast Delivery</h4>

                <p>
                  Our logistics network ensures that
                  products are delivered quickly and
                  efficiently, bringing convenience
                  directly to your doorstep.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <h4>Secure Payments</h4>

                <p>
                  We offer trusted payment solutions
                  that protect both buyers and sellers,
                  ensuring every transaction is safe
                  and secure.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Core Values */}
      <div className="mb-5">
        <h2 className="text-center mb-4">
          Our Core Values
        </h2>

        <div className="row">

          <div className="col-md-3 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5>Integrity</h5>

                <p>
                  We operate with honesty,
                  transparency, and accountability
                  in all our dealings.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5>Customer Focus</h5>

                <p>
                  Our customers are at the center
                  of every decision we make.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5>Innovation</h5>

                <p>
                  We continuously improve our
                  platform to deliver better
                  shopping experiences.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5>Reliability</h5>

                <p>
                  We strive to provide dependable
                  services that customers and
                  sellers can trust.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="bg-light rounded p-5 text-center">
        <h2 className="mb-4">
          Growing Every Day
        </h2>

        <div className="row">

          <div className="col-md-3 mb-3">
            <h2 className="text-primary fw-bold">
              10K+
            </h2>
            <p>Products Listed</p>
          </div>

          <div className="col-md-3 mb-3">
            <h2 className="text-primary fw-bold">
              5K+
            </h2>
            <p>Happy Customers</p>
          </div>

          <div className="col-md-3 mb-3">
            <h2 className="text-primary fw-bold">
              500+
            </h2>
            <p>Trusted Vendors</p>
          </div>

          <div className="col-md-3 mb-3">
            <h2 className="text-primary fw-bold">
              99%
            </h2>
            <p>Customer Satisfaction</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AboutPage;