import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../shared/components/ProtectedRoute'

// Customer Portal
import CustomerLoginPage from '../modules/customer-portal/pages/CustomerLoginPage'
import CustomerDashboardPage from '../modules/customer-portal/pages/CustomerDashboardPage'
import CustomerProposalPage from '../modules/customer-portal/pages/CustomerProposalPage'
import CustomerProposalSignPage from '../modules/customer-portal/pages/CustomerProposalSignPage'

// Non-Customer Portal
import PortalLoginPage from '../modules/noncustomer-portal/pages/PortalLoginPage'
import PortalLayout from '../modules/noncustomer-portal/components/PortalLayout'
import CustomersListPage from '../modules/noncustomer-portal/pages/CustomersListPage'
import CustomerDetailsPage from '../modules/noncustomer-portal/pages/CustomerDetailsPage'
import ProposalsListPage from '../modules/noncustomer-portal/pages/ProposalsListPage'
import ProposalDetailsPage from '../modules/noncustomer-portal/pages/ProposalDetailsPage'
import ProposalCreatePage from '../modules/noncustomer-portal/pages/ProposalCreatePage'
import ProposalAuditPage from '../modules/noncustomer-portal/pages/ProposalAuditPage'
import SettingsPage from '../modules/noncustomer-portal/pages/SettingsPage'
import CustomerVerificationPage from '../modules/customer-portal/pages/CustomerVerificationPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/customer/login" replace />} />

      {/* Customer Portal Routes */}
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/customer/sign/:token" element={<CustomerVerificationPage />} />

      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute customer>
            <CustomerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/proposals/:proposalId"
        element={
          <ProtectedRoute customer>
            <CustomerProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/proposals/:proposalId/sign"
        element={
          <ProtectedRoute customer>
            <CustomerProposalSignPage />
          </ProtectedRoute>
        }
      />

      {/* Non-Customer Portal Routes */}
      <Route path="/portal/login" element={<PortalLoginPage />} />
      <Route
        path="/portal/*"
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/portal/proposals" replace />} />
        <Route path="customers" element={<CustomersListPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailsPage />} />
        <Route path="proposals" element={<ProposalsListPage />} />
        <Route path="proposals/new" element={<ProposalCreatePage />} />
        <Route path="proposals/:proposalId" element={<ProposalDetailsPage />} />
        <Route path="proposals/:proposalId/audit" element={<ProposalAuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
