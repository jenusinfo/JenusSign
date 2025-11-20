import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, FileText, Calendar, User, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { proposalsApi, customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const ProposalsListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    customerId: ''
  })

  // Fetch proposals
  const { data: proposalsData, isLoading, error } = useQuery({
    queryKey: ['proposals', filters],
    queryFn: () => proposalsApi.getProposals(filters)
  })

  // Fetch customers for reference
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 })
  })

  const proposals = proposalsData?.items || []
  const customers = customersData?.items || []

  // Helper to get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.fullName || customer?.legalName || 'Unknown Customer'
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      PendingSignature: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Signature' },
      InProgress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
      Signed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Signed' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      Expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' }
    }

    const config = statusConfig[status] || statusConfig.Draft

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Proposals</h3>
            <p className="text-sm text-red-700 mt-1">{error.message || 'Failed to load proposals'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-1">
            Manage insurance proposals and signing requests
          </p>
        </div>
        <button
          onClick={handleCreateProposal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <motion.tr
                  key={proposal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={ () => {	  
				   console.log('📦 Full proposal object:', proposal)  // ⭐ Add this
				   console.log('🔑 Proposal ID:', proposal.id)        // ⭐ Add this
				  handleViewProposal(proposal.id)}}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCustomerName(proposal.customerId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {proposal.productType || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(proposal.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatDate(proposal.expiryDate)}
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
        <div className="text-sm text-gray-600 text-center">
          Showing {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default ProposalsListPage
