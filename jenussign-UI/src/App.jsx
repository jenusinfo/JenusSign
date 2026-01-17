import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Auth store
import useAuthStore from './shared/store/authStore'

// Loading component
import Loading from './shared/components/Loading'

// ============================================================================
// LAZY LOADED COMPONENTS - Customer Portal
// ============================================================================
const CustomerLoginPage = lazy(() => import('./modules/customer-portal/pages/CustomerLoginPage'))
const CustomerDashboardPage = lazy(() => import('./modules/customer-portal/pages/CustomerDashboardPage'))
const CustomerSignPage = lazy(() => import('./modules/customer-portal/pages/CustomerSignPage'))
const CustomerVerificationPage = lazy(() => import('./modules/customer-portal/pages/CustomerVerificationPage'))

// ============================================================================
// LAZY LOADED COMPONENTS - Agent/Broker Portal
// ============================================================================
const PortalLayout = lazy(() => import('./modules/noncustomer-portal/layouts/PortalLayout'))
const AgentLoginPage = lazy(() => import('./modules/noncustomer-portal/pages/AgentLoginPage'))
const DashboardPage = lazy(() => import('./modules/noncustomer-portal/pages/DashboardPage'))

// Envelopes
const EnvelopesListPage = lazy(() => import('./modules/noncustomer-portal/pages/EnvelopesListPage'))
const EnvelopeDetailPage = lazy(() => import('./modules/noncustomer-portal/pages/EnvelopeDetailPage'))
const EnvelopeCreatePage = lazy(() => import('./modules/noncustomer-portal/pages/EnvelopeCreatePage'))

// Customers
const CustomersListPage = lazy(() => import('./modules/noncustomer-portal/pages/CustomersListPage'))
const CustomerDetailPage = lazy(() => import('./modules/noncustomer-portal/pages/CustomerDetailPage'))
const CustomerCreatePage = lazy(() => import('./modules/noncustomer-portal/pages/CustomerCreatePage'))

// Agents
const AgentsListPage = lazy(() => import('./modules/noncustomer-portal/pages/AgentsListPage'))
const AgentDetailPage = lazy(() => import('./modules/noncustomer-portal/pages/AgentDetailPage'))

// Brokers
const BrokersListPage = lazy(() => import('./modules/noncustomer-portal/pages/BrokersListPage'))
const BrokerDetailPage = lazy(() => import('./modules/noncustomer-portal/pages/BrokerDetailPage'))

// Users & Settings
const UserManagementPage = lazy(() => import('./modules/noncustomer-portal/pages/UserManagementPage'))
const UserDetailPage = lazy(() => import('./modules/noncustomer-portal/pages/UserDetailPage'))
const UserCreatePage = lazy(() => import('./modules/noncustomer-portal/pages/UserCreatePage'))
const SettingsPage = lazy(() => import('./modules/noncustomer-portal/pages/SettingsPage'))
const SystemLogsPage = lazy(() => import('./modules/noncustomer-portal/pages/SystemLogsPage'))

// Create Pages
const AgentCreatePage = lazy(() => import('./modules/noncustomer-portal/pages/AgentCreatePage'))
const BrokerCreatePage = lazy(() => import('./modules/noncustomer-portal/pages/BrokerCreatePage'))

// Signing Workflows
const AgentAssistedSigningPage = lazy(() => import('./modules/noncustomer-portal/pages/AgentAssistedSigningPage'))
const PhysicalSignatureUploadPage = lazy(() => import('./modules/noncustomer-portal/pages/PhysicalSignatureUploadPage'))

// Verification Portal
const DocumentVerificationPage = lazy(() => import('./modules/customer-portal/pages/DocumentVerificationPage'))

// ============================================================================
// QUERY CLIENT
// ============================================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// ============================================================================
// PROTECTED ROUTE COMPONENTS
// ============================================================================

// Customer Portal Protection
const CustomerProtectedRoute = ({ children }) => {
  const { isCustomerAuthenticated, customerToken, customer } = useAuthStore()
  
  const isAuth = typeof isCustomerAuthenticated === 'function' 
    ? isCustomerAuthenticated() 
    : !!(customerToken && customer)
  
  if (!isAuth) {
    return <Navigate to="/customer/login" replace />
  }
  return children
}

