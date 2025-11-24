import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
} from 'lucide-react'
import { proposalsApi, customersApi } from '../../../api/mockApi'

const ProposalDetailsPage = () => {
  const { proposalId } = useParams()
  const navigate = useNavigate()

  // ---- Load proposal ----
  const {
    data: proposal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['portal-proposal', proposalId],
    queryFn: () => proposalsApi.getProposalById(proposalId),
    enabled: !!proposalId,
  })

  // ---- Load customers (for display) ----
  const { data: customersData } = useQuery({
    queryKey: ['portal-customers'],
    queryFn: () => customersApi.getCustomers({ pageSize: 100 }),
  })

  const customers = customersData?.items || []

  // compute customer (or null) **safely**
  let customer = null
  if (proposal && customers.length > 0) {
    customer = customers.find((c) => c.id === proposal.customerId) || null
  }

  // ---- Status helpers ----
  const statusConfig = {
    Draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: Clock,
      label: 'Draft',
    },
    PendingSignature: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: Clock,
      label: 'Pending Signature',
    },
    InProgress: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Send,
      label: 'In Progress',
    },
    Signed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle2,
      label: 'Signed',
    },
    Rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: AlertCircle,
      label: 'Rejected',
    },
    Expired: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: Clock,
      label: 'Expired',
    },
  }

  const currentStatus = statusConfig[proposal?.status] || statusConfig.Draft
  const StatusIcon = currentStatus.icon

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

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading proposal...</p>
        </div>
      </div>
    )
  }

  // ---- Error / Not found ----
  if (error || !proposal) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 text-lg">Proposal Not Found</h3>
              <p className="text-sm text-red-700 mt-1">
                The proposal you&apos;re looking for doesn&apos;t exist or you don&apos;t have
                permission to view it.
              </p>
              <p className="text-xs text-gray-600 mt-2">Proposal ID: {proposalId}</p>
              {error && (
                <p className="text-xs text-gray-500 mt-1">
                  Error: {error.message || 'Unknown error'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
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

  // ---- Normal render ----
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {proposal.proposalRef || proposal.businessKey || 'Proposal'}
              </h1>
              <p className="text-gray-600 mt-1">
                {proposal.productType || 'Insurance Proposal'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 items-center text-sm text-gray-500">
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
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatus.bg} ${currentStatus.text}`}
            >
              <StatusIcon className="w-4 h-4" />
              {currentStatus.label}
            </span>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Eye className="w-4 h-4" />
                Preview PDF
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 border border-blue-600 rounded-lg text-sm text-blue-600 hover:bg-blue-50">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposal details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposal Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Insurance Core Proposal ID</dt>
                <dd className="text-gray-900">
                  {proposal.insuranceCoreProposalId || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Business Key</dt>
                <dd className="text-gray-900">{proposal.businessKey || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created At</dt>
                <dd className="text-gray-900">{formatDate(proposal.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Activity</dt>
                <dd className="text-gray-900">
                  {formatDate(proposal.lastActivityAt) || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right: Customer details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            {customer ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {customer.type === 'Business' ? (
                    <Building2 className="w-4 h-4 text-gray-500" />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">
                    {customer.fullName || customer.legalName}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  Customer ID: {customer.businessKey || customer.id}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Customer details not available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailsPage
