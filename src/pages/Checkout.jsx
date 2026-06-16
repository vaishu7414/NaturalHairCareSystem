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

const CHECKOUT_PROFILE_KEY = 'checkoutProfile'
const RAZORPAY_KEY_ID = 'rzp_test_SiQNNt4hdfDG96'

const defaultCheckoutProfile = {
  mobile: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
}

function Checkout() {
  const user = getStoredUser()
  const userEmail = user?.email
  const userRole = user?.role
  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])
  const [checkoutProfile, setCheckoutProfile] = useState(() => {
    const storedProfile = localStorage.getItem(CHECKOUT_PROFILE_KEY)

    if (!storedProfile) {
      return defaultCheckoutProfile
    }

    try {
      return {
        ...defaultCheckoutProfile,
        ...JSON.parse(storedProfile),
      }
    } catch {
      localStorage.removeItem(CHECKOUT_PROFILE_KEY)
      return defaultCheckoutProfile
    }
  })
  const [createdOrder, setCreatedOrder] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!userEmail || userRole !== 'CUSTOMER') {
        setLoading(false)
        return
      }

      try {
        const [cartResponse, ordersResponse] = await Promise.all([
          apiClient.get('/cart'),
          apiClient.get('/orders/my'),
        ])

        setCart(cartResponse.data)
        setOrders(ordersResponse.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checkout details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userEmail, userRole])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setCheckoutProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveCheckoutProfile = () => {
    localStorage.setItem(CHECKOUT_PROFILE_KEY, JSON.stringify(checkoutProfile))
  }

  const validateCheckoutProfile = () => {
    if (!checkoutProfile.mobile.trim()) {
      setError('Mobile number is required')
      return false
    }

    if (!checkoutProfile.address.trim()) {
      setError('Address is required')
      return false
    }

    return true
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const refreshOrders = async () => {
    const ordersResponse = await apiClient.get('/orders/my')
    setOrders(ordersResponse.data || [])
  }

  const openRazorpayCheckout = async (order) => {
    const scriptLoaded = await loadRazorpayScript()

    if (!scriptLoaded) {
      setError('Failed to load Razorpay checkout')
      return
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'INR',
      name: 'Hair Care',
      description: `Payment for order #${order.id}`,
      handler: async (response) => {
        try {
          setProcessingPayment(true)
          setError(null)
          const paymentResponse = await apiClient.post(`/payments/order/${order.id}`, {
            method: 'razorpay',
          })
          setPaymentResult({
            ...paymentResponse.data,
            razorpayPaymentId: response.razorpay_payment_id,
          })
          setSuccess(`Payment completed for order #${order.id}`)
          await refreshOrders()
        } catch (err) {
          setError(err.response?.data?.message || 'Payment was captured by Razorpay but failed to update backend')
        } finally {
          setProcessingPayment(false)
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: checkoutProfile.mobile,
      },
      notes: {
        address: checkoutProfile.address,
        city: checkoutProfile.city,
        state: checkoutProfile.state,
        zipCode: checkoutProfile.zipCode,
      },
      theme: {
        color: '#212529',
      },
      modal: {
        ondismiss: () => {
          setProcessingPayment(false)
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const handlePlaceOrder = async () => {
    if (!validateCheckoutProfile()) {
      return
    }

    try {
      setPlacingOrder(true)
      setError(null)
      setSuccess(null)
      setPaymentResult(null)
      saveCheckoutProfile()

      const response = await apiClient.post('/orders/place')
      setCreatedOrder(response.data)
      setSuccess(`Order #${response.data.id} placed successfully`)
      setCart((prev) => ({
        ...(prev || {}),
        items: [],
        totalAmount: 0,
      }))
      await refreshOrders()
      await openRazorpayCheckout(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please <Link to="/login">login</Link> as a customer to place an order.
        </div>
      </div>
    )
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Checkout is available for customer accounts only.</div>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const totalAmount = cart?.totalAmount || 0

  return (
    <div className="checkout-page py-5">
      <div className="container">
        <div className="page-banner mb-4">
          <span className="section-kicker">Secure checkout</span>
          <h1 className="mb-2">Checkout</h1>
          <p className="mb-0">Save delivery details, review the order, and continue to payment.</p>
        </div>
        {loading && <div className="alert alert-secondary">Loading checkout details...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!loading && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Delivery Details</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="mobile"
                        value={checkoutProfile.mobile}
                        onChange={handleProfileChange}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={checkoutProfile.zipCode}
                        onChange={handleProfileChange}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="address"
                        value={checkoutProfile.address}
                        onChange={handleProfileChange}
                        placeholder="Enter full delivery address"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={checkoutProfile.city}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={checkoutProfile.state}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary mt-3"
                    onClick={saveCheckoutProfile}
                  >
                    Save Details
                  </button>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Current Cart</h5>
                  {cartItems.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
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
                              <td>{item.quantity}</td>
                              <td>{formatRupees(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info mb-0">
                      Your cart is empty. <Link to="/products">Add products first</Link>.
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Payment</h5>
                  <p className="text-muted mb-3">Your order will open Razorpay checkout after it is created.</p>
                  <button
                    className="btn btn-primary"
                    disabled={placingOrder || processingPayment || cartItems.length === 0}
                    onClick={handlePlaceOrder}
                  >
                    {placingOrder
                      ? 'Placing order...'
                      : processingPayment
                        ? 'Opening payment...'
                        : 'Place Order & Pay'}
                  </button>
                  {createdOrder && (
                    <p className="mt-3 mb-0">Current order: #{createdOrder.id}</p>
                  )}
                  {paymentResult && (
                    <div className="alert alert-success mt-3 mb-0">
                      Payment {paymentResult.status} via Razorpay
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card mb-4 order-summary-card">
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
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold">{formatRupees(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Previous Orders</h5>
                  {orders.length === 0 ? (
                    <div className="checkout-empty-state">No previous orders yet.</div>
                  ) : (
                    <div className="checkout-orders-list">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="checkout-order-item">
                          <div className="d-flex justify-content-between">
                            <strong>#{order.id}</strong>
                            <span>{order.status}</span>
                          </div>
                          <div className="small text-muted">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <div>{formatRupees(order.totalPrice)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/orders" className="btn btn-outline-secondary w-100 mt-3">
                    View Full Order History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
