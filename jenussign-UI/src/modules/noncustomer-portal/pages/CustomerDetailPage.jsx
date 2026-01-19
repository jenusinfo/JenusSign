import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Edit,
  Save,
  X,
  FileText,
  UserCircle,
  Building2,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi } from '../../../api/customersApi'
import { usersApi } from '../../../api/usersApi'

const CustomerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [agents, setAgents] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [customerData, agentsData] = await Promise.all([
          customersApi.getCustomer(id),
          usersApi.getAgents(),
        ])
        
        console.log('Customer data:', customerData)
        
        if (customerData) {
          // Transform API response to match expected UI format
          const transformed = {
            id: customerData.id,
            businessKey: customerData.businessKey,
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            companyName: customerData.companyName || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            mobile: customerData.alternatePhone || customerData.phone || '',
            idNumber: customerData.idNumber || '',
            idType: customerData.idType || 'ID Card',
            dateOfBirth: customerData.dateOfBirth,
            address: customerData.address || '',
            city: customerData.city || '',
            postalCode: customerData.postalCode || '',
            country: customerData.country || 'Cyprus',
            customerType: customerData.customerType,
            assignedAgent: customerData.agentId ? {
              id: customerData.agentId,
              name: customerData.agentName || '',
            } : null,
            createdAt: customerData.createdAt,
            envelopes: [], // TODO: Fetch envelopes for this customer
          }
          setCustomer(transformed)
          setFormData(transformed)
        }
        
        setAgents(agentsData || [])
      } catch (error) {
        console.error('Failed to fetch customer:', error)
        toast.error('Failed to load customer details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAgentChange = (e) => {
    const agentId = e.target.value
    const agent = agentId ? agents.find(a => a.id === agentId) : null
    setFormData({ ...formData, assignedAgent: agent ? { id: agent.id, name: `${agent.firstName} ${agent.lastName}` } : null })
  }

  const handleSave = async () => {
    try {
      await customersApi.updateCustomer(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.mobile,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        agentId: formData.assignedAgent?.id || null,
      })
      setCustomer(formData)
      setEditing(false)
      toast.success('Customer updated successfully')
    } catch (error) {
      console.error('Failed to update customer:', error)
      toast.error('Failed to update customer')
    }
  }

  const handleCancel = () => {
    setFormData(customer)
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this customer? This cannot be undone.')) {
      toast.success('Customer deleted')
      navigate('/portal/customers')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
        <Link to="/portal/customers" className="text-indigo-600 hover:text-indigo-700">
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/portal/customers')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-500">Customer ID: {customer.idNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{customer.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{customer.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ID Type</label>
                  {editing ? (
                    <select
                      name="idType"
                      value={formData.idType || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="ID Card">ID Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{customer.idType}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ID Number</label>
                  {editing ? (
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.idNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  {editing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.dateOfBirth}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Contact Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.phone}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mobile</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.mobile}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Address</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Street Address</label>
                  {editing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Postal Code</label>
                  {editing ? (
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.postalCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{customer.country}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Envelopes */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Envelopes</h2>
              <Link
                to={`/portal/envelopes/new?customer=${id}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + New Envelope
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {customer.envelopes?.length > 0 ? (
                customer.envelopes.map((env) => (
                  <Link
                    key={env.id}
                    to={`/portal/envelopes/${env.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{env.reference}</p>
                        <p className="text-sm text-gray-500">{env.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{env.date}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        env.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {env.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No envelopes yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Assignment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Assigned Agent</label>
                {editing ? (
                  <select
                    value={formData.assignedAgent?.id || ''}
                    onChange={handleAgentChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select Agent...</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.assignedAgent?.name || 'Not assigned'}
                      </p>
                      <p className="text-xs text-gray-500">Agent</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Assigned Employee <span className="text-gray-400">(Optional - Direct Business)</span>
                </label>
                {editing ? (
                  <select
                    value={formData.assignedEmployee?.id || ''}
                    onChange={(e) => {
                      const employeeId = e.target.value
                      const employee = employeeId ? agents.find(a => a.id === employeeId) : null
                      setFormData({ ...formData, assignedEmployee: employee ? { id: employee.id, name: `${employee.firstName} ${employee.lastName}` } : null })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">None (Agent handles)</option>
                    {agents.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                ) : customer.assignedEmployee ? (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.assignedEmployee.name}</p>
                      <p className="text-xs text-gray-500">Employee (Direct Business)</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No employee assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                to={`/portal/envelopes/new?customer=${id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-indigo-600"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Create Envelope</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-blue-600">
                <Send className="w-5 h-5" />
                <span className="font-medium">Send Message</span>
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Details</h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Envelopes</span>
                <span className="text-gray-900">{customer.envelopes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailPage
