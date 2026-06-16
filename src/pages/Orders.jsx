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

function Orders() {
  const user = getStoredUser()
  const userEmail = user?.email
  const userRole = user?.role
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userEmail || userRole !== 'CUSTOMER') {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.get('/orders/my')
        setOrders(response.data || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userEmail, userRole])

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please <Link to="/login">login</Link> as a customer to view your orders.
        </div>
      </div>
    )
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Orders history is available for customer accounts.</div>
      </div>
    )
  }

  return (
    <div className="orders-page py-5">
      <div className="container">
        <div className="page-banner mb-4">
          <span className="section-kicker">Purchase history</span>
          <h1 className="mb-2">My Orders</h1>
          <p className="mb-0">Track recent purchases, payment status, and product details in one place.</p>
        </div>
        {loading && <div className="alert alert-secondary">Loading orders...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="alert alert-info">
            No orders yet. <Link to="/products">Start shopping</Link>.
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="row g-4">
            {orders.map((order) => (
              <div key={order.id} className="col-12">
                <div className="card order-card">
                  <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                      <div>
                        <h5 className="mb-1">Order #{order.id}</h5>
                        <p className="text-muted mb-0">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="badge order-status-badge">{order.status}</span>
                        <p className="fw-semibold mt-2 mb-0">{formatRupees(order.totalPrice)}</p>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={`${order.id}-${item.productId}`}>
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
                              <td>{formatRupees(item.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {order.payment && (
                      <div className="alert alert-success mt-3 mb-0">
                        Payment: {order.payment.status} via {order.payment.method}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
