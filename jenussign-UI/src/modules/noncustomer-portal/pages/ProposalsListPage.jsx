import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  Send,
  Eye,
  Download,
  MoreVertical,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react'


import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { proposalsApi, customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import StatusBadge from '../../../shared/components/StatusBadge'

const ProposalsListPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAdmin, isEmployee } = useAuthStore()
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    customerId: ''
  })
  const [activeDropdown, setActiveDropdown] = useState(null)

  // Fetch proposals
  const { data: proposalsData, isLoading, error, refetch } = useQuery({
    queryKey: ['proposals', filters],
    queryFn: () => proposalsApi.getProposals(filters)
  })

  // Fetch customers for reference
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 })
  })

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: (proposalId) => proposalsApi.sendInvitation(proposalId, {
      emailSubject: 'Reminder: Your Insurance Proposal',
      emailBodyTemplateKey: 'ProposalReminderDefault'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals'])
      toast.success('Invitation resent successfully')
      setActiveDropdown(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend invitation')
    }
  })

  const proposals = proposalsData?.items || []
  const customers = customersData?.items || []

  const totalProposals = proposals.length
  const pendingProposals = proposals.filter(
      (p) => p.status === 'PENDING' || p.status === 'PendingSignature'
    ).length
    const signedProposals = proposals.filter(
      (p) => p.status === 'SIGNED' || p.status === 'Signed'
    ).length
    const expiredProposals = proposals.filter(
      (p) => p.status === 'EXPIRED' || p.status === 'Expired'
    ).length
  // Helper to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
      // Derived statistics for stat cards


    return customer?.fullName || customer?.legalName || 'Unknown Customer'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Handle navigation
  const handleCreateProposal = () => {
    navigate('/portal/proposals/new')
  }

  const handleViewProposal = (proposalId) => {
    navigate(`/portal/proposals/${proposalId}`)
  }

  const handleViewAudit = (proposalId) => {
    navigate(`/portal/proposals/${proposalId}/audit`)
    setActiveDropdown(null)
  }

  const handleResendInvitation = (e, proposalId) => {
    e.stopPropagation()
    resendMutation.mutate(proposalId)
  }

  // Check if proposal can have invitation resent
  const canResend = (status) => {
    return ['PendingSignature', 'Expired', 'Draft'].includes(status)
  }

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    if (activeDropdown) {
      setActiveDropdown(null)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Proposals</h3>
            <p className="text-sm text-red-700 mt-1">{error.message || 'Failed to load proposals'}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" onClick={handleClickOutside}>
      {/* Header */}
            <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-1">
            Manage insurance proposals and signing requests
          </p>
        </div>
        <button
          onClick={handleCreateProposal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Total */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total proposals
            </p>
            <p className="text-xl font-bold text-gray-900">
              {totalProposals}
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Pending
            </p>
            <p className="text-xl font-bold text-gray-900">
              {pendingProposals}
            </p>
          </div>
        </div>

        {/* Signed */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Signed
            </p>
            <p className="text-xl font-bold text-gray-900">
              {signedProposals}
            </p>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <XCircle className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Expired
            </p>
            <p className="text-xl font-bold text-gray-900">
              {expiredProposals}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search proposals..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="PendingSignature">Pending Signature</option>
                <option value="InProgress">In Progress</option>
                <option value="Signed">Signed</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.customerId}
                onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName || customer.legalName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Found</h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.search || filters.customerId
              ? 'Try adjusting your filters'
              : 'Get started by creating your first proposal'}
          </p>
          {!filters.status && !filters.search && !filters.customerId && (
            <button
              onClick={handleCreateProposal}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <motion.tr
                  key={proposal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {proposal.proposalRef || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {proposal.businessKey || proposal.insuranceCoreProposalId || 'No business key'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <div className="text-sm text-gray-900">
                      {getCustomerName(proposal.customerId)}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <div className="text-sm text-gray-900">
                      {proposal.productType || 'N/A'}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(proposal.createdAt)}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => handleViewProposal(proposal.id)}
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatDate(proposal.expiryDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Quick Action: Resend (if applicable) */}
                      {canResend(proposal.status) && (
                        <button
                          onClick={(e) => handleResendInvitation(e, proposal.id)}
                          disabled={resendMutation.isPending}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Resend Invitation"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Quick Action: View */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProposal(proposal.id)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* More Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDropdown(activeDropdown === proposal.id ? null : proposal.id)
                          }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === proposal.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewProposal(proposal.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                
                                {proposal.status === 'Signed' && (
                                  <button
                                    onClick={() => {
                                      toast.success('Download started')
                                      setActiveDropdown(null)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                  </button>
                                )}

                                {(isAdmin() || isEmployee()) && (
                                  <button
                                    onClick={() => handleViewAudit(proposal.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <History className="w-4 h-4" />
                                    View Audit Trail
                                  </button>
                                )}

                                {canResend(proposal.status) && (
                                  <button
                                    onClick={(e) => handleResendInvitation(e, proposal.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                  >
                                    <Send className="w-4 h-4" />
                                    Resend Invitation
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {proposals.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              {proposals.filter(p => p.status === 'PendingSignature').length} pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              {proposals.filter(p => p.status === 'Signed').length} signed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full" />
              {proposals.filter(p => p.status === 'Expired').length} expired
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalsListPage
