import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Building2, 
  Mail, 
  Search, 
  AlertCircle, 
  RefreshCw,
  Users 
} from 'lucide-react'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const BrokersListPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isAdminOrEmployee =
    user?.role === 'Admin' || user?.role === 'Employee'

  // Access control
  if (!isAdminOrEmployee) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Access Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              Only administrators and employees can view brokers.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const [search, setSearch] = useState('')

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['brokers', { search }],
    queryFn: () =>
      usersApi.getUsers({
        role: 'Broker',
        search: search || undefined,
      }),
  })

  const brokers = data?.items || []

  // Simple stats
  const totalBrokers = brokers.length
  const activeBrokers = brokers.filter((b) => b.isActive !== false).length

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Brokers</h3>
            <p className="text-sm text-red-700 mt-1">
              {error?.message || 'Failed to load brokers'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
          <p className="text-sm text-gray-500">
            Manage insurance brokers and view their assigned agents.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Brokers</p>
              <p className="text-xl font-bold text-gray-900">{totalBrokers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Brokers</p>
              <p className="text-xl font-bold text-gray-900">{activeBrokers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters / search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or business key..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b px-4 py-3 text-sm font-medium text-gray-500 flex justify-between">
          <span>
            {isLoading
              ? 'Loading brokers…'
              : `Showing ${brokers.length} broker${brokers.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 text-gray-500 text-center">Loading brokers…</div>
        ) : brokers.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No brokers found. Try adjusting your search.
          </div>
        ) : (
          <ul className="divide-y">
            {brokers.map((b) => (
              <li
                key={b.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/portal/brokers/${b.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100">
                    <Building2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {b.displayName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={14} />
                      {b.email}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{b.businessKey}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default BrokersListPage
