import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Download,
  Shield,
  CheckCircle2,
  User,
  Building2,
  PenTool,
  Eye,
  ExternalLink,
} from 'lucide-react'
import proposalsApi from '../../../api/proposalsApi'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

// Mobile-friendly PDF viewer component
const MobileFriendlyPdfViewer = ({ src, title, height = '500px', showDownload = true }) => {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open</span>
          </a>
          {showDownload && (
            <a
              href={src}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative w-full" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading document...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Unable to display PDF inline</p>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </a>
            </div>
          </div>
        ) : (
          <object
            data={src}
            type="application/pdf"
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
          >
            <iframe
              src={isMobile ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + src)}&embedded=true` : src}
              className="w-full h-full border-0"
              title={title}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setError(true)
              }}
            />
          </object>
        )}
      </div>
    </div>
  )
}

export default function CustomerProposalPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['customer-proposal', proposalId],
    queryFn: () => proposalsApi.getCustomerProposal(proposalId),
  })

  if (isLoading) return <Loading fullScreen message="Loading proposal..." />
  if (!proposal) return <div className="p-8 text-center">Proposal not found</div>

  const canSign = proposal.status === 'PENDING' || proposal.status === 'IN_PROGRESS' || 
                  proposal.status === 'PendingSignature' || proposal.status === 'InProgress'
  const isSigned = proposal.status === 'SIGNED' || proposal.status === 'COMPLETED' || 
                   proposal.status === 'Signed' || proposal.status === 'Completed'

  // Demo PDF URL
  const proposalPdfUrl = isSigned ? '/samples/demo-signed-esealed.pdf' : '/demo-proposal.pdf'
  const auditPdfUrl = '/samples/demo-audit-trail.pdf'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: Document Viewer Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    {proposal.title}
                  </h1>
                  <StatusBadge status={proposal.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {proposal.proposalRef || proposal.referenceNumber}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {isSigned ? (
                  <>
                    <a
                      href={proposalPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download final PDF</span>
                    </a>
                    <a
                      href={auditPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Audit trail</span>
                    </a>
                  </>
                ) : canSign ? (
                  <button
                    onClick={() => navigate(`/customer/proposals/${proposalId}/sign`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Sign Document</span>
                  </button>
                ) : (
                  <a
                    href={proposalPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View PDF</span>
                  </a>
                )}
              </div>
            </div>

            {/* Status Banner */}
            {isSigned ? (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Document Successfully Signed &amp; eSealed
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Your signature has been applied, an electronic seal has been added, and the
                    audit page is attached as the last page of the PDF.
                  </p>
                </div>
              </div>
            ) : canSign ? (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                <PenTool className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Signature Required
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please review the document below and click "Sign Document" when ready to proceed.
                  </p>
                </div>
              </div>
            ) : null}

            {/* PDF Viewer */}
            <div className="flex-1 min-h-0">
              <MobileFriendlyPdfViewer
                src={proposalPdfUrl}
                title={proposal.title}
                height="500px"
                showDownload={true}
              />
            </div>

            {/* Footer info */}
            {isSigned && proposal.signedAt && (
              <p className="mt-3 text-xs text-gray-500">
                Signed on: {formatDate(proposal.signedAt)}
              </p>
            )}
          </div>

          {/* RIGHT: Details Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Proposal Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Proposal Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Product Type</p>
                    <p className="text-sm text-gray-900">{proposal.productType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Customer</p>
                    <p className="text-sm text-gray-900">{proposal.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Expires</p>
                    <p className="text-sm text-gray-900">{formatDate(proposal.expiryDate)}</p>
                  </div>
                </div>
                {proposal.premium && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">Premium</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        €{proposal.premium.toLocaleString('en-CY', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Signature Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Signature Status</h3>
              
              {isSigned ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-700 font-medium">Signing completed</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        <p className="font-medium">Document Signed</p>
                        <p className="text-green-700 mt-1">
                          Securely signed with eIDAS AES compliance.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium">Platform eSealed</p>
                        <p className="text-blue-700 mt-1">
                          Protected with qualified certificate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : canSign ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-sm text-amber-700 font-medium">Awaiting signature</span>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/proposals/${proposalId}/sign`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Sign Document</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-sm text-gray-600">Not yet available for signing</span>
                </div>
              )}
            </motion.div>

            {/* Consents Card (if any) */}
            {proposal.consents && proposal.consents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Required Consents</h3>
                <div className="space-y-2">
                  {proposal.consents.map((consent) => (
                    <div
                      key={consent.proposalConsentId}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      {consent.value === true ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900">{consent.label}</p>
                        {consent.isRequired && (
                          <p className="text-[10px] text-gray-500 mt-0.5">Required</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
