import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Building2,
  UserCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Key,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../../api/usersApi'
import Loading from '../../../shared/components/Loading'

const departments = ['IT', 'Sales', 'Underwriting', 'Claims', 'Operations', 'Finance', 'HR']

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  // Fetch user from API
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
  })

  // Fetch all brokers
  const { data: brokersData } = useQuery({
    queryKey: ['brokers'],
    queryFn: usersApi.getBrokers,
  })

  // Fetch all agents
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: usersApi.getAgents,
  })

  const allBrokers = (brokersData?.users || []).map(b => ({
    id: b.id,
    name: `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email,
  }))

  const allAgents = (agentsData?.users || []).map(a => ({
    id: a.id,
    name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email,
  }))

  useEffect(() => {
    if (userData) {
      const transformedUser = {
        id: userData.id,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role?.toLowerCase() || 'employee',
        department: userData.department || 'General',
        status: userData.isActive ? 'active' : 'inactive',
        assignedBrokers: [],
        assignedAgents: [],
        lastLogin: userData.lastLoginAt,
        createdAt: userData.createdAt,
      }
      setUser(transformedUser)
      setFormData({
        ...transformedUser,
        assignedBrokerIds: transformedUser.assignedBrokers.map(b => b.id),
        assignedAgentIds: transformedUser.assignedAgents.map(a => a.id),
      })
    }
  }, [userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleBrokerToggle = (brokerId) => {
    const current = formData.assignedBrokerIds || []
    if (current.includes(brokerId)) {
      setFormData({ ...formData, assignedBrokerIds: current.filter(id => id !== brokerId) })
    } else {
      setFormData({ ...formData, assignedBrokerIds: [...current, brokerId] })
    }
  }

  const handleAgentToggle = (agentId) => {
    const current = formData.assignedAgentIds || []
    if (current.includes(agentId)) {
      setFormData({ ...formData, assignedAgentIds: current.filter(id => id !== agentId) })
    } else {
      setFormData({ ...formData, assignedAgentIds: [...current, agentId] })
    }
  }

  const handleSave = () => {
    const updatedUser = {
      ...formData,
      assignedBrokers: allBrokers.filter(b => formData.assignedBrokerIds?.includes(b.id)),
      assignedAgents: allAgents.filter(a => formData.assignedAgentIds?.includes(a.id)),
    }
    setUser(updatedUser)
    setEditing(false)
    toast.success('User updated successfully!')
  }

  const handleCancel = () => {
    setFormData({
      ...user,
      assignedBrokerIds: user.assignedBrokers.map(b => b.id),
      assignedAgentIds: user.assignedAgents.map(a => a.id),
    })
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      toast.success('User deleted successfully')
      navigate('/portal/users')
    }
  }

  const handleResetPassword = () => {
    toast.success('Password reset email sent!')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    })
  }

  if (userLoading) {
    return <Loading message="Loading user details..." />
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
        <Link to="/portal/users" className="text-indigo-600 hover:text-indigo-700">Back to Users</Link>
      </div>
    )
  }

  const isAdmin = user.role === 'administrator' || user.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/portal/users')} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              isAdmin ? 'bg-gradient-to-br from-red-400 to-orange-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'
            }`}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>
              </div>
              <p className="text-gray-500">{user.department}</p>
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
              <button onClick={handleResetPassword} className="px-4 py-2 text-amber-600 bg-amber-50 rounded-xl font-medium hover:bg-amber-100">
                <Key className="w-4 h-4 inline mr-2" />Reset Password
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-red-600 bg-red-50 rounded-xl font-medium hover:bg-red-100">
                <Trash2 className="w-4 h-4 inline mr-2" />Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">User Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                {editing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900 font-medium">{user.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                {editing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {editing ? (
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                {editing ? (
                  <select name="department" value={formData.department} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{user.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                {editing ? (
                  <select name="role" value={formData.role} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="employee">Employee</option>
                    <option value="administrator">Administrator</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {isAdmin ? 'Administrator' : 'Employee'}
                  </span>
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
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                    {user.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assignments (only for employees) */}
          {!isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Assignments</h2>
                <p className="text-sm text-gray-500 mt-1">Brokers and agents this employee manages</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Brokers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assigned Brokers</label>
                  {editing ? (
                    <div className="space-y-2">
                      {allBrokers.map(broker => (
                        <label key={broker.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedBrokerIds?.includes(broker.id)}
                            onChange={() => handleBrokerToggle(broker.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-gray-900">{broker.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {user.assignedBrokers.length === 0 ? (
                        <p className="text-gray-500 text-sm">No brokers assigned</p>
                      ) : (
                        user.assignedBrokers.map(broker => (
                          <Link key={broker.id} to={`/portal/brokers/${broker.id}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-900">{broker.name}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Assigned Agents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assigned Agents</label>
                  {editing ? (
                    <div className="space-y-2">
                      {allAgents.map(agent => (
                        <label key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedAgentIds?.includes(agent.id)}
                            onChange={() => handleAgentToggle(agent.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-gray-900">{agent.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {user.assignedAgents.length === 0 ? (
                        <p className="text-gray-500 text-sm">No agents assigned</p>
                      ) : (
                        user.assignedAgents.map(agent => (
                          <Link key={agent.id} to={`/portal/agents/${agent.id}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                            <UserCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-900">{agent.name}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Last Login:</span>
                <span className="text-gray-900">{formatDate(user.lastLogin)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Permissions</h2>
            </div>
            <div className="p-6">
              {isAdmin ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700 font-medium">
                    <Shield className="w-5 h-5" />
                    Full System Access
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Can manage all users, brokers, agents, and system settings.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    View assigned customers
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Create and manage envelopes
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    View reports for assigned brokers/agents
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailPage
