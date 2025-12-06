import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Send,
  AlertCircle,
  ArrowRight,
  Calendar,
  Activity,
} from 'lucide-react'
import { proposalsApi, customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import StatusBadge from '../../../shared/components/StatusBadge'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isEmployee, isBroker, isAgent } = useAuthStore()

  // Fetch proposals
  const { data: proposalsData, isLoading: proposalsLoading } = useQuery({
    queryKey: ['dashboard-proposals'],
    queryFn: () => proposalsApi.getProposals({ pageSize: 100 }),
  })

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['dashboard-customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 }),
  })

  const proposals = proposalsData?.items || []
  const customers = customersData?.items || []

  // Calculate statistics
  const stats = {
    totalProposals: proposals.length,
    pendingSignature: proposals.filter(p => p.status === 'PendingSignature').length,
    inProgress: proposals.filter(p => p.status === 'InProgress').length,
    signed: proposals.filter(p => p.status === 'Signed' || p.status === 'Completed').length,
    expired: proposals.filter(p => p.status === 'Expired').length,
    totalCustomers: customers.length,
  }

  // Calculate completion rate
  const completionRate = stats.totalProposals > 0 
    ? Math.round((stats.signed / stats.totalProposals) * 100) 
    : 0

  // Get recent proposals (last 5)
  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt))
    .slice(0, 5)

  // Get customer name helper
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.fullName || customer?.legalName || 'Unknown Customer'
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isLoading = proposalsLoading || customersLoading

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.displayName || 'User'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proposals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Proposals</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {isLoading ? '...' : stats.totalProposals}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </motion.div>

        {/* Pending Signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Signature</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {isLoading ? '...' : stats.pendingSignature}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/portal/proposals?status=PendingSignature')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            >
              View all pending
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </motion.div>

        {/* Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Signed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {isLoading ? '...' : stats.signed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-600">
                {completionRate}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {isLoading ? '...' : stats.totalCustomers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/portal/customers')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              Manage customers
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
              </div>
              <button
                onClick={() => navigate('/portal/proposals')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : recentProposals.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No proposals yet</p>
                <button
                  onClick={() => navigate('/portal/proposals/new')}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first proposal
                </button>
              </div>
            ) : (
              recentProposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(`/portal/proposals/${proposal.id}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {proposal.proposalRef || proposal.businessKey}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {getCustomerName(proposal.customerId)}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(proposal.createdAt)}
                          </span>
                          <span>{proposal.productType}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions & Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/portal/proposals/new')}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Create Proposal</span>
              </button>
              <button
                onClick={() => navigate('/portal/customers/new')}
                className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Add Customer</span>
              </button>
              <button
                onClick={() => navigate('/portal/proposals?status=PendingSignature')}
                className="w-full flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">Resend Invitations</span>
              </button>
            </div>
          </div>

          {/* Alerts/Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
            <div className="space-y-3">
              {stats.expired > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {stats.expired} expired proposal{stats.expired !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Consider resending invitations
                    </p>
                  </div>
                </div>
              )}
              
              {stats.pendingSignature > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.pendingSignature} awaiting signature
                    </p>
                    <p className="text-xs text-yellow-600 mt-0.5">
                      Customers have been notified
                    </p>
                  </div>
                </div>
              )}

              {stats.expired === 0 && stats.pendingSignature === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All caught up!
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      No pending actions required
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role-specific Info */}
          {(isAdmin() || isEmployee()) && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-2">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-100">eIDAS Compliance</span>
                  <span className="font-medium">Active ✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">TSA Service</span>
                  <span className="font-medium">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Key Vault</span>
                  <span className="font-medium">Connected</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
