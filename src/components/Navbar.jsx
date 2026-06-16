import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { clearAuth, getStoredUser } from '../utils/auth'

const brandLogo = 'https://img.freepik.com/premium-vector/hair-care-template-logo-design_278222-7822.jpg?w=2000'

function Navbar() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const navLinkClassName = ({ isActive }) =>
    `nav-link app-nav-link${isActive ? ' app-nav-link-active' : ''}`

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem('customerWelcomeShown')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container app-shell-container">
        <Link className="navbar-brand app-navbar-brand" to="/">
          <img src={brandLogo} alt="Hair Care logo" className="brand-logo" />
          <span className="brand-copy">
            <span className="brand-title">
              <span className="brand-title-top">Super</span>
              <span className="brand-title-bottom">Natural</span>
            </span>
          </span>
        </Link>
        <button
          className="navbar-toggler app-navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse app-navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto app-navbar-links">
            <li className="nav-item">
              <NavLink className={navLinkClassName} to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClassName} to="/products">Products</NavLink>
            </li>
            {user?.role === 'CUSTOMER' && (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClassName} to="/cart">Cart</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClassName} to="/orders">Orders</NavLink>
                </li>
              </>
            )}
            {user ? (
              <>
                <li className="nav-item app-user-item">
                  <span className="nav-link navbar-user app-user-chip">
                    {user.name} <span className="navbar-role">{user.role}</span>
                  </span>
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link nav-button app-nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClassName} to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link app-nav-link app-nav-cta${isActive ? ' app-nav-link-active' : ''}`} to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
