import httpClient from './httpClient'

// ============================================================================
// ENVELOPES API - Actual API calls to backend
// ============================================================================

/**
 * Get all envelopes (agent/broker portal)
 */
export const getEnvelopes = async (params = {}) => {
  const data = await httpClient.get('/envelopes', { params })
  // httpClient interceptor already returns response.data
  const rawEnvelopes = data.envelopes || data.items || []
  
  // Transform API response to match UI expected format
  const items = rawEnvelopes.map(env => ({
    id: env.id,
    title: env.name || '',
    reference: env.businessKey || '',
    status: env.status || 'Draft',
    documentsCount: env.documentCount || 0,
    customer: {
      name: env.customerName || '',
      email: env.customerEmail || '',
    },
    createdBy: {
      name: env.agentName || '',
    },
    createdAt: env.createdAt,
    expiresAt: env.expiresAt,
  }))
  
  return {
    items,
    totalCount: data.totalCount || 0,
    page: data.page || 1,
    pageSize: data.pageSize || 20,
  }
}

/**
 * Get envelope by ID
 */
export const getEnvelope = async (id) => {
  // httpClient interceptor already returns response.data
  return await httpClient.get(`/envelopes/${id}`)
}

/**
 * Get envelope by business key
 */
export const getEnvelopeByBusinessKey = async (businessKey) => {
  return await httpClient.get(`/envelopes/by-key/${businessKey}`)
}

/**
 * Get envelope by access token (for customer signing portal)
 */
export const getEnvelopeByToken = async (token) => {
  return await httpClient.get(`/envelopes/by-token/${token}`)
}

/**
 * Get envelopes for the logged-in customer
 * Uses the customer's JWT token for authentication
 */
export const getCustomerEnvelopes = async () => {
  const data = await httpClient.get('/envelopes/customer')
  return data.envelopes || data.items || data || []
}

/**
 * Get envelopes by customer ID
 */
export const getEnvelopesByCustomer = async (customerId) => {
  return await httpClient.get(`/envelopes/by-customer/${customerId}`)
}

/**
 * Create new envelope
 */
export const createEnvelope = async (data) => {
  return await httpClient.post('/envelopes', data)
}

/**
 * Update envelope
 */
export const updateEnvelope = async (id, data) => {
  return await httpClient.put(`/envelopes/${id}`, data)
}

/**
 * Delete envelope
 */
export const deleteEnvelope = async (id) => {
  return await httpClient.delete(`/envelopes/${id}`)
}

/**
 * Add document (proposal) to envelope
 */
export const addDocument = async (envelopeId, proposalId) => {
  return await httpClient.post(`/envelopes/${envelopeId}/documents`, { proposalId })
}

/**
 * Remove document from envelope
 */
export const removeDocument = async (envelopeId, proposalId) => {
  return await httpClient.delete(`/envelopes/${envelopeId}/documents/${proposalId}`)
}

/**
 * Send envelope for signing
 */
export const sendEnvelope = async (envelopeId, options = {}) => {
  return await httpClient.post(`/envelopes/${envelopeId}/send`, {
    sendEmail: options.sendEmail !== false,
    sendSms: options.sendSms || false,
    customerMessage: options.customerMessage || null,
    expiresAt: options.expiresAt || null,
  })
}

// ============================================================================
// SIGNING WORKFLOW API (uses SigningController endpoints)
// ============================================================================

/**
 * Get signing session info
 */
export const getSigningSession = async (token) => {
  return await httpClient.get(`/signing/${token}`)
}

/**
 * Verify customer identity
 */
export const verifyIdentity = async (token, data) => {
  return await httpClient.post(`/signing/${token}/verify-identity`, {
    idNumber: data.idNumber,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    method: data.method || 'ID_NUMBER',
    idCardImageBase64: data.idCardImage || null,
    selfieImageBase64: data.selfieImage || null,
  })
}

/**
 * Send OTP for signing
 * @param {string} token - The signing token (or null for customer login)
 * @param {string} channel - 'EMAIL' or 'SMS'
 */
export const sendOtp = async (token, channel = 'EMAIL') => {
  if (token) {
    return await httpClient.post(`/signing/${token}/request-otp`, { channel })
  } else {
    // Customer login OTP - use customer auth endpoint
    return await httpClient.post('/customer-auth/request-otp', { channel })
  }
}

// Alias for backwards compatibility
export const requestOtp = sendOtp

/**
 * Verify OTP
 * @param {string} token - The signing token (or null for customer login)
 * @param {string} code - The OTP code
 */
export const verifyOtp = async (token, code) => {
  if (token) {
    return await httpClient.post(`/signing/${token}/verify-otp`, { code })
  } else {
    // Customer login OTP verification
    return await httpClient.post('/customer-auth/verify-otp', { code })
  }
}

/**
 * Complete signing
 */
export const completeSigning = async (token, data) => {
  return await httpClient.post(`/signing/${token}/sign`, {
    signatureData: data.signatureData,
    consentConfirmed: data.consentConfirmed !== false,
  })
}

/**
 * Verify document by short code (QR code verification)
 */
export const verifyByShortCode = async (shortCode) => {
  return await httpClient.get(`/signing/verify/${shortCode}`)
}

/**
 * Get audit trail PDF
 */
export const getAuditTrail = async (token) => {
  return await httpClient.get(`/signing/${token}/audit-trail`, {
    responseType: 'blob',
  })
}

// ============================================================================
// CONFIRM DOCUMENT (for step-by-step document review)
// ============================================================================

export const confirmDocument = async (token, documentId) => {
  // Note: The backend may not have this endpoint yet
  // It could be handled client-side or added to SigningController
  return await httpClient.post(`/signing/${token}/confirm-document`, { documentId })
}

/**
 * Save consent response
 */
export const saveConsent = async (token, consentId, value) => {
  // Note: The backend may not have this endpoint yet
  return await httpClient.post(`/signing/${token}/consents`, { consentId, value })
}

// ============================================================================
// EXPORT
// ============================================================================

export const envelopesApi = {
  // Envelope CRUD
  getEnvelopes,
  getEnvelope,
  getEnvelopeByBusinessKey,
  getEnvelopeByToken,
  getCustomerEnvelopes,
  getEnvelopesByCustomer,
  createEnvelope,
  updateEnvelope,
  deleteEnvelope,
  addDocument,
  removeDocument,
  sendEnvelope,
  
  // Signing workflow
  getSigningSession,
  verifyIdentity,
  requestOtp,
  sendOtp,
  verifyOtp,
  completeSigning,
  verifyByShortCode,
  getAuditTrail,
  confirmDocument,
  saveConsent,
}

export default envelopesApi
