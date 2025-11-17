import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Send, Plus, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import proposalsApi from '../../../api/proposalsApi'
import customersApi from '../../../api/customersApi'
import Loading from '../../../shared/components/Loading'

const MOCK_CONSENT_DEFINITIONS = [
  {
    id: 'cd1',
    label: 'I accept the Terms & Conditions',
    controlType: 'Checkbox',
    isRequired: true,
  },
  {
    id: 'cd2',
    label: 'I consent to receiving marketing communications',
    controlType: 'Checkbox',
    isRequired: false,
  },
  {
    id: 'cd3',
    label: 'I consent to data processing',
    controlType: 'Checkbox',
    isRequired: true,
  },
]

export default function ProposalCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')

  const [step, setStep] = useState(1) // 1: Details, 2: Upload, 3: Send
  const [proposalData, setProposalData] = useState({
    customerId: customerId || '',
    insuranceCoreProposalId: '',
    proposalRef: '',
    productType: '',
    expiryDate: '',
    consentDefinitionIds: [],
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [createdProposalId, setCreatedProposalId] = useState(null)

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers(),
  })

  const createProposalMutation = useMutation({
    mutationFn: proposalsApi.createProposal,
    onSuccess: (data) => {
      setCreatedProposalId(data.id)
      toast.success('Proposal created successfully')
      setStep(2)
    },
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ proposalId, file }) => proposalsApi.uploadDocument(proposalId, file),
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      setStep(3)
    },
  })

  const sendInvitationMutation = useMutation({
    mutationFn: (proposalId) =>
      proposalsApi.sendInvitation(proposalId, {
        emailSubject: 'Your Insurance Proposal',
        emailBodyTemplateKey: 'ProposalInvitationDefault',
      }),
    onSuccess: () => {
      toast.success('Invitation sent successfully!')
      navigate(`/portal/proposals/${createdProposalId}`)
    },
  })

  const customers = customersData?.items || []

  const handleCreateProposal = (e) => {
    e.preventDefault()
    if (!proposalData.customerId || !proposalData.proposalRef || !proposalData.productType || !proposalData.expiryDate) {
      toast.error('Please fill in all required fields')
      return
    }
    createProposalMutation.mutate(proposalData)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      toast.error('Please select a PDF file')
    }
  }

  const handleUploadDocument = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }
    uploadDocumentMutation.mutate({
      proposalId: createdProposalId,
      file: selectedFile,
    })
  }

  const handleSendInvitation = () => {
    sendInvitationMutation.mutate(createdProposalId)
  }

  const toggleConsent = (consentId) => {
    setProposalData((prev) => ({
      ...prev,
      consentDefinitionIds: prev.consentDefinitionIds.includes(consentId)
        ? prev.consentDefinitionIds.filter((id) => id !== consentId)
        : [...prev.consentDefinitionIds, consentId],
    }))
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/portal/proposals')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Proposal</h1>
          <p className="text-gray-600">Follow the steps to create and send a proposal</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: 1, label: 'Details' },
            { step: 2, label: 'Upload' },
            { step: 3, label: 'Send' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step === item.step
                      ? 'bg-primary-600 text-white'
                      : step > item.step
                      ? 'bg-success-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > item.step ? <CheckCircle className="w-5 h-5" /> : item.step}
                </div>
                <p className="text-sm mt-2 text-gray-600">{item.label}</p>
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step > item.step ? 'bg-success-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Proposal Details */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Proposal Details</h2>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer <span className="text-danger-600">*</span>
                </label>
                <select
                  value={proposalData.customerId}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, customerId: e.target.value })
                  }
                  className="input"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Reference <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  value={proposalData.proposalRef}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, proposalRef: e.target.value })
                  }
                  placeholder="PR-2025-0001"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Core Proposal ID
                </label>
                <input
                  type="text"
                  value={proposalData.insuranceCoreProposalId}
                  onChange={(e) =>
                    setProposalData({
                      ...proposalData,
                      insuranceCoreProposalId: e.target.value,
                    })
                  }
                  placeholder="PROP12345"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type <span className="text-danger-600">*</span>
                </label>
                <select
                  value={proposalData.productType}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, productType: e.target.value })
                  }
                  className="input"
                  required
                >
                  <option value="">Select product type</option>
                  <option value="Home Insurance">Home Insurance</option>
                  <option value="Motor Insurance">Motor Insurance</option>
                  <option value="Life Insurance">Life Insurance</option>
                  <option value="Health Insurance">Health Insurance</option>
                  <option value="Travel Insurance">Travel Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-danger-600">*</span>
                </label>
                <input
                  type="date"
                  value={proposalData.expiryDate}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, expiryDate: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Consents
                </label>
                <div className="space-y-2">
                  {MOCK_CONSENT_DEFINITIONS.map((consent) => (
                    <div
                      key={consent.id}
                      onClick={() => toggleConsent(consent.id)}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalData.consentDefinitionIds.includes(consent.id)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {consent.label}
                            {consent.isRequired && (
                              <span className="text-danger-600 ml-1">*</span>
                            )}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={createProposalMutation.isPending}
                  className="btn btn-primary"
                >
                  {createProposalMutation.isPending ? 'Creating...' : 'Create Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Upload Document */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Proposal Document</h2>
            <form onSubmit={handleUploadDocument} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">Upload PDF Document</p>
                <p className="text-sm text-gray-600 mb-4">
                  Select the proposal PDF file to upload
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn btn-secondary cursor-pointer">
                  Choose File
                </label>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-success-50 rounded-lg inline-block">
                    <p className="text-sm text-success-900">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  disabled={uploadDocumentMutation.isPending}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploadDocumentMutation.isPending}
                  className="btn btn-primary"
                >
                  {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Send Invitation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Proposal Ready!</h2>
              <p className="text-gray-600">
                Your proposal has been created and the document has been uploaded. Send an
                invitation to the customer to start the signing process.
              </p>
            </div>

            <div className="p-4 bg-primary-50 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer receives email with proposal link</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer verifies identity using Insurance Core System data</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer reviews document and provides digital signature</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>eIDAS AES-compliant signature is applied automatically</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate(`/portal/proposals/${createdProposalId}`)}
                className="btn btn-secondary"
              >
                View Proposal
              </button>
              <button
                onClick={handleSendInvitation}
                disabled={sendInvitationMutation.isPending}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{sendInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
