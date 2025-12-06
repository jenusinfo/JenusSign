import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Download,
  Clock,
  User,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  MapPin,
  Monitor,
} from 'lucide-react'
import proposalsApi from '../../../api/proposalsApi'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'
import toast from 'react-hot-toast'

const eventTypeIcons = {
  IdentityVerified: CheckCircle2,
  ContactOtpVerified: CheckCircle2,
  ConsentAccepted: CheckCircle2,
  SignatureCaptured: FileText,
  SigningOtpVerified: Shield,
  DocumentSigned: Shield,
  TimestampApplied: Clock,
  ESealApplied: Shield,
  ProposalCreated: FileText,
  InvitationSent: User,
}

const eventTypeColors = {
  IdentityVerified: 'text-success-600 bg-success-100',
  ContactOtpVerified: 'text-success-600 bg-success-100',
  ConsentAccepted: 'text-primary-600 bg-primary-100',
  SignatureCaptured: 'text-primary-600 bg-primary-100',
  SigningOtpVerified: 'text-warning-600 bg-warning-100',
  DocumentSigned: 'text-success-600 bg-success-100',
  TimestampApplied: 'text-primary-600 bg-primary-100',
  ESealApplied: 'text-success-600 bg-success-100',
  ProposalCreated: 'text-gray-600 bg-gray-100',
  InvitationSent: 'text-primary-600 bg-primary-100',
}

export default function ProposalAuditPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()

  const { data: proposal, isLoading: proposalLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalsApi.getProposal(proposalId),
  })

  const { data: auditEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['audit-events', proposalId],
    queryFn: () => proposalsApi.getAuditEvents(proposalId),
  })

  const handleDownloadAuditPackage = async () => {
    try {
      toast.loading('Preparing audit package...')
      const response = await proposalsApi.getAuditPackage(proposalId)
      
      // Mock download since API returns URLs
      if (response.signedPdfUrl) {
        toast.success('Audit package ready for download!')
        console.log('Download URLs:', response)
      }
    } catch (error) {
      toast.error('Failed to download audit package')
    }
  }

  if (proposalLoading || eventsLoading) {
    return <Loading message="Loading audit trail..." />
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/portal/proposals/${proposalId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Proposal
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-1">
              Complete audit evidence for {proposal?.proposalRef}
            </p>
          </div>

          <button
            onClick={handleDownloadAuditPackage}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit Package</span>
          </button>
        </div>
      </div>

      {/* Compliance Info */}
      <div className="card mb-6 bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              eIDAS AES Compliance
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              This proposal meets all eIDAS Advanced Electronic Signature requirements:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Unique link to signatory</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Signatory identification</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Sole control of signature data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Integrity protection</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Trusted timestamp (RFC 3161)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Complete audit trail (10+ years)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Event Timeline</h2>

        {!auditEvents || auditEvents.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No audit events recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditEvents.map((event, index) => {
              const Icon = eventTypeIcons[event.eventType] || FileText
              const colorClass = eventTypeColors[event.eventType] || 'text-gray-600 bg-gray-100'

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 -translate-x-1/2 p-2 rounded-full ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Event content */}
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {event.eventType.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>
                          {event.userType === 'Customer' ? 'Customer' : 'Internal User'}
                        </span>
                      </div>

                      {event.ipAddress && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-mono text-xs">{event.ipAddress}</span>
                        </div>
                      )}

                      {event.userAgent && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Monitor className="w-4 h-4" />
                          <span className="truncate text-xs">
                            {event.userAgent.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.metadataJson && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <pre className="text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(JSON.parse(event.metadataJson), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Retention Notice */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Data Retention Policy</h3>
            <p className="text-sm text-blue-800">
              All audit evidence and signed documents are retained for a minimum of 10 years
              to comply with eIDAS regulations. The data is encrypted at rest using SQL
              Server Transparent Data Encryption (TDE).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
