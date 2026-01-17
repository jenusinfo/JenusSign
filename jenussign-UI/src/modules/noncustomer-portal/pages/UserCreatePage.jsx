import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  UserCircle,
  Save,
  Key,
} from 'lucide-react'
import toast from 'react-hot-toast'

const allBrokers = [
  { id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' },
  { id: 'broker-002', name: 'Mediterranean Insurance Services' },
  { id: 'broker-003', name: 'Island Risk Solutions' },
]

const allAgents = [
  { id: 'agent-001', name: 'Maria Georgiou', broker: 'Cyprus Insurance Brokers Ltd' },
  { id: 'agent-002', name: 'Andreas Papadopoulos', broker: 'Mediterranean Insurance Services' },
  { id: 'agent-003', name: 'Nikos Konstantinou', broker: 'Cyprus Insurance Brokers Ltd' },
]

const departments = ['IT', 'Sales', 'Underwriting', 'Claims', 'Operations', 'Finance', 'HR']

const UserCreatePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    assignedBrokerIds: [],
    assignedAgentIds: [],
    sendInvite: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  const handleBrokerToggle = (brokerId) => {
    const current = formData.assignedBrokerIds
    if (current.includes(brokerId)) {
      setFormData({ ...formData, assignedBrokerIds: current.filter(id => id !== brokerId) })
    } else {
      setFormData({ ...formData, assignedBrokerIds: [...current, brokerId] })
    }
  }

  const handleAgentToggle = (agentId) => {
    const current = formData.assignedAgentIds
    if (current.includes(agentId)) {
      setFormData({ ...formData, assignedAgentIds: current.filter(id => id !== agentId) })
    } else {
      setFormData({ ...formData, assignedAgentIds: [...current, agentId] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('User created successfully!')
    if (formData.sendInvite) {
      toast.success('Invitation email sent')
    }
    navigate('/portal/users')
  }

  const isAdmin = formData.role === 'administrator'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/portal/users')} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-500">Create an employee or administrator account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Personal Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                Contact Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@hydrainsurance.com.cy"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+357 99 123 456"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                Role & Department
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="employee">Employee</option>
                  <option value="administrator">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? 'Full system access' : 'Access limited to assigned brokers/agents'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select department...</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assignments (only for employees) */}
          {!isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Assignments</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select the brokers and agents this employee will manage
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Brokers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Assigned Brokers
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allBrokers.map(broker => (
                      <label key={broker.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedBrokerIds.includes(broker.id)}
                          onChange={() => handleBrokerToggle(broker.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-900">{broker.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assigned Agents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <UserCircle className="w-4 h-4 inline mr-1" />
                    Assigned Agents
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allAgents.map(agent => (
                      <label key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedAgentIds.includes(agent.id)}
                          onChange={() => handleAgentToggle(agent.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-gray-900">{agent.name}</span>
                          <p className="text-xs text-gray-500">{agent.broker}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invite */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-400" />
                Account Setup
              </h2>
            </div>
            <div className="p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="sendInvite"
                  checked={formData.sendInvite}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Send invitation email</p>
                  <p className="text-sm text-gray-500">
                    User will receive an email with a link to set up their password
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {formData.firstName && formData.lastName 
                    ? `${formData.firstName} ${formData.lastName}` 
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{formData.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{formData.department || '—'}</p>
              </div>
              {!isAdmin && (
                <div>
                  <p className="text-sm text-gray-500">Assignments</p>
                  <p className="font-medium text-gray-900">
                    {formData.assignedBrokerIds.length} broker(s), {formData.assignedAgentIds.length} agent(s)
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create User
                  </>
                )}
              </button>
              <Link to="/portal/users" className="w-full flex items-center justify-center px-4 py-2.5 text-gray-600 mt-2 hover:text-gray-900">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserCreatePage
