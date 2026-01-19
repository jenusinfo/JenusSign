import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  ChevronRight,
  Users,
  FileText,
  MapPin,
} from 'lucide-react'
import { usersApi } from '../../../api/usersApi'
import Loading from '../../../shared/components/Loading'

const BrokersListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Fetch brokers from API
  const { data: brokers = [], isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => usersApi.getBrokers(),
  })

  if (isLoading) {
    return <Loading message="Loading brokers..." />
  }

  // Transform brokers to expected format
  const transformedBrokers = brokers.map(broker => ({
    id: broker.id,
    name: broker.companyName || `${broker.firstName || ''} ${broker.lastName || ''}`.trim() || broker.email,
    registrationNumber: broker.businessKey || '',
    email: broker.email || '',
    phone: broker.phone || '',
    address: broker.address || '',
    contactPerson: `${broker.firstName || ''} ${broker.lastName || ''}`.trim(),
    status: broker.isActive ? 'active' : 'inactive',
    totalAgents: broker.agentCount || 0,
    totalCustomers: broker.customerCount || 0,
    totalEnvelopes: broker.envelopeCount || 0,
    createdAt: broker.createdAt,
  }))

  const filteredBrokers = transformedBrokers.filter((broker) => {
    const matchesSearch =
      broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || broker.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
          <p className="text-gray-500 mt-1">Manage insurance broker companies</p>
        </div>
        <Link
          to="/portal/brokers/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Broker
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brokers by name, email, or registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Brokers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBrokers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No brokers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredBrokers.map((broker, index) => (
            <motion.div
              key={broker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/portal/brokers/${broker.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{broker.name}</h3>
                      <p className="text-sm text-gray-500">{broker.registrationNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    broker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {broker.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{broker.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {broker.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {broker.address}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{broker.totalAgents}</span>
                      <span className="text-gray-500">agents</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{broker.totalEnvelopes}</span>
                      <span className="text-gray-500">envelopes</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Brokers</p>
          <p className="text-2xl font-bold text-gray-900">{transformedBrokers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="text-2xl font-bold text-blue-600">
            {transformedBrokers.reduce((sum, b) => sum + b.totalAgents, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-purple-600">
            {transformedBrokers.reduce((sum, b) => sum + b.totalCustomers, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Envelopes</p>
          <p className="text-2xl font-bold text-green-600">
            {transformedBrokers.reduce((sum, b) => sum + b.totalEnvelopes, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BrokersListPage
