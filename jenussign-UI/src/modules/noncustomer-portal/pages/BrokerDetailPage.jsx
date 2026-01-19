import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Edit,
  Save,
  X,
  Users,
  FileText,
  UserCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../../api/usersApi'

const BrokerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [broker, setBroker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const brokerData = await usersApi.getUser(id)
        
        if (brokerData) {
          const transformed = {
            id: brokerData.id,
            name: brokerData.companyName || `${brokerData.firstName || ''} ${brokerData.lastName || ''}`.trim() || brokerData.email,
            firstName: brokerData.firstName || '',
            lastName: brokerData.lastName || '',
            registrationNumber: brokerData.businessKey || '',
            email: brokerData.email || '',
            phone: brokerData.phone || '',
            address: brokerData.address || '',
            city: brokerData.city || '',
            postalCode: brokerData.postalCode || '',
            country: brokerData.country || 'Cyprus',
            contactPerson: `${brokerData.firstName || ''} ${brokerData.lastName || ''}`.trim(),
            contactPhone: brokerData.phone || '',
            contactEmail: brokerData.email || '',
            status: brokerData.isActive ? 'active' : 'inactive',
            createdAt: brokerData.createdAt,
            agents: [], // TODO: Fetch agents for this broker
            assignedEmployees: [],
            stats: { 
              totalAgents: brokerData.agentCount || 0, 
              totalCustomers: brokerData.customerCount || 0, 
              totalEnvelopes: brokerData.envelopeCount || 0, 
              completedEnvelopes: 0 
            },
          }
          setBroker(transformed)
          setFormData(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch broker:', error)
        toast.error('Failed to load broker details')
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

  const handleSave = async () => {
    try {
      await usersApi.updateUser(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.name,
      })
      setBroker(formData)
      setEditing(false)
      toast.success('Broker updated successfully!')
    } catch (error) {
      console.error('Failed to update broker:', error)
      toast.error('Failed to update broker')
    }
  }

  const handleCancel = () => {
    setFormData(broker)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this broker? All associated agents will need to be reassigned.')) {
      try {
        await usersApi.deleteUser(id)
        toast.success('Broker deleted successfully')
        navigate('/portal/brokers')
      } catch (error) {
        console.error('Failed to delete broker:', error)
        toast.error('Failed to delete broker')
      }
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

  if (!broker) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Broker Not Found</h2>
        <Link to="/portal/brokers" className="text-indigo-600 hover:text-indigo-700">Back to Brokers</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/portal/brokers')} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{broker.name}</h1>
              <p className="text-gray-500">Broker • {broker.registrationNumber}</p>
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
            <Users className="w-4 h-4" />Agents
          </div>
          <p className="text-2xl font-bold text-gray-900">{broker.stats.totalAgents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <UserCircle className="w-4 h-4" />Customers
          </div>
          <p className="text-2xl font-bold text-gray-900">{broker.stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <FileText className="w-4 h-4" />Envelopes
          </div>
          <p className="text-2xl font-bold text-gray-900">{broker.stats.totalEnvelopes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />Completed
          </div>
          <p className="text-2xl font-bold text-green-600">{broker.stats.completedEnvelopes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Company Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Company Name</label>
                {editing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900 font-medium">{broker.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Registration Number</label>
                {editing ? (
                  <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{broker.registrationNumber}</p>
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
                    broker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {broker.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                    {broker.status}
                  </span>
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
                    <p className="text-gray-900">{broker.email}</p>
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
                    <p className="text-gray-900">{broker.phone}</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                {editing ? (
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{broker.address}, {broker.city} {broker.postalCode}, {broker.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Contact Person</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                {editing ? (
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{broker.contactPerson}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                {editing ? (
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{broker.contactEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {editing ? (
                  <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                ) : (
                  <p className="text-gray-900">{broker.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Agents */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Agents ({broker.agents.length})</h2>
              <Link to={`/portal/agents/new?broker=${broker.id}`} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Plus className="w-4 h-4" />Add Agent
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {broker.agents.map(agent => (
                <Link key={agent.id} to={`/portal/agents/${agent.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{agent.customers} customers</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Employees */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Assigned Employees</h2>
            </div>
            <div className="p-6">
              {broker.assignedEmployees.length === 0 ? (
                <p className="text-gray-500 text-sm">No employees assigned</p>
              ) : (
                <div className="space-y-3">
                  {broker.assignedEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(broker.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerDetailPage
