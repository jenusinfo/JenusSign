import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children, customer = false }) {
  const { isAuthenticated, isCustomerAuthenticated } = useAuthStore()

  if (customer && !isCustomerAuthenticated) {
    return <Navigate to="/customer/login" replace />
  }

  if (!customer && !isAuthenticated) {
    return <Navigate to="/portal/login" replace />
  }

  return children
}
