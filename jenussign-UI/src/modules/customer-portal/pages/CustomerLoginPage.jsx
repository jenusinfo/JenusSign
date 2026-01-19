import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  ArrowRight,
  Shield,
  Lock,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Sparkles,
  FileSignature,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { customerAuthApi } from '../../../api/customerAuthApi'
import useAuthStore from '../../../shared/store/authStore'
import { TrustIndicatorBar } from '../../../shared/components/ComplianceBadges'
import { componentPresets, animations } from '../../../shared/constants/designSystem'

/**
 * CustomerLoginPage - Passwordless OTP login for customers
 * 
 * Flow:
 * 1. Enter email address
 * 2. Receive OTP via email
 * 3. Verify OTP and access dashboard
 */
const CustomerLoginPage = () => {
  const navigate = useNavigate()
  const { setCustomerAuth } = useAuthStore()
  
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const result = await customerAuthApi.requestOtp(email, 'EMAIL')
      setOtpToken(result.otpToken)
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
      const result = await customerAuthApi.verifyOtp(otpToken, otp)
      
      // Set customer auth from API response
      const customer = result.customer || {
        id: result.customerId,
        email: result.email || email,
        displayName: result.displayName || result.name || email.split('@')[0],
      }
      
      setCustomerAuth(result.accessToken, customer, result.refreshToken)
      toast.success('Login successful')
      navigate('/customer/dashboard')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // Mask email for display
  const maskEmail = (email) => {
    if (!email) return ''
    const [user, domain] = email.split('@')
    if (user.length <= 2) return email
    return `${user[0]}${'•'.repeat(Math.min(user.length - 2, 5))}${user[user.length - 1]}@${domain}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex flex-col">
      {/* Trust Indicators Bar */}
      <TrustIndicatorBar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          {...animations.pageEnter}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            {/* Logo Icon with Badge */}
            <div className="inline-block relative mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileSignature className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
              </div>
              {/* Green checkmark badge */}
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Brand Name */}
            <h1 className="text-2xl font-bold text-white mb-0.5">
              JenusSign
            </h1>
            <p className="text-white/90 text-sm mb-4">
              eIDAS Digital Signing
            </p>
            
            {/* Portal Title */}
            <h2 className="text-xl font-semibold text-white mb-1">
              Customer Portal
            </h2>
            <p className="text-blue-100 text-sm">
              Sign documents securely with eIDAS-compliant signatures
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {step === 'email' ? (
                    <Mail className="w-5 h-5 text-white" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {step === 'email' ? 'Welcome Back' : 'Verify Your Identity'}
                  </h2>
                  <p className="text-xs text-blue-100">
                    {step === 'email' 
                      ? 'Enter your email to receive a secure login code'
                      : `Code sent to ${maskEmail(email)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {step === 'email' ? (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={componentPresets.button.primary + ' w-full py-3'}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Login Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Demo hint */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-700 text-center">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                      <strong>Demo:</strong> Enter any email to continue
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter 6-digit Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-center text-xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className={componentPresets.button.primary + ' w-full py-3'}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Demo hint */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-700 text-center">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                      <strong>Demo:</strong> Use code <span className="font-mono font-bold">123456</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setOtp('')
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Back to email
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80">
              <Lock className="w-3.5 h-3.5" />
              <span>Your data is encrypted and secure</span>
            </div>
          </motion.div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/60">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CustomerLoginPage
