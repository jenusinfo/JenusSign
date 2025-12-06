import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { customersApi, proposalsApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import StatusBadge from '../../../shared/components/StatusBadge'

const CustomersListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    customerType: ''
  })

  // Fetch customers
  const { data: customersData, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.getCustomers(filters)
  })

  // Fetch proposals for counting
  const { data: proposalsData } = useQuery({
    queryKey: ['all-proposals'],
    queryFn: () => proposalsApi.getProposals({ pageSize: 500 })
  })

  const customers = customersData?.items || []
  const proposals = proposalsData?.items || []

  // Get proposal count for a customer
  const getProposalCount = (customerId) => {
    return proposals.filter(p => p.customerId === customerId).length
  }

  // Get pending proposal count for a customer
  const getPendingCount = (customerId) => {
    return proposals.filter(p => 
      p.customerId === customerId && 
      ['PendingSignature', 'InProgress'].includes(p.status)
    ).length
  }

  // Handle navigation
  const handleCreateCustomer = () => {
    navigate('/portal/customers/new')
  }

  const handleViewCustomer = (customerId) => {
    navigate(`/portal/customers/${customerId}`)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Customers</h3>
            <p className="text-sm text-red-700 mt-1">{error.message || 'Failed to load customers'}</p>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage individual and company customers
          </p>
        </div>
        <button
          onClick={handleCreateCustomer}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.filter(c => c.customerType === 'Company').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Individuals</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.filter(c => c.customerType === 'Individual' || !c.customerType).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Proposals</p>
              <p className="text-xl font-bold text-gray-900">
                {proposals.filter(p => ['PendingSignature', 'InProgress'].includes(p.status)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email, or business key..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filters.customerType}
                onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Types</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
              </select>
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.search || filters.customerType
              ? 'Try adjusting your filters'
              : 'Get started by adding your first customer'}
          </p>
          {!filters.status && !filters.search && !filters.customerType && (
            <button
              onClick={handleCreateCustomer}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Key
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => {
                const proposalCount = getProposalCount(customer.id)
                const pendingCount = getPendingCount(customer.id)
                
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleViewCustomer(customer.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          customer.customerType === 'Company' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {customer.customerType === 'Company' ? (
                            <Building2 className={`w-5 h-5 ${
                              customer.customerType === 'Company' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.fullName || customer.legalName || 'Unnamed'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.insuranceCoreCustomerId || 'No ICS ID'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.customerType === 'Company'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {customer.customerType || 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {customer.email || 'N/A'}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{proposalCount}</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status || 'Active'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {customer.businessKey || 'N/A'}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {customers.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default CustomersListPage
