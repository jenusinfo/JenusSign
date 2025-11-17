import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import authApi from '../../../api/authApi'
import useAuthStore from '../../../shared/store/authStore'

export default function PortalLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('login') // 'login' or 'otp'
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.login(email, password)
      if (response.requiresOtp) {
        setStep('otp')
        toast.success('OTP sent to your email! (Use 123456 for demo)')
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
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
      const response = await authApi.verifyOtp(email, otp)
      setAuth(response.token, response.user)
      toast.success('Login successful!')
      navigate('/portal/proposals')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg"
          >
            <Shield className="w-8 h-8 text-primary-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">JenusSign Portal</h1>
          <p className="text-primary-100">Agent & Administrator Access</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 'login' ? 'Portal Login' : 'Two-Factor Authentication'}
          </h2>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input pl-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pl-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Demo Credentials</p>
                    <p className="text-blue-700">Email: admin@insurance.com</p>
                    <p className="text-blue-700">Password: admin123</p>
                    <p className="text-blue-700 mt-1">Or: agent@insurance.com / agent123</p>
                    <p className="text-blue-700 mt-1">OTP will be: 123456</p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="input pl-11 tracking-widest text-lg"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  OTP sent to <span className="font-medium">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                Back
              </button>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-primary-100">
            Are you a customer?{' '}
            <a
              href="/customer/login"
              className="text-white hover:text-primary-50 font-medium underline"
            >
              Customer Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
