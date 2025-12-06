#!/bin/bash

# Customers List Page
cat > /home/claude/jenussign-frontend/src/modules/noncustomer-portal/pages/CustomersListPage.jsx << 'EOF'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Search, Plus, Mail, Phone, Building, User as UserIcon, ChevronRight } from 'lucide-react'
import customersApi from '../../../api/customersApi'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'

export default function CustomersListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, statusFilter],
    queryFn: () =>
      customersApi.getCustomers({
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  })

  const customers = data?.items || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading message="Loading customers..." />
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">No customers match your search criteria.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/portal/customers/${customer.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {customer.customerType === 'Individual' ? (
                            <UserIcon className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Building className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.fullName || customer.legalName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.insuranceCoreCustomerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{customer.customerType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center ml-auto">
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
EOF

echo "Created CustomersListPage.jsx"

# Customer Details Page
cat > /home/claude/jenussign-frontend/src/modules/noncustomer-portal/pages/CustomerDetailsPage.jsx << 'EOF'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Building, Mail, Phone, MapPin, FileText, Plus, Calendar } from 'lucide-react'
import customersApi from '../../../api/customersApi'
import proposalsApi from '../../../api/proposalsApi'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

export default function CustomerDetailsPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getCustomer(customerId),
  })

  const { data: proposalsData, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals', customerId],
    queryFn: () => proposalsApi.getProposals({ customerId }),
  })

  if (customerLoading) return <Loading fullScreen message="Loading customer..." />

  const proposals = proposalsData?.items || []

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/portal/customers')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customers</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                {customer?.customerType === 'Individual' ? (
                  <User className="w-10 h-10 text-primary-600" />
                ) : (
                  <Building className="w-10 h-10 text-primary-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer?.fullName || customer?.legalName}
              </h2>
              <p className="text-gray-600">{customer?.customerType}</p>
              <div className="mt-3">
                <StatusBadge status={customer?.status} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{customer?.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900">{customer?.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Country</p>
                  <p className="text-gray-900">{customer?.country}</p>
                </div>
              </div>
            </div>

            {customer?.individual && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Individual Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date of Birth</span>
                    <span className="font-medium">{formatDate(customer.individual.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">National ID</span>
                    <span className="font-medium">{customer.individual.nationalId}</span>
                  </div>
                </div>
              </div>
            )}

            {customer?.company && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Company Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registration No</span>
                    <span className="font-medium">{customer.company.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registration Date</span>
                    <span className="font-medium">{formatDate(customer.company.registrationDate)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Proposals</h3>
              <button
                onClick={() => navigate(`/portal/proposals/new?customerId=${customerId}`)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Proposal</span>
              </button>
            </div>

            {proposalsLoading ? (
              <Loading message="Loading proposals..." />
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-gray-600 mb-4">Create the first proposal for this customer</p>
                <button
                  onClick={() => navigate(`/portal/proposals/new?customerId=${customerId}`)}
                  className="btn btn-primary"
                >
                  Create Proposal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    onClick={() => navigate(`/portal/proposals/${proposal.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{proposal.productType}</h4>
                        <p className="text-sm text-gray-600">{proposal.proposalRef}</p>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(proposal.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
EOF

echo "Created CustomerDetailsPage.jsx"

