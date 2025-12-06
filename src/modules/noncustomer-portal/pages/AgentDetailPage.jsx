import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, UserCircle2, Mail, Building2 } from 'lucide-react'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const AgentDetailPage = () => {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isAdminOrEmployee =
    user?.role === 'Admin' || user?.role === 'Employee'
  const isBroker = user?.role === 'Broker'

  if (!isAdminOrEmployee && !isBroker) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Access denied. Only admins, employees, and brokers can view agent details.
          </p>
        </div>
      </div>
    )
  }

  const { data: agent, isLoading } = useQuery({
    queryKey: ['user', agentId],
    queryFn: () => usersApi.getUser(agentId),
  })

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading agent…</div>
  }

  if (!agent) {
    return (
      <div className="p-6 text-gray-500">
        Agent not found.{' '}
        <button
          className="text-primary-600 underline"
          onClick={() => navigate('/portal/agents')}
        >
          Back to agents
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        onClick={() => navigate('/portal/agents')}
      >
        <ArrowLeft size={16} /> Back to Agents
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-emerald-100">
          <UserCircle2 className="text-emerald-600" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {agent.displayName}
          </h1>
          <p className="text-gray-500">{agent.businessKey}</p>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Contact</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            {agent.email}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Broker
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 size={16} />
            {agent.broker
              ? `${agent.broker.displayName} (${agent.broker.businessKey})`
              : agent.assignedBrokerId
              ? `Assigned Broker ID: ${agent.assignedBrokerId}`
              : 'No broker assigned'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentDetailPage
