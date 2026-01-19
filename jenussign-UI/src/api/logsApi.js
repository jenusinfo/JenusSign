import httpClient from './httpClient'

export const logsApi = {
  /**
   * Get system logs with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @param {string} [params.eventType] - Filter by event type
   * @param {string} [params.severity] - Filter by severity (INFO, WARNING, ERROR)
   * @param {string} [params.fromDate] - Start date (ISO string)
   * @param {string} [params.toDate] - End date (ISO string)
   * @param {number} [params.page] - Page number (1-indexed)
   * @param {number} [params.pageSize] - Items per page
   */
  getLogs: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.search) queryParams.append('search', params.search)
    if (params.eventType && params.eventType !== 'ALL') queryParams.append('eventType', params.eventType)
    if (params.severity && params.severity !== 'ALL') queryParams.append('severity', params.severity)
    if (params.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params.toDate) queryParams.append('toDate', params.toDate)
    if (params.page) queryParams.append('page', params.page)
    if (params.pageSize) queryParams.append('pageSize', params.pageSize)
    
    const queryString = queryParams.toString()
    const url = `/logs${queryString ? `?${queryString}` : ''}`
    
    return httpClient.get(url)
  },

  /**
   * Get a single log entry by ID
   */
  getLog: async (id) => {
    return httpClient.get(`/logs/${id}`)
  },

  /**
   * Export logs to CSV or JSON
   * @param {Object} params - Same filter params as getLogs
   * @param {string} format - 'csv' or 'json'
   */
  exportLogs: async (params = {}, format = 'csv') => {
    const queryParams = new URLSearchParams()
    
    if (params.search) queryParams.append('search', params.search)
    if (params.eventType && params.eventType !== 'ALL') queryParams.append('eventType', params.eventType)
    if (params.severity && params.severity !== 'ALL') queryParams.append('severity', params.severity)
    if (params.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params.toDate) queryParams.append('toDate', params.toDate)
    queryParams.append('format', format)
    
    const response = await httpClient.get(`/logs/export?${queryParams.toString()}`, {
      responseType: 'blob'
    })
    
    return response
  },

  /**
   * Get log statistics/summary
   */
  getLogStats: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params.toDate) queryParams.append('toDate', params.toDate)
    
    const queryString = queryParams.toString()
    const url = `/logs/stats${queryString ? `?${queryString}` : ''}`
    
    return httpClient.get(url)
  },
}
