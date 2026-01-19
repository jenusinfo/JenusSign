import httpClient from './httpClient'

// ============================================================================
// SIGNING API - customer signing workflow
// httpClient interceptor already returns response.data
// ============================================================================

/**
 * Get signing session info by access token
 * @param {string} accessToken
 */
export const getSigningSession = async (accessToken) => {
  return await httpClient.get(`/signing/${accessToken}`)
}

/**
 * Verify customer identity
 * @param {string} accessToken
 * @param {object} payload
 */
export const verifyIdentity = async (accessToken, payload) => {
  return await httpClient.post(`/signing/${accessToken}/verify-identity`, payload)
}

/**
 * Request OTP for signing
 * @param {string} accessToken
 * @param {string} channel - Email | Sms
 */
export const requestOtp = async (accessToken, channel) => {
  return await httpClient.post(`/signing/${accessToken}/request-otp`, { channel })
}

/**
 * Verify OTP code
 * @param {string} accessToken
 * @param {string} code
 */
export const verifyOtp = async (accessToken, code) => {
  return await httpClient.post(`/signing/${accessToken}/verify-otp`, { code })
}

/**
 * Complete signature
 * @param {string} accessToken
 * @param {string} signatureData
 * @param {boolean} consentConfirmed
 */
export const completeSignature = async (accessToken, signatureData, consentConfirmed) => {
  return await httpClient.post(`/signing/${accessToken}/sign`, { signatureData, consentConfirmed })
}

/**
 * Verify a signed document by verification code
 * @param {string} verificationCode - The verification code from the signed document
 */
export const verifyDocument = async (verificationCode) => {
  return await httpClient.get(`/signing/verify/${verificationCode}`)
}

export const signingApi = {
  getSigningSession,
  verifyIdentity,
  requestOtp,
  verifyOtp,
  completeSignature,
  verifyDocument,
}

export default signingApi
