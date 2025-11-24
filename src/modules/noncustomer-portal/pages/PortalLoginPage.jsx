import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import Logo from '../../../shared/components/Logo'

const PortalLoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()  // ✅ Correct: Destructure setAuth
  
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.login({ email, password })
      
      if (response.requiresOtp) {
        toast.success('OTP sent to your email')
        setStep('otp')
      } else {
        // Direct login (no 2FA)
        setAuth(response.token, response.user)
        toast.success('Login successful')
        navigate('/portal/proposals')
      }
    } catch (error) {
      toast.error(error.message || 'Invalid credentials')
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
      const response = await authApi.verifyOtp({ email, otp })
      setAuth(response.token, response.user)  // ✅ Correct: Use setAuth function
      toast.success('Login successful')
      navigate('/portal/proposals')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
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
            Insurance Portal Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'credentials' ? (
            <form onSubmit={handleLogin}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Portal Login</h2>
                <p className="text-gray-600 mt-2">Agents, Brokers, Employees & Admins</p>
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
                      placeholder="your.email@company.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
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
                  {loading ? 'Authenticating...' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Two-factor authentication (2FA) is enabled for enhanced security
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-gray-600 mt-2">
                  Enter the code sent to <strong>{email}</strong>
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
                    autoFocus
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
                    setStep('credentials')
                    setOtp('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2"
                >
                  ← Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6 space-y-1">
          <p>Demo Credentials: admin@insurance.com / admin123</p>
          <p>Demo OTP: 123456</p>
        </div>
      </motion.div>
    </div>
  )
}

export default PortalLoginPage
