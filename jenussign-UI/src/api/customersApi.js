import httpClient from './httpClient'

const MOCK_MODE = true
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock customers data
const mockCustomers = [
  {
    id: 'c1',
    customerType: 'Individual',
    fullName: 'John Doe',
    legalName: null,
    email: 'john.doe@email.com',
    phone: '+35799123456',
    assignedAgentId: '2',
    assignedBrokerId: null,
    status: 'Active',
    insuranceCoreCustomerId: 'ICS12345',
    individual: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      nationalId: 'ID123456',
      idCountryOfIssue: 'CY',
    },
    company: null,
    country: 'CY',
  },
  {
    id: 'c2',
    customerType: 'Company',
    fullName: null,
    legalName: 'Acme Insurance Ltd',
    email: 'contact@acme.com',
    phone: '+35799654321',
    assignedAgentId: '2',
    assignedBrokerId: null,
    status: 'Active',
    insuranceCoreCustomerId: 'ICS12346',
    individual: null,
    company: {
      registrationNumber: 'HE123456',
      registrationDate: '2010-05-01',
      registrationCountryOfIssue: 'CY',
    },
    country: 'CY',
  },
  {
    id: 'c3',
    customerType: 'Individual',
    fullName: 'Jane Smith',
    legalName: null,
    email: 'jane.smith@email.com',
    phone: '+35799789012',
    assignedAgentId: '2',
    assignedBrokerId: null,
    status: 'Active',
    insuranceCoreCustomerId: 'ICS12347',
    individual: {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1985-06-15',
      nationalId: 'ID789012',
      idCountryOfIssue: 'CY',
    },
    company: null,
    country: 'CY',
  },
]

const customersApi = {
  async getCustomers(params = {}) {
    if (MOCK_MODE) {
      await delay(400)
      let filtered = [...mockCustomers]
      
      if (params.search) {
        const search = params.search.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.fullName?.toLowerCase().includes(search) ||
            c.legalName?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search)
        )
      }
      
      if (params.status) {
        filtered = filtered.filter((c) => c.status === params.status)
      }
      
      return {
        items: filtered,
        totalCount: filtered.length,
      }
    }
    return httpClient.get('/customers', { params })
  },

  async getCustomer(id) {
    if (MOCK_MODE) {
      await delay(300)
      const customer = mockCustomers.find((c) => c.id === id)
      if (!customer) throw new Error('Customer not found')
      return customer
    }
    return httpClient.get(`/customers/${id}`)
  },
}

export default customersApi
