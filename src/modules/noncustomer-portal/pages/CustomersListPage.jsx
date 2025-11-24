import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, User, Building2, Mail, Phone, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const CustomersListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  // Fetch customers
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.getCustomers(filters)
  })

  const customers = customersData?.items || []

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      Inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
      Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
    }

    const config = statusConfig[status] || statusConfig.Active

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Search by name, email, or business key..."
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.search
              ? 'Try adjusting your filters'
              : 'Get started by adding your first customer'}
          </p>
          {!filters.status && !filters.search && (
            <button
              onClick={handleCreateCustomer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Key
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
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
                    <StatusBadge status={customer.status || 'Active'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-600">
                      {customer.businessKey || 'N/A'}
                    </div>
                  </td>
                </motion.tr>
              ))}
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
