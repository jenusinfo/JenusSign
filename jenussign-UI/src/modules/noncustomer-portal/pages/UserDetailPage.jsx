import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { usersApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Access Denied</p></div></div>
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!user) return <div className="p-6">User not found</div>

  return (
    <div className="p-6">
      <button onClick={() => navigate('/portal/users')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={20} /> Back to Users
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {user.businessKey}
          </span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-3">
            <div><span className="text-gray-600">Business Key:</span> <span className="ml-2 font-medium">{user.businessKey}</span></div>
            <div><span className="text-gray-600">Email:</span> <span className="ml-2">{user.email}</span></div>
            <div><span className="text-gray-600">Display Name:</span> <span className="ml-2">{user.displayName}</span></div>
            <div><span className="text-gray-600">Role:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
              user.role === 'Admin' ? 'bg-red-100 text-red-800' :
              user.role === 'Broker' ? 'bg-orange-100 text-orange-800' :
              user.role === 'Agent' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>{user.role}</span></div>
            <div><span className="text-gray-600">Status:</span> <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
              user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>{user.isActive ? 'Active' : 'Inactive'}</span></div>
            {user.broker && (
              <div>
                <span className="text-gray-600">Broker:</span>
                <div className="ml-2 mt-1 p-2 bg-orange-50 border border-orange-200 rounded">
                  <div className="font-medium">{user.broker.displayName}</div>
                  <div className="text-xs text-gray-500">{user.broker.businessKey}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-600">Created:</span> <span className="ml-2">{new Date(user.createdAt).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailPage
