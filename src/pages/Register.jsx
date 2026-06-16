import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Pages.css'
import apiClient from '../services/api'
import { clearAuth } from '../utils/auth'
import PasswordInput from '../components/PasswordInput'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError(null)
      clearAuth()

      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="card-body p-4">
                <h3 className="card-title mb-4 text-center">Create Your Account</h3>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <PasswordInput
                    label="Password"
                    className="mb-3"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    required
                  />
                  <PasswordInput
                    label="Confirm Password"
                    className="mb-4"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength="6"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Register'}
                  </button>
                </form>
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account? <Link to="/login">Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
