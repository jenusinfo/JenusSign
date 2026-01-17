import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Building2,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/store/authStore'

const AgentLoginPage = () => {
  const navigate = useNavigate()
  const { setAuth, setAgentAuth } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - in production this would come from API
      const mockUser = {
        id: 'user-001',
        name: 'User',
        email: formData.email,
        role: formData.email.includes('admin') ? 'admin' : 'agent',
        company: 'Hydra Insurance Ltd',
      }

      // Generate mock token
      const mockToken = 'mock-jwt-token-' + Date.now()

      // Set auth state using BOTH methods for compatibility
      setAgentAuth(mockToken, mockUser)
      setAuth(mockToken, mockUser)

      toast.success(`Welcome back, ${mockUser.name}!`)
      
      // Small delay to ensure state is persisted before navigation
      setTimeout(() => {
        navigate('/portal/dashboard', { replace: true })
      }, 100)

    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">JenusSign</h1>
            <p className="text-indigo-300 text-xs">Agent Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-indigo-200">eIDAS Compliant</span>
        </div>
      </header>

      {/* Main Content - true vertical center */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo/Title Section */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Agent Portal</h2>
            <p className="text-indigo-300">Manage digital signing workflows for your clients</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Secure Login</h3>
                  <p className="text-indigo-200 text-sm">Access your dashboard</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="admin@insurance.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-indigo-300">Remember me</span>
                </label>
                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Demo Notice */}
              <div className="bg-indigo-500/20 rounded-xl p-3 border border-indigo-500/30">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span><strong>Demo:</strong> Enter any email and password to continue</span>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Link */}
          <p className="text-center mt-6 text-indigo-300">
            Customer looking to sign documents?{' '}
            <Link to="/customer/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Go to Customer Portal
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default AgentLoginPage
