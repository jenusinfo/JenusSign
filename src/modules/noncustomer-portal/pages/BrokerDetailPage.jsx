import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, Mail, Users } from 'lucide-react'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const BrokerDetailPage = () => {
  const { brokerId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()

  const isAdminOrEmployee =
    currentUser?.role === 'Admin' || currentUser?.role === 'Employee'

  if (!isAdminOrEmployee) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Access denied. Only admins and employees can view broker details.
          </p>
        </div>
      </div>
    )
  }

  const { data: broker, isLoading: brokerLoading } = useQuery({
    queryKey: ['user', brokerId],
    queryFn: () => usersApi.getUser(brokerId),
  })

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents-for-broker', brokerId],
    queryFn: () => usersApi.getUsers({ role: 'Agent' }),
  })

  const agents =
    agentsData?.items?.filter(
      (a) =>
        a.assignedBrokerId === brokerId ||
        a.broker?.id === brokerId
    ) || []

  if (brokerLoading) {
    return <div className="p-6 text-gray-500">Loading broker…</div>
  }

  if (!broker) {
    return (
      <div className="p-6 text-gray-500">
        Broker not found.{' '}
        <button
          className="text-primary-600 underline"
          onClick={() => navigate('/portal/brokers')}
        >
          Back to brokers
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        onClick={() => navigate('/portal/brokers')}
      >
        <ArrowLeft size={16} /> Back to Brokers
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-indigo-100">
          <Building2 className="text-indigo-600" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {broker.displayName}
          </h1>
          <p className="text-gray-500">{broker.businessKey}</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Contact</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            {broker.email}
          </div>
        </div>

        {/* Agents */}
        <div className="bg-white rounded-xl border p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users size={16} /> Assigned Agents
          </h2>
          {agentsLoading ? (
            <div className="text-gray-500 text-sm">Loading agents…</div>
          ) : agents.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No agents assigned to this broker.
            </div>
          ) : (
            <ul className="divide-y">
              {agents.map((a) => (
                <li
                  key={a.id}
                  className="py-2 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {a.displayName}
                    </div>
                    <div className="text-gray-500 text-xs">{a.email}</div>
                  </div>
                  <button
                    className="text-primary-600 text-xs underline"
                    onClick={() => navigate(`/portal/agents/${a.id}`)}
                  >
                    View agent
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrokerDetailPage
