import httpClient from './httpClient'

// ============================================================================
// AUTH API - Actual API calls to backend
// httpClient interceptor already returns response.data, so we work with data directly
// ============================================================================

const authApi = {
  // Non-customer portal login (Agent/Broker/Admin)
  async login(email, password) {
    const data = await httpClient.post('/auth/login', { email, password })
    // Backend returns { requiresOtp, otpToken, accessToken, refreshToken, user }
    // If OTP is not required (direct login), save tokens immediately
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },

  async verifyOtp(otpToken, otp) {
    // Note: Current backend doesn't have OTP for user login, 
    // but we keep this for future implementation
    // For now, login returns tokens directly
    const data = await httpClient.post('/auth/verify-login-otp', { 
      otpToken, 
      otpCode: otp 
    })
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    
    const data = await httpClient.post('/auth/refresh', { refreshToken })
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  },

  async getCurrentUser() {
    return await httpClient.get('/auth/me')
  },

  // Customer portal login via OTP
  async requestCustomerOtp(email, phone = null) {
    return await httpClient.post('/customer-auth/request-otp', { 
      email: email || null,
      phone: phone || null
    })
  },

  async verifyCustomerOtp(otpToken, code) {
    const data = await httpClient.post('/customer-auth/verify-otp', { 
      otpToken, 
      code 
    })
    if (data.accessToken) {
      localStorage.setItem('customerToken', data.accessToken)
      localStorage.setItem('customerRefreshToken', data.refreshToken)
      localStorage.setItem('customer', JSON.stringify(data.customer))
    }
    return data
  },

  async refreshCustomerToken() {
    const refreshToken = localStorage.getItem('customerRefreshToken')
    if (!refreshToken) throw new Error('No refresh token')
    
    const data = await httpClient.post('/customer-auth/refresh', { refreshToken })
    localStorage.setItem('customerToken', data.accessToken)
    localStorage.setItem('customerRefreshToken', data.refreshToken)
    return data
  },

  async getCurrentCustomer() {
    return await httpClient.get('/customer-auth/me')
  },

  logout() {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customerRefreshToken')
    localStorage.removeItem('customer')
    
    // Call backend logout to invalidate refresh token
    httpClient.post('/auth/logout').catch(() => {})
  },

  // Helper to get stored user/customer
  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getStoredCustomer() {
    const customer = localStorage.getItem('customer')
    return customer ? JSON.parse(customer) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  isCustomerAuthenticated() {
    return !!localStorage.getItem('customerToken')
  },
}

export { authApi }
export default authApi
