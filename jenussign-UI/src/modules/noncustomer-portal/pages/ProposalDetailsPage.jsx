import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  Download,
  Send,
  Shield,
  CheckCircle,
  Eye,
} from 'lucide-react'
import proposalsApi from '../../../api/proposalsApi'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate, formatDateTime } from '../../../shared/utils/formatters'

export default function ProposalDetailsPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalsApi.getProposal(proposalId),
  })

  const { data: auditEvents = [] } = useQuery({
    queryKey: ['audit-events', proposalId],
    queryFn: () => proposalsApi.getAuditEvents(proposalId),
    enabled: activeTab === 'audit',
  })

  if (isLoading) return <Loading fullScreen message="Loading proposal..." />

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/portal/proposals')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{proposal.proposalRef}</h1>
                <p className="text-gray-600">{proposal.insuranceCoreProposalId}</p>
              </div>
              <StatusBadge status={proposal.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-gray-900">{formatDate(proposal.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expires</p>
                  <p className="text-gray-900">{formatDate(proposal.expiryDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Activity</p>
                  <p className="text-gray-900">{formatDate(proposal.lastActivityAt)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'consents', label: 'Consents', icon: CheckCircle },
                { id: 'audit', label: 'Audit Trail', icon: Shield },
              ].map((tab) => {
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
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Information</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Status Summary</p>
                    <p className="text-gray-900">
                      {proposal.status === 'PendingSignature' &&
                        'Waiting for customer to start the signing process.'}
                      {proposal.status === 'InProgress' &&
                        'Customer has started the signing process.'}
                      {proposal.status === 'Signed' && 'Document has been successfully signed.'}
                      {proposal.status === 'Draft' && 'Proposal is in draft mode.'}
                    </p>
                  </div>

                  {proposal.signatureStatus && (
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Signature Status</p>
                      <p className="text-gray-900 capitalize">{proposal.signatureStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'consents' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Consents</h2>
                {proposal.consents && proposal.consents.length > 0 ? (
                  <div className="space-y-3">
                    {proposal.consents.map((consent) => (
                      <div
                        key={consent.proposalConsentId}
                        className="p-4 bg-gray-50 rounded-lg flex items-start space-x-3"
                      >
                        {consent.value === true ? (
                          <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{consent.label}</p>
                          {consent.isRequired && (
                            <p className="text-xs text-gray-600 mt-1">Required consent</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {consent.value === true ? 'Accepted' : 'Not yet accepted'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No consents required for this proposal.</p>
                )}
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h2>
                {auditEvents.length > 0 ? (
                  <div className="space-y-4">
                    {auditEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">{event.eventType}</p>
                          <p className="text-sm text-gray-600">{formatDateTime(event.timestamp)}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>User Type: {event.userType}</p>
                          <p>IP Address: {event.ipAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No audit events recorded yet.</p>
                )}
              </div>
            )}
          </motion.div>
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

            {proposal.status === 'Draft' && (
              <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Send Invitation</span>
              </button>
            )}

            <button className="btn btn-secondary w-full flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>View Document</span>
            </button>

            <button
              onClick={() => navigate(`/portal/proposals/${proposalId}/audit`)}
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>View Full Audit Trail</span>
            </button>

            {proposal.status === 'Signed' && (
              <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Signed PDF</span>
              </button>
            )}

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Progress</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${proposal.status !== 'Draft' ? 'bg-success-600' : 'bg-gray-400'}`} />
                  <span className={proposal.status !== 'Draft' ? 'text-gray-900' : 'text-gray-600'}>
                    Invitation sent
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${proposal.status === 'InProgress' || proposal.status === 'Signed' ? 'bg-success-600' : 'bg-gray-400'}`} />
                  <span className={proposal.status === 'InProgress' || proposal.status === 'Signed' ? 'text-gray-900' : 'text-gray-600'}>
                    Customer started
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${proposal.status === 'Signed' ? 'bg-success-600' : 'bg-gray-400'}`} />
                  <span className={proposal.status === 'Signed' ? 'text-gray-900' : 'text-gray-600'}>
                    Document signed
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
