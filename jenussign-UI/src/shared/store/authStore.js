import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      customerToken: null,
      customer: null,
      isCustomerAuthenticated: false,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      setCustomerAuth: (customerToken, customer) =>
        set({
          customerToken,
          customer,
          isCustomerAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      logoutCustomer: () =>
        set({
          customerToken: null,
          customer: null,
          isCustomerAuthenticated: false,
        }),

      clearAll: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          customerToken: null,
          customer: null,
          isCustomerAuthenticated: false,
        }),
    }),
    {
      name: 'jenussign-auth',
    }
  )
)

export default useAuthStore
