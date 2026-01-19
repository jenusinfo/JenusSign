import httpClient from './httpClient'

// ============================================================================
// PROPOSALS API - Actual API calls to backend
// httpClient interceptor already returns response.data, so we return directly
// ============================================================================

const proposalsApi = {
  async getProposals(params = {}) {
    const data = await httpClient.get('/proposals', { params })
    // Backend returns { proposals, totalCount, page, pageSize }
    return {
      items: data.proposals || data.items || [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
    }
  },

  async getProposal(id) {
    return await httpClient.get(`/proposals/${id}`)
  },

  async getProposalByReference(referenceNumber) {
    return await httpClient.get(`/proposals/by-reference/${referenceNumber}`)
  },

  async createProposal(data) {
    return await httpClient.post('/proposals', data)
  },

  async updateProposal(id, data) {
    return await httpClient.put(`/proposals/${id}`, data)
  },

  async deleteProposal(id) {
    return await httpClient.delete(`/proposals/${id}`)
  },

  // Send proposal for signing
  async sendForSigning(id, options = {}) {
    return await httpClient.post(`/proposals/${id}/send`, {
      sendEmail: options.sendEmail !== false,
      sendSms: options.sendSms || false,
      customerMessage: options.customerMessage || null,
      expiresAt: options.expiresAt || null,
    })
  },

  // Get proposals by customer
  async getProposalsByCustomer(customerId) {
    return await httpClient.get(`/proposals/customer/${customerId}`)
  },

  // Upload document to proposal
  async uploadDocument(proposalId, file) {
    const formData = new FormData()
    formData.append('file', file)
    return await httpClient.post(`/proposals/${proposalId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default proposalsApi
