import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Save,
  UserCircle,
  Building2,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../../api/usersApi'

const CustomerCreatePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState([])
  const [employees, setEmployees] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Cyprus',
    assignedAgentId: '',
    assignedEmployeeId: '',
    notes: '',
  })

  // Fetch agents and employees on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await usersApi.getAgents()
        setAgents(data)
      } catch (error) {
        console.error('Failed to load agents:', error)
        toast.error('Failed to load agents')
      } finally {
        setLoadingAgents(false)
      }
    }

    const fetchEmployees = async () => {
      try {
        const data = await usersApi.getEmployees()
        setEmployees(data)
      } catch (error) {
        console.error('Failed to load employees:', error)
        toast.error('Failed to load employees')
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchAgents()
    fetchEmployees()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.idNumber || !formData.assignedAgentId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Customer created successfully!')
    navigate('/portal/customers')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/portal/customers')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
          <p className="text-gray-500">Create a new customer record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    placeholder="e.g., X1234567"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                    placeholder="customer@example.com"
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
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Nicosia"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="1065"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-gray-400" />
                Assignment
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Agent <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignedAgentId"
                  value={formData.assignedAgentId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                  disabled={loadingAgents}
                >
                  <option value="">{loadingAgents ? 'Loading agents...' : 'Select an agent...'}</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.brokerName || 'No broker'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Required: The agent managing this customer</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Employee (Optional)
                </label>
                <select
                  name="assignedEmployeeId"
                  value={formData.assignedEmployeeId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  disabled={loadingEmployees}
                >
                  <option value="">{loadingEmployees ? 'Loading employees...' : 'None (Broker business only)'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || emp.role})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Optional: For direct insurance business</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Additional Notes</h2>
            </div>
            <div className="p-6">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this customer..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium text-gray-900">{formData.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{formData.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigned Agent</p>
                <p className="font-medium text-gray-900">
                  {agents.find(a => a.id === formData.assignedAgentId)?.name || '—'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Customer
                  </>
                )}
              </button>
              <Link
                to="/portal/customers"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 mt-2 hover:text-gray-900"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CustomerCreatePage
