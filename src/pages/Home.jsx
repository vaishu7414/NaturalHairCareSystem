import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Pages.css'
import { getStoredUser } from '../utils/auth'
import apiClient from '../services/api'
import defaultHeroImage from '../assets/homeimage.jpg'

function Home() {
  const user = getStoredUser()
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'
  const [hairTypeCount, setHairTypeCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasShown = localStorage.getItem('customerWelcomeShown')
    return isCustomer && !hasShown
  })
  const [heroImage, setHeroImage] = useState(() => {
    const stored = localStorage.getItem('heroImage')
    return stored || defaultHeroImage
  })
  const [uploadError, setUploadError] = useState(null)

  const handleHeroImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result
      if (imageData) {
        setHeroImage(imageData)
        localStorage.setItem('heroImage', imageData)
        setUploadError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const fetchHairTypeCounts = async () => {
      try {
        const response = await apiClient.get('/products')
        const products = response.data?.content || []
        const uniqueHairTypes = new Set(products.map(p => p.hairType))
        setHairTypeCount(uniqueHairTypes.size)
      } catch (err) {
        setHairTypeCount(5)
      }
    }

    if (isAdmin) {
      fetchHairTypeCounts()
    }
  }, [isAdmin])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('customerWelcomeShown', 'true')
  }

  return (
    <div className="home-page">
      {/* Welcome Modal Popup */}
      {showWelcome && (
        <div className="welcome-modal-overlay" onClick={handleCloseWelcome}>
          <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
            <div className="welcome-modal-content">
              <button 
                className="welcome-modal-close" 
                onClick={handleCloseWelcome}
                aria-label="Close welcome popup"
              >
                ×
              </button>
              <div className="welcome-modal-body">
                <h2 className="welcome-modal-title">Hello! 👋</h2>
                <p className="welcome-modal-message">
                  Welcome back, <span className="welcome-modal-name">{user?.name}</span>!
                </p>
                <p className="welcome-modal-subtitle">
                  Ready to find your perfect hair care products?
                </p>
              </div>
              <div className="welcome-modal-footer">
                <button 
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleCloseWelcome}
                >
                  Let's Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="hero-section">
        <div className="container">
          {isAdmin && (
            <div className="alert alert-info mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Admin: Upload Hero Image</strong>
                  <p className="mb-0 small mt-1">Upload a custom image to replace the default hero image</p>
                </div>
                <label className="btn btn-sm btn-primary mb-0">
                  Choose Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleHeroImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {uploadError && <p className="text-danger small mt-2 mb-0">{uploadError}</p>}
            </div>
          )}
          <div className="row align-items-center gy-5">
            <div className="col-lg-6 text-start">
              <h1 className="display-4 mb-4">Healthy hair routines with a more elevated feel.</h1>
              <p className="lead mb-4 hero-copy">
                Discover nourishing formulas, clean ingredients, and everyday favorites curated
                for shine, softness, strength, and long-term hair wellness.
              </p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary btn-lg">
                  {isAdmin ? 'Manage Products' : 'Shop Collection'}
                </Link>
                {isCustomer ? (
                  <Link to="/orders" className="btn btn-outline-dark btn-lg">
                    View Orders
                  </Link>
                ) : !isAdmin && (
                  <Link to="/register" className="btn btn-outline-dark btn-lg">
                    Create Account
                  </Link>
                )}
              </div>
              <div className="hero-metrics">
                <div>
                  <strong>50+</strong>
                  <span>Curated products</span>
                </div>
                <div>
                  <strong>{isAdmin ? hairTypeCount : 5}</strong>
                  <span>Hair-type ranges</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Order access</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-visual-card">
                <img
                  src={heroImage}
                  alt="Hair Care"
                  className="img-fluid hero-visual"
                />
                <div className="hero-floating-note">
                  <span>Best for dry, curly, and damaged hair</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-kicker">Why customers stay</span>
            <h2 className="mb-3">Built for a smoother shopping experience</h2>
            <p>Designed to feel cleaner, faster, and easier on every screen.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 feature-card">
                <div className="card-body">
                  <div className="feature-icon">01</div>
                  <h5 className="card-title">Premium Quality</h5>
                  <p className="card-text">
                    Thoughtfully selected formulas made to support healthier, softer, shinier hair.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 feature-card">
                <div className="card-body">
                  <div className="feature-icon">02</div>
                  <h5 className="card-title">Fast Delivery</h5>
                  <p className="card-text">
                    A streamlined checkout flow and a clear order summary from cart to payment.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 feature-card">
                <div className="card-body">
                  <div className="feature-icon">03</div>
                  <h5 className="card-title">Better Value</h5>
                  <p className="card-text">
                    Competitive pricing, clear product details, and less clutter across the site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
