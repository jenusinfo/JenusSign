import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Calendar, Clock, Download, Shield, CheckCircle2 } from 'lucide-react'
import proposalsApi from '../../../api/proposalsApi'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

export default function CustomerProposalPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['customer-proposal', proposalId],
    queryFn: () => proposalsApi.getCustomerProposal(proposalId),
  })

  if (isLoading) return <Loading fullScreen message="Loading proposal..." />
  if (!proposal) return <div className="p-8 text-center">Proposal not found</div>

  const canSign = proposal.status === 'PendingSignature' || proposal.status === 'InProgress'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
              <p className="text-gray-600">{proposal.proposalRef}</p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Details</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Product Type</p>
                    <p className="text-gray-900">{proposal.productType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created Date</p>
                    <p className="text-gray-900">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                    <p className="text-gray-900">{formatDate(proposal.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Consents Card */}
            {proposal.consents && proposal.consents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Consents</h2>
                <div className="space-y-3">
                  {proposal.consents.map((consent) => (
                    <div
                      key={consent.proposalConsentId}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {consent.value === true ? (
                        <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{consent.label}</p>
                        {consent.isRequired && (
                          <p className="text-xs text-gray-600 mt-1">Required</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card space-y-4 sticky top-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>

              {canSign && (
                <button
                  onClick={() => navigate(`/customer/proposals/${proposalId}/sign`)}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{proposal.status === 'InProgress' ? 'Resume Signing' : 'Start Signing'}</span>
                </button>
              )}

              {proposal.status === 'Signed' && (
                <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Signed Document</span>
                </button>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Signature Status</h4>
                <div className="space-y-2">
                  {proposal.signatureStatus === 'NotCaptured' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                      <span>Signature not captured</span>
                    </div>
                  )}
                  {proposal.signatureStatus === 'Captured' && (
                    <div className="flex items-center text-sm text-primary-600">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
                      <span>Signature captured</span>
                    </div>
                  )}
                  {proposal.signatureStatus === 'Completed' && (
                    <div className="flex items-center text-sm text-success-600">
                      <div className="w-2 h-2 bg-success-600 rounded-full mr-2" />
                      <span>Signing completed</span>
                    </div>
                  )}
                </div>
              </div>

              {proposal.status === 'Signed' && (
                <div className="p-3 bg-success-50 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-success-900">
                      <p className="font-medium">Document Signed</p>
                      <p className="text-success-700 mt-1">
                        Your document has been securely signed with eIDAS AES compliance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
