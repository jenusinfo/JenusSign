import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import authApi from '../../../api/authApi'
import useAuthStore from '../../../shared/store/authStore'

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setCustomerAuth = useAuthStore((state) => state.setCustomerAuth)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await authApi.requestCustomerOtp(email)
      setStep('otp')
      toast.success('OTP sent to your email! (Use 123456 for demo)')
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
      const response = await authApi.verifyCustomerOtp(email, otp)
      setCustomerAuth(response.token, response.customer)
      toast.success('Login successful!')
      navigate('/customer/dashboard')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JenusSign</h1>
          <p className="text-gray-600">Secure Digital Signing Platform</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 'email' ? 'Customer Login' : 'Verify OTP'}
          </h2>

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg py-3"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Demo Mode</p>
                    <p className="text-blue-700">Use email: john.doe@email.com</p>
                    <p className="text-blue-700">OTP will be: 123456</p>
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
                onClick={() => setStep('email')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                Back
              </button>
            </form>
          )}
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you an agent or broker?{' '}
            <a href="/portal/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Portal Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
