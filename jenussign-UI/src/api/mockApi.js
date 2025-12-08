// Mock API for JenusSign Frontend Development
// Enhanced version with customerProposalsApi for Customer Portal

// Demo Users Database

const DEMO_USERS = [
  {
    id: 'user-admin-001',
    email: 'admin@insurance.com',
    password: 'admin123',
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

// Demo Proposals Database (Enhanced for Customer Portal)
// PDF URLs added for each proposal
const DEMO_PROPOSALS = [
  {
    id: 'prop-001',
    customerId: 'cust-001',
    customerEmail: 'john.doe@example.com',
    customerName: 'Yiannis Kleanthous',
    insuranceCoreProposalId: 'PROP-12345',
    proposalRef: 'PR-2025-0001',
    referenceNumber: 'PR-2025-0001',
    businessKey: 'PROP-PROP-12345',
    title: 'Home Insurance Proposal PR-2025-0001',
    productType: 'Home Insurance',
    status: 'PENDING',
    premium: 1250.00,
    createdByUserId: 'user-agt-001',
    createdAt: '2024-11-10T10:00:00Z',
    lastActivityAt: '2024-11-15T08:30:00Z',
    expiryDate: '2025-12-31T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    // PDF URLs for Home Insurance
    documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
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
  },
  {
    id: 'prop-002',
    customerId: 'cust-001',
    customerEmail: 'john.doe@example.com',
    customerName: 'Charis Constantinou',
    insuranceCoreProposalId: 'PROP-12346',
    proposalRef: 'PR-2025-0002',
    referenceNumber: 'PR-2025-0002',
    businessKey: 'PROP-PROP-12346',
    title: 'Motor Insurance Proposal PR-2025-0002',
    productType: 'Motor Insurance',
    status: 'PENDING',
    premium: 850.00,
    createdByUserId: 'user-agt-001',
    createdAt: '2024-11-12T14:00:00Z',
    lastActivityAt: '2024-11-18T10:15:00Z',
    expiryDate: '2025-12-31T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    // PDF URLs for Motor Insurance
    documentUrl: '/samples/motor-insurance-proposal-PR-2025-0002.pdf',
    signedDocumentUrl: '/samples/demo-motor-signed-esealed.pdf',
    auditTrailUrl: '/samples/motor-insurance-audit-trail-PR-2025-0002.pdf',
    consents: [
      {
        proposalConsentId: 'pc-003',
        consentDefinitionId: 'cd-001',
        label: 'I accept the Terms & Conditions',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      },
      {
        proposalConsentId: 'pc-004',
        consentDefinitionId: 'cd-002',
        label: 'I accept the Privacy Policy',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      }
    ]
  },
  {
    id: 'prop-003',
    customerId: 'cust-001',
    customerEmail: 'john.doe@example.com',
    customerName: 'Nikos Papadopoulos',
    insuranceCoreProposalId: 'PROP-12347',
    proposalRef: 'PR-2025-0003',
    referenceNumber: 'PR-2025-0003',
    businessKey: 'PROP-PROP-12347',
    title: 'Travel Insurance Policy PR-2025-0003',
    productType: 'Travel Insurance',
    status: 'COMPLETED',
    premium: 320.00,
    createdByUserId: 'user-agt-001',
    createdAt: '2024-10-25T09:00:00Z',
    lastActivityAt: '2024-10-28T16:45:00Z',
    signedAt: '2024-10-28T16:45:00Z',
    expiryDate: '2025-11-25T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    // PDF URLs for Travel Insurance (reusing home for demo)
    documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
    consents: []
  },
  {
    id: 'prop-004',
    customerId: 'cust-001',
    customerEmail: 'john.doe@example.com',
    customerName: 'John Doe',
    insuranceCoreProposalId: 'PROP-12348',
    proposalRef: 'PR-2025-0004',
    referenceNumber: 'PR-2025-0004',
    businessKey: 'PROP-PROP-12348',
    title: 'Life Insurance Proposal PR-2025-0004',
    productType: 'Life Insurance',
    status: 'SIGNED',
    premium: 2400.00,
    createdByUserId: 'user-agt-001',
    createdAt: '2024-09-15T11:00:00Z',
    lastActivityAt: '2024-09-20T14:30:00Z',
    signedAt: '2024-09-20T14:30:00Z',
    expiryDate: '2025-10-15T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    // PDF URLs for Life Insurance (reusing home for demo)
    documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
    consents: []
  },
  {
    id: 'prop-005',
    customerId: 'cust-002',
    customerEmail: 'info@techsolutions.cy',
    customerName: 'Tech Solutions Ltd',
    insuranceCoreProposalId: 'PROP-12349',
    proposalRef: 'PR-2025-0005',
    referenceNumber: 'PR-2025-0005',
    businessKey: 'PROP-PROP-12349',
    title: 'Business Liability Insurance PR-2025-0005',
    productType: 'Business Insurance',
    status: 'PENDING',
    premium: 4500.00,
    createdByUserId: 'user-agt-001',
    createdAt: '2024-11-18T09:00:00Z',
    lastActivityAt: '2024-11-18T09:00:00Z',
    expiryDate: '2025-12-18T23:59:59Z',
    assignedAgentId: 'user-agt-001',
    assignedBrokerId: 'user-brk-001',
    // PDF URLs for Business Insurance (reusing motor for demo)
    documentUrl: '/samples/motor-insurance-proposal-PR-2025-0002.pdf',
    signedDocumentUrl: '/samples/demo-motor-signed-esealed.pdf',
    auditTrailUrl: '/samples/motor-insurance-audit-trail-PR-2025-0002.pdf',
    consents: [
      {
        proposalConsentId: 'pc-005',
        consentDefinitionId: 'cd-001',
        label: 'I accept the Terms & Conditions',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      },
      {
        proposalConsentId: 'pc-006',
        consentDefinitionId: 'cd-002',
        label: 'I accept the Privacy Policy',
        controlType: 'Checkbox',
        isRequired: true,
        value: null
      }
    ]
  }
]

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

    return {
      requiresOtp: true
    }
  },

  async verifyOtp({ email, otp }) {
    await delay()

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

// ============================================
// CUSTOMER PROPOSALS API (NEW - for Customer Dashboard)
// ============================================
export const customerProposalsApi = {
  async getByCustomer(email) {
    await delay(400)

    if (!email) {
      return []
    }

    // Find proposals by customer email
    let proposals = DEMO_PROPOSALS.filter(p =>
      p.customerEmail?.toLowerCase() === email.toLowerCase()
    )

    // If no proposals found for this email, return demo proposals for testing
    if (proposals.length === 0) {
      // For demo purposes, show all proposals to any logged-in customer
      proposals = DEMO_PROPOSALS
    }

    return proposals
  },

  async getById(id) {
    await delay(300)

    const proposal = DEMO_PROPOSALS.find(p => p.id === id)

    if (!proposal) {
      throw new Error('Proposal not found')
    }

    return proposal
  }
}

// ============================================
// DEMO SIGNING SESSIONS - Multiple tokens for prospect demos
// ============================================
const DEMO_SIGNING_SESSIONS = {
  // Token 1: Yiannis Kleanthous - Home Insurance
  'demo1': {
    token: 'demo1',
    proposalId: 'prop-001',
    proposalTitle: 'Home Insurance Proposal PR-2025-0001',
    customerType: 'INDIVIDUAL',
    customerName: 'Yiannis Kleanthous',
    prefilledEmail: 'yiannis.kleanthous@hydrainsurance.com.cy',
    prefilledMobile: '+357 99 123456',
    expectedDateOfBirth: '1985-03-12',
    expectedIdNumber: 'X1234567',
    // PDF URLs for this session
    documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
    eidData: {
      name: 'Yiannis Kleanthous',
      idNumber: 'X1234567',
      dateOfBirth: '12 March 1985',
      email: 'yiannis.kleanthous@hydrainsurance.com.cy'
    }
  },
  // Token 2: Charis Constantinou - Motor Insurance
  'demo2': {
    token: 'demo2',
    proposalId: 'prop-002',
    proposalTitle: 'Motor Insurance Proposal PR-2025-0002',
    customerType: 'INDIVIDUAL',
    customerName: 'Charis Constantinou',
    prefilledEmail: 'charis.constantinou@hydrainsurance.com.cy',
    prefilledMobile: '+357 99 654321',
    expectedDateOfBirth: '1990-07-22',
    expectedIdNumber: 'M7654321',
    // PDF URLs for this session
    documentUrl: '/samples/motor-insurance-proposal-PR-2025-0002.pdf',
    signedDocumentUrl: '/samples/demo-motor-signed-esealed.pdf',
    auditTrailUrl: '/samples/motor-insurance-audit-trail-PR-2025-0002.pdf',
    eidData: {
      name: 'Charis Constantinou',
      idNumber: 'M7654321',
      dateOfBirth: '22 July 1990',
      email: 'charis.constantinou@hydrainsurance.com.cy'
    }
  },
  // Token 3: Nikos Papadopoulos - Travel Insurance
  'demo3': {
    token: 'demo3',
    proposalId: 'prop-003',
    proposalTitle: 'Travel Insurance Policy PR-2025-0003',
    customerType: 'INDIVIDUAL',
    customerName: 'Nikos Papadopoulos',
    prefilledEmail: 'nikos.p@example.com',
    prefilledMobile: '+357 99 789012',
    expectedDateOfBirth: '1978-11-05',
    expectedIdNumber: 'N9876543',
    // PDF URLs (reusing home for demo)
    documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
    signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
    auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
    eidData: {
      name: 'Nikos Papadopoulos',
      idNumber: 'N9876543',
      dateOfBirth: '5 November 1978',
      email: 'nikos.p@example.com'
    }
  },
  // Token 4: Business user - Tech Solutions
  'business1': {
    token: 'business1',
    proposalId: 'prop-005',
    proposalTitle: 'Business Liability Insurance PR-2025-0005',
    customerType: 'BUSINESS',
    customerName: 'Tech Solutions Ltd',
    companyName: 'Tech Solutions Ltd',
    prefilledEmail: 'info@techsolutions.cy',
    prefilledMobile: '+357 22 123456',
    expectedRegistrationNumber: 'HE123456',
    // PDF URLs (reusing motor for demo)
    documentUrl: '/samples/motor-insurance-proposal-PR-2025-0002.pdf',
    signedDocumentUrl: '/samples/demo-motor-signed-esealed.pdf',
    auditTrailUrl: '/samples/motor-insurance-audit-trail-PR-2025-0002.pdf',
    eidData: {
      name: 'Tech Solutions Ltd',
      registrationNumber: 'HE123456',
      email: 'info@techsolutions.cy'
    }
  }
}

// Default session for unknown tokens (falls back to demo1)
const DEFAULT_SIGNING_SESSION = DEMO_SIGNING_SESSIONS['demo1']

export const signingSessionsApi = {
  /**
   * Get session by token
   * Supported demo tokens:
   * - demo1: Yiannis Kleanthous - Home Insurance
   * - demo2: Charis Constantinou - Motor Insurance
   * - demo3: Nikos Papadopoulos - Travel Insurance
   * - business1: Tech Solutions Ltd - Business Insurance
   * 
   * Any other token will return the default (demo1) session
   */
  async getSessionByToken(token) {
    await delay(300)

    // Look up the token in our demo sessions
    const session = DEMO_SIGNING_SESSIONS[token] || {
      ...DEFAULT_SIGNING_SESSION,
      token: token // Keep the original token
    }

    return session
  },

  async verifyIdentity(token, payload) {
    await delay(400)

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
  async getCustomer(id) {
    await delay()

    const customer = DEMO_CUSTOMERS.find((c) => c.id === id)

    if (!customer) {
      throw new Error('Customer not found')
    }

    return customer
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

// Proposals API (for Agent/Broker Portal)
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

  async getProposal(id) {
    await delay()

    const proposal = DEMO_PROPOSALS.find((p) => p.id === id)

    if (!proposal) {
      throw new Error('Proposal not found')
    }

    return proposal
  },

  async getProposalById(id) {
    await delay()

    const proposal = DEMO_PROPOSALS.find(p => p.id === id)

    if (!proposal) {
      throw new Error('Proposal not found')
    }

    return proposal
  },

  async createProposal(data) {
    await delay()

    const now = new Date().toISOString()

    const newProposal = {
      id: `prop-${Date.now()}`,
      status: (data && data.status) ? data.status : 'Draft',
      createdAt: now,
      lastActivityAt: now,
      // Default PDF URLs
      documentUrl: '/samples/home-insurance-proposal-PR-2025-0001.pdf',
      signedDocumentUrl: '/samples/demo-home-signed-esealed.pdf',
      auditTrailUrl: '/samples/home-insurance-audit-trail-PR-2025-0001.pdf',
      ...data,
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
    proposal.status = 'SIGNED'
    proposal.signatureStatus = 'Completed'
    proposal.signedAt = new Date().toISOString()
    proposal.signatureType = signatureType
    proposal.signedByChannel = signedByChannel

    return { ...proposal }
  }
}

// Users API
export const usersApi = {
  async getUsers({ search, role, assignedBrokerId, page = 1, pageSize = 10 } = {}) {
    await delay();

    let items = [...DEMO_USERS];

    // Filter by role (Admin / Employee / Broker / Agent)
    if (role) {
      items = items.filter((u) => u.role === role);
    }

    // Filter agents by assigned broker (for broker views)
    if (assignedBrokerId) {
      items = items.filter((u) => u.assignedBrokerId === assignedBrokerId);
    }

    // Text search on name, email, business key
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (u) =>
          u.displayName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.businessKey.toLowerCase().includes(s)
      );
    }

    // Build lookup for brokers (for agents' broker info)
    const brokerLookup = Object.fromEntries(
      DEMO_USERS
        .filter((u) => u.role === 'Broker')
        .map((b) => [
          b.id,
          {
            id: b.id,
            displayName: b.displayName,
            email: b.email,
            businessKey: b.businessKey,
          },
        ])
    );

    const mapped = items.map((u, idx) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      businessKey: u.businessKey,
      assignedBrokerId: u.assignedBrokerId || null,
      broker: u.assignedBrokerId ? brokerLookup[u.assignedBrokerId] || null : null,
      isActive: true,
      createdAt: u.createdAt || new Date(2024, 10, 1 + idx).toISOString(),
    }));

    const statistics = {
      totalUsers: mapped.length,
      totalAdmins: mapped.filter((u) => u.role === 'Admin').length,
      totalEmployees: mapped.filter((u) => u.role === 'Employee').length,
      totalAgents: mapped.filter((u) => u.role === 'Agent').length,
      totalBrokers: mapped.filter((u) => u.role === 'Broker').length,
    };

    return {
      items: mapped,
      totalCount: mapped.length,
      page,
      pageSize,
      statistics,
    };
  },


  async getUser(id) {
    await delay();
    const u = DEMO_USERS.find((x) => x.id === id);
    if (!u) {
      throw new Error('User not found');
    }

    const brokerLookup = Object.fromEntries(
      DEMO_USERS
        .filter((x) => x.role === 'Broker')
        .map((b) => [
          b.id,
          {
            id: b.id,
            displayName: b.displayName,
            email: b.email,
            businessKey: b.businessKey,
          },
        ])
    );

    return {
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      businessKey: u.businessKey,
      assignedBrokerId: u.assignedBrokerId || null,
      broker: u.assignedBrokerId ? brokerLookup[u.assignedBrokerId] || null : null,
      isActive: true,
      createdAt: u.createdAt || new Date(2024, 10, 1).toISOString(),
    };
  },


  async getBrokers() {
    await delay();
    const brokers = DEMO_USERS.filter((u) => u.role === 'Broker');
    return brokers.map((b) => ({
      id: b.id,
      displayName: b.displayName,
      email: b.email,
      businessKey: b.businessKey,
    }));
  },

  async createUser(data) {
    await delay();

    const id = `user-${Date.now()}`;
    const newUser = {
      id,
      email: data.email,
      password: data.password || 'demo123',
      displayName:
        data.displayName ||
        data.fullName ||
        (data.email ? data.email.split('@')[0] : 'New User'),
      role: data.role || 'Employee',
      businessKey: data.businessKey || (data.role || 'USR').slice(0, 3).toUpperCase() + '-' + id.slice(-3),
      assignedBrokerId: data.assignedBrokerId || null,
      createdAt: new Date().toISOString(),
    };

    DEMO_USERS.push(newUser);

    return {
      id: newUser.id,
      displayName: newUser.displayName,
      email: newUser.email,
      role: newUser.role,
      businessKey: newUser.businessKey,
      broker: null,
      isActive: true,
      createdAt: newUser.createdAt,
    };
  },
};


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

console.log('🚀 Enhanced Mock API loaded with PDF URLs')
console.log('📧 Demo Portal Login: admin@insurance.com / admin123')
console.log('🔑 Demo OTP: 123456')
console.log('👤 Demo Customer: john.doe@example.com (or any email)')
console.log('📋 Demo Proposals: 5 proposals available')
console.log('🔗 Demo Signing Tokens:')
console.log('   - demo1: Yiannis Kleanthous (Home Insurance)')
console.log('   - demo2: Charis Constantinou (Motor Insurance)')
console.log('   - demo3: Nikos Papadopoulos (Travel Insurance)')
console.log('   - business1: Tech Solutions Ltd (Business Insurance)')
