import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = '/api/v1'

// Create axios instance
const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - handles both agent and customer tokens
httpClient.interceptors.request.use(
  (config) => {
    // Get persisted auth state from localStorage (Zustand persist)
    const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state
    
    // Priority: customerToken for customer routes, agentToken for portal routes
    const isCustomerRoute = config.url?.includes('/customer') || 
                           config.url?.includes('/signing') ||
                           config.url?.includes('/envelopes/customer')
    
    let token = null
    if (isCustomerRoute && authState?.customerToken) {
      token = authState.customerToken
    } else if (authState?.agentToken) {
      token = authState.agentToken
    } else if (authState?.token) {
      // Legacy fallback
      token = authState.token
    } else {
      // Final fallback to simple token storage
      token = localStorage.getItem('token')
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      // Determine which portal user is on based on URL
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/customer')) {
        // Clear customer auth
        const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (authState.state) {
          authState.state.customerToken = null
          authState.state.customer = null
          localStorage.setItem('auth-storage', JSON.stringify(authState))
        }
        window.location.href = '/customer/login'
      } else {
        // Clear agent/portal auth
        const authState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        if (authState.state) {
          authState.state.agentToken = null
          authState.state.agent = null
          authState.state.token = null
          authState.state.user = null
          localStorage.setItem('auth-storage', JSON.stringify(authState))
        }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/portal/login'
      }
    }
    
    // Don't show toast for 401 (redirect handles it)
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    return Promise.reject(error)
  }
)

export default httpClient
