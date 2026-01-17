import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Shield,
  ChevronRight,
  Building2,
  UserCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react'

const mockUsers = [
  {
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@hydrainsurance.com.cy',
    phone: '+357 22 100 100',
    role: 'administrator',
    department: 'IT',
    status: 'active',
    assignedBrokers: [],
    assignedAgents: [],
    lastLogin: '2025-01-17T10:00:00Z',
    createdAt: '2020-01-01T00:00:00Z',
  },
  {
    id: 'emp-001',
    name: 'Elena Christodoulou',
    email: 'elena.c@hydrainsurance.com.cy',
    phone: '+357 99 555 666',
    role: 'employee',
    department: 'Sales',
    status: 'active',
    assignedBrokers: [{ id: 'broker-001', name: 'Cyprus Insurance Brokers Ltd' }],
    assignedAgents: [{ id: 'agent-001', name: 'Maria Georgiou' }],
    lastLogin: '2025-01-17T08:30:00Z',
    createdAt: '2022-03-15T10:00:00Z',
  },
  {
    id: 'emp-002',
    name: 'Nikos Stavrou',
    email: 'nikos.s@hydrainsurance.com.cy',
    phone: '+357 99 777 888',
    role: 'employee',
    department: 'Underwriting',
    status: 'active',
    assignedBrokers: [{ id: 'broker-002', name: 'Mediterranean Insurance Services' }],
    assignedAgents: [],
    lastLogin: '2025-01-16T14:00:00Z',
    createdAt: '2021-06-20T09:00:00Z',
  },
  {
    id: 'emp-003',
    name: 'Anna Kyriacou',
    email: 'anna.k@hydrainsurance.com.cy',
    phone: '+357 99 999 000',
    role: 'employee',
    department: 'Claims',
    status: 'active',
    assignedBrokers: [],
    assignedAgents: [{ id: 'agent-002', name: 'Andreas Papadopoulos' }, { id: 'agent-003', name: 'Nikos Konstantinou' }],
    lastLogin: '2025-01-17T09:15:00Z',
    createdAt: '2023-01-10T11:00:00Z',
  },
  {
    id: 'emp-004',
    name: 'George Demetriou',
    email: 'george.d@hydrainsurance.com.cy',
    phone: '+357 99 111 222',
    role: 'employee',
    department: 'Operations',
    status: 'inactive',
    assignedBrokers: [],
    assignedAgents: [],
    lastLogin: '2024-12-01T16:00:00Z',
    createdAt: '2022-08-01T08:00:00Z',
  },
]

const roleConfig = {
  administrator: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: Shield },
  employee: { label: 'Employee', color: 'bg-blue-100 text-blue-700', icon: UserCircle },
}

const UserManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage employees and administrators</p>
        </div>
        <Link
          to="/portal/users/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Roles</option>
              <option value="administrator">Administrator</option>
              <option value="employee">Employee</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2">Assignments</div>
          <div className="col-span-2">Last Login</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => {
              const roleInfo = roleConfig[user.role]
              const RoleIcon = roleInfo.icon
              const totalAssignments = user.assignedBrokers.length + user.assignedAgents.length
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/portal/users/${user.id}`}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    {/* User Info */}
                    <div className="col-span-1 lg:col-span-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          user.role === 'administrator' 
                            ? 'bg-gradient-to-br from-red-400 to-orange-500' 
                            : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-1 lg:col-span-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="col-span-1 lg:col-span-2">
                      <span className="text-gray-600">{user.department}</span>
                    </div>

                    {/* Assignments */}
                    <div className="col-span-1 lg:col-span-2">
                      {totalAssignments > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                          {user.assignedBrokers.length > 0 && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Building2 className="w-3.5 h-3.5" />
                              {user.assignedBrokers.length}
                            </span>
                          )}
                          {user.assignedAgents.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <UserCircle className="w-3.5 h-3.5" />
                              {user.assignedAgents.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No assignments</span>
                      )}
                    </div>

                    {/* Last Login */}
                    <div className="col-span-1 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm text-gray-500">{formatDate(user.lastLogin)}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 lg:col-span-1 flex justify-end">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{mockUsers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Administrators</p>
          <p className="text-2xl font-bold text-red-600">
            {mockUsers.filter(u => u.role === 'administrator').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Employees</p>
          <p className="text-2xl font-bold text-blue-600">
            {mockUsers.filter(u => u.role === 'employee').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {mockUsers.filter(u => u.status === 'active').length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
