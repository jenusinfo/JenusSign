// Mock API for JenusSign Frontend Development
// This simulates backend responses until the real ASP.NET Core API is ready

// Demo Users Database
const DEMO_USERS = [
  {
    id: 'user-admin-001',
    email: 'admin@insurance.com',
    password: 'admin123', // In production, this would be hashed
    displayName: 'Admin User',
    role: 'Admin',
    businessKey: 'ADM-001'
  },
  {
    id: 'user-emp-001',
    email: 'employee@insurance.com',
    password: 'emp123',
    displayName: 'John Employee',
    role: 'Employee',
    businessKey: 'EMP-001'
  },
  {
    id: 'user-brk-001',
    email: 'broker@insurance.com',
    password: 'brk123',
    displayName: 'Sarah Broker',
    role: 'Broker',
    businessKey: 'BRK-001'
  },
  {
    id: 'user-agt-001',
    email: 'agent@insurance.com',
    password: 'agt123',
    displayName: 'Mike Agent',
    role: 'Agent',
    businessKey: 'AGT-001',
    assignedBrokerId: 'user-brk-001'
  }
]

// Demo Customers Database
const DEMO_CUSTOMERS = [
  {
    id: 'cust-001',
    customerType: 'Individual',
    insuranceCoreCustomerId: 'ICS-12345',
    businessKey: 'CUST-ICS-12345',
    individual: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-15',
      nationalId: 'ID123456',
      idCountryOfIssue: 'CY'
    },
    company: null,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+35799123456',
    country: 'CY',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    status: 'Active',
    createdAt: '2024-11-01T10:00:00Z'
  },
  {
    id: 'cust-002',
    customerType: 'Company',
    insuranceCoreCustomerId: 'ICS-12346',
    businessKey: 'CUST-ICS-12346',
    individual: null,
    company: {
      legalName: 'Tech Solutions Ltd',
      registrationNumber: 'HE123456',
      registrationDate: '2010-05-15',
      registrationCountryOfIssue: 'CY'
    },
    fullName: 'Tech Solutions Ltd',
    legalName: 'Tech Solutions Ltd',
    email: 'info@techsolutions.cy',
    phone: '+35799654321',
    country: 'CY',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    status: 'Active',
    createdAt: '2024-11-02T10:00:00Z'
  }
]

// Demo Proposals Database
const DEMO_PROPOSALS = [
  {
    id: 'prop-001',
    customerId: 'cust-001',
    insuranceCoreProposalId: 'PROP-12345',
    proposalRef: 'PR-2024-0001',
    businessKey: 'PROP-PROP-12345',
    productType: 'Home Insurance',
    status: 'PendingSignature',
    createdByUserId: 'user-agt-001',
    createdAt: '2024-11-10T10:00:00Z',
    lastActivityAt: '2024-11-15T08:30:00Z',
    expiryDate: '2024-12-10T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    consents: [
      {
        proposalConsentId: 'pc-001',
        consentDefinitionId: 'cd-001',
        label: 'I accept the Terms & Conditions',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      },
      {
        proposalConsentId: 'pc-002',
        consentDefinitionId: 'cd-002',
        label: 'I accept the Privacy Policy',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      }
    ]
  }
]

