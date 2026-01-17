import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  Eye,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit,
  AlertCircle,
  Printer,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Mock envelope data
const mockEnvelopeData = {
  'env-001': {
    id: 'env-001',
    reference: 'PR-2025-0001',
    title: 'Home Insurance Proposal',
    status: 'PENDING',
    customer: {
      name: 'Yiannis Kleanthous',
      email: 'yiannis.kleanthous@hydrainsurance.com.cy',
      phone: '+357 99 123 456',
      idNumber: 'X1234567',
    },
    documents: [
      { id: 'doc-1', name: 'Home Insurance Proposal', pages: 4, url: '/samples/home_insurance_proposal_PR20250001.pdf' },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3, url: '/samples/terms-and-conditions.pdf' },
      { id: 'doc-3', name: 'Privacy Policy', pages: 2, url: '/samples/privacy-policy.pdf' },
    ],
    token: 'demo1',
    signingLink: `${window.location.origin}/customer/verify/demo1`,
    createdAt: '2025-01-15T10:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    sentAt: null,
    viewedAt: null,
    signedAt: null,
    createdBy: { name: 'Admin User', email: 'admin@insurance.com' },
  },
  'env-002': {
    id: 'env-002',
    reference: 'PR-2025-0002',
    title: 'Motor Insurance Proposal',
    status: 'PENDING',
    customer: {
      name: 'Charis Constantinou',
      email: 'charis.constantinou@hydrainsurance.com.cy',
      phone: '+357 99 654 321',
      idNumber: 'M7654321',
    },
    documents: [
      { id: 'doc-1', name: 'Motor Insurance Proposal', pages: 4, url: '/samples/motor_insurance_proposal_PR20250002.pdf' },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3, url: '/samples/terms-and-conditions.pdf' },
      { id: 'doc-3', name: 'Privacy Policy', pages: 2, url: '/samples/privacy-policy.pdf' },
    ],
    token: 'demo2',
    signingLink: `${window.location.origin}/customer/verify/demo2`,
    createdAt: '2025-01-14T09:30:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    sentAt: '2025-01-14T10:00:00Z',
    viewedAt: null,
    signedAt: null,
    createdBy: { name: 'Admin User', email: 'admin@insurance.com' },
  },
  'env-003': {
    id: 'env-003',
    reference: 'PR-2025-0003',
    title: 'Commercial Property Insurance',
    status: 'COMPLETED',
    customer: {
      name: 'Cyprus Trading Ltd',
      email: 'info@cyprustrading.com.cy',
      phone: '+357 22 123 456',
      idNumber: 'HE123456',
    },
    documents: [
      { id: 'doc-1', name: 'Commercial Property Proposal', pages: 6, url: '/samples/demo-signed-esealed.pdf' },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3, url: '/samples/terms-and-conditions.pdf' },
    ],
    token: 'demo3',
    signingLink: `${window.location.origin}/customer/verify/demo3`,
    createdAt: '2025-01-10T14:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
    sentAt: '2025-01-10T14:30:00Z',
    viewedAt: '2025-01-10T15:00:00Z',
    signedAt: '2025-01-10T15:15:00Z',
    createdBy: { name: 'Admin User', email: 'admin@insurance.com' },
  },
}

// Also support old prop-XXX format
const legacyMapping = {
  'prop-001': 'env-001',
  'prop-002': 'env-002',
  'prop-003': 'env-003',
}

