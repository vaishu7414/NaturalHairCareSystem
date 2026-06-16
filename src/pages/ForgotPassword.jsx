import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Pages.css'
import apiClient from '../services/api'
import { sendOtpEmail } from '../services/emailjs'
import PasswordInput from '../components/PasswordInput'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // Step 1: Email, Step 2: OTP, Step 3: Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('Please enter your email address')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Request OTP from backend (generates and stores OTP)
      const response = await apiClient.post('/auth/send-otp', { email })
      
      // Extract OTP from response (you may need to adjust based on your backend response)
      const generatedOtp = response.data.otp || response.data.generatedOtp
      
      // Send OTP email via EmailJS
      await sendOtpEmail(email, generatedOtp)
      
      setSuccess('OTP sent to your email. Please check your inbox.')
      setStep(2)
    } catch (err) {
      console.error('Error sending OTP:', err)
      setError(err.response?.data?.message || 'Failed to send OTP')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiClient.post('/auth/verify-otp', { email, otp })
      setSuccess('OTP verified successfully!')
      setStep(3)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiClient.post('/auth/reset-password-with-otp', {
        email,
        otp,
        newPassword,
      })
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    setStep(step - 1)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="auth-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="card-body p-4">
                <h3 className="card-title mb-3 text-center">Reset Your Password</h3>

                {/* Step Indicator */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div
                      className={`badge ${step >= 1 ? 'bg-primary' : 'bg-light'}`}
                      style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      1
                    </div>
                    <div
                      className={`flex-grow-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-light'}`}
                      style={{ height: '2px' }}
                    ></div>
                    <div
                      className={`badge ${step >= 2 ? 'bg-primary' : 'bg-light'}`}
                      style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      2
                    </div>
                    <div
                      className={`flex-grow-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-light'}`}
                      style={{ height: '2px' }}
                    ></div>
                    <div
                      className={`badge ${step >= 3 ? 'bg-primary' : 'bg-light'}`}
                      style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      3
                    </div>
                  </div>
                  <div className="row mt-2 text-center" style={{ fontSize: '0.8rem' }}>
                    <div className="col">Email</div>
                    <div className="col">OTP</div>
                    <div className="col">Password</div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <p className="text-muted text-center mb-3">
                      Enter the OTP sent to {email}
                    </p>
                    <div className="mb-3">
                      <label className="form-label">One-Time Password (OTP)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength="6"
                        required
                        disabled={loading}
                      />
                      <small className="text-muted">OTP will expire in 5 minutes</small>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-2"
                      disabled={loading}
                    >
                      {loading ? 'Verifying OTP...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={handleGoBack}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <p className="text-muted text-center mb-3">
                      Enter your new password
                    </p>
                    <PasswordInput
                      label="New Password"
                      className="mb-3"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength="6"
                      required
                      disabled={loading}
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      className="mb-4"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength="6"
                      required
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-2"
                      disabled={loading}
                    >
                      {loading ? 'Resetting password...' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={handleGoBack}
                      disabled={loading}
                    >
                      Back
                    </button>
                  </form>
                )}

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Remembered it? <Link to="/login">Back to login</Link>
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

export default ForgotPassword
