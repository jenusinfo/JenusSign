import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Edit,
  Save,
  X,
  Building2,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const mockAgents = {
  'agent-001': {
    id: 'agent-001',
    name: 'Maria Georgiou',
    email: 'maria.g@hydrainsurance.com.cy',
    phone: '+357 99 111 222',
    idNumber: 'AG001',
    licenseNumber: 'CY-INS-2020-1234',
    broker: { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
    status: 'active',
    createdAt: '2023-01-15T10:00:00Z',
    customers: [
      { id: 'cust-001', name: 'Yiannis Kleanthous', email: 'yiannis.k@email.com', pendingEnvelopes: 1 },
      { id: 'cust-003', name: 'Cyprus Trading Ltd', email: 'info@cyprustrading.com.cy', pendingEnvelopes: 0 },
    ],
    recentEnvelopes: [
      { id: 'env-001', reference: 'PR-2025-0001', customer: 'Yiannis Kleanthous', status: 'PENDING', date: '2025-01-15' },
      { id: 'env-003', reference: 'PR-2025-0003', customer: 'Cyprus Trading Ltd', status: 'COMPLETED', date: '2025-01-10' },
    ],
    stats: { totalCustomers: 45, totalEnvelopes: 120, pendingEnvelopes: 8, completedThisMonth: 12 },
  },
  'agent-002': {
    id: 'agent-002',
    name: 'Andreas Papadopoulos',
    email: 'andreas.p@hydrainsurance.com.cy',
    phone: '+357 99 333 444',
    idNumber: 'AG002',
    licenseNumber: 'CY-INS-2021-5678',
    broker: { id: 'broker-002', name: 'Mediterranean Insurance Services' },
    status: 'active',
    createdAt: '2023-03-20T14:30:00Z',
    customers: [
      { id: 'cust-002', name: 'Charis Constantinou', email: 'charis.c@email.com', pendingEnvelopes: 1 },
    ],
    recentEnvelopes: [
      { id: 'env-002', reference: 'PR-2025-0002', customer: 'Charis Constantinou', status: 'PENDING', date: '2025-01-14' },
    ],
    stats: { totalCustomers: 32, totalEnvelopes: 89, pendingEnvelopes: 5, completedThisMonth: 8 },
  },
}

const mockBrokers = [
  { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
  { id: 'broker-002', name: 'Mediterranean Insurance Services' },
  { id: 'broker-003', name: 'Island Risk Solutions' },
]

const AgentDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    setTimeout(() => {
      const data = mockAgents[id]
      if (data) {
        setAgent(data)
        setFormData(data)
      }
      setLoading(false)
    }, 500)
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleBrokerChange = (e) => {
    const broker = mockBrokers.find(b => b.id === e.target.value)
    setFormData({ ...formData, broker: broker || null })
  }

  const handleSave = () => {
    setAgent(formData)
    setEditing(false)
    toast.success('Agent updated successfully!')
  }

  const handleCancel = () => {
    setFormData(agent)
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      toast.success('Agent deleted successfully')
      navigate('/portal/agents')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Agent Not Found</h2>
        <Link to="/portal/agents" className="text-indigo-600 hover:text-indigo-700">Back to Agents</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/portal/agents')} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {agent.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-500">Agent • {agent.idNumber}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200">
                <X className="w-4 h-4 inline mr-2" />Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">
                <Save className="w-4 h-4 inline mr-2" />Save
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-xl font-medium hover:bg-indigo-100">
                <Edit className="w-4 h-4 inline mr-2" />Edit
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-red-600 bg-red-50 rounded-xl font-medium hover:bg-red-100">
                <Trash2 className="w-4 h-4 inline mr-2" />Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" />
            Customers
          </div>
          <p className="text-2xl font-bold text-gray-900">{agent.stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <FileText className="w-4 h-4" />
            Total Envelopes
          </div>
          <p className="text-2xl font-bold text-gray-900">{agent.stats.totalEnvelopes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <p className="text-2xl font-bold text-amber-600">{agent.stats.pendingEnvelopes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            This Month
          </div>
          <p className="text-2xl font-bold text-green-600">{agent.stats.completedThisMonth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Agent Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                {editing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900 font-medium">{agent.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Agent ID</label>
                {editing ? (
                  <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{agent.idNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                {editing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{agent.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                {editing ? (
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{agent.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                {editing ? (
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{agent.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                {editing ? (
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {agent.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                    {agent.status}
                  </span>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Broker</label>
                {editing ? (
                  <select value={formData.broker?.id || ''} onChange={handleBrokerChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">Select a broker...</option>
                    {mockBrokers.map(broker => (
                      <option key={broker.id} value={broker.id}>{broker.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <Link to={`/portal/brokers/${agent.broker.id}`} className="text-indigo-600 hover:text-indigo-700">
                      {agent.broker.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Assigned Customers ({agent.customers.length})</h2>
              <Link to={`/portal/customers/new?agent=${agent.id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                + Add Customer
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {agent.customers.map(customer => (
                <Link key={customer.id} to={`/portal/customers/${customer.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  {customer.pendingEnvelopes > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                      {customer.pendingEnvelopes} pending
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Envelopes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Envelopes</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {agent.recentEnvelopes.map(envelope => (
                <Link key={envelope.id} to={`/portal/envelopes/${envelope.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{envelope.reference}</p>
                    <p className="text-sm text-gray-500">{envelope.customer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{envelope.date}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      envelope.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {envelope.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(agent.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentDetailPage
