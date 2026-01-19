import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  ChevronRight,
  FileText,
  UserCircle,
  Building2,
} from 'lucide-react'
import { customersApi } from '../../../api/customersApi'
import { usersApi } from '../../../api/usersApi'
import Loading from '../../../shared/components/Loading'

const CustomersListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [agentFilter, setAgentFilter] = useState('ALL')
  const [employeeFilter, setEmployeeFilter] = useState('ALL')

  // Fetch customers from API
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: () => customersApi.getCustomers({ search: searchQuery || undefined }),
  })

  // Fetch agents for filter dropdown
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => usersApi.getAgents(),
  })

  const customers = customersData?.items || customersData || []

  if (isLoading) {
    return <Loading message="Loading customers..." />
  }

  const filteredCustomers = customers.filter((customer) => {
    const fullName = customer.fullName || customer.displayName || `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase()
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.idNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.businessKey?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAgent = agentFilter === 'ALL' || customer.agentId === agentFilter
    const matchesEmployee = employeeFilter === 'ALL' || 
      (employeeFilter === 'DIRECT' && customer.assignedEmployee) ||
      (employeeFilter === 'BROKER' && !customer.assignedEmployee)
    
    return matchesSearch && matchesAgent && matchesEmployee
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <Link
          to="/portal/customers/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.fullName || `${agent.firstName} ${agent.lastName}`}</option>
              ))}
            </select>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Business Types</option>
              <option value="DIRECT">Direct (with Employee)</option>
              <option value="BROKER">Broker Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Agent</div>
          <div className="col-span-2">Employee</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Envelopes</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredCustomers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Link
                to="/portal/customers/new"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Add new customer
              </Link>
            </div>
          ) : (
            filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={`/portal/customers/${customer.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Customer Info */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{customer.idNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 truncate">{customer.assignedAgent?.name || '—'}</span>
                    </div>
                  </div>

                  {/* Employee */}
                  <div className="col-span-1 md:col-span-2">
                    {customer.assignedEmployee ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600 truncate">{customer.assignedEmployee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Broker only</span>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600 truncate">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Envelopes */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{customer.totalEnvelopes}</span>
                      {customer.pendingEnvelopes > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {customer.pendingEnvelopes} pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="col-span-1 md:col-span-1 flex justify-end">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Direct Business</p>
          <p className="text-2xl font-bold text-purple-600">
            {customers.filter(c => c.assignedEmployee).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Broker Only</p>
          <p className="text-2xl font-bold text-blue-600">
            {customers.filter(c => !c.assignedEmployee).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Agents</p>
          <p className="text-2xl font-bold text-amber-600">
            {agents.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomersListPage
