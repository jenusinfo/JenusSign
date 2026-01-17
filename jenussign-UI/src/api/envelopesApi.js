/**
 * JenusSign Envelope API
 * 
 * Unified API module for envelope-based document signing
 * Used by both Customer Portal and Agent/Broker Portal
 */

import { ENVELOPE_STATUS, DOCUMENT_STATUS } from '../shared/constants/designSystem'

// ============================================================================
// MOCK DATA - Demo Envelopes
// ============================================================================

const mockEnvelopes = [
  {
    id: 'env-001',
    referenceNumber: 'PR-2025-0001',
    token: 'demo1',
    title: 'Home Insurance Proposal',
    envelopeType: 'INSURANCE_PROPOSAL',
    status: ENVELOPE_STATUS.PENDING,
    createdAt: '2026-01-10T09:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    
    // Customer info
    customer: {
      id: 'cust-001',
      name: 'Yiannis Kleanthous',
      email: 'yiannis.kleanthous@hydrainsurance.com.cy',
      mobile: '+357 99 123 456',
      idNumber: 'X1234567',
      type: 'INDIVIDUAL',
    },
    
    // Agent info
    agent: {
      id: 'agent-001',
      name: 'Maria Georgiou',
      email: 'maria.georgiou@hydrainsurance.com.cy',
    },
    
    // Documents in envelope
    documents: [
      {
        id: 'doc-001',
        title: 'Home Insurance Proposal',
        url: '/samples/home_insurance_proposal_PR20250001.pdf',
        pages: 4,
        status: DOCUMENT_STATUS.PENDING,
        order: 1,
      },
      {
        id: 'doc-002',
        title: 'Terms & Conditions',
        url: '/samples/terms-and-conditions.pdf',
        pages: 8,
        status: DOCUMENT_STATUS.PENDING,
        order: 2,
      },
      {
        id: 'doc-003',
        title: 'Privacy Policy',
        url: '/samples/privacy-policy.pdf',
        pages: 3,
        status: DOCUMENT_STATUS.PENDING,
        order: 3,
      },
    ],
    
    // Required consents
    consents: [
      {
        id: 'consent-001',
        text: 'I confirm that all information provided is true and accurate to the best of my knowledge.',
        required: true,
        response: null,
      },
      {
        id: 'consent-002',
        text: 'I have read and accept the Terms and Conditions.',
        required: true,
        response: null,
      },
      {
        id: 'consent-003',
        text: 'I consent to the processing of my personal data in accordance with the Privacy Policy.',
        required: true,
        response: null,
      },
      {
        id: 'consent-004',
        text: 'I agree to receive marketing communications (optional).',
        required: false,
        response: null,
      },
    ],
    
    // Verification requirements
    verification: {
      method: 'ID_SCAN_OTP', // 'OTP' | 'ID_SCAN' | 'ID_SCAN_OTP' | 'EIDAS'
      expectedIdNumber: 'X1234567',
      expectedDob: '1985-03-12',
    },
    
    // Premium info (for insurance)
    premium: 1250.00,
    currency: 'EUR',
  },
  {
    id: 'env-002',
    referenceNumber: 'PR-2025-0002',
    token: 'demo2',
    title: 'Motor Insurance Proposal',
    envelopeType: 'INSURANCE_PROPOSAL',
    status: ENVELOPE_STATUS.PENDING,
    createdAt: '2026-01-12T14:30:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    
    customer: {
      id: 'cust-002',
      name: 'Charis Constantinou',
      email: 'charis.constantinou@hydrainsurance.com.cy',
      mobile: '+357 99 654 321',
      idNumber: 'M7654321',
      type: 'INDIVIDUAL',
    },
    
    agent: {
      id: 'agent-002',
      name: 'Andreas Papageorgiou',
      email: 'andreas.papageorgiou@hydrainsurance.com.cy',
    },
    
    documents: [
      {
        id: 'doc-004',
        title: 'Motor Insurance Proposal',
        url: '/samples/motor_insurance_proposal_PR20250002.pdf',
        pages: 4,
        status: DOCUMENT_STATUS.PENDING,
        order: 1,
      },
      {
        id: 'doc-005',
        title: 'Vehicle Schedule',
        url: '/samples/vehicle-schedule.pdf',
        pages: 2,
        status: DOCUMENT_STATUS.PENDING,
        order: 2,
      },
    ],
    
    consents: [
      {
        id: 'consent-005',
        text: 'I confirm that all vehicle information provided is true and accurate.',
        required: true,
        response: null,
      },
      {
        id: 'consent-006',
        text: 'I have read and accept the Motor Insurance Terms and Conditions.',
        required: true,
        response: null,
      },
      {
        id: 'consent-007',
        text: 'I authorize access to my driving history and claims record.',
        required: true,
        response: null,
      },
    ],
    
    verification: {
      method: 'OTP',
      expectedIdNumber: 'M7654321',
      expectedDob: '1990-07-22',
    },
    
    premium: 850.00,
    currency: 'EUR',
  },
  {
    id: 'env-003',
    referenceNumber: 'PR-2025-0003',
    token: 'demo3',
    title: 'Commercial Property Insurance',
    envelopeType: 'INSURANCE_PROPOSAL',
    status: ENVELOPE_STATUS.COMPLETED,
    createdAt: '2026-01-05T10:00:00Z',
    completedAt: '2026-01-08T16:45:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    
    customer: {
      id: 'cust-003',
      name: 'Cyprus Trading Ltd',
      email: 'contracts@cyprustrading.com.cy',
      registrationNumber: 'HE123456',
      type: 'COMPANY',
    },
    
    agent: {
      id: 'agent-001',
      name: 'Maria Georgiou',
      email: 'maria.georgiou@hydrainsurance.com.cy',
    },
    
    documents: [
      {
        id: 'doc-006',
        title: 'Commercial Property Proposal',
        url: '/samples/commercial-proposal.pdf',
        pages: 6,
        status: DOCUMENT_STATUS.SIGNED,
        order: 1,
      },
    ],
    
    consents: [
      {
        id: 'consent-008',
        text: 'I confirm I am authorized to sign on behalf of the company.',
        required: true,
        response: true,
      },
    ],
    
    verification: {
      method: 'OTP',
    },
    
    premium: 4500.00,
    currency: 'EUR',
    
    // Signature evidence (for completed envelopes)
    signatureEvidence: {
      signedAt: '2026-01-08T16:45:00Z',
      signerName: 'Nikos Papadopoulos',
      signerId: 'K987654',
      ipAddress: '82.116.198.100',
      deviceInfo: 'Chrome 120.0 on Windows 11',
      documentHash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
      otpVerified: true,
      certificateChain: [
        { name: 'JenusSign Qualified eSeal', issuer: 'JCC Cyprus Trust Center' },
        { name: 'JCC Cyprus Trust Center', issuer: 'Cyprus Root CA' },
        { name: 'Cyprus Root CA', issuer: 'European Trust Root' },
      ],
    },
  },
  {
    id: 'env-004',
    referenceNumber: 'PR-2025-0004',
    token: 'business1',
    title: 'Business Liability Insurance',
    envelopeType: 'INSURANCE_PROPOSAL',
    status: ENVELOPE_STATUS.IN_PROGRESS,
    createdAt: '2026-01-14T08:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    
    customer: {
      id: 'cust-004',
      name: 'Tech Solutions Cyprus Ltd',
      email: 'legal@techsolutions.cy',
      registrationNumber: 'HE789012',
      type: 'COMPANY',
    },
    
    agent: {
      id: 'agent-002',
      name: 'Andreas Papageorgiou',
      email: 'andreas.papageorgiou@hydrainsurance.com.cy',
    },
    
    documents: [
      {
        id: 'doc-007',
        title: 'Business Liability Proposal',
        url: '/samples/liability-proposal.pdf',
        pages: 5,
        status: DOCUMENT_STATUS.CONFIRMED,
        order: 1,
      },
      {
        id: 'doc-008',
        title: 'Risk Assessment Report',
        url: '/samples/risk-assessment.pdf',
        pages: 3,
        status: DOCUMENT_STATUS.PENDING,
        order: 2,
      },
    ],
    
    consents: [
      {
        id: 'consent-009',
        text: 'I confirm I am an authorized signatory for this company.',
        required: true,
        response: true,
      },
      {
        id: 'consent-010',
        text: 'I have reviewed and accept the liability coverage terms.',
        required: true,
        response: null,
      },
    ],
    
    verification: {
      method: 'ID_SCAN_OTP',
    },
    
    premium: 2800.00,
    currency: 'EUR',
  },
]

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Get all envelopes (for agent dashboard)
 */
