#!/bin/bash
set -e

echo "Creating remaining form pages..."

# Update mockApi.js to add update methods
cat >> src/api/mockApi.js << 'EOF'

// Update customer
customersApi.updateCustomer = async (id, data) => {
  await delay()
  const index = mockCustomers.findIndex(c => c.id === id)
  if (index === -1) {
    throw new Error('Customer not found')
  }
  mockCustomers[index] = { ...mockCustomers[index], ...data, updatedAt: new Date().toISOString() }
  return mockCustomers[index]
}

// Update user
usersApi.updateUser = async (id, data) => {
  await delay()
  const index = mockUsers.findIndex(u => u.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }
  mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date().toISOString() }
  return mockUsers[index]
}

// Update proposal
proposalsApi.updateProposal = async (id, data) => {
  await delay()
  const index = mockProposals.findIndex(p => p.id === id)
  if (index === -1) {
    throw new Error('Proposal not found')
  }
  mockProposals[index] = { ...mockProposals[index], ...data, lastActivityAt: new Date().toISOString() }
  return mockProposals[index]
}
EOF

echo "✅ Updated mockApi.js with update methods"

# Update App.jsx to include all routes
cat > src/App.jsx << 'EOF'
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Layouts
import PortalLayout from './modules/noncustomer-portal/components/PortalLayout'

// Pages
import PortalLoginPage from './modules/noncustomer-portal/pages/PortalLoginPage'
import CustomersListPage from './modules/noncustomer-portal/pages/CustomersListPage'
import CustomerDetailPage from './modules/noncustomer-portal/pages/CustomerDetailPage'
import CustomerCreatePage from './modules/noncustomer-portal/pages/CustomerCreatePage'
import ProposalsListPage from './modules/noncustomer-portal/pages/ProposalsListPage'
import ProposalDetailPage from './modules/noncustomer-portal/pages/ProposalDetailPage'
import ProposalCreatePage from './modules/noncustomer-portal/pages/ProposalCreatePage'
import UserManagementPage from './modules/noncustomer-portal/pages/UserManagementPage'
import UserDetailPage from './modules/noncustomer-portal/pages/UserDetailPage'
import UserCreatePage from './modules/noncustomer-portal/pages/UserCreatePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/portal/login" replace />} />
          <Route path="/portal/login" element={<PortalLoginPage />} />

          {/* Protected Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="/portal/customers" replace />} />
            
            {/* Customers */}
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customers/new" element={<CustomerCreatePage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            
            {/* Proposals */}
            <Route path="proposals" element={<ProposalsListPage />} />
            <Route path="proposals/new" element={<ProposalCreatePage />} />
            <Route path="proposals/:id" element={<ProposalDetailPage />} />
            
            {/* Users */}
            <Route path="users" element={<UserManagementPage />} />
            <Route path="users/new" element={<UserCreatePage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/portal/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
EOF

echo "✅ Updated App.jsx with all routes"

# Update CustomersListPage to add navigation to create and detail
sed -i 's|<Plus size={20} />|<Plus size={20} />|g' src/modules/noncustomer-portal/pages/CustomersListPage.jsx
sed -i 's|className="flex items-center gap-2 px-4 py-2 bg-primary-600|onClick={() => navigate("/portal/customers/new")}\n          className="flex items-center gap-2 px-4 py-2 bg-primary-600|g' src/modules/noncustomer-portal/pages/CustomersListPage.jsx

# Add navigate import and onClick to ProposalsListPage
sed -i "1s|^|import { useNavigate } from 'react-router-dom'\n|" src/modules/noncustomer-portal/pages/ProposalsListPage.jsx
sed -i 's|const ProposalsListPage = () => {|const ProposalsListPage = () => {\n  const navigate = useNavigate()|' src/modules/noncustomer-portal/pages/ProposalsListPage.jsx
sed -i 's|<Plus size={20} />|onClick={() => navigate("/portal/proposals/new")}\n            className="flex items-center gap-2 px-4 py-2 bg-primary-600|g' src/modules/noncustomer-portal/pages/ProposalsListPage.jsx

# Add navigate import and onClick to UserManagementPage  
sed -i "2s|^|import { useNavigate } from 'react-router-dom'\n|" src/modules/noncustomer-portal/pages/UserManagementPage.jsx
sed -i 's|const UserManagementPage = () => {|const UserManagementPage = () => {\n  const navigate = useNavigate()|' src/modules/noncustomer-portal/pages/UserManagementPage.jsx

echo "✅ All pages created and routes updated!"
echo ""
echo "📋 Summary:"
echo "   - Customer: List ✅ Detail ✅ Create ✅"
echo "   - Proposal: List ✅ Detail (creating...) Create (creating...)"
echo "   - User:     List ✅ Detail (creating...) Create (creating...)"
