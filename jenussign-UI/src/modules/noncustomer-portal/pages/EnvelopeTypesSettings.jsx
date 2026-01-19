import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Check,
  X,
  Copy,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Settings,
  Shield,
  Clock,
  Code,
  Folder,
  ClipboardCheck,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi } from '../../../api/settingsApi'

const categories = ['Insurance', 'Banking', 'Legal', 'HR', 'Other']

const EnvelopeTypesSettings = () => {
  const [envelopeTypes, setEnvelopeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableConsents, setAvailableConsents] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editForm, setEditForm] = useState({})

  // Fetch envelope types and consents on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesData, consentsData] = await Promise.all([
          settingsApi.getEnvelopeTypes(),
          settingsApi.getConsentDefinitions()
        ])
        setEnvelopeTypes(typesData || [])
        setAvailableConsents(consentsData || [])
      } catch (error) {
        console.error('Failed to load envelope types:', error)
        toast.error('Failed to load envelope types')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleToggleActive = async (id) => {
    const type = envelopeTypes.find(t => t.id === id)
    try {
      await settingsApi.updateEnvelopeType(id, { isActive: !type.isActive })
      setEnvelopeTypes(types =>
        types.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
      )
      toast.success('Status updated')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleToggleManual = (id) => {
    setEnvelopeTypes(types =>
      types.map(t => t.id === id ? { ...t, allowManualCreation: !t.allowManualCreation } : t)
    )
  }

  const handleToggleApi = (id) => {
    setEnvelopeTypes(types =>
      types.map(t => t.id === id ? { ...t, allowApiCreation: !t.allowApiCreation } : t)
    )
  }

  const handleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleEdit = (type) => {
    setEditingId(type.id)
    setEditForm({ ...type })
  }

  const handleSaveEdit = () => {
    setEnvelopeTypes(types =>
      types.map(t => t.id === editingId ? { ...editForm } : t)
    )
    setEditingId(null)
    toast.success('Envelope type updated')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this envelope type?')) {
      try {
        await settingsApi.deleteEnvelopeType(id)
        setEnvelopeTypes(types => types.filter(t => t.id !== id))
        toast.success('Envelope type deleted')
      } catch (error) {
        console.error('Failed to delete envelope type:', error)
        toast.error('Failed to delete envelope type')
      }
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('API code copied to clipboard')
  }

  const handleCreateNew = async () => {
    const newType = {
      name: 'New Envelope Type',
      code: 'NEW_TYPE',
      description: '',
      category: 'Insurance',
      allowManualCreation: true,
      allowApiCreation: true,
      requiresIdVerification: true,
      requiresFaceMatch: false,
      defaultExpiryDays: 30,
      requiredDocuments: [
        { id: 'doc-1', name: 'Main Document', required: true },
      ],
      consents: [
        { consentId: 'consent-001', required: true },
        { consentId: 'consent-002', required: true },
      ],
      isActive: false,
      usageCount: 0,
    }
    try {
      const created = await settingsApi.createEnvelopeType(newType)
      setEnvelopeTypes([...envelopeTypes, created])
      setExpandedId(created.id)
      setEditingId(created.id)
      setEditForm(created)
      toast.success('New envelope type created - please configure it')
    } catch (error) {
      console.error('Failed to create envelope type:', error)
      toast.error('Failed to create envelope type')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading envelope types...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Envelope Types</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure document types for manual and API-based envelope creation
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Type
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex gap-3">
          <Code className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">API Integration</p>
            <p className="text-blue-600 mt-1">
              Use the <code className="bg-blue-100 px-1.5 py-0.5 rounded">code</code> field when creating envelopes via API. 
              Example: <code className="bg-blue-100 px-1.5 py-0.5 rounded">POST /api/envelopes {"{ type: 'HOME_INS_PROP' }"}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Envelope Types List */}
      <div className="space-y-3">
        {envelopeTypes.map((type) => (
          <motion.div
            key={type.id}
            layout
            className={`bg-white border rounded-xl overflow-hidden ${
              type.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Header Row */}
            <div
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleExpand(type.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  type.isActive ? 'bg-indigo-100' : 'bg-gray-200'
                }`}>
                  <FileText className={`w-5 h-5 ${type.isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${type.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {type.name}
                    </h3>
                    {!type.isActive && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyCode(type.code)
                      }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-mono bg-gray-100 px-2 py-0.5 rounded"
                    >
                      <Code className="w-3 h-3" />
                      {type.code}
                      <Copy className="w-3 h-3 ml-1" />
                    </button>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{type.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{type.usageCount} envelopes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Quick Toggles */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleManual(type.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      type.allowManualCreation
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title="Allow manual creation"
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => handleToggleApi(type.id)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      type.allowApiCreation
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                    title="Allow API creation"
                  >
                    API
                  </button>
                </div>

                {/* Active Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleActive(type.id)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {type.isActive ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </button>

                {/* Expand Arrow */}
                {expandedId === type.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedId === type.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-6">
                    {editingId === type.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Code</label>
                            <input
                              type="text"
                              value={editForm.code}
                              onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Expiry (days)</label>
                            <input
                              type="number"
                              value={editForm.defaultExpiryDays}
                              onChange={(e) => setEditForm({ ...editForm, defaultExpiryDays: parseInt(e.target.value) })}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows={2}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Creation Methods */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-700">Creation Methods</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Settings className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">Manual Creation</p>
                                  <p className="text-xs text-gray-500">Agents can create in portal</p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={editForm.allowManualCreation}
                                onChange={(e) => setEditForm({ ...editForm, allowManualCreation: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Code className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">API Creation</p>
                                  <p className="text-xs text-gray-500">Navins can create via API</p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={editForm.allowApiCreation}
                                onChange={(e) => setEditForm({ ...editForm, allowApiCreation: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Required Document Types - FIRST */}
                        <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
                          <div className="flex items-center justify-between bg-indigo-50 -mx-6 px-6 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              <label className="text-sm font-semibold text-indigo-900">Required Document Types</label>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDoc = {
                                  id: `doc-${Date.now()}`,
                                  name: '',
                                  description: '',
                                  required: true,
                                  allowedFormats: ['pdf'],
                                  maxSizeMb: 10,
                                }
                                setEditForm({
                                  ...editForm,
                                  requiredDocuments: [...(editForm.requiredDocuments || []), newDoc],
                                })
                              }}
                              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Add Document Type
                            </button>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Define the document slots that will appear when creating an envelope of this type.
                          </p>

                          <div className="space-y-3">
                            {(editForm.requiredDocuments || []).map((doc, index) => (
                              <div key={doc.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                    <span className="text-sm font-medium text-gray-700">Document {index + 1}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditForm({
                                        ...editForm,
                                        requiredDocuments: editForm.requiredDocuments.filter((_, i) => i !== index),
                                      })
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Document Name *</label>
                                    <input
                                      type="text"
                                      value={doc.name}
                                      onChange={(e) => {
                                        const updated = [...editForm.requiredDocuments]
                                        updated[index] = { ...doc, name: e.target.value }
                                        setEditForm({ ...editForm, requiredDocuments: updated })
                                      }}
                                      placeholder="e.g., Insurance Proposal"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Allowed Formats</label>
                                    <select
                                      value={doc.allowedFormats?.[0] || 'pdf'}
                                      onChange={(e) => {
                                        const updated = [...editForm.requiredDocuments]
                                        updated[index] = { ...doc, allowedFormats: [e.target.value] }
                                        setEditForm({ ...editForm, requiredDocuments: updated })
                                      }}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                      <option value="pdf">PDF Only</option>
                                      <option value="image">Images (JPG, PNG)</option>
                                      <option value="any">Any Format</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Description (shown to agents)</label>
                                  <input
                                    type="text"
                                    value={doc.description || ''}
                                    onChange={(e) => {
                                      const updated = [...editForm.requiredDocuments]
                                      updated[index] = { ...doc, description: e.target.value }
                                      setEditForm({ ...editForm, requiredDocuments: updated })
                                    }}
                                    placeholder="e.g., Main proposal document from Navins"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={doc.required}
                                      onChange={(e) => {
                                        const updated = [...editForm.requiredDocuments]
                                        updated[index] = { ...doc, required: e.target.checked }
                                        setEditForm({ ...editForm, requiredDocuments: updated })
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Required document</span>
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600">Max size:</label>
                                    <select
                                      value={doc.maxSizeMb || 10}
                                      onChange={(e) => {
                                        const updated = [...editForm.requiredDocuments]
                                        updated[index] = { ...doc, maxSizeMb: parseInt(e.target.value) }
                                        setEditForm({ ...editForm, requiredDocuments: updated })
                                      }}
                                      className="px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                                    >
                                      <option value={5}>5 MB</option>
                                      <option value={10}>10 MB</option>
                                      <option value={25}>25 MB</option>
                                      <option value={50}>50 MB</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {(!editForm.requiredDocuments || editForm.requiredDocuments.length === 0) && (
                              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No document types defined</p>
                                <p className="text-xs text-gray-400 mt-1">Click "Add Document Type" to define required documents</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Verification Requirements - AFTER documents */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <label className="block text-sm font-medium text-gray-700">Verification Requirements</label>
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.requiresIdVerification}
                                onChange={(e) => setEditForm({ ...editForm, requiresIdVerification: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">ID Verification</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.requiresFaceMatch}
                                onChange={(e) => setEditForm({ ...editForm, requiresFaceMatch: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">Face Match</span>
                            </label>
                          </div>
                        </div>

                        {/* Required Consents */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Required Consents</label>
                            <span className="text-xs text-gray-500">
                              {(editForm.consents || []).length} selected
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Select which consent statements customers must accept for this envelope type
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {AVAILABLE_CONSENTS.map((consent) => {
                              const isSelected = (editForm.consents || []).some(c => c.consentId === consent.id)
                              const selectedConsent = (editForm.consents || []).find(c => c.consentId === consent.id)
                              
                              return (
                                <div
                                  key={consent.id}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    isSelected
                                      ? 'border-indigo-300 bg-indigo-50'
                                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        let updated = [...(editForm.consents || [])]
                                        if (e.target.checked) {
                                          updated.push({ consentId: consent.id, required: consent.defaultRequired })
                                        } else {
                                          updated = updated.filter(c => c.consentId !== consent.id)
                                        }
                                        setEditForm({ ...editForm, consents: updated })
                                      }}
                                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-900">{consent.shortName}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                          consent.category === 'privacy' ? 'bg-blue-100 text-blue-700' :
                                          consent.category === 'legal' ? 'bg-purple-100 text-purple-700' :
                                          consent.category === 'communication' ? 'bg-green-100 text-green-700' :
                                          'bg-gray-100 text-gray-600'
                                        }`}>
                                          {consent.category}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-0.5 truncate">{consent.name}</p>
                                      {isSelected && (
                                        <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={selectedConsent?.required ?? true}
                                            onChange={(e) => {
                                              const updated = (editForm.consents || []).map(c =>
                                                c.consentId === consent.id ? { ...c, required: e.target.checked } : c
                                              )
                                              setEditForm({ ...editForm, consents: updated })
                                            }}
                                            className="w-3.5 h-3.5 text-red-600 rounded focus:ring-red-500"
                                          />
                                          <span className="text-xs text-gray-600">Required (must accept)</span>
                                        </label>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                            <p className="text-gray-900">{type.description || 'No description'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Settings</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Expires in {type.defaultExpiryDays} days</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {type.requiresIdVerification && type.requiresFaceMatch
                                    ? 'ID + Face Match'
                                    : type.requiresIdVerification
                                    ? 'ID Verification'
                                    : 'OTP Only'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Required Documents</h4>
                            <div className="space-y-1">
                              {type.requiredDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{doc.name}</span>
                                  {doc.required && (
                                    <span className="text-xs text-red-500">*</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Consents Section in View Mode */}
                        {type.consents && type.consents.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                              <ClipboardCheck className="w-4 h-4" />
                              Required Consents ({type.consents.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {type.consents.map((consent) => {
                                const consentDef = AVAILABLE_CONSENTS.find(c => c.id === consent.consentId)
                                if (!consentDef) return null
                                return (
                                  <div
                                    key={consent.consentId}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                                      consent.required
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}
                                  >
                                    <span className="font-medium">{consentDef.shortName}</span>
                                    {consent.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Created {new Date(type.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(type)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Types</p>
          <p className="text-2xl font-bold text-gray-900">{envelopeTypes.length}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {envelopeTypes.filter(t => t.isActive).length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Manual Enabled</p>
          <p className="text-2xl font-bold text-blue-600">
            {envelopeTypes.filter(t => t.allowManualCreation && t.isActive).length}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">API Enabled</p>
          <p className="text-2xl font-bold text-purple-600">
            {envelopeTypes.filter(t => t.allowApiCreation && t.isActive).length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EnvelopeTypesSettings
