import httpClient from './httpClient'

export const settingsApi = {
  /**
   * Get system settings
   */
  getSettings: async () => {
    return httpClient.get('/settings')
  },

  /**
   * Update system settings (partial update)
   */
  updateSettings: async (settings) => {
    return httpClient.patch('/settings', settings)
  },

  // ============================================================================
  // CONSENT DEFINITIONS
  // ============================================================================

  /**
   * Get consent definitions
   */
  getConsentDefinitions: async () => {
    return httpClient.get('/settings/consent-definitions')
  },

  /**
   * Create consent definition
   */
  createConsentDefinition: async (data) => {
    return httpClient.post('/settings/consent-definitions', data)
  },

  /**
   * Update consent definition
   */
  updateConsentDefinition: async (id, data) => {
    return httpClient.put(`/settings/consent-definitions/${id}`, data)
  },

  /**
   * Delete consent definition
   */
  deleteConsentDefinition: async (id) => {
    return httpClient.delete(`/settings/consent-definitions/${id}`)
  },

  // ============================================================================
  // ENVELOPE TYPES
  // ============================================================================

  /**
   * Get envelope types
   */
  getEnvelopeTypes: async () => {
    return httpClient.get('/settings/envelope-types')
  },

  /**
   * Create envelope type
   */
  createEnvelopeType: async (data) => {
    return httpClient.post('/settings/envelope-types', data)
  },

  /**
   * Update envelope type
   */
  updateEnvelopeType: async (id, data) => {
    return httpClient.put(`/settings/envelope-types/${id}`, data)
  },

  /**
   * Delete envelope type
   */
  deleteEnvelopeType: async (id) => {
    return httpClient.delete(`/settings/envelope-types/${id}`)
  },

  /**
   * Get all enum values (statuses, roles, etc.)
   */
  getEnumValues: async () => {
    return httpClient.get('/settings/enums')
  },

  /**
   * Health check
   */
  getHealth: async () => {
    return httpClient.get('/settings/health')
  },
}
