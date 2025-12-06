import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon,
  FileText,
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Clock,
  Key,
  Mail,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Loading from '../../../shared/components/Loading'

// Mock API - replace with actual API calls
const settingsApi = {
  getSettings: async () => ({
    tsa: {
      endpoint: 'https://freetsa.org/tsr',
      hashAlgorithm: 'SHA256',
    },
    keyVault: {
      name: 'jenussign-vault',
      certificateName: 'insurance-eseal',
    },
    session: {
      timeoutMinutes: 15,
      otpExpiryMinutes: 10,
    },
    retention: {
      years: 10,
    },
  }),
  getConsentDefinitions: async () => [
    {
      id: '1',
      label: 'I accept the Terms & Conditions',
      description: 'Customer must accept company T&C',
      controlType: 'Checkbox',
      isRequired: true,
      isActive: true,
    },
    {
      id: '2',
      label: 'I consent to data processing',
      description: 'GDPR consent for data processing',
      controlType: 'Checkbox',
      isRequired: true,
      isActive: true,
    },
    {
      id: '3',
      label: 'I agree to receive marketing communications',
      description: 'Optional marketing consent',
      controlType: 'Checkbox',
      isRequired: false,
      isActive: true,
    },
  ],
  createConsentDefinition: async (data) => ({ id: Date.now().toString(), ...data }),
  updateConsentDefinition: async (id, data) => ({ id, ...data }),
  deleteConsentDefinition: async (id) => ({ success: true }),
}

function GeneralSettingsTab() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  })

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      {/* TSA Configuration */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Trusted Timestamp Authority
              </h3>
              <p className="text-sm text-gray-600 mt-1">RFC 3161 timestamping service</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TSA Endpoint
            </label>
            <input
              type="text"
              value={settings.tsa.endpoint}
              disabled
              className="input bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Currently using freetsa.org (free RFC 3161 service)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hash Algorithm
            </label>
            <input
              type="text"
              value={settings.tsa.hashAlgorithm}
              disabled
              className="input bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Azure Key Vault */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <Key className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Azure Key Vault Configuration
              </h3>
              <p className="text-sm text-gray-600 mt-1">HSM-backed eSeal storage</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Vault Name
            </label>
            <input
              type="text"
              value={settings.keyVault.name}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Name
            </label>
            <input
              type="text"
              value={settings.keyVault.certificateName}
              disabled
              className="input bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Session & Security */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Shield className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Session & Security</h3>
              <p className="text-sm text-gray-600 mt-1">Timeout and OTP configuration</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.session.timeoutMinutes}
              disabled
              className="input bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Inactivity timeout for signing sessions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Expiry (minutes)
            </label>
            <input
              type="number"
              value={settings.session.otpExpiryMinutes}
              disabled
              className="input bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">One-time password validity</p>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Data Retention</h3>
              <p className="text-sm text-gray-600 mt-1">eIDAS compliance requirement</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retention Period (years)
          </label>
          <input
            type="number"
            value={settings.retention.years}
            disabled
            className="input bg-gray-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum retention period for audit evidence and signed documents
          </p>
        </div>
      </div>
    </div>
  )
}

function ConsentDefinitionsTab() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    controlType: 'Checkbox',
    isRequired: false,
  })

  const { data: consents, isLoading } = useQuery({
    queryKey: ['consent-definitions'],
    queryFn: settingsApi.getConsentDefinitions,
  })

  const createMutation = useMutation({
    mutationFn: settingsApi.createConsentDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries(['consent-definitions'])
      toast.success('Consent definition created')
      setIsCreating(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => settingsApi.updateConsentDefinition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consent-definitions'])
      toast.success('Consent definition updated')
      setEditingId(null)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteConsentDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries(['consent-definitions'])
      toast.success('Consent definition deleted')
    },
  })

  const resetForm = () => {
    setFormData({
      label: '',
      description: '',
      controlType: 'Checkbox',
      isRequired: false,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const startEdit = (consent) => {
    setEditingId(consent.id)
    setFormData({
      label: consent.label,
      description: consent.description,
      controlType: consent.controlType,
      isRequired: consent.isRequired,
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setIsCreating(false)
    setEditingId(null)
    resetForm()
  }

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consent Definitions</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage consent templates for proposals
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary flex items-center space-x-2"
          disabled={isCreating || editingId}
        >
          <Plus className="w-4 h-4" />
          <span>Add Consent</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-primary-50 border-primary-200"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., I accept the Terms & Conditions"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal description for this consent"
                  className="input"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Control Type
                  </label>
                  <select
                    value={formData.controlType}
                    onChange={(e) => setFormData({ ...formData, controlType: e.target.value })}
                    className="input"
                  >
                    <option value="Checkbox">Checkbox</option>
                    <option value="Radio">Radio</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                    Required consent
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button type="submit" className="btn btn-primary flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Update' : 'Create'}</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consents List */}
      <div className="space-y-3">
        {consents.map((consent, index) => (
          <motion.div
            key={consent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card ${editingId === consent.id ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{consent.label}</h4>
                  {consent.isRequired && (
                    <span className="px-2 py-1 text-xs font-medium bg-danger-100 text-danger-700 rounded">
                      Required
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {consent.controlType}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{consent.description}</p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => startEdit(consent)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  disabled={isCreating || editingId}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this consent definition?')) {
                      deleteMutation.mutate(consent.id)
                    }
                  }}
                  className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  disabled={isCreating || editingId}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'consents', label: 'Consent Definitions', icon: FileText },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system settings and consent templates</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && <GeneralSettingsTab />}
          {activeTab === 'consents' && <ConsentDefinitionsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
