import httpClient from './httpClient'

// ============================================================================
// CUSTOMER AUTH API - OTP-based passwordless authentication for customers
// httpClient interceptor already returns response.data, so we return directly
// ============================================================================

/**
 * Request OTP for customer login
 * @param {string} email - Customer email address
 * @param {string} channel - 'EMAIL' or 'SMS' (default: 'EMAIL')
 * @returns {Promise<{success: boolean, maskedDestination: string, channel: string, expiresAt: string, otpToken: string, message: string}>}
 */
export const requestOtp = async (email, channel = 'EMAIL') => {
  return await httpClient.post('/customer-auth/request-otp', { 
    email, 
    channel 
  })
}

/**
 * Verify OTP and authenticate customer
 * @param {string} otpToken - The token received from requestOtp
 * @param {string} code - The OTP code
 * @returns {Promise<{success: boolean, accessToken: string, refreshToken: string, customer: object, expiresAt: string}>}
 */
export const verifyOtp = async (otpToken, code) => {
  return await httpClient.post('/customer-auth/verify-otp', { 
    otpToken, 
    code 
  })
}

/**
 * Get current customer info
 */
export const getCurrentCustomer = async () => {
  return await httpClient.get('/customer-auth/me')
}

/**
 * Refresh customer tokens
 * @param {string} refreshToken - The refresh token
 */
export const refreshTokens = async (refreshToken) => {
  return await httpClient.post('/customer-auth/refresh', { refreshToken })
}

/**
 * Customer logout
 */
export const logout = async () => {
  return await httpClient.post('/customer-auth/logout')
}

// ============================================================================
// EXPORT
// ============================================================================

export const customerAuthApi = {
  requestOtp,
  verifyOtp,
  getCurrentCustomer,
  refreshTokens,
  logout,
}

export default customerAuthApi
