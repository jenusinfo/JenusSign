#!/bin/bash

# Create ProposalDetailPage
cat > src/modules/noncustomer-portal/pages/ProposalDetailPage.jsx << 'PROPDETAIL'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText } from 'lucide-react'
import { proposalsApi } from '../../../api/mockApi'

const ProposalDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposalsApi.getProposal(id),
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!proposal) return <div className="p-6">Proposal not found</div>

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/proposals')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Proposals
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{proposal.proposalRef}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {proposal.businessKey}
          </span>
          <span className="text-sm text-gray-500">ICS ID: {proposal.insuranceCoreProposalId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Proposal Details</h2>
            <div className="space-y-3">
              <div><span className="text-gray-600">Product Type:</span> <span className="ml-2 font-medium">{proposal.productType}</span></div>
              <div><span className="text-gray-600">Status:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
                proposal.status === 'Signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{proposal.status}</span></div>
              <div><span className="text-gray-600">Customer:</span> <span className="ml-2">{proposal.customerName} ({proposal.customerBusinessKey})</span></div>
              <div><span className="text-gray-600">Created:</span> <span className="ml-2">{new Date(proposal.createdAt).toLocaleString()}</span></div>
              <div><span className="text-gray-600">Last Activity:</span> <span className="ml-2">{new Date(proposal.lastActivityAt).toLocaleString()}</span></div>
              {proposal.expiryDate && <div><span className="text-gray-600">Expiry:</span> <span className="ml-2">{new Date(proposal.expiryDate).toLocaleDateString()}</span></div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Assignment</h2>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium">{proposal.assignedAgent.displayName}</div>
                <div className="text-xs text-gray-500">{proposal.assignedAgent.businessKey}</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm font-medium">{proposal.assignedBroker.displayName}</div>
                <div className="text-xs text-gray-500">{proposal.assignedBroker.businessKey}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailPage
PROPDETAIL

# Create ProposalCreatePage
cat > src/modules/noncustomer-portal/pages/ProposalCreatePage.jsx << 'PROPCREATE'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, FileText, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { proposalsApi, customersApi } from '../../../api/mockApi'

const ProposalCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    customerId: '',
    insuranceCoreProposalId: '',
    businessKey: '',
    proposalRef: '',
    productType: '',
    expiryDate: '',
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers({}),
  })

  const createMutation = useMutation({
    mutationFn: (data) => proposalsApi.createProposal(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['proposals'])
      toast.success('Proposal created successfully')
      navigate(`/portal/proposals/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create proposal')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      businessKey: formData.businessKey || `PROP-${formData.insuranceCoreProposalId}`,
    })
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'insuranceCoreProposalId' && value && !formData.businessKey) {
      setFormData(prev => ({ ...prev, businessKey: `PROP-${value}` }))
    }
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/proposals')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Proposals
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Proposal</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Business Keys</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ICS Proposal ID *</label>
              <input type="text" required value={formData.insuranceCoreProposalId}
                onChange={(e) => handleChange('insuranceCoreProposalId', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Key</label>
              <input type="text" value={formData.businessKey}
                onChange={(e) => handleChange('businessKey', e.target.value)}
                placeholder="Auto-generated"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Proposal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
              <select required value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="">Select customer...</option>
                {customersData?.items.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.businessKey} - {customer.fullName || customer.legalName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Ref *</label>
              <input type="text" required value={formData.proposalRef}
                onChange={(e) => setFormData(prev => ({ ...prev, proposalRef: e.target.value }))}
                placeholder="PR-2024-0001"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
              <select required value={formData.productType}
                onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="">Select product...</option>
                <option value="Home Insurance">Home Insurance</option>
                <option value="Auto Insurance">Auto Insurance</option>
                <option value="Business Insurance">Business Insurance</option>
                <option value="Life Insurance">Life Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input type="date" value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/portal/proposals')}
            className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <Save size={20} />
            {createMutation.isPending ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProposalCreatePage
PROPCREATE

echo "✅ Proposal pages created"

# Create UserDetailPage
cat > src/modules/noncustomer-portal/pages/UserDetailPage.jsx << 'USERDETAIL'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Access Denied</p></div></div>
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!user) return <div className="p-6">User not found</div>

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/users')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Users
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {user.businessKey}
          </span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-3">
            <div><span className="text-gray-600">Business Key:</span> <span className="ml-2 font-medium">{user.businessKey}</span></div>
            <div><span className="text-gray-600">Email:</span> <span className="ml-2">{user.email}</span></div>
            <div><span className="text-gray-600">Display Name:</span> <span className="ml-2">{user.displayName}</span></div>
            <div><span className="text-gray-600">Role:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
              user.role === 'Admin' ? 'bg-red-100 text-red-800' :
              user.role === 'Broker' ? 'bg-orange-100 text-orange-800' :
              user.role === 'Agent' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>{user.role}</span></div>
            <div><span className="text-gray-600">Status:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>{user.isActive ? 'Active' : 'Inactive'}</span></div>
            {user.broker && (
              <div>
                <span className="text-gray-600">Broker:</span>
                <div className="ml-2 mt-1 p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium">{user.broker.displayName}</div>
                  <div className="text-xs text-gray-500">{user.broker.businessKey}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-600">Created:</span> <span className="ml-2">{new Date(user.createdAt).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailPage
USERDETAIL

# Create UserCreatePage
cat > src/modules/noncustomer-portal/pages/UserCreatePage.jsx << 'USERCREATE'
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
USERCREATE

echo "✅ User pages created"
echo ""
echo "🎉 ALL FORM PAGES COMPLETED!"
echo ""
echo "📋 Complete Page List:"
echo "   ✅ CustomersListPage"
echo "   ✅ CustomerDetailPage (view/edit)"
echo "   ✅ CustomerCreatePage"
echo "   ✅ ProposalsListPage"
echo "   ✅ ProposalDetailPage"
echo "   ✅ ProposalCreatePage"
echo "   ✅ UserManagementPage"
echo "   ✅ UserDetailPage"
echo "   ✅ UserCreatePage"
