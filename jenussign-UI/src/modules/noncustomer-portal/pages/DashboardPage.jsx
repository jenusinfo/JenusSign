import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Send,
  Calendar,
  FolderOpen,
  UserPlus,
} from 'lucide-react'
import useAuthStore from '../../../shared/store/authStore'

// Mock data for dashboard
const mockStats = {
  totalEnvelopes: 5,
  pendingSignature: 3,
  signed: 2,
  totalCustomers: 4,
}

const mockRecentEnvelopes = [
  {
    id: 'env-001',
    reference: 'PR-2025-0001',
    customer: 'Yiannis Kleanthous',
    date: '15 Jan 2025',
    type: 'Home Insurance',
    status: 'PENDING',
  },
  {
    id: 'env-002',
    reference: 'PR-2025-0002',
    customer: 'Charis Constantinou',
    date: '14 Jan 2025',
    type: 'Motor Insurance',
    status: 'PENDING',
  },
  {
    id: 'env-003',
    reference: 'PR-2025-0003',
    customer: 'Cyprus Trading Ltd',
    date: '10 Jan 2025',
    type: 'Commercial Insurance',
    status: 'COMPLETED',
  },
  {
    id: 'env-004',
    reference: 'PR-2025-0004',
    customer: 'Tech Solutions Cyprus',
    date: '12 Jan 2025',
    type: 'Business Insurance',
    status: 'PENDING',
  },
]

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

const DashboardPage = () => {
  const { user, agent } = useAuthStore()
  const currentUser = agent || user || { name: 'User' }

  const stats = [
    {
      label: 'Total Envelopes',
      value: mockStats.totalEnvelopes,
      icon: FolderOpen,
      color: 'bg-blue-100 text-blue-600',
      trend: '+12% from last month',
      trendUp: true,
    },
    {
      label: 'Pending Signature',
      value: mockStats.pendingSignature,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      link: '/portal/envelopes?status=PENDING',
      linkText: 'View all pending',
    },
    {
      label: 'Signed',
      value: mockStats.signed,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-600',
      progress: Math.round((mockStats.signed / mockStats.totalEnvelopes) * 100),
    },
    {
      label: 'Total Customers',
      value: mockStats.totalCustomers,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      link: '/portal/customers',
      linkText: 'Manage customers',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {currentUser.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            
            {stat.trend && (
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp className={`w-4 h-4 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                <span className={stat.trendUp ? 'text-green-600' : 'text-red-600'}>{stat.trend}</span>
              </div>
            )}
            
            {stat.link && (
              <Link 
                to={stat.link}
                className="flex items-center gap-1 mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {stat.linkText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            
            {stat.progress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500"></span>
                  <span className="text-gray-600">{stat.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Envelopes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Envelopes</h2>
            </div>
            <Link 
              to="/portal/envelopes"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {mockRecentEnvelopes.map((envelope) => (
              <Link
                key={envelope.id}
                to={`/portal/envelopes/${envelope.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{envelope.reference}</p>
                    <p className="text-sm text-gray-500">{envelope.customer}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{envelope.date}</span>
                      <span>•</span>
                      <span>{envelope.type}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[envelope.status]}`}>
                  {envelope.status === 'PENDING' ? 'Pending' : 'Completed'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                to="/portal/envelopes/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium text-indigo-600">Create Envelope</span>
              </Link>
              
              <Link
                to="/portal/customers/new"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-blue-600">Add Customer</span>
              </Link>
              
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Send className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-purple-600">Resend Invitations</span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Alerts</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-0.5">No pending actions required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
