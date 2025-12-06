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
import CustomerDetailPage from '../modules/noncustomer-portal/pages/CustomerDetailPage'
import CustomerCreatePage from '../modules/noncustomer-portal/pages/CustomerCreatePage'


import ProposalsListPage from '../modules/noncustomer-portal/pages/ProposalsListPage'
import ProposalDetailsPage from '../modules/noncustomer-portal/pages/ProposalDetailsPage'
import ProposalCreatePage from '../modules/noncustomer-portal/pages/ProposalCreatePage'
import ProposalAuditPage from '../modules/noncustomer-portal/pages/ProposalAuditPage'

import SettingsPage from '../modules/noncustomer-portal/pages/SettingsPage'

import CustomerVerificationPage from '../modules/customer-portal/pages/CustomerVerificationPage'

import UserManagementPage from '../modules/noncustomer-portal/pages/UserManagementPage'
import UserCreatePage from '../modules/noncustomer-portal/pages/UserCreatePage'
import UserDetailPage from '../modules/noncustomer-portal/pages/UserDetailPage'
import DashboardPage from '../modules/noncustomer-portal/pages/DashboardPage'

import BrokersListPage from '../modules/noncustomer-portal/pages/BrokersListPage'
import BrokerDetailPage from '../modules/noncustomer-portal/pages/BrokerDetailPage'
import AgentsListPage from '../modules/noncustomer-portal/pages/AgentsListPage'
import AgentDetailPage from '../modules/noncustomer-portal/pages/AgentDetailPage'

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
        {/* Default landing page for /portal */}
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersListPage />} />
        <Route path="customers/new" element={<CustomerCreatePage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />


        {/* Proposals */}
        <Route path="proposals" element={<ProposalsListPage />} />
        <Route path="proposals/new" element={<ProposalCreatePage />} />
        <Route path="proposals/:proposalId" element={<ProposalDetailsPage />} />
        <Route path="proposals/:proposalId/audit" element={<ProposalAuditPage />} />

        {/* Brokers */}
        <Route path="brokers" element={<BrokersListPage />} />
        <Route path="brokers/:brokerId" element={<BrokerDetailPage />} />

        {/* Agents */}
        <Route path="agents" element={<AgentsListPage />} />
        <Route path="agents/:agentId" element={<AgentDetailPage />} />


        {/* Users */}
        <Route path="users" element={<UserManagementPage />} />
        <Route path="users/new" element={<UserCreatePage />} />
        <Route path="users/:id" element={<UserDetailPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>



      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
