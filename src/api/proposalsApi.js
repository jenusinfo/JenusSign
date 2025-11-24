import httpClient from './httpClient'


const MOCK_MODE = true
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock proposals data
const mockProposals = [
  {
    id: 'prop-001',
    customerId: 'c1',
    insuranceCoreProposalId: 'PROP12345',
    proposalRef: 'PR-2025-0001',
    title: 'Home Insurance Proposal PR-2025-0001',
    productType: 'Home Insurance',
    status: 'PendingSignature',
    createdAt: '2025-11-10T10:00:00Z',
    lastActivityAt: '2025-11-11T08:30:00Z',
    expiryDate: '2025-12-01T00:00:00Z',
    createdByUserId: '2',
	consents: [
      {
        proposalConsentId: 'pc-001',
        consentDefinitionId: 'cd-001',
        label: 'I accept the Terms & Conditions',
        controlType: 'Checkbox',
        isRequired: true,
        value: null,
      },
      {
        proposalConsentId: 'pc-002',
        consentDefinitionId: 'cd-002',
        label: 'I accept the Privacy Policy',
        controlType: 'Checkbox',
        isRequired: true,
        value: null,
      },
    ],
    signatureStatus: 'NotCaptured',
  },
  {
    id: 'prop-002',
    customerId: 'c1',
    insuranceCoreProposalId: 'PROP12346',
    proposalRef: 'PR-2025-0002',
    title: 'Motor Insurance Proposal PR-2025-0002',
    productType: 'Motor Insurance',
    status: 'InProgress',
    createdAt: '2025-11-08T14:00:00Z',
    lastActivityAt: '2025-11-14T16:45:00Z',
    expiryDate: '2025-11-30T00:00:00Z',
    createdByUserId: '2',
	consents: [
      {
        proposalConsentId: 'pc-003',
        consentDefinitionId: 'cd-001',
        label: 'I accept the Terms & Conditions',
        controlType: 'Checkbox',
        isRequired: true,
        value: true,
      },
    ],
    signatureStatus: 'Captured',
  },
  {
    id: 'prop-003',
    customerId: 'c1',
    insuranceCoreProposalId: 'PROP12347',
    proposalRef: 'PR-2025-0003',
    title: 'Life Insurance Proposal PR-2025-0003',
    productType: 'Life Insurance',
    status: 'Signed',
    createdAt: '2025-10-20T09:00:00Z',
    lastActivityAt: '2025-10-25T11:20:00Z',
    expiryDate: '2025-11-20T00:00:00Z',
    createdByUserId: '2',
    consents: [],
    signatureStatus: 'Completed',
  },
]


