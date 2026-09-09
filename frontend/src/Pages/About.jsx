import React from "react";
import "./AboutPage.css";

import elegantInterior from "../assets/image/Elegant interior.PNG";
import luxuryInterior from "../assets/image/Luxury Interior.PNG";
import interiorFeature from "../assets/image/Product.jpg";

const About = () => {
  return (
    <main className="sensational-about">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div
          className="about-hero-image"
          aria-hidden="true"
        />

        <div
          className="about-hero-overlay"
          aria-hidden="true"
        />

        <div className="container about-hero-content">
          <p className="about-eyebrow">
            SENSATIONAL INTERIORS
          </p>

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
            <a
              href="/shop"
              className="about-btn about-btn-light"
            >
              Explore Our Collection
            </a>

            <a
              href="/contact"
              className="about-btn about-btn-outline"
            >
              Start a Project
            </a>
          </div>
        </div>

        <div
          className="hero-scroll"
          aria-hidden="true"
        >
          <span>SCROLL TO EXPLORE</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ================= INTRODUCTION ================= */}
      <section className="about-introduction">
        <div className="container">
          <div className="about-intro-grid">

            <div className="about-intro-title">
              <p className="section-label">
                ABOUT US
              </p>

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

              <a
                href="/contact"
                className="about-text-link"
              >
                DISCOVER OUR APPROACH
                <span aria-hidden="true">→</span>
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
              <p className="section-label">
                OUR PHILOSOPHY
              </p>

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
                src={elegantInterior}
                alt="Elegant luxury interior designed by Sensational Interiors"
                loading="lazy"
                decoding="async"
              />
                            
             
              <span
                className="image-number"
                aria-hidden="true"
              >
                01
              </span>
            </div>

            <div className="story-image story-image-small">
              <img
                src={luxuryInterior}
                alt="Luxury interior details by Sensational Interiors"
                loading="lazy"
                decoding="async"
              />
              

              <span
                className="image-number"
                aria-hidden="true"
              >
                02
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="about-values">
        <div className="container">

          <div className="values-heading">
            <p className="section-label">
              WHAT WE BELIEVE
            </p>

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
              <span aria-hidden="true">01</span>

              <h3>
                Timeless Design
              </h3>

              <p>
                We create interiors that remain beautiful
                beyond temporary trends, combining classic
                elements with contemporary design.
              </p>
            </article>

            <article className="value-card">
              <span aria-hidden="true">02</span>

              <h3>
                Personal Expression
              </h3>

              <p>
                Your home should tell your story. We design
                spaces that reflect your personality, taste
                and lifestyle.
              </p>
            </article>

            <article className="value-card">
              <span aria-hidden="true">03</span>

              <h3>
                Attention to Detail
              </h3>

              <p>
                From furniture selection to finishing touches,
                we pay attention to the details that transform
                a good interior into a remarkable one.
              </p>
            </article>

            <article className="value-card">
              <span aria-hidden="true">04</span>

              <h3>
                Comfort &amp; Function
              </h3>

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
              <p className="section-label">
                WHAT WE DO
              </p>

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
              <span className="service-number">
                01
              </span>

              <h3>
                Interior Design
              </h3>

              <p>
                Thoughtful concepts and interior solutions
                created around your space and lifestyle.
              </p>

              <span
                className="service-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div className="service-row">
              <span className="service-number">
                02
              </span>

              <h3>
                Furniture
              </h3>

              <p>
                Carefully selected pieces that bring comfort,
                character and sophistication to your space.
              </p>

              <span
                className="service-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div className="service-row">
              <span className="service-number">
                03
              </span>

              <h3>
                Space Styling
              </h3>

              <p>
                Décor, accessories and finishing details that
                bring your interior together.
              </p>

              <span
                className="service-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

            <div className="service-row">
              <span className="service-number">
                04
              </span>

              <h3>
                Custom Interiors
              </h3>

              <p>
                Bespoke solutions created specifically for
                your requirements and the character of your
                space.
              </p>

              <span
                className="service-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="about-process">
        <div className="container">

          <div className="process-heading">
            <p className="section-label">
              OUR PROCESS
            </p>

            <h2>
              From your vision
              <br />
              to reality.
            </h2>
          </div>

          <div className="process-grid">

            <div className="process-item">
              <div
                className="process-circle"
                aria-hidden="true"
              >
                01
              </div>

              <h3>
                Consultation
              </h3>

              <p>
                We begin by understanding your needs,
                preferences, space and vision.
              </p>
            </div>

            <div className="process-item">
              <div
                className="process-circle"
                aria-hidden="true"
              >
                02
              </div>

              <h3>
                Concept
              </h3>

              <p>
                We develop a design direction that brings
                your ideas together into a cohesive vision.
              </p>
            </div>

            <div className="process-item">
              <div
                className="process-circle"
                aria-hidden="true"
              >
                03
              </div>

              <h3>
                Selection
              </h3>

              <p>
                Furniture, materials, textures and details
                are carefully selected for your space.
              </p>
            </div>

            <div className="process-item">
              <div
                className="process-circle"
                aria-hidden="true"
              >
                04
              </div>

              <h3>
                Transformation
              </h3>

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
            src={interiorFeature}
            alt="Sensational Interiors project"
            loading="lazy"
            decoding="async"
          />

  
          <div
            className="feature-overlay"
            aria-hidden="true"
          />

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

            <a
              href="/projects"
              className="about-btn about-btn-light"
            >
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

            <a
              href="/contact"
              className="about-btn about-btn-dark"
            >
              Book a Consultation
            </a>

          </div>
        </div>
      </section>

    </main>
  );
};

export default About;
