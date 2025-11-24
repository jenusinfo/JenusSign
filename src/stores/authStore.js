import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Portal User (Agent/Broker/Employee/Admin)
      user: null,
      token: null,
      
      // Customer
      customer: null,
      customerToken: null,

      // Portal User Actions
      setAuth: (token, user) => {
        set({ 
          token, 
          user,
          // Clear customer data when portal user logs in
          customer: null,
          customerToken: null
        })
      },

      logout: () => {
        set({ 
          user: null, 
          token: null,
          customer: null,
          customerToken: null
        })
      },

      // Customer Actions
      setCustomerAuth: (customerToken, customer) => {
        set({ 
          customerToken, 
          customer,
          // Clear portal user data when customer logs in
          user: null,
          token: null
        })
      },

      logoutCustomer: () => {
        set({ 
          customer: null, 
          customerToken: null 
        })
      },

      // Auth Check Helpers
      isAuthenticated: () => {
        const { token } = get()
        return !!token
      },

      isCustomerAuthenticated: () => {
        const { customerToken } = get()
        return !!customerToken
      },

      // Role Check Helpers
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'Admin'
      },

      isEmployee: () => {
        const { user } = get()
        return user?.role === 'Employee'
      },

      isBroker: () => {
        const { user } = get()
        return user?.role === 'Broker'
      },

      isAgent: () => {
        const { user } = get()
        return user?.role === 'Agent'
      },

      // Combined role checks
      canManageSettings: () => {
        const { user } = get()
        return user?.role === 'Admin' || user?.role === 'Employee'
      },

      canViewAllCustomers: () => {
        const { user } = get()
        return user?.role === 'Admin' || user?.role === 'Employee' || user?.role === 'Broker'
      },

      canCreateProposals: () => {
        const { user } = get()
        return !!user // All portal users can create proposals
      }
    }),
    {
      name: 'jenussign-auth-storage',
      // Only persist certain fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        customer: state.customer,
        customerToken: state.customerToken
      })
    }
  )
)

export default useAuthStore
