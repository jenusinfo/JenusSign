import httpClient from './httpClient'

// ============================================================================
// CUSTOMERS API - Actual API calls to backend
// httpClient interceptor already returns response.data, so we return directly
// ============================================================================

const customersApi = {
  async getCustomers(params = {}) {
    const data = await httpClient.get('/customers', { params })
    // Backend returns { customers, totalCount, page, pageSize }
    return {
      items: data.customers || data.items || [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
    }
  },

  async getCustomer(id) {
    return await httpClient.get(`/customers/${id}`)
  },

  async getCustomerByBusinessKey(businessKey) {
    return await httpClient.get(`/customers/by-key/${businessKey}`)
  },

  async createCustomer(data) {
    return await httpClient.post('/customers', data)
  },

  async updateCustomer(id, data) {
    return await httpClient.put(`/customers/${id}`, data)
  },

  async deleteCustomer(id) {
    return await httpClient.delete(`/customers/${id}`)
  },

  // Search customers
  async searchCustomers(query) {
    const data = await httpClient.get('/customers', { 
      params: { search: query } 
    })
    return data.customers || data.items || []
  },
}

export { customersApi }
export default customersApi
