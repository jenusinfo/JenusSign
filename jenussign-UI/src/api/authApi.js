import httpClient from './httpClient'

// Mock mode for demo - set to true to use mock data
const MOCK_MODE = true

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'admin@insurance.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'Admin',
  },
  {
    id: '2',
    email: 'agent@insurance.com',
    password: 'agent123',
    displayName: 'Agent Smith',
    role: 'Agent',
  },
]

const mockCustomers = [
  {
    id: 'c1',
    email: 'john.doe@email.com',
    fullName: 'John Doe',
  },
]

// Mock delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const authApi = {
  // Non-customer portal login
  async login(email, password) {
    if (MOCK_MODE) {
      await delay(800)
      const user = mockUsers.find((u) => u.email === email && u.password === password)
      if (user) {
        return { requiresOtp: true }
      }
      throw new Error('Invalid credentials')
    }
    return httpClient.post('/auth/login', { email, password })
  },

  async verifyOtp(email, otp) {
    if (MOCK_MODE) {
      await delay(600)
      const user = mockUsers.find((u) => u.email === email)
      if (user && otp === '123456') {
        const token = `mock-token-${Date.now()}`
        return {
          token,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          user: {
            id: user.id,
            displayName: user.displayName,
            role: user.role,
          },
        }
      }
      throw new Error('Invalid OTP')
    }
    return httpClient.post('/auth/verify-otp', { email, otp })
  },

  // Customer portal login
  async requestCustomerOtp(email) {
    if (MOCK_MODE) {
      await delay(500)
      const customer = mockCustomers.find((c) => c.email === email)
      if (customer) {
        console.log('Mock OTP: 123456')
        return { success: true }
      }
      throw new Error('Customer not found')
    }
    return httpClient.post('/customer-auth/request-otp', { email })
  },

  async verifyCustomerOtp(email, otp) {
    if (MOCK_MODE) {
      await delay(600)
      const customer = mockCustomers.find((c) => c.email === email)
      if (customer && otp === '123456') {
        const token = `mock-customer-token-${Date.now()}`
        return {
          token,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          customer: {
            id: customer.id,
            fullName: customer.fullName,
          },
        }
      }
      throw new Error('Invalid OTP')
    }
    return httpClient.post('/customer-auth/verify-otp', { email, otp })
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('customerToken')
    localStorage.removeItem('customer')
  },
}

export default authApi