const proposalsApi = {
  // Get all proposals (non-customer portal)
  async getProposals(params = {}) {
    if (MOCK_MODE) {
      await delay(500)
      let filtered = [...mockProposals]
      
      if (params.customerId) {
        filtered = filtered.filter((p) => p.customerId === params.customerId)
      }
      if (params.status) {
        filtered = filtered.filter((p) => p.status === params.status)
      }
      
      return {
        items: filtered,
        totalCount: filtered.length,
      }
    }
    return httpClient.get('/proposals', { params })
  },

  // Get single proposal (non-customer portal)
  async getProposal(id) {
    if (MOCK_MODE) {
      await delay(300)
      const proposal = mockProposals.find((p) => p.id === id)
      if (!proposal) throw new Error('Proposal not found')
      return proposal
    }
    return httpClient.get(`/proposals/${id}`)
  },

  // Create proposal
  async createProposal(data) {
    if (MOCK_MODE) {
      await delay(700)
      const newProposal = {
        id: `p${mockProposals.length + 1}`,
        ...data,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      }
      mockProposals.push(newProposal)
      return newProposal
    }
    return httpClient.post('/proposals', data)
  },

  // Upload document
  async uploadDocument(proposalId, file) {
    if (MOCK_MODE) {
      await delay(1000)
      return {
        proposalId,
        documentId: `doc${Date.now()}`,
        originalFileName: file.name,
        originalHash: 'SHA256_HASH_HERE',
      }
    }
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post(`/proposals/${proposalId}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Send invitation
  async sendInvitation(proposalId, data) {
    if (MOCK_MODE) {
      await delay(500)
      return {
        success: true,
        invitationSentAt: new Date().toISOString(),
      }
    }
    return httpClient.post(`/proposals/${proposalId}/send-invitation`, data)
  },

  // Customer portal: Get customer proposals
  async getCustomerProposals() {
    if (MOCK_MODE) {
      await delay(400)
      return mockProposals.filter((p) => p.customerId === 'c1')
    }
    return httpClient.get('/customer/proposals')
  },

  // Customer portal: Get single proposal
  async getCustomerProposal(id) {
    if (MOCK_MODE) {
      await delay(300)
      const proposal = mockProposals.find((p) => p.id === id)
      if (!proposal) throw new Error('Proposal not found')
      return proposal
    }
    return httpClient.get(`/customer/proposals/${id}`)
  },

  // Customer portal: Verify identity
  async verifyIdentity(proposalId, data) {
    if (MOCK_MODE) {
      await delay(800)
      // Simple mock validation
      if (data.customerType === 'Individual') {
        if (data.dateOfBirth && data.nationalId && data.idCountryOfIssue) {
          return { verified: true }
        }
      } else if (data.customerType === 'Company') {
        if (data.registrationNumber && data.registrationDate && data.registrationCountryOfIssue) {
          return { verified: true }
        }
      }
      throw new Error('Identity verification failed')
    }
    return httpClient.post(`/customer/proposals/${proposalId}/verify-identity`, data)
  },

  // Customer portal: Request contact OTP
  async requestContactOtp(proposalId, data) {
    if (MOCK_MODE) {
      await delay(500)
      console.log('Mock Contact OTP: 123456')
      return { success: true }
    }
    return httpClient.post(`/customer/proposals/${proposalId}/request-contact-otp`, data)
  },

  // Customer portal: Verify contact OTP
  async verifyContactOtp(proposalId, otp) {
    if (MOCK_MODE) {
      await delay(600)
      if (otp === '123456') {
        return { verified: true }
      }
      throw new Error('Invalid OTP')
    }
    return httpClient.post(`/customer/proposals/${proposalId}/verify-contact-otp`, { otp })
  },

  // Customer portal: Save consents
  async saveConsents(proposalId, consents) {
    if (MOCK_MODE) {
      await delay(400)
      return { success: true }
    }
    return httpClient.post(`/customer/proposals/${proposalId}/consents`, { consents })
  },

  // Customer portal: Save signature
  async saveSignature(proposalId, data) {
    if (MOCK_MODE) {
      await delay(600)
      return { success: true, signatureId: `sig${Date.now()}` }
    }
    return httpClient.post(`/customer/proposals/${proposalId}/signature`, data)
  },

  // Customer portal: Request signing OTP
  async requestSigningOtp(proposalId) {
    if (MOCK_MODE) {
      await delay(500)
      console.log('Mock Signing OTP: 123456')
      return { success: true }
    }
    return httpClient.post(`/customer/proposals/${proposalId}/request-signing-otp`)
  },

  // Customer portal: Verify signing OTP (final sign)
  // Customer portal: Verify signing OTP (final sign)
	async verifySigningOtp(proposalId, otp) {
	  if (MOCK_MODE) {
		await delay(1500) // Simulate PDF signing process

		const proposal = mockProposals.find((p) => p.id === proposalId)

		if (!proposal) {
		  throw new Error('Proposal not found')
		}

		if (otp === '123456') {
		  const now = new Date().toISOString()

		  // ✅ update in-memory proposal so UI sees "Signed"
		  proposal.status = 'Signed'
		  proposal.signatureStatus = 'Completed'
		  proposal.lastActivityAt = now

		  return {
			success: true,
			status: proposal.status,
			finalDocumentId: `final-doc-${Date.now()}`,
		  }
		}

		throw new Error('Invalid OTP')
	  }

	  return httpClient.post(`/customer/proposals/${proposalId}/verify-signing-otp`, { otp })
	},


  // Get proposal document
  async getDocument(proposalId) {
    if (MOCK_MODE) {
      await delay(300)
      return {
        url: 'https://example.com/sample.pdf',
      }
    }
    return httpClient.get(`/customer/proposals/${proposalId}/document`)
  },

  // Get audit events
  async getAuditEvents(proposalId) {
    if (MOCK_MODE) {
      await delay(400)
      return [
        {
          id: 'ae1',
          eventType: 'ProposalCreated',
          timestamp: '2025-11-10T10:00:00Z',
          userType: 'Agent',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadataJson: '{}',
        },
        {
          id: 'ae2',
          eventType: 'InvitationSent',
          timestamp: '2025-11-10T10:05:00Z',
          userType: 'Agent',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadataJson: '{}',
        },
      ]
    }
    return httpClient.get(`/proposals/${proposalId}/audit-events`)
  },

  // Get audit package
  async getAuditPackage(proposalId) {
    if (MOCK_MODE) {
      await delay(800)
      return {
        proposalId,
        signedPdfUrl: 'https://example.com/signed-proposal.pdf',
        auditPdfUrl: 'https://example.com/audit-evidence.pdf',
        evidenceJsonUrl: 'https://example.com/evidence.json',
      }
    }
    return httpClient.get(`/proposals/${proposalId}/audit-package`)
  },
}

export default proposalsApi
