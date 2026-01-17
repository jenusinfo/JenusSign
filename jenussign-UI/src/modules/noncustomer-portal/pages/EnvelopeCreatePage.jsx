import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  User,
  Building2,
  Shield,
  Clock,
  Send,
  Save,
  CreditCard,
  FileCheck,
  Plus,
  Trash2,
  Eye,
  Loader2,
  Mail,
  Users,
  Printer,
  Phone,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Mock Envelope Types (would come from API/settings)
const ENVELOPE_TYPES = [
  {
    id: 'type-001',
    name: 'Home Insurance Proposal',
    code: 'HOME_INSURANCE',
    category: 'Insurance',
    description: 'Standard home insurance proposal with property details',
    expiryDays: 30,
    requiredDocuments: [
      { id: 'doc-1', name: 'Insurance Proposal', required: true, allowedFormats: 'PDF', maxSizeMb: 10 },
      { id: 'doc-2', name: 'Terms & Conditions', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
      { id: 'doc-3', name: 'Privacy Policy', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
    ],
    verification: {
      requireIdVerification: true,
      requireFaceMatch: false,
    },
    autoIncludeDocs: ['terms-conditions', 'privacy-policy'],
  },
  {
    id: 'type-002',
    name: 'Motor Insurance Proposal',
    code: 'MOTOR_INSURANCE',
    category: 'Insurance',
    description: 'Vehicle insurance proposal with driver and vehicle details',
    expiryDays: 30,
    requiredDocuments: [
      { id: 'doc-1', name: 'Insurance Proposal', required: true, allowedFormats: 'PDF', maxSizeMb: 10 },
      { id: 'doc-2', name: 'Vehicle Registration', required: true, allowedFormats: 'PDF,Images', maxSizeMb: 5 },
      { id: 'doc-3', name: 'Driving License', required: false, allowedFormats: 'PDF,Images', maxSizeMb: 5 },
      { id: 'doc-4', name: 'Terms & Conditions', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
    ],
    verification: {
      requireIdVerification: true,
      requireFaceMatch: true,
    },
    autoIncludeDocs: ['terms-conditions'],
  },
  {
    id: 'type-003',
    name: 'Commercial Property Insurance',
    code: 'COMMERCIAL_PROPERTY',
    category: 'Insurance',
    description: 'Commercial property insurance for businesses',
    expiryDays: 45,
    requiredDocuments: [
      { id: 'doc-1', name: 'Insurance Proposal', required: true, allowedFormats: 'PDF', maxSizeMb: 25 },
      { id: 'doc-2', name: 'Business Registration', required: true, allowedFormats: 'PDF', maxSizeMb: 10 },
      { id: 'doc-3', name: 'Property Valuation', required: false, allowedFormats: 'PDF', maxSizeMb: 25 },
      { id: 'doc-4', name: 'Terms & Conditions', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
      { id: 'doc-5', name: 'Privacy Policy', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
    ],
    verification: {
      requireIdVerification: true,
      requireFaceMatch: false,
    },
    autoIncludeDocs: ['terms-conditions', 'privacy-policy'],
  },
  {
    id: 'type-004',
    name: 'Travel Insurance',
    code: 'TRAVEL_INSURANCE',
    category: 'Insurance',
    description: 'Travel insurance policy for individuals or groups',
    expiryDays: 14,
    requiredDocuments: [
      { id: 'doc-1', name: 'Insurance Proposal', required: true, allowedFormats: 'PDF', maxSizeMb: 10 },
      { id: 'doc-2', name: 'Terms & Conditions', required: true, allowedFormats: 'PDF', maxSizeMb: 5 },
    ],
    verification: {
      requireIdVerification: false,
      requireFaceMatch: false,
    },
    autoIncludeDocs: ['terms-conditions'],
  },
  {
    id: 'type-005',
    name: 'General Agreement',
    code: 'GENERAL_AGREEMENT',
    category: 'Contract',
    description: 'General purpose agreement or contract',
    expiryDays: 30,
    requiredDocuments: [
      { id: 'doc-1', name: 'Agreement Document', required: true, allowedFormats: 'PDF', maxSizeMb: 25 },
    ],
    verification: {
      requireIdVerification: false,
      requireFaceMatch: false,
    },
    autoIncludeDocs: [],
  },
]

// Mock Customers (would come from API)
const CUSTOMERS = [
  { id: 'cust-001', name: 'Yiannis Kleanthous', email: 'yiannis.kleanthous@email.com', phone: '+357 99 123 456', type: 'individual' },
  { id: 'cust-002', name: 'Charis Constantinou', email: 'charis.constantinou@email.com', phone: '+357 99 654 321', type: 'individual' },
  { id: 'cust-003', name: 'Andreas Papadopoulos', email: 'andreas.p@email.com', phone: '+357 99 111 222', type: 'individual' },
  { id: 'cust-004', name: 'Cyprus Trading Ltd', email: 'info@cyprustrading.com', phone: '+357 22 123 456', type: 'company' },
  { id: 'cust-005', name: 'Tech Solutions Cyprus Ltd', email: 'contact@techsolutions.cy', phone: '+357 22 789 012', type: 'company' },
]

const EnvelopeCreatePage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Signing methods
  const SIGNING_METHODS = [
    {
      id: 'digital_self_service',
      name: 'Digital Self-Service',
      description: 'Customer receives link and completes signing independently',
      icon: 'Mail',
      otpTo: 'Customer',
      signatureBy: 'Customer (Digital)',
      recommended: true,
    },
    {
      id: 'agent_assisted',
      name: 'Agent-Assisted Digital',
      description: 'Agent guides customer through signing process (in-person or phone)',
      icon: 'Users',
      otpTo: 'Customer (verbal to agent)',
      signatureBy: 'Customer (Digital on agent device)',
      recommended: false,
    },
    {
      id: 'print_sign_scan',
      name: 'Print-Sign-Scan',
      description: 'Customer signs physical documents, agent uploads scanned copies',
      icon: 'Printer',
      otpTo: 'Agent',
      signatureBy: 'Customer (Physical) + eSeal',
      recommended: false,
    },
  ]

  // Form state
  const [formData, setFormData] = useState({
    envelopeTypeId: '',
    title: '',
    customerId: '',
    expiryDays: 30,
    message: '',
    sendNotification: true,
    notificationChannel: 'email',
    signingMethod: 'digital_self_service',
    agentAssistedMode: 'in_person', // in_person, phone_call
  })

  // Selected envelope type details
  const [selectedType, setSelectedType] = useState(null)

  // Document uploads (keyed by required document id)
  const [uploadedDocuments, setUploadedDocuments] = useState({})

  // Additional documents (beyond required)
  const [additionalDocuments, setAdditionalDocuments] = useState([])

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  // Get selected customer
  const selectedCustomer = CUSTOMERS.find(c => c.id === formData.customerId)

  // Filter customers based on search
  const filteredCustomers = CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  )

  // Handle envelope type selection
  const handleTypeChange = (typeId) => {
    const type = ENVELOPE_TYPES.find(t => t.id === typeId)
    setSelectedType(type)
    setFormData(prev => ({
      ...prev,
      envelopeTypeId: typeId,
      expiryDays: type?.expiryDays || 30,
    }))
    setUploadedDocuments({})
  }

  // Handle document upload for a specific slot
  const handleDocumentUpload = (docSlotId, files) => {
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedDocuments(prev => ({
        ...prev,
        [docSlotId]: {
          file,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        }
      }))
      toast.success(`Uploaded: ${file.name}`)
    }
  }

  // Remove uploaded document
  const handleRemoveDocument = (docSlotId) => {
    setUploadedDocuments(prev => {
      const updated = { ...prev }
      delete updated[docSlotId]
      return updated
    })
  }

  // Handle additional document upload
  const handleAdditionalDocUpload = (files) => {
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map(file => ({
        id: `additional-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }))
      setAdditionalDocuments(prev => [...prev, ...newDocs])
      toast.success(`Added ${files.length} additional document(s)`)
    }
  }

  // Remove additional document
  const handleRemoveAdditionalDoc = (docId) => {
    setAdditionalDocuments(prev => prev.filter(d => d.id !== docId))
  }

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.envelopeTypeId) return false
    if (!formData.title.trim()) return false
    if (!formData.customerId) return false
    
    if (selectedType) {
      const requiredDocs = selectedType.requiredDocuments.filter(d => d.required)
      for (const doc of requiredDocs) {
        if (selectedType.autoIncludeDocs?.some(autoDoc => 
          doc.name.toLowerCase().includes(autoDoc.replace('-', ' '))
        )) continue
        
        if (!uploadedDocuments[doc.id]) return false
      }
    }
    
    return true
  }

  // Handle form submission
  const handleSubmit = async (action) => {
    if (action === 'send' && !isFormValid()) {
      toast.error('Please fill in all required fields and upload required documents')
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (action === 'send') {
        // Generate a mock envelope ID
        const newEnvelopeId = `env-${Date.now()}`
        
        if (formData.signingMethod === 'digital_self_service') {
          toast.success('Envelope created and invitation sent!')
          navigate('/portal/envelopes')
        } else if (formData.signingMethod === 'agent_assisted') {
          toast.success('Envelope created! Proceeding to agent-assisted signing...')
          navigate(`/portal/envelopes/${newEnvelopeId}/sign/assisted`)
        } else if (formData.signingMethod === 'print_sign_scan') {
          toast.success('Envelope created! Proceeding to print documents...')
          navigate(`/portal/envelopes/${newEnvelopeId}/sign/physical`)
        }
      } else {
        toast.success('Envelope saved as draft')
        navigate('/portal/envelopes')
      }
    } catch (error) {
      toast.error('Failed to create envelope')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/portal/envelopes" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Envelope</h1>
          <p className="text-sm text-gray-500">Send documents for digital signature</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Envelope Type Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Envelope Type</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.envelopeTypeId}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Choose an envelope type...</option>
                  {Object.entries(
                    ENVELOPE_TYPES.reduce((acc, type) => {
                      if (!acc[type.category]) acc[type.category] = []
                      acc[type.category].push(type)
                      return acc
                    }, {})
                  ).map(([category, types]) => (
                    <optgroup key={category} label={category}>
                      {types.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <p className="text-sm text-indigo-700">{selectedType.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs">
                      <Clock className="w-3 h-3" />
                      Expires in {selectedType.expiryDays} days
                    </span>
                    {selectedType.verification.requireIdVerification && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                        <CreditCard className="w-3 h-3" />
                        ID Verification
                      </span>
                    )}
                    {selectedType.verification.requireFaceMatch && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                        <User className="w-3 h-3" />
                        Face Match
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Home Insurance - John Smith - Policy #12345"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A specific title to identify this envelope
                </p>
              </div>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipient</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between bg-white hover:border-gray-300 transition-colors"
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                >
                  {selectedCustomer ? (
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedCustomer.type === 'company' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {selectedCustomer.type === 'company' ? (
                          <Building2 className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                        <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Choose a customer...</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showCustomerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, customerId: customer.id }))
                          setShowCustomerDropdown(false)
                          setCustomerSearch('')
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          customer.type === 'company' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {customer.type === 'company' ? (
                            <Building2 className="w-4 h-4 text-purple-600" />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 border-t border-gray-100">
                      <Link
                        to="/portal/customers/new"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Customer
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signing Method Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Signing Method</h2>
            
            <div className="space-y-3">
              {SIGNING_METHODS.map((method) => {
                const isSelected = formData.signingMethod === method.id
                const IconComponent = method.icon === 'Mail' ? Mail : method.icon === 'Users' ? Users : Printer
                
                return (
                  <div
                    key={method.id}
                    onClick={() => setFormData(prev => ({ ...prev, signingMethod: method.id }))}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          {method.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs text-gray-500">
                            <strong>OTP:</strong> {method.otpTo}
                          </span>
                          <span className="text-xs text-gray-500">
                            <strong>Signature:</strong> {method.signatureBy}
                          </span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Agent-Assisted Options */}
            {formData.signingMethod === 'agent_assisted' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Agent-Assisted Mode</p>
                    <p className="text-sm text-amber-700">
                      OTP will be sent to the customer's contact. The agent will enter it after verbal confirmation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center ${
                    formData.agentAssistedMode === 'in_person' ? 'border-amber-500 bg-white' : 'border-amber-200'
                  }`}>
                    <input
                      type="radio"
                      name="agentMode"
                      value="in_person"
                      checked={formData.agentAssistedMode === 'in_person'}
                      onChange={() => setFormData(prev => ({ ...prev, agentAssistedMode: 'in_person' }))}
                      className="sr-only"
                    />
                    <Users className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">In-Person</span>
                  </label>
                  <label className={`flex-1 p-3 border-2 rounded-lg cursor-pointer text-center ${
                    formData.agentAssistedMode === 'phone_call' ? 'border-amber-500 bg-white' : 'border-amber-200'
                  }`}>
                    <input
                      type="radio"
                      name="agentMode"
                      value="phone_call"
                      checked={formData.agentAssistedMode === 'phone_call'}
                      onChange={() => setFormData(prev => ({ ...prev, agentAssistedMode: 'phone_call' }))}
                      className="sr-only"
                    />
                    <Phone className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Phone Call</span>
                  </label>
                </div>
              </div>
            )}

            {/* Print-Sign-Scan Info */}
            {formData.signingMethod === 'print_sign_scan' && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">Physical Signature Process</p>
                    <p className="text-sm text-purple-700 mt-1">
                      You will print the documents, have the customer sign physically, then scan and upload 
                      the signed copies. Your OTP will be used to apply the organizational eSeal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Upload */}
          {selectedType && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              
              <div className="space-y-4">
                {/* Required Documents */}
                {selectedType.requiredDocuments.map((docSlot) => {
                  const isAutoIncluded = selectedType.autoIncludeDocs?.some(autoDoc => 
                    docSlot.name.toLowerCase().includes(autoDoc.replace('-', ' '))
                  )
                  const uploadedDoc = uploadedDocuments[docSlot.id]

                  return (
                    <div key={docSlot.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            {docSlot.name}
                            {docSlot.required && !isAutoIncluded && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                            )}
                            {!docSlot.required && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Optional</span>
                            )}
                            {isAutoIncluded && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Auto-included</span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {docSlot.allowedFormats} • Max {docSlot.maxSizeMb}MB
                          </p>
                        </div>
                        {uploadedDoc && (
                          <button
                            onClick={() => handleRemoveDocument(docSlot.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isAutoIncluded ? (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">
                            This document will be automatically included from system templates
                          </span>
                        </div>
                      ) : uploadedDoc ? (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileCheck className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{uploadedDoc.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(uploadedDoc.size)}</p>
                          </div>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Click to upload or drag & drop</span>
                          <input
                            type="file"
                            accept={docSlot.allowedFormats.includes('Images') ? '.pdf,.jpg,.jpeg,.png' : '.pdf'}
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(docSlot.id, e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                  )
                })}

                {/* Additional Documents */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Documents (Optional)</h4>
                  
                  {additionalDocuments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {additionalDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveAdditionalDoc(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Add more documents</span>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAdditionalDocUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Message & Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Message & Options</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Recipient (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a personal message that will be included in the invitation email..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={formData.expiryDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 30 }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Channel
                  </label>
                  <select
                    value={formData.notificationChannel}
                    onChange={(e) => setFormData(prev => ({ ...prev, notificationChannel: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="email">Email Only</option>
                    <option value="sms">SMS Only</option>
                    <option value="both">Email & SMS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-4">
              {/* Type */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Envelope Type</p>
                  <p className="font-medium text-gray-900">
                    {selectedType?.name || 'Not selected'}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="font-medium text-gray-900 break-words">
                    {formData.title || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recipient</p>
                  <p className="font-medium text-gray-900">
                    {selectedCustomer?.name || 'Not selected'}
                  </p>
                  {selectedCustomer && (
                    <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                  )}
                </div>
              </div>

              {/* Signing Method */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  formData.signingMethod === 'digital_self_service' ? 'bg-blue-100' :
                  formData.signingMethod === 'agent_assisted' ? 'bg-amber-100' : 'bg-purple-100'
                }`}>
                  {formData.signingMethod === 'digital_self_service' ? (
                    <Mail className="w-4 h-4 text-blue-600" />
                  ) : formData.signingMethod === 'agent_assisted' ? (
                    <Users className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Printer className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signing Method</p>
                  <p className={`font-medium ${
                    formData.signingMethod === 'digital_self_service' ? 'text-blue-600' :
                    formData.signingMethod === 'agent_assisted' ? 'text-amber-600' : 'text-purple-600'
                  }`}>
                    {SIGNING_METHODS.find(m => m.id === formData.signingMethod)?.name || 'Not selected'}
                  </p>
                  {formData.signingMethod === 'agent_assisted' && (
                    <p className="text-xs text-gray-500">
                      {formData.agentAssistedMode === 'in_person' ? 'In-Person' : 'Phone Call'}
                    </p>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="font-medium text-gray-900">
                    {Object.keys(uploadedDocuments).length + additionalDocuments.length} uploaded
                    {selectedType && (
                      <span className="text-gray-500">
                        {' '}/ {selectedType.requiredDocuments.filter(d => 
                          d.required && !selectedType.autoIncludeDocs?.some(autoDoc => 
                            d.name.toLowerCase().includes(autoDoc.replace('-', ' '))
                          )
                        ).length} required
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Expiry */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expires</p>
                  <p className="font-medium text-gray-900">
                    {formData.expiryDays} days from sending
                  </p>
                </div>
              </div>

              {/* Verification Requirements */}
              {selectedType && (selectedType.verification.requireIdVerification || selectedType.verification.requireFaceMatch) && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification</p>
                    <div className="space-y-1">
                      {selectedType.verification.requireIdVerification && (
                        <p className="text-sm text-gray-700">✓ ID Verification</p>
                      )}
                      {selectedType.verification.requireFaceMatch && (
                        <p className="text-sm text-gray-700">✓ Face Match</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Checklist */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-3">CHECKLIST</p>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${formData.envelopeTypeId ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.envelopeTypeId ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Envelope type selected
                </div>
                <div className={`flex items-center gap-2 text-sm ${formData.title ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.title ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Title provided
                </div>
                <div className={`flex items-center gap-2 text-sm ${formData.customerId ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.customerId ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Recipient selected
                </div>
                <div className={`flex items-center gap-2 text-sm ${
                  selectedType && selectedType.requiredDocuments.filter(d => 
                    d.required && !selectedType.autoIncludeDocs?.some(autoDoc => 
                      d.name.toLowerCase().includes(autoDoc.replace('-', ' '))
                    )
                  ).every(d => uploadedDocuments[d.id]) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {selectedType && selectedType.requiredDocuments.filter(d => 
                    d.required && !selectedType.autoIncludeDocs?.some(autoDoc => 
                      d.name.toLowerCase().includes(autoDoc.replace('-', ' '))
                    )
                  ).every(d => uploadedDocuments[d.id]) ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Required documents uploaded
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmit('send')}
                disabled={isSubmitting || !isFormValid()}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.signingMethod === 'agent_assisted' ? 'bg-amber-600 hover:bg-amber-700' :
                  formData.signingMethod === 'print_sign_scan' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : formData.signingMethod === 'agent_assisted' ? (
                  <Users className="w-4 h-4" />
                ) : formData.signingMethod === 'print_sign_scan' ? (
                  <Printer className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {formData.signingMethod === 'digital_self_service' && 'Create & Send Invitation'}
                {formData.signingMethod === 'agent_assisted' && 'Create & Start Assisted Signing'}
                {formData.signingMethod === 'print_sign_scan' && 'Create & Print Documents'}
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>
            </div>

            {/* eIDAS Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-indigo-500" />
              {formData.signingMethod === 'print_sign_scan' 
                ? 'Physical Signature + eSeal' 
                : 'eIDAS Compliant Digital Signing'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvelopeCreatePage
