import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="app-footer mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5>About Hair Care</h5>
            <p>
              A refined storefront for everyday routines, salon-grade nourishment, and confident
              self-care.
            </p>
          </div>
          <div className="col-sm-6 col-lg-4">
            <h5>Explore</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/products" className="footer-link">Products</Link></li>
              <li><Link to="/cart" className="footer-link">Cart</Link></li>
            </ul>
          </div>
          <div className="col-sm-6 col-lg-4">
            <h5>Contact</h5>
            <p>Email: hello@haircare.com</p>
            <p>Phone: +91 80000 00000</p>
            <p>Support hours: Mon - Sat, 9:00 AM to 7:00 PM</p>
          </div>
        </div>
        <hr />
        <div className="text-center footer-bottom">
          <p>&copy; 2026 Hair Care Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