// Check if DEMO_PROPOSALS is defined
console.log('✅ mockApi.js loaded')
console.log('📋 DEMO_PROPOSALS count:', DEMO_PROPOSALS?.length)

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Auth API
export const authApi = {
  async login({ email, password }) {
    await delay()
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Always require OTP for demo
    return {
      requiresOtp: true
    }
  },

  async verifyOtp({ email, otp }) {
    await delay()
    
    // Accept any 6-digit OTP for demo (in production, validate actual OTP)
    if (!otp || otp.length !== 6) {
      throw new Error('Invalid OTP')
    }

    const user = DEMO_USERS.find(u => u.email === email)
    
    if (!user) {
      throw new Error('User not found')
    }

    return {
      token: `demo-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      user: {
        id: user.id,
        displayName: user.displayName,
        role: user.role,
        email: user.email,
        businessKey: user.businessKey
      }
    }
  }
}

// Customer Auth API
export const customerAuthApi = {
  async requestOtp({ email }) {
    await delay()
    
    // Accept any email for demo
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address')
    }

    console.log(`[DEMO] OTP sent to ${email}: 123456`)
    return { success: true }
  },

  async verifyOtp({ email, otp }) {
    await delay()
    
    // Accept 123456 for demo
    if (otp !== '123456') {
      throw new Error('Invalid OTP')
    }

    // Find or create customer
    let customer = DEMO_CUSTOMERS.find(c => c.email === email)
    
    if (!customer) {
      // Create demo customer for any email
      customer = {
        id: `cust-${Date.now()}`,
        customerType: 'Individual',
        fullName: email.split('@')[0],
        email: email
      }
    }

    return {
      token: `customer-token-${customer.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      customer: {
        id: customer.id,
        fullName: customer.fullName || customer.legalName,
        email: customer.email
      }
    }
  }
}

// --- Signing session mock API for email link journey ---

// For prototype, we ignore the token and always return the same demo session.
// Later you can look up the real session by token from backend.
// --- Signing session mock API for email link journey ---

export const signingSessionsApi = {
  async getSessionByToken(token) {
    await delay(300)

    // For prototype, we pretend this token points to demo proposal "prop-001"
    return {
      token,
      proposalId: 'prop-001',
      customerType: 'INDIVIDUAL', // or 'BUSINESS'
      prefilledEmail: 'john.doe@example.com',
      prefilledMobile: '+35799123456',
      // In real backend you might also return masked info:
      // maskedEmail: 'john.d••••@example.com',
      // maskedMobile: '+357 99•• ••••',
    }
  },

  async verifyIdentity(token, payload) {
    await delay(400)

    // Prototype behaviour:
    // - If all required fields are non-empty, consider identity valid
    const isIndividual = payload.customerType === 'INDIVIDUAL'
    const ok = isIndividual
      ? payload.dateOfBirth && payload.idNumber
      : payload.dateOfRegistration && (payload.registrationNumber || payload.tin)

    if (!ok) {
      return { success: false, reason: 'INVALID_DATA', remainingAttempts: 2 }
    }

    return { success: true }
  },

  async sendOtp(token, { channel, email, mobile }) {
    await delay(400)

    // In real life, send OTP via SMS or email.
    // Here we just pretend and always succeed.
    console.log(`[DEMO] Sending OTP 123456 via ${channel || 'EMAIL'} to`, {
      email,
      mobile,
    })

    return {
      success: true,
      channel: channel || 'EMAIL',
      demoOtp: '123456',
    }
  },

  async verifyOtp(token, { otp }) {
    await delay(400)

    if (otp !== '123456') {
      return { success: false, reason: 'INVALID_OTP', remainingAttempts: 2 }
    }

    return { success: true }
  },
}


// Customers API
export const customersApi = {
  async getCustomers({ page = 1, pageSize = 10, status, search } = {}) {
    await delay()
    
    let items = [...DEMO_CUSTOMERS]
    
    if (status) {
      items = items.filter(c => c.status === status)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter(c => 
        c.fullName?.toLowerCase().includes(searchLower) ||
        c.legalName?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.businessKey?.toLowerCase().includes(searchLower)
      )
    }

    return {
      items,
      totalCount: items.length,
      page,
      pageSize
    }
  },

  async getCustomerById(id) {
    await delay()
    
    const customer = DEMO_CUSTOMERS.find(c => c.id === id)
    
    if (!customer) {
      throw new Error('Customer not found')
    }

    return customer
  },

  async createCustomer(data) {
    await delay()
    
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...data,
      status: 'Active',
      createdAt: new Date().toISOString()
    }
    
    DEMO_CUSTOMERS.push(newCustomer)
    
    return newCustomer
  },

  async updateCustomer(id, data) {
    await delay()
    
    const index = DEMO_CUSTOMERS.findIndex(c => c.id === id)
    
    if (index === -1) {
      throw new Error('Customer not found')
    }

    DEMO_CUSTOMERS[index] = {
      ...DEMO_CUSTOMERS[index],
      ...data
    }
    
    return DEMO_CUSTOMERS[index]
  }
}

