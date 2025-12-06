import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, Building2, Mail, Phone, MapPin, Tag, Calendar, CreditCard } from 'lucide-react'
import { customersApi, usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const CustomerCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAgent, isBroker } = useAuthStore()
  
  const [customerType, setCustomerType] = useState('Individual')
  const [formData, setFormData] = useState({
    // Business Keys
    insuranceCoreCustomerId: '',
    businessKey: '',
    
    // Individual
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    idCountryOfIssue: 'CY',
    
    // Company
    legalName: '',
    registrationNumber: '',
    registrationDate: '',
    registrationCountryOfIssue: 'CY',
    
    // Contact
    email: '',
    phone: '',
    country: 'CY',
    
    // Assignment
    assignedAgentId: isAgent() ? user.id : '',
  })

  // Get agents for dropdown (if not agent role)
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => usersApi.getUsers({ role: 'Agent' }),
    enabled: !isAgent(),
  })
  const agents = agentsData?.items || []

  const createMutation = useMutation({
    mutationFn: (data) => customersApi.createCustomer(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['customers'])
      toast.success('Customer created successfully')
      navigate(`/portal/customers/${data.id}`)  // ✅ FIXED: parenthesis instead of backtick
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create customer')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const customerData = {
      insuranceCoreCustomerId: formData.insuranceCoreCustomerId,
      businessKey: formData.businessKey || `CUST-${formData.insuranceCoreCustomerId}`,
      customerType,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      assignedAgentId: formData.assignedAgentId,
    }

    if (customerType === 'Individual') {
      customerData.individual = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationalId: formData.nationalId,
        idCountryOfIssue: formData.idCountryOfIssue,
      }
    } else {
      customerData.company = {
        legalName: formData.legalName,
        registrationNumber: formData.registrationNumber,
        registrationDate: formData.registrationDate,
        registrationCountryOfIssue: formData.registrationCountryOfIssue,
      }
    }

    createMutation.mutate(customerData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate business key from ICS ID
    if (field === 'insuranceCoreCustomerId' && value && !formData.businessKey) {
      setFormData(prev => ({ ...prev, businessKey: `CUST-${value}` }))
    }
  }

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

        <h1 className="text-2xl font-bold text-gray-900">Create New Customer</h1>
        <p className="text-gray-600 mt-1">Add a new customer to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Customer Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Type</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCustomerType('Individual')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                customerType === 'Individual'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User size={32} className={`mx-auto mb-2 ${
                customerType === 'Individual' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <div className="font-medium text-gray-900">Individual</div>
              <div className="text-sm text-gray-500">Personal customer</div>
            </button>

            <button
              type="button"
              onClick={() => setCustomerType('Company')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                customerType === 'Company'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building2 size={32} className={`mx-auto mb-2 ${
                customerType === 'Company' ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <div className="font-medium text-gray-900">Company</div>
              <div className="text-sm text-gray-500">Business customer</div>
            </button>
          </div>
        </div>

        {/* Business Keys */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Keys</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Core System ID *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.insuranceCoreCustomerId}
                  onChange={(e) => handleChange('insuranceCoreCustomerId', e.target.value)}
                  placeholder="12345"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Original ID from your core system</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Key
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.businessKey}
                  onChange={(e) => handleChange('businessKey', e.target.value)}
                  placeholder="CUST-12345 (auto-generated)"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-generated if left empty</p>
            </div>
          </div>
        </div>

        {/* Individual Fields */}
        {customerType === 'Individual' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    placeholder="ID123456"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Country of Issue *
                </label>
                <select
                  required
                  value={formData.idCountryOfIssue}
                  onChange={(e) => handleChange('idCountryOfIssue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CY">Cyprus (CY)</option>
                  <option value="GR">Greece (GR)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="US">United States (US)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Company Fields */}
        {customerType === 'Company' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="ACME Corporation Ltd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  placeholder="HE123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.registrationDate}
                    onChange={(e) => handleChange('registrationDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Country *
                </label>
                <select
                  required
                  value={formData.registrationCountryOfIssue}
                  onChange={(e) => handleChange('registrationCountryOfIssue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CY">Cyprus (CY)</option>
                  <option value="GR">Greece (GR)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="US">United States (US)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+35799123456"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  required
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CY">Cyprus</option>
                  <option value="GR">Greece</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment */}
        {!isAgent() && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Agent *
              </label>
              <select
                required
                value={formData.assignedAgentId}
                onChange={(e) => handleChange('assignedAgentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.businessKey} - {agent.displayName}
                    {agent.broker && ` (Broker: ${agent.broker.displayName})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {isAgent() && 'Customer will be automatically assigned to you'}
                {isBroker() && 'Select an agent under your brokerage'}
                {!isAgent() && !isBroker() && 'Broker will be auto-assigned from agent'}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/portal/customers')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={20} />
            {createMutation.isPending ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CustomerCreatePage
