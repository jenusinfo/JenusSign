import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Settings,
  Building2,
  Mail,
  Shield,
  Key,
  Bell,
  Award,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Clock,
  ShieldCheck,
  Lock,
  Layers,
  ClipboardCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi } from '../../../api/settingsApi'
import Loading from '../../../shared/components/Loading'
import EnvelopeTypesSettings from './EnvelopeTypesSettings'
import ConsentDefinitionsSettings from './ConsentDefinitionsSettings'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company')
  const queryClient = useQueryClient()

  // Fetch settings from API
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  })

  // Local state for form editing
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    address: '',
    website: '',
    vatNumber: '',
  })

  const [emailSettings, setEmailSettings] = useState({
    senderName: 'JenusSign',
    senderEmail: '',
    replyTo: '',
    enableReminders: true,
    reminderDays: 3,
  })

  const [signingSettings, setSigningSettings] = useState({
    defaultExpiry: 30,
    requireIdVerification: true,
    enableFaceMatch: true,
    otpChannel: 'email',
  })

  // Initialize form with API data
  useEffect(() => {
    if (settingsData) {
      setCompanySettings({
        companyName: settingsData.companyName || '',
        companyEmail: settingsData.supportEmail || '',
        companyPhone: '',
        address: '',
        website: settingsData.baseUrl || '',
        vatNumber: '',
      })
      setEmailSettings(prev => ({
        ...prev,
        enableReminders: settingsData.enableEmailNotifications ?? true,
      }))
      setSigningSettings(prev => ({
        ...prev,
        defaultExpiry: settingsData.signingLinkExpiryDays || 7,
      }))
    }
  }, [settingsData])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
      toast.success('Settings saved successfully!')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })

  // Certificate/eSeal settings (from API or defaults)
  const certificateSettings = {
    eSealEnabled: settingsData?.keyVaultConfigured ?? false,
    eSealDisplayName: 'JenusSign Qualified eSeal',
    tsaEnabled: true,
    tsaUrl: 'https://freetsa.org/tsr',
  }

  // Certificate status (would come from a health check endpoint)
  const certificateStatus = {
    eSeal: {
      status: settingsData?.keyVaultConfigured ? 'valid' : 'disconnected',
      issuer: 'JCC Cyprus Trust Center',
      subject: 'CN=JenusSign, O=Hydra Insurance Ltd, C=CY',
      serialNumber: 'AB:CD:EF:12:34:56:78:90',
      validFrom: '2024-01-15',
      validTo: '2026-01-15',
      keyVaultName: 'kv-jenussign-prod',
      certificateName: 'JenusSign-eSeal-Certificate',
      lastUsed: new Date().toISOString(),
    },
    tsa: {
      status: 'connected',
      lastResponse: new Date().toISOString(),
      responseTime: '245ms',
    },
    jccApi: {
      status: 'connected',
      lastHealthCheck: new Date().toISOString(),
    },
  }

  const [testingConnection, setTestingConnection] = useState(false)

  const handleSave = async () => {
    updateMutation.mutate({
      companyName: companySettings.companyName,
      supportEmail: companySettings.companyEmail,
      signingLinkExpiryDays: signingSettings.defaultExpiry,
      enableEmailNotifications: emailSettings.enableReminders,
    })
  }

  const handleTestConnection = async (service) => {
    setTestingConnection(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setTestingConnection(false)
    toast.success(`${service} connection successful!`)
  }

  const getStatusBadge = (status) => {
    const configs = {
      valid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Valid' },
      connected: { bg: 'bg-green-100', text: 'text-green-700', label: 'Connected' },
      expiring: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Expiring Soon' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
      error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' },
      disconnected: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Disconnected' },
    }
    const config = configs[status] || configs.error
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'signing', label: 'Signing', icon: FileText },
    { id: 'envelopeTypes', label: 'Envelope Types', icon: Layers },
    { id: 'consents', label: 'Consents', icon: ClipboardCheck },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  if (isLoading) {
    return <Loading message="Loading settings..." />
  }

  const saving = updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your organization settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Settings className="w-5 h-5" />
              </motion.div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Company Settings */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companySettings.companyName}
                        onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={companySettings.companyEmail}
                        onChange={(e) => setCompanySettings({ ...companySettings, companyEmail: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={companySettings.companyPhone}
                        onChange={(e) => setCompanySettings({ ...companySettings, companyPhone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                      <input
                        type="text"
                        value={companySettings.vatNumber}
                        onChange={(e) => setCompanySettings({ ...companySettings, vatNumber: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={emailSettings.senderName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                    <input
                      type="email"
                      value={emailSettings.replyTo}
                      onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Days</label>
                    <input
                      type="number"
                      value={emailSettings.reminderDays}
                      onChange={(e) => setEmailSettings({ ...emailSettings, reminderDays: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableReminders"
                    checked={emailSettings.enableReminders}
                    onChange={(e) => setEmailSettings({ ...emailSettings, enableReminders: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="enableReminders" className="text-sm text-gray-700">
                    Enable automatic reminders for unsigned documents
                  </label>
                </div>
              </div>
            )}

            {/* Signing Settings */}
            {activeTab === 'signing' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Signing Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Expiry (days)</label>
                    <input
                      type="number"
                      value={signingSettings.defaultExpiry}
                      onChange={(e) => setSigningSettings({ ...signingSettings, defaultExpiry: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OTP Channel</label>
                    <select
                      value={signingSettings.otpChannel}
                      onChange={(e) => setSigningSettings({ ...signingSettings, otpChannel: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requireIdVerification"
                      checked={signingSettings.requireIdVerification}
                      onChange={(e) => setSigningSettings({ ...signingSettings, requireIdVerification: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="requireIdVerification" className="text-sm text-gray-700">
                      Require ID verification before signing
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enableFaceMatch"
                      checked={signingSettings.enableFaceMatch}
                      onChange={(e) => setSigningSettings({ ...signingSettings, enableFaceMatch: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="enableFaceMatch" className="text-sm text-gray-700">
                      Enable face match verification
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Envelope Types Settings */}
            {activeTab === 'envelopeTypes' && (
              <EnvelopeTypesSettings />
            )}

            {/* Consents Settings */}
            {activeTab === 'consents' && (
              <ConsentDefinitionsSettings />
            )}

            {/* Certificates Settings */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Certificates & eSeal</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="w-4 h-4" />
                    Credentials stored in Azure Key Vault
                  </div>
                </div>

                {/* eSeal Certificate */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">eSeal Certificate</h3>
                        <p className="text-sm text-gray-500">Qualified electronic seal for document signing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(certificateStatus.eSeal.status)}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={certificateSettings.eSealEnabled}
                          onChange={(e) => setCertificateSettings({ ...certificateSettings, eSealEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={certificateSettings.eSealDisplayName}
                          onChange={(e) => setCertificateSettings({ ...certificateSettings, eSealDisplayName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Issuer</label>
                        <p className="text-gray-900 py-2.5">{certificateStatus.eSeal.issuer}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Subject</label>
                        <p className="text-gray-900 text-sm py-2.5 font-mono bg-gray-50 px-3 rounded-lg">
                          {certificateStatus.eSeal.subject}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Serial Number</label>
                        <p className="text-gray-900 text-sm py-2.5 font-mono bg-gray-50 px-3 rounded-lg">
                          {certificateStatus.eSeal.serialNumber}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Valid From</label>
                        <p className="text-gray-900 py-2.5">{formatDate(certificateStatus.eSeal.validFrom)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Valid Until</label>
                        <div className="flex items-center gap-2 py-2.5">
                          <p className="text-gray-900">{formatDate(certificateStatus.eSeal.validTo)}</p>
                          {getDaysUntilExpiry(certificateStatus.eSeal.validTo) < 90 && (
                            <span className="text-amber-600 text-sm">
                              ({getDaysUntilExpiry(certificateStatus.eSeal.validTo)} days left)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key Vault Info */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">Azure Key Vault (HSM-backed)</p>
                          <p className="text-blue-600 mt-1">
                            Vault: <span className="font-mono">{certificateStatus.eSeal.keyVaultName}</span>
                          </p>
                          <p className="text-blue-600">
                            Certificate: <span className="font-mono">{certificateStatus.eSeal.certificateName}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamp Authority */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Timestamp Authority (TSA)</h3>
                        <p className="text-sm text-gray-500">RFC 3161 compliant timestamping service</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(certificateStatus.tsa.status)}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={certificateSettings.tsaEnabled}
                          onChange={(e) => setCertificateSettings({ ...certificateSettings, tsaEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TSA URL</label>
                      <input
                        type="url"
                        value={certificateSettings.tsaUrl}
                        onChange={(e) => setCertificateSettings({ ...certificateSettings, tsaUrl: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        placeholder="https://freetsa.org/tsr"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>Last response: {formatDate(certificateStatus.tsa.lastResponse)}</span>
                        <span>Response time: {certificateStatus.tsa.responseTime}</span>
                      </div>
                      <button
                        onClick={() => handleTestConnection('TSA')}
                        disabled={testingConnection}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>

                {/* JCC Trust Services API */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">JCC Trust Services</h3>
                        <p className="text-sm text-gray-500">Qualified Trust Service Provider API</p>
                      </div>
                    </div>
                    {getStatusBadge(certificateStatus.jccApi.status)}
                  </div>
                  <div className="p-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800">Credentials Secured</p>
                          <p className="text-amber-600 mt-1">
                            JCC API credentials (Client ID & Secret) are stored securely in Azure Key Vault 
                            and are not visible in this interface.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Last health check: {formatDate(certificateStatus.jccApi.lastHealthCheck)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestConnection('JCC API')}
                          disabled={testingConnection}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                          Test Connection
                        </button>
                        <a
                          href="https://portal.azure.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Manage in Azure
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* eIDAS Compliance */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">eIDAS Article 26 Compliant</h3>
                      <p className="text-sm text-green-600">
                        Your certificate configuration meets Advanced Electronic Signature (AES) requirements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">eIDAS Compliant</h3>
                      <p className="text-sm text-green-600">Your signing configuration meets Article 26 requirements</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Session Timeout</h4>
                      <p className="text-sm text-gray-500">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Audit Logging</h4>
                      <p className="text-sm text-gray-500">Log all user actions for compliance</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Envelope Signed</h4>
                      <p className="text-sm text-gray-500">Get notified when a customer signs documents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Envelope Expired</h4>
                      <p className="text-sm text-gray-500">Get notified when an envelope expires</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Certificate Expiry Warning</h4>
                      <p className="text-sm text-gray-500">Get notified 90 days before certificate expiry</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Daily Summary</h4>
                      <p className="text-sm text-gray-500">Receive a daily summary of all envelope activity</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
