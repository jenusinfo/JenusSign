import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Edit, User, Building2, Mail, Phone, MapPin, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const CustomerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAdmin, isEmployee } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomer(id),
    onSuccess: (data) => {
      setFormData(data)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => customersApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer', id])
      queryClient.invalidateQueries(['customers'])
      setIsEditing(false)
      toast.success('Customer updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update customer')
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading customer...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Customer not found</div>
      </div>
    )
  }

  const canEdit = isAdmin() || isEmployee()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/portal/customers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Customers
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.fullName || customer.legalName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {customer.businessKey}
              </span>
              <span className="text-sm text-gray-500">
                ICS ID: {customer.insuranceCoreCustomerId}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(customer)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Edit size={20} />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  {customer.customerType === 'Individual' ? (
                    <User size={18} className="text-gray-400" />
                  ) : (
                    <Building2 size={18} className="text-gray-400" />
                  )}
                  <span className="text-gray-900">{customer.customerType}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData?.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                )}
              </div>
            </div>

            {/* Individual Fields */}
            {customer.customerType === 'Individual' && customer.individual && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.individual.firstName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.individual.lastName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.individual.dateOfBirth}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    National ID
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.individual.nationalId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Country of Issue
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.individual.idCountryOfIssue}
                  </div>
                </div>
              </div>
            )}

            {/* Company Fields */}
            {customer.customerType === 'Company' && customer.company && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.company.legalName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.company.registrationNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.company.registrationDate}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Country
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {customer.company.registrationCountryOfIssue}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-900">{customer.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData?.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-900">{customer.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-gray-400" />
                  <span className="text-gray-900">{customer.country}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent & Broker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Agent
                </label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.assignedAgent.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {customer.assignedAgent.businessKey}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Broker
                </label>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.assignedBroker.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {customer.assignedBroker.businessKey}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(customer.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(customer.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPage
