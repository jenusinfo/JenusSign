import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText } from 'lucide-react'
import { proposalsApi } from '../../../api/mockApi'

const ProposalDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposalsApi.getProposal(id),
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!proposal) return <div className="p-6">Proposal not found</div>

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/proposals')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Proposals
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{proposal.proposalRef}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {proposal.businessKey}
          </span>
          <span className="text-sm text-gray-500">ICS ID: {proposal.insuranceCoreProposalId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Proposal Details</h2>
            <div className="space-y-3">
              <div><span className="text-gray-600">Product Type:</span> <span className="ml-2 font-medium">{proposal.productType}</span></div>
              <div><span className="text-gray-600">Status:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
                proposal.status === 'Signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{proposal.status}</span></div>
              <div><span className="text-gray-600">Customer:</span> <span className="ml-2">{proposal.customerName} ({proposal.customerBusinessKey})</span></div>
              <div><span className="text-gray-600">Created:</span> <span className="ml-2">{new Date(proposal.createdAt).toLocaleString()}</span></div>
              <div><span className="text-gray-600">Last Activity:</span> <span className="ml-2">{new Date(proposal.lastActivityAt).toLocaleString()}</span></div>
              {proposal.expiryDate && <div><span className="text-gray-600">Expiry:</span> <span className="ml-2">{new Date(proposal.expiryDate).toLocaleDateString()}</span></div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Assignment</h2>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium">{proposal.assignedAgent.displayName}</div>
                <div className="text-xs text-gray-500">{proposal.assignedAgent.businessKey}</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm font-medium">{proposal.assignedBroker.displayName}</div>
                <div className="text-xs text-gray-500">{proposal.assignedBroker.businessKey}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalDetailPage
