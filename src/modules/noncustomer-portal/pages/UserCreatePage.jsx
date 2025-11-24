import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Mail, User, Shield, Building2, UserCircle, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const UserCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdmin } = useAuthStore()

  const [formData, setFormData] = useState({
    businessKey: '',
    email: '',
    displayName: '',
    role: 'Agent',
    brokerId: '',
  })

  if (!isAdmin()) {
    return <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Access Denied</p></div></div>
  }

  const { data: brokersData } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => usersApi.getBrokers(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('User created successfully')
      navigate('/portal/users')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const roleIcons = {
    Admin: Shield,
    Employee: UserCircle,
    Broker: Building2,
    Agent: User,
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/users')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Users
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Role Selection</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Broker', 'Agent', 'Employee', 'Admin'].map(role => {
              const Icon = roleIcons[role]
              return (
                <button key={role} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role, brokerId: role === 'Agent' ? prev.brokerId : '' }))}
                  className={`p-3 border-2 rounded-lg ${formData.role === role ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                  <Icon size={24} className="mx-auto mb-1" />
                  <div className="text-sm font-medium">{role}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Key *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" required value={formData.businessKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessKey: e.target.value }))}
                  placeholder="BRK-001 or AGT-001"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input type="text" required value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@insurance.com"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            {formData.role === 'Agent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Broker *</label>
                <select required value={formData.brokerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, brokerId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="">Select broker...</option>
                  {brokersData?.map(broker => (
                    <option key={broker.id} value={broker.id}>
                      {broker.businessKey} - {broker.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/portal/users')}
            className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Save size={20} />
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserCreatePage
