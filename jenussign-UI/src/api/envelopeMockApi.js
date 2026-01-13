// Enhanced Mock API with Envelope Support
// Add this to your existing mockApi.js or replace the relevant sections

// ============================================
// ENVELOPE & DOCUMENTS DATA STRUCTURE
// ============================================

const DEMO_ENVELOPES = [
  {
    id: 'env-001',
    tenantId: 'tenant-hydra',
    customerId: 'cust-001',
    referenceNumber: 'ENV-2025-0001',
    title: 'Home Insurance Package',
    status: 'PENDING', // DRAFT, PENDING, SIGNED, EXPIRED, CANCELLED
    createdByUserId: 'user-agt-001',
    createdAt: '2025-01-01T10:00:00Z',
    lastActivityAt: '2025-01-05T08:30:00Z',
    expiryDate: '2025-02-01T23:59:59Z',
    signedAt: null,
    
    // Customer info (denormalized for quick access)
    customerName: 'Yiannis Kleanthous',
    customerEmail: 'yiannis.kleanthous@example.com',
    customerPhone: '+35799123456',
    
    // Documents in this envelope (up to 3 for base package)
    documents: [
      {
        id: 'doc-001',
        envelopeId: 'env-001',
        order: 1,
        title: 'Home Insurance Proposal',
        originalFileName: 'home_insurance_proposal.pdf',
        url: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
        pages: 5,
        hash: 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
        uploadedAt: '2025-01-01T10:00:00Z',
        viewedAt: null,
        viewConfirmedAt: null,
      },
      {
        id: 'doc-002',
        envelopeId: 'env-001',
        order: 2,
        title: 'Terms & Conditions',
        originalFileName: 'terms_and_conditions.pdf',
        url: '/samples/home-insurance-proposal-PR-2025-0001.pdf', // Reusing for demo
        pages: 12,
        hash: 'b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3',
        uploadedAt: '2025-01-01T10:00:00Z',
        viewedAt: null,
        viewConfirmedAt: null,
      },
      {
        id: 'doc-003',
        envelopeId: 'env-001',
        order: 3,
        title: 'GDPR Privacy Notice',
        originalFileName: 'gdpr_privacy_notice.pdf',
        url: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf', // Reusing for demo
        pages: 3,
        hash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
        uploadedAt: '2025-01-01T10:00:00Z',
        viewedAt: null,
        viewConfirmedAt: null,
      },
    ],
    
    // Consents for the envelope
    consents: [
      {
        id: 'consent-001',
        envelopeId: 'env-001',
        documentId: null, // null = envelope-level consent
        label: 'I accept the Terms & Conditions',
        description: 'You must accept the terms and conditions to proceed with signing.',
        isRequired: true,
        response: null,
        respondedAt: null,
      },
      {
        id: 'consent-002',
        envelopeId: 'env-001',
        documentId: null,
        label: 'I accept the Privacy Policy and GDPR Notice',
        description: 'You must accept the privacy policy to proceed with signing.',
        isRequired: true,
        response: null,
        respondedAt: null,
      },
      {
        id: 'consent-003',
        envelopeId: 'env-001',
        documentId: null,
        label: 'I agree to receive marketing communications',
        description: 'Optional: Receive updates about our products and services.',
        isRequired: false,
        response: null,
        respondedAt: null,
      },
    ],
    
    // Signature (single signature for all documents)
    signature: null,
    
    // Signed document URLs (populated after signing)
    signedDocumentUrl: null,
    auditTrailUrl: null,
    
    // Verification code for QR
    verificationCode: 'ENV20250001',
  },
  {
    id: 'env-002',
    tenantId: 'tenant-hydra',
    customerId: 'cust-001',
    referenceNumber: 'ENV-2025-0002',
    title: 'Motor Insurance Package',
    status: 'PENDING',
    createdByUserId: 'user-agt-001',
    createdAt: '2025-01-02T14:00:00Z',
    lastActivityAt: '2025-01-06T10:15:00Z',
    expiryDate: '2025-02-02T23:59:59Z',
    signedAt: null,
    
    customerName: 'Charis Constantinou',
    customerEmail: 'charis.constantinou@example.com',
    customerPhone: '+35799654321',
    
    documents: [
      {
        id: 'doc-004',
        envelopeId: 'env-002',
        order: 1,
        title: 'Motor Insurance Proposal',
        originalFileName: 'motor_insurance_proposal.pdf',
        url: '/samples/motor-insurance-proposal-PR-2025-0002.pdf',
        pages: 6,
        hash: 'd6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5',
        uploadedAt: '2025-01-02T14:00:00Z',
        viewedAt: null,
        viewConfirmedAt: null,
      },
      {
        id: 'doc-005',
        envelopeId: 'env-002',
        order: 2,
        title: 'Payment Authorization Form',
        originalFileName: 'payment_authorization.pdf',
        url: '/samples/motor-insurance-proposal-PR-2025-0002.pdf', // Reusing for demo
        pages: 2,
        hash: 'e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6',
        uploadedAt: '2025-01-02T14:00:00Z',
        viewedAt: null,
        viewConfirmedAt: null,
      },
    ],
    
    consents: [
      {
        id: 'consent-004',
        envelopeId: 'env-002',
        documentId: null,
        label: 'I accept the Terms & Conditions',
        isRequired: true,
        response: null,
        respondedAt: null,
      },
      {
        id: 'consent-005',
        envelopeId: 'env-002',
        documentId: null,
        label: 'I authorize the payment as described',
        isRequired: true,
        response: null,
        respondedAt: null,
      },
    ],
    
    signature: null,
    signedDocumentUrl: null,
    auditTrailUrl: null,
    verificationCode: 'ENV20250002',
  },
  {
    id: 'env-003',
    tenantId: 'tenant-hydra',
    customerId: 'cust-001',
    referenceNumber: 'ENV-2025-0003',
    title: 'Travel Insurance - Completed',
    status: 'SIGNED',
    createdByUserId: 'user-agt-001',
    createdAt: '2024-12-15T09:00:00Z',
    lastActivityAt: '2024-12-18T16:45:00Z',
    expiryDate: '2025-01-15T23:59:59Z',
    signedAt: '2024-12-18T16:45:00Z',
    
    customerName: 'Nikos Papadopoulos',
    customerEmail: 'nikos.papadopoulos@example.com',
    customerPhone: '+35799111222',
    
    documents: [
      {
        id: 'doc-006',
        envelopeId: 'env-003',
        order: 1,
        title: 'Travel Insurance Policy',
        originalFileName: 'travel_insurance_policy.pdf',
        url: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
        pages: 4,
        hash: 'f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7',
        uploadedAt: '2024-12-15T09:00:00Z',
        viewedAt: '2024-12-18T16:30:00Z',
        viewConfirmedAt: '2024-12-18T16:32:00Z',
      },
    ],
    
    consents: [
      {
        id: 'consent-006',
        envelopeId: 'env-003',
        documentId: null,
        label: 'I accept the Terms & Conditions',
        isRequired: true,
        response: true,
        respondedAt: '2024-12-18T16:40:00Z',
      },
    ],
    
    signature: {
      id: 'sig-001',
      envelopeId: 'env-003',
      signatureType: 'Drawn',
      signatureImageUrl: '/signatures/sig-001.png',
      capturedAt: '2024-12-18T16:42:00Z',
      otpVerifiedAt: '2024-12-18T16:45:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      certificateThumbprint: 'ABC123DEF456',
    },
    
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
    verificationCode: 'ENV20250003',
  },
]

// Signing sessions for direct email links
const DEMO_SIGNING_SESSIONS = [
  {
    token: 'demo1',
    envelopeId: 'env-001',
    proposalId: 'prop-001', // For backwards compatibility
    customerEmail: 'yiannis.kleanthous@example.com',
    customerName: 'Yiannis Kleanthous',
    status: 'Active',
    createdAt: '2025-01-01T10:05:00Z',
    expiresAt: '2025-02-01T23:59:59Z',
  },
  {
    token: 'demo2',
    envelopeId: 'env-002',
    proposalId: 'prop-002',
    customerEmail: 'charis.constantinou@example.com',
    customerName: 'Charis Constantinou',
    status: 'Active',
    createdAt: '2025-01-02T14:05:00Z',
    expiresAt: '2025-02-02T23:59:59Z',
  },
  {
    token: 'demo3',
    envelopeId: 'env-003',
    proposalId: 'prop-003',
    customerEmail: 'nikos.papadopoulos@example.com',
    customerName: 'Nikos Papadopoulos',
    status: 'Completed',
    createdAt: '2024-12-15T09:05:00Z',
    expiresAt: '2025-01-15T23:59:59Z',
  },
]

// ============================================
// ENVELOPE API
// ============================================

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const envelopesApi = {
  // Get all envelopes (for agent portal)
  async getEnvelopes(params = {}) {
    await delay(400)
    
    let filtered = [...DEMO_ENVELOPES]
    
    if (params.customerId) {
      filtered = filtered.filter(e => e.customerId === params.customerId)
    }
    if (params.status) {
      filtered = filtered.filter(e => e.status === params.status)
    }
    if (params.search) {
      const s = params.search.toLowerCase()
      filtered = filtered.filter(e => 
        e.referenceNumber.toLowerCase().includes(s) ||
        e.title.toLowerCase().includes(s) ||
        e.customerName.toLowerCase().includes(s)
      )
    }
    
    return {
      items: filtered,
      totalCount: filtered.length,
    }
  },

  // Get single envelope by ID
  async getEnvelope(id) {
    await delay(300)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === id)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    return { ...envelope }
  },

  // Get envelope by token (for customer signing link)
  async getEnvelopeByToken(token) {
    await delay(300)
    
    const session = DEMO_SIGNING_SESSIONS.find(s => s.token === token)
    if (!session) {
      throw new Error('Invalid or expired signing link')
    }
    
    if (session.status === 'Expired') {
      throw new Error('This signing link has expired')
    }
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === session.envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    return {
      ...envelope,
      session,
    }
  },

  // Create new envelope
  async createEnvelope(data) {
    await delay(700)
    
    const newEnvelope = {
      id: `env-${Date.now()}`,
      tenantId: data.tenantId || 'tenant-hydra',
      customerId: data.customerId,
      referenceNumber: `ENV-${new Date().getFullYear()}-${String(DEMO_ENVELOPES.length + 1).padStart(4, '0')}`,
      title: data.title,
      status: 'DRAFT',
      createdByUserId: data.createdByUserId,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      signedAt: null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      documents: [],
      consents: [],
      signature: null,
      signedDocumentUrl: null,
      auditTrailUrl: null,
      verificationCode: `ENV${new Date().getFullYear()}${String(DEMO_ENVELOPES.length + 1).padStart(4, '0')}`,
    }
    
    DEMO_ENVELOPES.push(newEnvelope)
    return newEnvelope
  },

  // Add document to envelope
  async addDocument(envelopeId, documentData) {
    await delay(500)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    if (envelope.documents.length >= 3) {
      throw new Error('Maximum 3 documents allowed in base package')
    }
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      envelopeId,
      order: envelope.documents.length + 1,
      title: documentData.title,
      originalFileName: documentData.fileName,
      url: documentData.url || '/samples/home-insurance-proposal-PR-2025-0001.pdf',
      pages: documentData.pages || 1,
      hash: `hash-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      viewedAt: null,
      viewConfirmedAt: null,
    }
    
    envelope.documents.push(newDoc)
    envelope.lastActivityAt = new Date().toISOString()
    
    return newDoc
  },

  // Confirm document viewed (customer action)
  async confirmDocumentViewed(envelopeId, documentId) {
    await delay(300)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    const doc = envelope.documents.find(d => d.id === documentId)
    if (!doc) {
      throw new Error('Document not found')
    }
    
    const now = new Date().toISOString()
    if (!doc.viewedAt) {
      doc.viewedAt = now
    }
    doc.viewConfirmedAt = now
    envelope.lastActivityAt = now
    
    return { success: true, document: doc }
  },

  // Save consents
  async saveConsents(envelopeId, consents) {
    await delay(400)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    const now = new Date().toISOString()
    
    consents.forEach(c => {
      const consent = envelope.consents.find(ec => ec.id === c.id)
      if (consent) {
        consent.response = c.response
        consent.respondedAt = now
      }
    })
    
    envelope.lastActivityAt = now
    
    return { success: true }
  },

  // Save signature
  async saveSignature(envelopeId, signatureData) {
    await delay(500)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    envelope.signature = {
      id: `sig-${Date.now()}`,
      envelopeId,
      signatureType: signatureData.type, // 'Drawn' | 'Uploaded' | 'Typed'
      signatureImageUrl: signatureData.imageUrl || '/signatures/temp.png',
      signatureImageBase64: signatureData.imageBase64,
      capturedAt: new Date().toISOString(),
      otpVerifiedAt: null,
      ipAddress: signatureData.ipAddress || '192.168.1.1',
      userAgent: signatureData.userAgent || navigator.userAgent,
      certificateThumbprint: null,
    }
    
    envelope.lastActivityAt = new Date().toISOString()
    
    return { success: true, signatureId: envelope.signature.id }
  },

  // Request signing OTP
  async requestSigningOtp(envelopeId) {
    await delay(400)
    
    console.log('[DEMO] Signing OTP sent: 123456')
    
    return { success: true, message: 'OTP sent to registered phone/email' }
  },

  // Complete signing with OTP verification
  async completeSigning(envelopeId, otp) {
    await delay(1500) // Simulate signing process
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    if (otp !== '123456') {
      throw new Error('Invalid OTP')
    }
    
    const now = new Date().toISOString()
    
    // Update envelope
    envelope.status = 'SIGNED'
    envelope.signedAt = now
    envelope.lastActivityAt = now
    
    // Update signature with OTP verification
    if (envelope.signature) {
      envelope.signature.otpVerifiedAt = now
      envelope.signature.certificateThumbprint = `CERT-${Date.now()}`
    }
    
    // Set signed document URLs
    envelope.signedDocumentUrl = '/samples/demo-home-signed-esealed.pdf'
    envelope.auditTrailUrl = '/samples/home-insurance-audit-trail-PR-2025-0001.pdf'
    
    // Generate evidence object
    const evidence = {
      envelopeId: envelope.id,
      referenceNumber: envelope.referenceNumber,
      verificationCode: envelope.verificationCode,
      documentHash: envelope.documents.map(d => d.hash).join('+'),
      timestamp: now,
      signedAt: now,
      otpVerified: true,
      signerName: envelope.customerName,
      signerIdMasked: 'AB******89',
      ipAddress: envelope.signature?.ipAddress || '192.168.1.1',
      deviceInfo: envelope.signature?.userAgent || 'Chrome on Windows',
      agentName: 'Mike Agent',
      agentId: 'AGT-001',
      certificateChain: [
        { name: 'JCC Trust Services Root CA', issuer: 'JCC' },
        { name: 'JCC Qualified eSeal CA', issuer: 'JCC Trust Services Root CA' },
        { name: 'Hydra Insurance eSeal', issuer: 'JCC Qualified eSeal CA' },
      ],
      documentsReviewed: envelope.documents.map(d => ({
        title: d.title,
        viewedAt: d.viewedAt,
        confirmedAt: d.viewConfirmedAt,
        hash: d.hash,
      })),
    }
    
    return {
      success: true,
      envelope: { ...envelope },
      signedDocumentUrl: envelope.signedDocumentUrl,
      auditTrailUrl: envelope.auditTrailUrl,
      evidence,
    }
  },

  // Get audit package
  async getAuditPackage(envelopeId) {
    await delay(600)
    
    const envelope = DEMO_ENVELOPES.find(e => e.id === envelopeId)
    if (!envelope) {
      throw new Error('Envelope not found')
    }
    
    return {
      envelopeId,
      signedPdfUrl: envelope.signedDocumentUrl || '/samples/demo-home-signed-esealed.pdf',
      auditPdfUrl: envelope.auditTrailUrl || '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
      verificationUrl: `https://verify.jenussign.com/${envelope.verificationCode}`,
    }
  },

  // Verify envelope (public API)
  async verifyEnvelope(verificationCode) {
    await delay(800)
    
    const envelope = DEMO_ENVELOPES.find(e => e.verificationCode === verificationCode)
    if (!envelope) {
      throw new Error('Document not found')
    }
    
    if (envelope.status !== 'SIGNED') {
      throw new Error('Document has not been signed')
    }
    
    return {
      valid: true,
      envelope: {
        referenceNumber: envelope.referenceNumber,
        title: envelope.title,
        status: envelope.status,
        signedAt: envelope.signedAt,
        expiresAt: new Date(new Date(envelope.signedAt).getTime() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      documents: envelope.documents.map(d => ({
        title: d.title,
        pages: d.pages,
        hash: d.hash.substring(0, 16) + '...',
      })),
      signer: {
        name: envelope.customerName,
        idMasked: 'AB******89',
        country: 'CY',
        verificationMethod: 'OTP (SMS)',
      },
      signature: {
        timestamp: envelope.signedAt,
        timestampAuthority: 'FreeTSA.org',
        certificateIssuer: 'JCC Trust Services (Cyprus)',
        algorithm: 'SHA-256 with RSA',
      },
      tenant: {
        name: 'Hydra Insurance',
      },
      integrity: {
        documentHashValid: true,
        signatureValid: true,
        timestampValid: true,
        certificateValid: true,
        notExpired: true,
      },
    }
  },
}

// ============================================
// SIGNING SESSIONS API (for backwards compatibility)
// ============================================

export const signingSessionsApi = {
  async getSessionByToken(token) {
    await delay(300)
    
    const session = DEMO_SIGNING_SESSIONS.find(s => s.token === token)
    if (!session) {
      throw new Error('Invalid or expired signing link')
    }
    
    // Return envelope data for the new system
    const envelope = DEMO_ENVELOPES.find(e => e.id === session.envelopeId)
    
    return {
      ...session,
      envelope,
      // Backwards compatibility
      proposalId: session.proposalId,
      documentUrl: envelope?.documents[0]?.url,
      signedDocumentUrl: envelope?.signedDocumentUrl,
      auditTrailUrl: envelope?.auditTrailUrl,
    }
  },
}

// ============================================
// CONSOLE LOG FOR DEMO
// ============================================

console.log('🚀 Enhanced Mock API loaded with Envelope support')
console.log('📦 Demo Envelopes:')
console.log('   - demo1: Yiannis Kleanthous (Home Insurance - 3 documents)')
console.log('   - demo2: Charis Constantinou (Motor Insurance - 2 documents)')
console.log('   - demo3: Nikos Papadopoulos (Travel Insurance - SIGNED)')
console.log('🔑 Demo OTP: 123456')

export default {
  envelopesApi,
  signingSessionsApi,
}