// Proposals API
export const proposalsApi = {
  async getProposals({ customerId, status, fromDate, toDate, page = 1, pageSize = 10 } = {}) {
    await delay()
    
    let items = [...DEMO_PROPOSALS]
    
    if (customerId) {
      items = items.filter(p => p.customerId === customerId)
    }
    
    if (status) {
      items = items.filter(p => p.status === status)
    }

    return {
      items,
      totalCount: items.length,
      page,
      pageSize
    }
  },

  async getProposalById(id) {
     console.log('🔍 getProposalById CALLED with:', id)  // ⭐ ADD THIS
  await delay()
  
  console.log('📋 Searching in DEMO_PROPOSALS:', DEMO_PROPOSALS)  // ⭐ ADD THIS
  
  const proposal = DEMO_PROPOSALS.find(p => p.id === id)
  
  console.log('🎯 Result:', proposal)  // ⭐ ADD THIS
  
  if (!proposal) {
    console.error('❌ NOT FOUND!')
    throw new Error('Proposal not found')
  }

  console.log('✅ FOUND! Returning:', proposal)  // ⭐ ADD THIS
  return proposal
},

  async createProposal(data) {
  await delay()

  const now = new Date().toISOString()

  const newProposal = {
    id: `prop-${Date.now()}`,
    status: (data && data.status) ? data.status : 'Draft',  // 👈 proper property
    createdAt: now,
    lastActivityAt: now,
    ...data, // keep this last so other fields from data are merged in
  }

	  DEMO_PROPOSALS.push(newProposal)

	  return newProposal
	},


  async uploadDocument(proposalId, file) {
    await delay()
    
    console.log(`[DEMO] Document uploaded for proposal ${proposalId}:`, file.name)
    
    return {
      proposalId,
      documentId: `doc-${Date.now()}`,
      originalFileName: file.name,
      originalHash: 'SHA256_MOCK_HASH'
    }
  },

  async sendInvitation(proposalId, data) {
    await delay()
    
    console.log(`[DEMO] Invitation sent for proposal ${proposalId}`)
    
    return {
      success: true,
      invitationSentAt: new Date().toISOString()
    }
  },
  
  async completeSigning(proposalId, { signatureType, signedByChannel }) {
  await delay()

  const proposal = DEMO_PROPOSALS.find((p) => p.id === proposalId)
  if (!proposal) {
    throw new Error('Proposal not found')
	  }

	  // Update in-memory object
	  proposal.status = 'Signed'
	  proposal.signatureStatus = 'Completed'
	  proposal.signedAt = new Date().toISOString()
	  proposal.signatureType = signatureType
	  proposal.signedByChannel = signedByChannel

	  // Dummy URLs – put any PDFs you like in /public
	  proposal.signedDocumentUrl = '/demo-signed-proposal.pdf'
	  proposal.auditTrailUrl = '/demo-audit-trail.pdf'

	  return { ...proposal }
	}

}

// Users API
export const usersApi = {
  async getUsers({ role, page = 1, pageSize = 10 } = {}) {
    await delay()
    
    let items = [...DEMO_USERS]
    
    if (role) {
      items = items.filter(u => u.role === role)
    }

    return {
      items: items.map(u => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        businessKey: u.businessKey
      })),
      totalCount: items.length,
      page,
      pageSize
    }
  }
}

// Settings API
export const settingsApi = {
  async getSettings() {
    await delay()
    
    return {
      tsa: {
        endpoint: 'https://freetsa.org/tsr',
        hashAlgorithm: 'SHA256'
      },
      otp: {
        expiryMinutes: 10,
        length: 6
      },
      session: {
        timeoutMinutes: 15
      },
      retention: {
        years: 10
      }
    }
  }
}

// Consent Definitions API
export const consentDefinitionsApi = {
  async getConsentDefinitions() {
    await delay()
    
    return [
      {
        id: 'cd-001',
        label: 'I accept the Terms & Conditions',
        description: 'You must accept the terms and conditions to proceed',
        controlType: 'Checkbox',
        isRequired: true,
        isActive: true
      },
      {
        id: 'cd-002',
        label: 'I accept the Privacy Policy',
        description: 'You must accept the privacy policy to proceed',
        controlType: 'Checkbox',
        isRequired: true,
        isActive: true
      },
      {
        id: 'cd-003',
        label: 'I agree to receive marketing communications',
        description: 'Optional: Receive updates about our products and services',
        controlType: 'Checkbox',
        isRequired: false,
        isActive: true
      }
    ]
  }
}

console.log('🚀 Mock API loaded')
console.log('📧 Demo Portal Login: admin@insurance.com / admin123')
console.log('🔑 Demo OTP: 123456')
console.log('👤 Demo Customer: any email (e.g., customer@example.com)')
