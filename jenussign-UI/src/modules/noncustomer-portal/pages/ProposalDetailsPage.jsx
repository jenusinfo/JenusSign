import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  Download,
  Send,
  Eye,
  AlertCircle,
  CheckCircle2,
  Building2,
  History,
  Shield,
  Upload,
  X,
  Printer,
  Mail,
  Phone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { proposalsApi, customersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import StatusBadge from '../../../shared/components/StatusBadge'

const ProposalDetailsPage = () => {
  const { proposalId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAdmin, isEmployee } = useAuthStore()
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Load proposal
  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalsApi.getProposal(proposalId),
    enabled: !!proposalId,
  })

  // Load customers (for display)
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 }),
  })

  const customers = customersData?.items || []

  // Find customer safely
  const customer = proposal && customers.length > 0
    ? customers.find((c) => c.id === proposal.customerId) || null
    : null

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: () => proposalsApi.sendInvitation(proposalId, {
      emailSubject: 'Reminder: Your Insurance Proposal',
      emailBodyTemplateKey: 'ProposalReminderDefault'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['proposal', proposalId])
      toast.success('Invitation resent successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resend invitation')
    }
  })

  // Upload physical signature mutation
  const uploadMutation = useMutation({
    mutationFn: (file) => proposalsApi.uploadPhysicalSignature(proposalId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['proposal', proposalId])
      toast.success('Physical signature uploaded successfully')
      setShowUploadModal(false)
      setUploadedFile(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload signature')
    }
  })

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Check if can resend invitation
  const canResend = proposal && ['PendingSignature', 'Expired', 'Draft'].includes(proposal.status)

  // Handle file selection for physical signature
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB')
      return
    }
    
    setUploadedFile(file)
  }

  // Handle physical signature upload
  const handleUploadSignature = () => {
    if (!uploadedFile) return
    uploadMutation.mutate(uploadedFile)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading proposal...</p>
        </div>
      </div>
    )
  }

  // Error / Not found
  if (error || !proposal) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 text-lg">Proposal Not Found</h3>
              <p className="text-sm text-red-700 mt-1">
                The proposal you're looking for doesn't exist or you don't have permission to view it.
              </p>
              {error && (
                <p className="text-xs text-gray-500 mt-2">
                  Error: {error.message || 'Unknown error'}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/portal/proposals')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Proposals
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/portal/proposals')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Proposals
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {proposal.proposalRef || proposal.businessKey || 'Proposal'}
              </h1>
              <p className="text-gray-600 mt-1">
                {proposal.productType || 'Insurance Proposal'}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 items-center text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(proposal.createdAt)}
                </span>
                {proposal.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Expires: {formatDate(proposal.expiryDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={proposal.status} showIcon size="large" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => toast.success('Opening PDF preview...')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview PDF
          </button>

          {proposal.status === 'Signed' && (
            <button
              onClick={() => toast.success('Download started')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Signed
            </button>
          )}

          {canResend && (
            <button
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {resendMutation.isPending ? 'Sending...' : 'Resend Invitation'}
            </button>
          )}

          {proposal.status !== 'Signed' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-purple-600 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Physical Signature
            </button>
          )}

          <button
            onClick={() => toast.success('Printing...')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          {(isAdmin() || isEmployee()) && (
            <button
              onClick={() => navigate(`/portal/proposals/${proposalId}/audit`)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4" />
              Audit Trail
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Insurance Core Proposal ID</dt>
                <dd className="text-gray-900 font-medium mt-1">
                  {proposal.insuranceCoreProposalId || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Business Key</dt>
                <dd className="text-gray-900 font-medium mt-1">
                  {proposal.businessKey || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Product Type</dt>
                <dd className="text-gray-900 font-medium mt-1">
                  {proposal.productType || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={proposal.status} />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Created At</dt>
                <dd className="text-gray-900 font-medium mt-1">
                  {formatDate(proposal.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Activity</dt>
                <dd className="text-gray-900 font-medium mt-1">
                  {formatDate(proposal.lastActivityAt)}
                </dd>
              </div>
              {proposal.expiryDate && (
                <div>
                  <dt className="text-gray-500">Expiry Date</dt>
                  <dd className="text-gray-900 font-medium mt-1">
                    {formatDate(proposal.expiryDate)}
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>

          {/* PDF Preview Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">PDF Preview</p>
                <p className="text-sm text-gray-500 mt-1">Document will be displayed here</p>
                <button
                  onClick={() => toast.success('Opening full preview...')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                  Open Full Preview
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            {customer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    customer.customerType === 'Company' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {customer.customerType === 'Company' ? (
                      <Building2 className="w-6 h-6 text-purple-600" />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.fullName || customer.legalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.businessKey || customer.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{customer.phone}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/portal/customers/${customer.id}`)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Customer Profile →
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Customer details not available.</p>
            )}
          </motion.div>

          {/* Assignment Info */}
          {(proposal.assignedAgent || proposal.assignedBroker) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
              <div className="space-y-3">
                {proposal.assignedAgent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-600 font-medium mb-1">Agent</p>
                    <p className="text-sm font-medium text-gray-900">
                      {proposal.assignedAgent.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proposal.assignedAgent.businessKey}
                    </p>
                  </div>
                )}
                {proposal.assignedBroker && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-600 font-medium mb-1">Broker</p>
                    <p className="text-sm font-medium text-gray-900">
                      {proposal.assignedBroker.displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proposal.assignedBroker.businessKey}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Compliance Info */}
          {proposal.status === 'Signed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">eIDAS Compliant</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This document has been signed with an Advanced Electronic Signature (AES) in compliance with eIDAS Article 26.
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-green-600">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Identity verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>RFC 3161 timestamp applied</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>eSeal certificate attached</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Physical Signature Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Physical Signature</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                For non-digital customers: Print the proposal, have the customer sign physically, 
                then scan and upload the signed document. The system will apply an eSeal for authenticity.
              </p>

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    Select a scanned PDF of the signed document
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Choose PDF
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUploadSignature}
                      disabled={uploadMutation.isPending}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload & Apply eSeal'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProposalDetailsPage
