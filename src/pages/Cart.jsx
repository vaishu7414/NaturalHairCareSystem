import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'
import apiClient from '../services/api'
import { getStoredUser } from '../utils/auth'
import { formatRupees } from '../utils/currency'

const fallbackProductImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="90" viewBox="0 0 120 90">
      <rect width="120" height="90" rx="12" fill="#efe2cf" />
      <circle cx="60" cy="35" r="16" fill="#8b5e3c" opacity="0.2" />
      <text x="60" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#5c4033">
        Product
      </text>
    </svg>
  `)

function Cart() {
  const user = getStoredUser()
  const userEmail = user?.email
  const userRole = user?.role
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  useEffect(() => {
    const fetchCart = async () => {
      if (!userEmail || userRole !== 'CUSTOMER') {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.get('/cart')
        setCart(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cart')
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [userEmail, userRole])

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) {
      return
    }

    try {
      setUpdatingItemId(cartItemId)
      const response = await apiClient.put(`/cart/items/${cartItemId}`, { quantity })
      setCart(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item')
    } finally {
      setUpdatingItemId(null)
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      setUpdatingItemId(cartItemId)
      const response = await apiClient.delete(`/cart/items/${cartItemId}`)
      setCart(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove cart item')
    } finally {
      setUpdatingItemId(null)
    }
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please <Link to="/login">login</Link> as a customer to manage your cart.
        </div>
      </div>
    )
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Cart access is available for customer accounts only.</div>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const totalAmount = cart?.totalAmount || 0

  return (
    <div className="cart-page py-5">
      <div className="container">
        <div className="page-banner mb-4">
          <span className="section-kicker">Bag overview</span>
          <h1 className="mb-2">Shopping Cart</h1>
          <p className="mb-0">Review quantities, update items, and head to checkout when ready.</p>
        </div>
        {loading && <div className="alert alert-secondary">Loading cart...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && cartItems.length > 0 ? (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="table-responsive content-card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.imageUrl || fallbackProductImage}
                              alt={item.productName}
                              className="cart-product-image"
                              onError={(event) => {
                                event.currentTarget.onerror = null
                                event.currentTarget.src = fallbackProductImage
                              }}
                            />
                            <span>{item.productName}</span>
                          </div>
                        </td>
                        <td>{formatRupees(item.unitPrice)}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm cart-quantity-input"
                            value={item.quantity}
                            min="1"
                            disabled={updatingItemId === item.id}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          />
                        </td>
                        <td>{formatRupees(item.subtotal)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            disabled={updatingItemId === item.id}
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card order-summary-card">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatRupees(totalAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping:</span>
                    <span>{formatRupees(0)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold">{formatRupees(totalAmount)}</span>
                  </div>
                  <Link to="/checkout" className="btn btn-primary w-100">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="alert alert-info empty-state">
              <p>Your cart is empty.</p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Cart
