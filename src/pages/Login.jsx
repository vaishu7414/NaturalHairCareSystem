import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Pages.css'
import apiClient from '../services/api'
import { clearAuth } from '../utils/auth'
import PasswordInput from '../components/PasswordInput'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      clearAuth()
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card auth-card">
              <div className="card-body p-4">
                <h3 className="card-title mb-4 text-center">Login to Your Account</h3>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <PasswordInput
                    label="Password"
                    className="mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                <div className="text-center">
                  <p className="mb-2">
                    Don&apos;t have an account? <Link to="/register">Sign up</Link>
                  </p>
                  <Link to="/forgot-password">Forgot your password?</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