export const getEnvelopes = async (filters = {}) => {
  await delay(300)
  
  let result = [...mockEnvelopes]
  
  // Apply filters
  if (filters.status) {
    result = result.filter(e => e.status === filters.status)
  }
  if (filters.customerId) {
    result = result.filter(e => e.customer.id === filters.customerId)
  }
  if (filters.agentId) {
    result = result.filter(e => e.agent.id === filters.agentId)
  }
  
  return result
}

/**
 * Get single envelope by ID
 */
export const getEnvelope = async (envelopeId) => {
  await delay(200)
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  return { ...envelope }
}

/**
 * Get envelope by token (for customer access via email link)
 */
export const getEnvelopeByToken = async (token) => {
  await delay(200)
  
  const envelope = mockEnvelopes.find(e => e.token === token)
  if (!envelope) {
    throw new Error('Invalid or expired signing link')
  }
  
  // Check expiry
  if (new Date(envelope.expiresAt) < new Date()) {
    throw new Error('This signing link has expired')
  }
  
  return { ...envelope }
}

/**
 * Get envelopes for a specific customer (customer dashboard)
 */
export const getCustomerEnvelopes = async (customerEmail) => {
  await delay(300)
  
  return mockEnvelopes.filter(e => 
    e.customer.email?.toLowerCase() === customerEmail?.toLowerCase()
  )
}

