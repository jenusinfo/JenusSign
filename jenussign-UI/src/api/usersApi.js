import httpClient from './httpClient'

// httpClient interceptor already returns response.data, so we return directly

export const usersApi = {
  /**
   * Get paginated list of users
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.pageSize - Items per page (default: 20)
   * @param {string} params.role - Filter by role (Admin, Employee, Broker, Agent)
   * @param {string} params.search - Search term
   */
  getUsers: async (params = {}) => {
    return await httpClient.get('/users', { params })
  },

  /**
   * Get user by ID
   */
  getUser: async (id) => {
    return await httpClient.get(`/users/${id}`)
  },

  /**
   * Get all agents (users with Agent role)
   */
  getAgents: async () => {
    const data = await httpClient.get('/users', { 
      params: { role: 'Agent', pageSize: 100 } 
    })
    return data.users || []
  },

  /**
   * Get all brokers (users with Broker role)
   */
  getBrokers: async () => {
    const data = await httpClient.get('/users', { 
      params: { role: 'Broker', pageSize: 100 } 
    })
    return data.users || []
  },

  /**
   * Get all employees (users with Employee role)
   */
  getEmployees: async () => {
    const data = await httpClient.get('/users', { 
      params: { role: 'Employee', pageSize: 100 } 
    })
    return data.users || []
  },

  /**
   * Create a new user
   */
  createUser: async (userData) => {
    return await httpClient.post('/users', userData)
  },

  /**
   * Update user
   */
  updateUser: async (id, userData) => {
    return await httpClient.put(`/users/${id}`, userData)
  },

  /**
   * Delete user
   */
  deleteUser: async (id) => {
    return await httpClient.delete(`/users/${id}`)
  }
}

export default usersApi
