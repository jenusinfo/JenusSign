import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * JenusSign Auth Store
 * 
 * Manages authentication state for both Customer Portal and Agent/Broker Portal.
 * Uses Zustand with persistence to localStorage.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // ========== CUSTOMER AUTH STATE ==========
      customerToken: null,
      customerRefreshToken: null,
      customer: null,

      // ========== AGENT/PORTAL AUTH STATE ==========
      agentToken: null,
      agentRefreshToken: null,
      agent: null,
      
      // Legacy support
      token: null,
      user: null,

      // ========== CUSTOMER AUTH ACTIONS ==========
      
      setCustomerAuth: (token, customer, refreshToken = null) => {
        set({ 
          customerToken: token, 
          customerRefreshToken: refreshToken,
          customer,
        })
      },

      updateCustomer: (updates) => {
        const current = get().customer
        set({ 
          customer: { ...current, ...updates },
        })
      },

      isCustomerAuthenticated: () => {
        const { customerToken, customer } = get()
        return !!(customerToken && customer)
      },

      logoutCustomer: () => {
        set({ 
          customerToken: null, 
          customerRefreshToken: null,
          customer: null,
        })
      },

      // ========== AGENT AUTH ACTIONS ==========
      
      setAgentAuth: (token, agent, refreshToken = null) => {
        set({ 
          agentToken: token, 
          agentRefreshToken: refreshToken,
          agent,
          // Also set legacy fields for compatibility
          token,
          user: agent,
        })
      },

      updateAgent: (updates) => {
        const current = get().agent
        set({ 
          agent: { ...current, ...updates },
          user: { ...current, ...updates },
        })
      },

      isAgentAuthenticated: () => {
        const { agentToken, agent, token, user } = get()
        // Check both new and legacy fields
        return !!(agentToken && agent) || !!(token && user)
      },

      logoutAgent: () => {
        set({ 
          agentToken: null, 
          agentRefreshToken: null,
          agent: null,
          token: null,
          user: null,
        })
      },

      // ========== ROLE CHECK FUNCTIONS ==========
      
      isAdmin: () => {
        const { agent, user } = get()
        const currentUser = agent || user
        if (!currentUser) return false
        return currentUser.role === 'admin' || currentUser.role === 'ADMIN' || currentUser.isAdmin === true
      },

      isBroker: () => {
        const { agent, user } = get()
        const currentUser = agent || user
        if (!currentUser) return false
        return currentUser.role === 'broker' || currentUser.role === 'BROKER'
      },

      isAgent: () => {
        const { agent, user } = get()
        const currentUser = agent || user
        if (!currentUser) return false
        return currentUser.role === 'agent' || currentUser.role === 'AGENT'
      },

      isEmployee: () => {
        const { agent, user } = get()
        const currentUser = agent || user
        if (!currentUser) return false
        return currentUser.role === 'employee' || currentUser.role === 'EMPLOYEE' || currentUser.isEmployee === true
      },

      getRole: () => {
        const { agent, user } = get()
        const currentUser = agent || user
        return currentUser?.role || null
      },

      // ========== LEGACY SUPPORT ==========
      
      // For existing code that uses setAuth(token, user)
      setAuth: (token, user) => {
        set({
          token,
          user,
          agentToken: token,
          agent: user,
        })
      },

      // For existing code that uses isAuthenticated()
      isAuthenticated: () => {
        const { token, user, agentToken, agent } = get()
        return !!(token && user) || !!(agentToken && agent)
      },

      // General logout
      logout: () => {
        set({
          customerToken: null,
          customer: null,
          agentToken: null,
          agent: null,
          token: null,
          user: null,
        })
      },

      // ========== UTILITY ACTIONS ==========
      
      clearAll: () => {
        set({
          customerToken: null,
          customer: null,
          agentToken: null,
          agent: null,
          token: null,
          user: null,
        })
      },

      getCurrentUser: () => {
        const { customer, agent, user } = get()
        return customer || agent || user || null
      },

      getCurrentToken: () => {
        const { customerToken, agentToken, token } = get()
        return customerToken || agentToken || token || null
      },
    }),
    {
      name: 'jenussign-auth',
      partialize: (state) => ({
        customerToken: state.customerToken,
        customer: state.customer,
        agentToken: state.agentToken,
        agent: state.agent,
        token: state.token,
        user: state.user,
      }),
    }
  )
)

export default useAuthStore