/**
 * Verify customer identity
 */
export const verifyIdentity = async (envelopeId, verificationData) => {
  await delay(800)
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId || e.token === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  
  // Simulate verification logic
  const { idNumber, dateOfBirth } = verificationData
  const expected = envelope.verification
  
  // For demo, accept any input or match expected values
  const isValid = !expected.expectedIdNumber || 
                  idNumber === expected.expectedIdNumber ||
                  idNumber === '123456' // Demo bypass
  
  if (!isValid) {
    return { success: false, message: 'Identity verification failed' }
  }
  
  return { 
    success: true, 
    verified: true,
    customer: envelope.customer,
  }
}

/**
 * Send OTP to customer
 */
export const sendOtp = async (envelopeId, channel = 'EMAIL') => {
  await delay(500)
  
  // In production, this would actually send an OTP
  return { 
    success: true, 
    message: `OTP sent via ${channel}`,
    expiresIn: 300, // 5 minutes
  }
}

/**
 * Verify OTP
 */
export const verifyOtp = async (envelopeId, otp) => {
  await delay(500)
  
  // For demo, accept 123456
  if (otp !== '123456') {
    throw new Error('Invalid OTP code')
  }
  
  return { 
    success: true, 
    verified: true,
  }
}

/**
 * Confirm document review
 */
export const confirmDocument = async (envelopeId, documentId) => {
  await delay(200)
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId || e.token === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  
  const doc = envelope.documents.find(d => d.id === documentId)
  if (doc) {
    doc.status = DOCUMENT_STATUS.CONFIRMED
  }
  
  return { success: true, document: doc }
}

/**
 * Save consent response
 */
export const saveConsent = async (envelopeId, consentId, value) => {
  await delay(100)
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId || e.token === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  
  const consent = envelope.consents.find(c => c.id === consentId)
  if (consent) {
    consent.response = value
  }
  
  return { success: true }
}

/**
 * Complete signing process
 */
export const completeSigning = async (envelopeId, signatureData) => {
  await delay(1500) // Simulate signing process
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId || e.token === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  
  // Update envelope status
  envelope.status = ENVELOPE_STATUS.COMPLETED
  envelope.completedAt = new Date().toISOString()
  
  // Update all documents to signed
  envelope.documents.forEach(doc => {
    doc.status = DOCUMENT_STATUS.SIGNED
  })
  
  // Generate signature evidence
  const evidence = {
    signedAt: new Date().toISOString(),
    signerName: envelope.customer.name,
    signerId: envelope.customer.idNumber || envelope.customer.registrationNumber,
    ipAddress: '82.116.198.' + Math.floor(Math.random() * 255),
    deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
    documentHash: generateMockHash(),
    otpVerified: true,
    signatureMethod: signatureData.method || 'draw',
    certificateChain: [
      { name: 'JenusSign Qualified eSeal', issuer: 'JCC Cyprus Trust Center' },
      { name: 'JCC Cyprus Trust Center', issuer: 'Cyprus Root CA' },
      { name: 'Cyprus Root CA', issuer: 'European Trust Root' },
    ],
  }
  
  envelope.signatureEvidence = evidence
  
  return {
    success: true,
    envelope: { ...envelope },
    evidence,
    signedDocumentUrl: '/samples/demo-signed-esealed.pdf',
    auditTrailUrl: '/samples/demo-audit-trail.pdf',
  }
}

/**
 * Create new envelope (agent portal)
 */
export const createEnvelope = async (envelopeData) => {
  await delay(500)
  
  const newId = `env-${Date.now()}`
  const newRef = `PR-2025-${String(mockEnvelopes.length + 1).padStart(4, '0')}`
  const newToken = `token-${Date.now()}`
  
  const newEnvelope = {
    id: newId,
    referenceNumber: newRef,
    token: newToken,
    status: ENVELOPE_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    ...envelopeData,
  }
  
  mockEnvelopes.push(newEnvelope)
  
  return { ...newEnvelope }
}

/**
 * Send envelope to customer
 */
export const sendEnvelope = async (envelopeId) => {
  await delay(500)
  
  const envelope = mockEnvelopes.find(e => e.id === envelopeId)
  if (!envelope) {
    throw new Error('Envelope not found')
  }
  
  envelope.status = ENVELOPE_STATUS.SENT
  envelope.sentAt = new Date().toISOString()
  
  // Generate signing URL
  const signingUrl = `${window.location.origin}/customer/sign/${envelope.token}`
  
  return {
    success: true,
    envelope: { ...envelope },
    signingUrl,
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateMockHash() {
  const chars = 'abcdef0123456789'
  let hash = ''
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// ============================================================================
// EXPORT
// ============================================================================

export const envelopesApi = {
  getEnvelopes,
  getEnvelope,
  getEnvelopeByToken,
  getCustomerEnvelopes,
  verifyIdentity,
  sendOtp,
  verifyOtp,
  confirmDocument,
  saveConsent,
  completeSigning,
  createEnvelope,
  sendEnvelope,
}

export default envelopesApi
