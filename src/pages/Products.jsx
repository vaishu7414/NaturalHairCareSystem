import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'
import apiClient from '../services/api'
import { getStoredUser } from '../utils/auth'
import { formatRupees } from '../utils/currency'

const fallbackProductImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3e8d6" />
          <stop offset="100%" stop-color="#dcc3a5" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#bg)" />
      <circle cx="150" cy="78" r="30" fill="#8b5e3c" opacity="0.18" />
      <rect x="95" y="118" width="110" height="18" rx="9" fill="#8b5e3c" opacity="0.22" />
      <text x="150" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#5c4033">
        Hair Care Product
      </text>
    </svg>
  `)

const initialProductForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  hairType: 'DRY',
  stock: '',
}

function Products() {
  const user = getStoredUser()
  const isCustomer = user?.role === 'CUSTOMER'
  const isAdmin = user?.role === 'ADMIN'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [addingProductId, setAddingProductId] = useState(null)
  const [productForm, setProductForm] = useState(initialProductForm)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [cartToast, setCartToast] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/products')
        setProducts(response.data?.content || [])
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (!cartToast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCartToast(null)
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [cartToast])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/products')
      setProducts(response.data?.content || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId) => {
    if (!isCustomer) {
      setError('Please login as a customer to add products to cart')
      return
    }

    try {
      setAddingProductId(productId)
      setError(null)
      setSuccess(null)
      await apiClient.post('/cart/items', {
        productId,
        quantity: 1,
      })
      setSuccess('Product added to cart successfully')
      const addedProduct = products.find((product) => product.id === productId)
      setCartToast({
        name: addedProduct?.name || 'Product',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product to cart')
    } finally {
      setAddingProductId(null)
    }
  }

  const handleProductFormChange = (e) => {
    const { name, value } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateProduct = async (e) => {
    e.preventDefault()

    try {
      setSavingProduct(true)
      setError(null)
      setSuccess(null)
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        imageUrl: productForm.imageUrl || null,
        hairType: productForm.hairType,
        stock: Number(productForm.stock),
      }

      if (editingProductId) {
        await apiClient.put(`/products/${editingProductId}`, payload)
        setSuccess('Product updated successfully')
      } else {
        await apiClient.post('/products', payload)
        setSuccess('Product created successfully')
      }

      setProductForm(initialProductForm)
      setEditingProductId(null)
      await fetchProducts()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (editingProductId ? 'Failed to update product' : 'Failed to create product')
      )
    } finally {
      setSavingProduct(false)
    }
  }

  const handleEditProduct = (product) => {
    setError(null)
    setSuccess(null)
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || '',
      hairType: product.hairType,
      stock: product.stock,
    })
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setProductForm(initialProductForm)
    setError(null)
  }

  const handleDeleteProduct = async (productId) => {
    try {
      setDeletingProductId(productId)
      setError(null)
      setSuccess(null)
      await apiClient.delete(`/products/${productId}`)
      setSuccess('Product deleted successfully')

      if (editingProductId === productId) {
        handleCancelEdit()
      }

      await fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeletingProductId(null)
    }
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl || fallbackProductImage)
    setShowImageModal(true)
  }

  const handleCloseImageModal = () => {
    setShowImageModal(false)
    setSelectedImage(null)
  }

  return (
    <div className="products-page py-5">
      {cartToast && (
        <div className="cart-toast" role="status" aria-live="polite">
          <div className="cart-toast-icon">+</div>
          <div>
            <strong>{cartToast.name}</strong>
            <p className="mb-0">Added to your cart</p>
          </div>
        </div>
      )}
      <div className="container">
        <div className="page-banner mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <span className="section-kicker">Product catalog</span>
            <h1 className="mb-1">Our Products</h1>
          </div>
          {isCustomer && (
            <Link to="/cart" className="btn btn-outline-dark">
              View Cart
            </Link>
          )}
        </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isAdmin && (
          <div className="card admin-product-form mb-5">
            <div className="card-body">
              <h4 className="mb-3">{editingProductId ? 'Edit Product' : 'Add Product'}</h4>
              <form onSubmit={handleCreateProduct}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="imageUrl"
                      value={productForm.imageUrl}
                      onChange={handleProductFormChange}
                      placeholder="https://example.com/product-image.jpg"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Hair Type</label>
                    <select
                      className="form-select"
                      name="hairType"
                      value={productForm.hairType}
                      onChange={handleProductFormChange}
                    >
                      <option value="DRY">DRY</option>
                      <option value="OILY">OILY</option>
                      <option value="CURLY">CURLY</option>
                      <option value="DAMAGED">DAMAGED</option>
                      <option value="NORMAL">NORMAL</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-dark" disabled={savingProduct}>
                      {savingProduct
                        ? (editingProductId ? 'Updating product...' : 'Saving product...')
                        : (editingProductId ? 'Update Product' : 'Add Product')}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-sm-6 col-xl-4">
                <div className="card h-100 product-card">
                  <img
                    src={product.imageUrl || fallbackProductImage}
                    className="card-img-top product-card-image"
                    alt={product.name}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleImageClick(product.imageUrl)}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = fallbackProductImage
                    }}
                  />
                  <div className="card-body d-flex flex-column product-card-body">
                    <div className="product-meta-row">
                      <span className="product-pill">{product.hairType}</span>
                      <span className="product-stock">Stock: {product.stock}</span>
                    </div>
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-auto gap-3 flex-wrap">
                      <span className="h5 mb-0 product-price">{formatRupees(product.price)}</span>
                      {isAdmin ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-dark btn-sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            disabled={deletingProductId === product.id}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ) : isCustomer ? (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={addingProductId === product.id}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          {addingProductId === product.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      ) : (
                        <span className="badge text-bg-secondary">Customer login required</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No products available</p>
        )}
      </div>

      {showImageModal && (
        <div 
          className="image-modal-overlay"
          onClick={handleCloseImageModal}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close"
              onClick={handleCloseImageModal}
              aria-label="Close image"
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Product full view" 
              className="image-modal-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
