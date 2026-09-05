import React from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer
      className="py-3"
      style={{ backgroundColor: '#6050DC', color: 'white' }}
    >
      <div className="container text-center">

        {/* Quick Links Section */}
        <div className="mb-2">
          <Link
            to="/"
            className="text-white text-decoration-none mx-2"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-white text-decoration-none mx-2"
          >
            About
          </Link>

          <Link
            to="/shop"
            className="text-white text-decoration-none mx-2"
          >
            Shop
          </Link>

          <Link
            to="/contact"
            className="text-white text-decoration-none mx-2"
          >
            Contact
          </Link>
        </div>

        {/* Social Media Icons Section */}
        <div className="mb-2">
          <a href="#" className="text-white mx-2">
            <FaFacebook />
          </a>

          <a href="#" className="text-white mx-2">
            <FaTwitter />
          </a>

          <a href="#" className="text-white mx-2">
            <FaInstagram />
          </a>
        </div>

        {/* Copyright Section */}
        <p className="small mb-0">
          &copy; 2026 Shopit
        </p>

      </div>
    </footer>
  )
}

export default Footer