// Agent Portal Protection
const AgentProtectedRoute = ({ children }) => {
  const { isAgentAuthenticated, isAuthenticated, agentToken, agent, token, user } = useAuthStore()
  
  const isAuth = 
    (typeof isAgentAuthenticated === 'function' && isAgentAuthenticated()) ||
    (typeof isAuthenticated === 'function' && isAuthenticated()) ||
    !!(agentToken && agent) ||
    !!(token && user)
  
  if (!isAuth) {
    return <Navigate to="/portal/login" replace />
  }
  return children
}

// ============================================================================
// 404 PAGE
// ============================================================================
const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl font-bold text-gray-400">404</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Go to Home
      </a>
    </div>
  </div>
)

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading fullScreen message="Loading..." />}>
          <Routes>
            {/* ============================================ */}
            {/* ROOT REDIRECT */}
            {/* ============================================ */}
            <Route path="/" element={<Navigate to="/portal/login" replace />} />

            {/* ============================================ */}
            {/* CUSTOMER PORTAL ROUTES */}
            {/* ============================================ */}
            <Route path="/customer">
              <Route path="login" element={<CustomerLoginPage />} />
              <Route
                path="dashboard"
                element={
                  <CustomerProtectedRoute>
                    <CustomerDashboardPage />
                  </CustomerProtectedRoute>
                }
              />
              {/* Token-based verification (from email link) */}
              <Route path="verify/:token" element={<CustomerVerificationPage />} />
              {/* Token-based signing (after verification) */}
              <Route path="sign/:token" element={<CustomerSignPage />} />
              {/* Redirect /customer to login */}
              <Route index element={<Navigate to="/customer/login" replace />} />
            </Route>

            {/* ============================================ */}
            {/* AGENT/BROKER PORTAL ROUTES */}
            {/* ============================================ */}
            <Route path="/portal">
              {/* Public: Login */}
              <Route path="login" element={<AgentLoginPage />} />
              
              {/* Protected: Dashboard & Management */}
              <Route
                element={
                  <AgentProtectedRoute>
                    <PortalLayout />
                  </AgentProtectedRoute>
                }
              >
                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route index element={<Navigate to="/portal/dashboard" replace />} />

                {/* Envelopes */}
                <Route path="envelopes" element={<EnvelopesListPage />} />
                <Route path="envelopes/new" element={<EnvelopeCreatePage />} />
                <Route path="envelopes/:id" element={<EnvelopeDetailPage />} />

                {/* Legacy: Proposals (redirect to envelopes) */}
                <Route path="proposals" element={<Navigate to="/portal/envelopes" replace />} />
                <Route path="proposals/new" element={<Navigate to="/portal/envelopes/new" replace />} />
                <Route path="proposals/:id" element={<EnvelopeDetailPage />} />

                {/* Signing Workflows */}
                <Route path="envelopes/:envelopeId/sign/assisted" element={<AgentAssistedSigningPage />} />
                <Route path="envelopes/:envelopeId/sign/physical" element={<PhysicalSignatureUploadPage />} />

                {/* Customers */}
                <Route path="customers" element={<CustomersListPage />} />
                <Route path="customers/new" element={<CustomerCreatePage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />

                {/* Agents */}
                <Route path="agents" element={<AgentsListPage />} />
                <Route path="agents/new" element={<AgentCreatePage />} />
                <Route path="agents/:id" element={<AgentDetailPage />} />

                {/* Brokers */}
                <Route path="brokers" element={<BrokersListPage />} />
                <Route path="brokers/new" element={<BrokerCreatePage />} />
                <Route path="brokers/:id" element={<BrokerDetailPage />} />

                {/* Users (Admin only) */}
                <Route path="users" element={<UserManagementPage />} />
                <Route path="users/new" element={<UserCreatePage />} />
                <Route path="users/:id" element={<UserDetailPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />

                {/* System Logs (Admin only) */}
                <Route path="logs" element={<SystemLogsPage />} />
              </Route>
            </Route>

            {/* ============================================ */}
            {/* VERIFICATION PORTAL (Public) */}
            {/* ============================================ */}
            <Route path="/verify" element={<DocumentVerificationPage />} />
            <Route path="/verify/:code" element={<DocumentVerificationPage />} />

            {/* ============================================ */}
            {/* LEGACY REDIRECTS */}
            {/* ============================================ */}
            <Route path="/agent/*" element={<Navigate to="/portal/login" replace />} />
            
            {/* ============================================ */}
            {/* 404 CATCH-ALL */}
            {/* ============================================ */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
