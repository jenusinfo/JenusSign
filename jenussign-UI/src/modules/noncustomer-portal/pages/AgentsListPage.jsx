import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  UserCircle,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  Users,
  FileText,
  Filter,
} from 'lucide-react'

const mockAgents = [
  {
    id: 'agent-001',
    name: 'Maria Georgiou',
    email: 'maria.g@hydrainsurance.com.cy',
    phone: '+357 99 111 222',
    idNumber: 'AG001',
    broker: { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
    status: 'active',
    totalCustomers: 45,
    totalEnvelopes: 120,
    pendingEnvelopes: 8,
    createdAt: '2023-01-15T10:00:00Z',
  },
  {
    id: 'agent-002',
    name: 'Andreas Papadopoulos',
    email: 'andreas.p@hydrainsurance.com.cy',
    phone: '+357 99 333 444',
    idNumber: 'AG002',
    broker: { id: 'broker-002', name: 'Mediterranean Insurance Services' },
    status: 'active',
    totalCustomers: 32,
    totalEnvelopes: 89,
    pendingEnvelopes: 5,
    createdAt: '2023-03-20T14:30:00Z',
  },
  {
    id: 'agent-003',
    name: 'Nikos Konstantinou',
    email: 'nikos.k@hydrainsurance.com.cy',
    phone: '+357 99 555 666',
    idNumber: 'AG003',
    broker: { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
    status: 'active',
    totalCustomers: 28,
    totalEnvelopes: 67,
    pendingEnvelopes: 3,
    createdAt: '2023-06-10T09:00:00Z',
  },
  {
    id: 'agent-004',
    name: 'Christina Antoniou',
    email: 'christina.a@hydrainsurance.com.cy',
    phone: '+357 99 777 888',
    idNumber: 'AG004',
    broker: { id: 'broker-003', name: 'Island Risk Solutions' },
    status: 'inactive',
    totalCustomers: 15,
    totalEnvelopes: 34,
    pendingEnvelopes: 0,
    createdAt: '2023-09-05T11:00:00Z',
  },
]

const mockBrokers = [
  { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
  { id: 'broker-002', name: 'Mediterranean Insurance Services' },
  { id: 'broker-003', name: 'Island Risk Solutions' },
]

const AgentsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [brokerFilter, setBrokerFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesBroker = brokerFilter === 'ALL' || agent.broker.id === brokerFilter
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter
    
    return matchesSearch && matchesBroker && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">Manage insurance agents and their assignments</p>
        </div>
        <Link
          to="/portal/agents/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Agent
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Brokers</option>
              {mockBrokers.map(broker => (
                <option key={broker.id} value={broker.id}>{broker.name}</option>
              ))}
            </select>
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
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-3">Agent</div>
          <div className="col-span-3">Broker</div>
          <div className="col-span-2">Customers</div>
          <div className="col-span-2">Envelopes</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAgents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No agents found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={`/portal/agents/${agent.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  {/* Agent Info */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                        {agent.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{agent.name}</p>
                        <p className="text-sm text-gray-500 truncate">{agent.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Broker */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{agent.broker.name}</span>
                    </div>
                  </div>

                  {/* Customers */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{agent.totalCustomers}</span>
                      <span className="text-gray-500">customers</span>
                    </div>
                  </div>

                  {/* Envelopes */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{agent.totalEnvelopes}</span>
                      {agent.pendingEnvelopes > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {agent.pendingEnvelopes} pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.status}
                    </span>
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
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="text-2xl font-bold text-gray-900">{mockAgents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {mockAgents.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockAgents.reduce((sum, a) => sum + a.totalCustomers, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Envelopes</p>
          <p className="text-2xl font-bold text-amber-600">
            {mockAgents.reduce((sum, a) => sum + a.pendingEnvelopes, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgentsListPage
