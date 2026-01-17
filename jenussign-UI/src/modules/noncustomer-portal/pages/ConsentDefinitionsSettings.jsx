import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
  Save,
  GripVertical,
  Tag,
  Clock,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Mock consent data
const MOCK_CONSENTS = [
  {
    id: 'consent-001',
    name: 'GDPR Data Processing Consent',
    shortName: 'GDPR',
    category: 'privacy',
    defaultRequired: true,
    isActive: true,
    version: '2.1',
    lastUpdated: '2025-01-15',
    usedInTypes: 5,
    text: 'I consent to the processing of my personal data in accordance with the General Data Protection Regulation (GDPR) and the company\'s Privacy Policy. I understand that my data will be used for the purpose of providing insurance services and managing my policy.',
    legalReference: 'GDPR Article 6(1)(a)',
  },
  {
    id: 'consent-002',
    name: 'Terms & Conditions Acceptance',
    shortName: 'T&C',
    category: 'legal',
    defaultRequired: true,
    isActive: true,
    version: '3.0',
    lastUpdated: '2025-01-10',
    usedInTypes: 8,
    text: 'I confirm that I have read, understood, and agree to be bound by the Terms and Conditions of this insurance policy. I acknowledge that providing false or misleading information may void my coverage.',
    legalReference: 'Insurance Contract Law',
  },
  {
    id: 'consent-003',
    name: 'Electronic Communication Consent',
    shortName: 'E-Comms',
    category: 'communication',
    defaultRequired: true,
    isActive: true,
    version: '1.5',
    lastUpdated: '2024-12-20',
    usedInTypes: 8,
    text: 'I consent to receive all communications related to my insurance policy electronically, including but not limited to policy documents, renewal notices, claims correspondence, and other official communications via email or through the customer portal.',
    legalReference: 'eIDAS Regulation',
  },
  {
    id: 'consent-004',
    name: 'Marketing Communications',
    shortName: 'Marketing',
    category: 'marketing',
    defaultRequired: false,
    isActive: true,
    version: '1.2',
    lastUpdated: '2024-11-15',
    usedInTypes: 3,
    text: 'I agree to receive marketing communications about products, services, and special offers from Hydra Insurance Ltd and its partners. I understand I can withdraw this consent at any time.',
    legalReference: 'GDPR Article 7',
  },
  {
    id: 'consent-005',
    name: 'Third Party Data Sharing',
    shortName: '3rd Party',
    category: 'privacy',
    defaultRequired: false,
    isActive: true,
    version: '1.0',
    lastUpdated: '2024-10-01',
    usedInTypes: 2,
    text: 'I consent to the sharing of my personal data with third-party service providers, including reinsurers, claims assessors, and fraud prevention agencies, for the purposes of policy administration and claims processing.',
    legalReference: 'GDPR Article 6(1)(f)',
  },
  {
    id: 'consent-006',
    name: 'Medical Information Release',
    shortName: 'Medical',
    category: 'privacy',
    defaultRequired: true,
    isActive: false,
    version: '1.0',
    lastUpdated: '2024-09-01',
    usedInTypes: 1,
    text: 'I authorize the release of my medical information to Hydra Insurance Ltd and its appointed medical examiners for the purpose of assessing my insurance application and processing any related claims.',
    legalReference: 'Data Protection Act',
  },
]

const CATEGORIES = [
  { id: 'privacy', name: 'Privacy & Data', color: 'blue' },
  { id: 'legal', name: 'Legal & Compliance', color: 'purple' },
  { id: 'communication', name: 'Communication', color: 'green' },
  { id: 'marketing', name: 'Marketing', color: 'orange' },
  { id: 'financial', name: 'Financial', color: 'indigo' },
]

const ConsentDefinitionsSettings = () => {
  const [consents, setConsents] = useState(MOCK_CONSENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedConsent, setExpandedConsent] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingConsent, setEditingConsent] = useState(null)

  // Filter consents
  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         consent.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || consent.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && consent.isActive) ||
                         (filterStatus === 'inactive' && !consent.isActive)
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Toggle consent active status
  const toggleConsentStatus = (consentId) => {
    setConsents(prev => prev.map(c => 
      c.id === consentId ? { ...c, isActive: !c.isActive } : c
    ))
    const consent = consents.find(c => c.id === consentId)
    toast.success(`${consent.shortName} ${consent.isActive ? 'deactivated' : 'activated'}`)
  }

  // Delete consent
  const deleteConsent = (consentId) => {
    const consent = consents.find(c => c.id === consentId)
    if (consent.usedInTypes > 0) {
      toast.error(`Cannot delete: Used in ${consent.usedInTypes} envelope types`)
      return
    }
    setConsents(prev => prev.filter(c => c.id !== consentId))
    toast.success('Consent deleted')
  }

  // Duplicate consent
  const duplicateConsent = (consent) => {
    const newConsent = {
      ...consent,
      id: `consent-${Date.now()}`,
      name: `${consent.name} (Copy)`,
      shortName: `${consent.shortName}-Copy`,
      version: '1.0',
      usedInTypes: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    setConsents(prev => [...prev, newConsent])
    toast.success('Consent duplicated')
  }

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find(c => c.id === category)
    return cat?.color || 'gray'
  }

  const getCategoryName = (category) => {
    const cat = CATEGORIES.find(c => c.id === category)
    return cat?.name || category
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consent Definitions</h3>
          <p className="text-sm text-gray-500">
            Manage consent templates that can be used across envelope types
          </p>
        </div>
        <button
          onClick={() => {
            setEditingConsent(null)
            setShowCreateModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Consent
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search consents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Consents</p>
          <p className="text-2xl font-bold text-gray-900">{consents.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{consents.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-600">Required by Default</p>
          <p className="text-2xl font-bold text-amber-700">{consents.filter(c => c.defaultRequired).length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">{CATEGORIES.length}</p>
        </div>
      </div>

      {/* Consents List */}
      <div className="space-y-3">
        {filteredConsents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No consents found</p>
          </div>
        ) : (
          filteredConsents.map((consent) => (
            <motion.div
              key={consent.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                consent.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Consent Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      consent.isActive ? 'bg-indigo-100' : 'bg-gray-200'
                    }`}>
                      <Shield className={`w-5 h-5 ${consent.isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium ${consent.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {consent.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${getCategoryColor(consent.category)}-100 text-${getCategoryColor(consent.category)}-700`}>
                          {getCategoryName(consent.category)}
                        </span>
                        {consent.defaultRequired ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                            Required
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            Optional
                          </span>
                        )}
                        {!consent.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {consent.shortName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          v{consent.version}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Used in {consent.usedInTypes} types
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedConsent(expandedConsent === consent.id ? null : consent.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedConsent === consent.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedConsent === consent.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 bg-gray-50">
                      {/* Consent Text */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Consent Text</label>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-700">
                          {consent.text}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Legal Reference</label>
                          <p className="text-sm text-gray-900">{consent.legalReference}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Version</label>
                          <p className="text-sm text-gray-900">{consent.version}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
                          <p className="text-sm text-gray-900">{consent.lastUpdated}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Used In</label>
                          <p className="text-sm text-gray-900">{consent.usedInTypes} envelope types</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <button
                          onClick={() => toggleConsentStatus(consent.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            consent.isActive
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {consent.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => duplicateConsent(consent)}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingConsent(consent)
                              setShowCreateModal(true)
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteConsent(consent.id)}
                            disabled={consent.usedInTypes > 0}
                            className={`p-2 transition-colors ${
                              consent.usedInTypes > 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                            title={consent.usedInTypes > 0 ? 'Cannot delete: in use' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <ConsentModal
            consent={editingConsent}
            categories={CATEGORIES}
            onClose={() => {
              setShowCreateModal(false)
              setEditingConsent(null)
            }}
            onSave={(consentData) => {
              if (editingConsent) {
                setConsents(prev => prev.map(c => 
                  c.id === editingConsent.id ? { ...c, ...consentData, lastUpdated: new Date().toISOString().split('T')[0] } : c
                ))
                toast.success('Consent updated')
              } else {
                const newConsent = {
                  ...consentData,
                  id: `consent-${Date.now()}`,
                  version: '1.0',
                  usedInTypes: 0,
                  lastUpdated: new Date().toISOString().split('T')[0],
                }
                setConsents(prev => [...prev, newConsent])
                toast.success('Consent created')
              }
              setShowCreateModal(false)
              setEditingConsent(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Consent Create/Edit Modal
const ConsentModal = ({ consent, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: consent?.name || '',
    shortName: consent?.shortName || '',
    category: consent?.category || 'privacy',
    defaultRequired: consent?.defaultRequired ?? true,
    isActive: consent?.isActive ?? true,
    text: consent?.text || '',
    legalReference: consent?.legalReference || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.shortName || !formData.text) {
      toast.error('Please fill in all required fields')
      return
    }
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {consent ? 'Edit Consent' : 'Create New Consent'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Name & Short Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., GDPR Data Processing Consent"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                placeholder="e.g., GDPR"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used for compact display</p>
            </div>
          </div>

          {/* Category & Legal Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Reference</label>
              <input
                type="text"
                value={formData.legalReference}
                onChange={(e) => setFormData(prev => ({ ...prev, legalReference: e.target.value }))}
                placeholder="e.g., GDPR Article 6(1)(a)"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Consent Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consent Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={5}
              placeholder="Enter the full consent text that will be shown to customers..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will be displayed to customers for acceptance
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.defaultRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultRequired: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">Required by Default</p>
                <p className="text-xs text-gray-500">Consent must be accepted to proceed</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Available for use in envelope types</p>
              </div>
            </label>
          </div>

          {/* Preview */}
          {formData.text && (
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Preview</label>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    disabled
                    className="w-5 h-5 rounded border-gray-300 mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-gray-700">{formData.text}</p>
                    {formData.defaultRequired && (
                      <p className="text-xs text-red-500 mt-1">* This consent is required</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {consent ? 'Update Consent' : 'Create Consent'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ConsentDefinitionsSettings