const statusConfig = {
  PENDING: { label: 'Pending Signature', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
}

const EnvelopeDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [envelope, setEnvelope] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Check for legacy prop-XXX format
      const actualId = legacyMapping[id] || id
      const data = mockEnvelopeData[actualId]
      
      if (data) {
        setEnvelope(data)
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [id])

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copySigningLink = () => {
    navigator.clipboard.writeText(envelope.signingLink)
    toast.success('Signing link copied to clipboard!')
  }

  const handleResendInvitation = () => {
    toast.success('Invitation email sent to ' + envelope.customer.email)
  }

  const handleVoidEnvelope = () => {
    if (window.confirm('Are you sure you want to void this envelope? This cannot be undone.')) {
      toast.success('Envelope voided successfully')
      navigate('/portal/envelopes')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading envelope...</p>
        </div>
      </div>
    )
  }

  if (!envelope) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Envelope Not Found</h2>
          <p className="text-gray-500 mb-4">The envelope you're looking for doesn't exist.</p>
          <Link
            to="/portal/envelopes"
            className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Envelopes
          </Link>
        </div>
      </div>
    )
  }

  const StatusBadge = () => {
    const config = statusConfig[envelope.status] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/portal/envelopes')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{envelope.title}</h1>
              <StatusBadge />
            </div>
            <p className="text-gray-500 mt-1">{envelope.reference}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {envelope.status === 'PENDING' && (
            <>
              <button
                onClick={handleResendInvitation}
                className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
              >
                <Send className="w-4 h-4" />
                Resend Invitation
              </button>
              <button
                onClick={copySigningLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </>
          )}
          {envelope.status === 'COMPLETED' && (
            <a
              href={envelope.documents[0].url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Signed
            </a>
          )}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => window.open(envelope.signingLink, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview Signing
                </button>
                {envelope.status === 'PENDING' && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wide">Alternative Signing</p>
                    <Link
                      to={`/portal/envelopes/${envelope.id}/sign/assisted`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 w-full"
                    >
                      <Users className="w-4 h-4" />
                      Agent-Assisted Signing
                    </Link>
                    <Link
                      to={`/portal/envelopes/${envelope.id}/sign/physical`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 w-full"
                    >
                      <Printer className="w-4 h-4" />
                      Print-Sign-Scan
                    </Link>
                    <hr className="my-1 border-gray-100" />
                  </>
                )}
                {envelope.status !== 'COMPLETED' && (
                  <button
                    onClick={handleVoidEnvelope}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Void Envelope
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {envelope.documents.map((doc, index) => (
                <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.pages} pages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Activity Timeline</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <TimelineItem
                  icon={FileText}
                  iconBg="bg-indigo-100"
                  iconColor="text-indigo-600"
                  title="Envelope Created"
                  description={`Created by ${envelope.createdBy.name}`}
                  date={formatDate(envelope.createdAt)}
                  completed
                />
                <TimelineItem
                  icon={Send}
                  iconBg={envelope.sentAt ? 'bg-blue-100' : 'bg-gray-100'}
                  iconColor={envelope.sentAt ? 'text-blue-600' : 'text-gray-400'}
                  title="Invitation Sent"
                  description={envelope.sentAt ? `Sent to ${envelope.customer.email}` : 'Pending'}
                  date={formatDate(envelope.sentAt)}
                  completed={!!envelope.sentAt}
                />
                <TimelineItem
                  icon={Eye}
                  iconBg={envelope.viewedAt ? 'bg-purple-100' : 'bg-gray-100'}
                  iconColor={envelope.viewedAt ? 'text-purple-600' : 'text-gray-400'}
                  title="Document Viewed"
                  description={envelope.viewedAt ? 'Customer reviewed the documents' : 'Pending'}
                  date={formatDate(envelope.viewedAt)}
                  completed={!!envelope.viewedAt}
                />
                <TimelineItem
                  icon={CheckCircle2}
                  iconBg={envelope.signedAt ? 'bg-green-100' : 'bg-gray-100'}
                  iconColor={envelope.signedAt ? 'text-green-600' : 'text-gray-400'}
                  title="Documents Signed"
                  description={envelope.signedAt ? 'eIDAS compliant signature applied' : 'Pending'}
                  date={formatDate(envelope.signedAt)}
                  completed={!!envelope.signedAt}
                  isLast
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {envelope.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{envelope.customer.name}</p>
                  <p className="text-sm text-gray-500">ID: {envelope.customer.idNumber}</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{envelope.customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{envelope.customer.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signing Link */}
          {envelope.status === 'PENDING' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Signing Link</h2>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 break-all font-mono">{envelope.signingLink}</p>
                </div>
                <button
                  onClick={copySigningLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(envelope.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expires</span>
                <span className="text-gray-900">{formatDate(envelope.expiresAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Documents</span>
                <span className="text-gray-900">{envelope.documents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created By</span>
                <span className="text-gray-900">{envelope.createdBy.name}</span>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">eIDAS Compliant</h3>
            </div>
            <p className="text-sm text-gray-600">
              This envelope uses Advanced Electronic Signatures compliant with EU Regulation 910/2014 (eIDAS).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Timeline Item Component
const TimelineItem = ({ icon: Icon, iconBg, iconColor, title, description, date, completed, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {!isLast && (
        <div className={`w-0.5 flex-1 mt-2 ${completed ? 'bg-indigo-200' : 'bg-gray-200'}`} />
      )}
    </div>
    <div className="flex-1 pb-4">
      <p className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
      {date && date !== 'Not yet' && (
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      )}
    </div>
  </div>
)

export default EnvelopeDetailPage
