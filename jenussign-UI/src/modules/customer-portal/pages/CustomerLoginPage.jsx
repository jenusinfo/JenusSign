import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { customerAuthApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import Logo from '../../../shared/components/Logo'

const CustomerLoginPage = () => {
  const navigate = useNavigate()
  const { setCustomerAuth } = useAuthStore()
  
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await customerAuthApi.requestOtp({ email })
      toast.success('OTP sent to your email')
      setStep('otp')
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    setLoading(true)
    try {
      const response = await customerAuthApi.verifyOtp({ email, otp })
      setCustomerAuth(response.token, response.customer)
      toast.success('Login successful')
      navigate('/customer/dashboard')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" showText={true} />
          </div>
          <p className="text-gray-600">
            Secure document signing portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'email' ? (
            <form onSubmit={handleRequestOtp}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customer Login</h2>
                <p className="text-gray-600 mt-2">Enter your email to receive a login code</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Login Code'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  For security, we'll send a one-time code to your registered email address
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Enter Login Code</h2>
                <p className="text-gray-600 mt-2">
                  We sent a code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6-Digit Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2"
                >
                  ← Back to email
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact your insurance provider
        </p>
      </motion.div>
    </div>
  )
}

export default CustomerLoginPage
