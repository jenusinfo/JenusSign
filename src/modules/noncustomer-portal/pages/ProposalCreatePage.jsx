import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react'
import { proposalsApi, customersApi, consentDefinitionsApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const ProposalCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId')
  
  const { user, isAgent } = useAuthStore()

  const [currentStep, setCurrentStep] = useState(1) // 1: Details, 2: Document, 3: Send
  const [createdProposalId, setCreatedProposalId] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    insuranceCoreProposalId: '',
    proposalRef: '',
    productType: '',
    expiryDate: '',
    consentDefinitionIds: []
  })

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 })
  })
  const customers = customersData?.items || []

  // Fetch consent definitions
  const { data: consentsData } = useQuery({
    queryKey: ['consent-definitions'],
    queryFn: () => consentDefinitionsApi.getConsentDefinitions()
  })
  const consents = consentsData || []

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: (data) => proposalsApi.createProposal(data),
    onSuccess: (data) => {
      setCreatedProposalId(data.id)
      toast.success('Proposal created successfully')
	  //navigate('/portal/proposals')  // ← Make sure this also goes to list
      setCurrentStep(2)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create proposal')
    }
  })

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: ({ proposalId, file }) => proposalsApi.uploadDocument(proposalId, file),
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      setCurrentStep(3)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document')
    }
  })

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: (proposalId) => proposalsApi.sendInvitation(proposalId, {
      emailSubject: 'Your Insurance Proposal',
      emailBodyTemplateKey: 'ProposalInvitationDefault'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals'])
      toast.success('Invitation sent successfully')
      navigate('/portal/proposals')  // ← Goes to list 
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invitation')
    }
  })

  // Handle form submit
  const handleCreateProposal = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }
    if (!formData.proposalRef) {
      toast.error('Please enter a proposal reference')
      return
    }
    if (!formData.productType) {
      toast.error('Please enter a product type')
      return
    }
    if (!formData.expiryDate) {
      toast.error('Please select an expiry date')
      return
    }

    createProposalMutation.mutate(formData)
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPdfPreviewUrl(url)
    
    toast.success('File selected successfully')
  }

  // Handle document upload
  const handleUploadDocument = () => {
    if (!uploadedFile) {
      toast.error('Please select a file first')
      return
    }

    uploadDocumentMutation.mutate({
      proposalId: createdProposalId,
      file: uploadedFile
    })
  }

  // Handle send invitation
  const handleSendInvitation = () => {
    sendInvitationMutation.mutate(createdProposalId)
  }

  // Clear preview
  const handleClearFile = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
    }
    setUploadedFile(null)
    setPdfPreviewUrl(null)
  }

  // Get selected customer name
  const selectedCustomer = customers.find(c => c.id === formData.customerId)
  const customerName = selectedCustomer?.fullName || selectedCustomer?.legalName || ''

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/portal/proposals')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Proposal</h1>
          <p className="text-gray-600 mt-1">Create and send a proposal to a customer</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <div>
                <div className="font-medium text-gray-900">Details</div>
                <div className="text-xs text-gray-500">Proposal information</div>
              </div>
            </div>

            <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <div>
                <div className="font-medium text-gray-900">Document</div>
                <div className="text-xs text-gray-500">Upload PDF</div>
              </div>
            </div>

            <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
              </div>
              <div>
                <div className="font-medium text-gray-900">Send</div>
                <div className="text-xs text-gray-500">Send invitation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Proposal Details */}
        {currentStep === 1 && (
          <form onSubmit={handleCreateProposal} className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Proposal Details</h2>

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName || customer.legalName} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {/* ICS Proposal ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Core System Proposal ID
              </label>
              <input
                type="text"
                value={formData.insuranceCoreProposalId}
                onChange={(e) => setFormData({ ...formData, insuranceCoreProposalId: e.target.value })}
                placeholder="e.g., PROP-12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: ID from your insurance core system</p>
            </div>

            {/* Proposal Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposal Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.proposalRef}
                onChange={(e) => setFormData({ ...formData, proposalRef: e.target.value })}
                placeholder="e.g., PR-2024-0002"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select product type</option>
                <option value="Home Insurance">Home Insurance</option>
                <option value="Car Insurance">Car Insurance</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Health Insurance">Health Insurance</option>
                <option value="Business Insurance">Business Insurance</option>
                <option value="Travel Insurance">Travel Insurance</option>
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Consent Definitions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Consents
              </label>
              <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                {consents.length === 0 ? (
                  <p className="text-sm text-gray-500">No consent definitions available</p>
                ) : (
                  consents.map((consent) => (
                    <label key={consent.id} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consentDefinitionIds.includes(consent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              consentDefinitionIds: [...formData.consentDefinitionIds, consent.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              consentDefinitionIds: formData.consentDefinitionIds.filter(id => id !== consent.id)
                            })
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {consent.label}
                          {consent.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {consent.description && (
                          <div className="text-xs text-gray-500">{consent.description}</div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/portal/proposals')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProposalMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {createProposalMutation.isPending ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Upload Document */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Proposal Document</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload the PDF document for {customerName} to review and sign
              </p>
            </div>

            {/* File Upload Area */}
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Document</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a PDF file (max 10MB)
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Choose PDF File
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                      <div className="text-sm text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* PDF Preview */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Eye className="w-4 h-4" />
                      Document Preview
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4">
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-96 border border-gray-300 rounded bg-white"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              {uploadedFile && (
                <button
                  onClick={handleUploadDocument}
                  disabled={uploadDocumentMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload & Continue'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Send Invitation */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Proposal Ready</h2>
              <p className="text-gray-600 mb-6">
                Your proposal is ready to be sent to {customerName}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto mb-6">
                <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Send className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Customer receives email with secure link
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Customer reviews document and consents
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    Customer signs with digital signature
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate(`/portal/proposals/${createdProposalId}`)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={sendInvitationMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendInvitationMutation.isPending ? 'Sending...' : 'Send Invitation Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProposalCreatePage
