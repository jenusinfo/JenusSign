import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Shield,
  ShieldCheck,
  Lock,
  Sparkles,
  FileSignature,
  History,
  User,
  LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { customerProposalsApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import Loading from '../../../shared/components/Loading'
import Logo from '../../../shared/components/Logo'
import { formatDate, formatCurrency } from '../../../shared/utils/formatters'

const CustomerDashboardPage = () => {
  const navigate = useNavigate()
  const { customer, logoutCustomer } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch customer proposals
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['customer-proposals', customer?.email],
    queryFn: () => customerProposalsApi.getByCustomer(customer?.email),
    enabled: !!customer?.email,
  })

  const handleLogout = () => {
    logoutCustomer()
    navigate('/customer/login')
    toast.success('Logged out successfully')
  }

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || p.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Stats calculation
  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'PENDING').length,
    inProgress: proposals.filter((p) => p.status === 'IN_PROGRESS').length,
    completed: proposals.filter((p) => p.status === 'COMPLETED' || p.status === 'SIGNED').length,
  }

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      PENDING: {
        bg: 'bg-gradient-to-r from-blue-100 to-indigo-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      },
      IN_PROGRESS: {
        bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      },
      COMPLETED: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
      },
      SIGNED: {
        bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500',
      },
      EXPIRED: {
        bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
        text: 'text-gray-500',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      },
    }
    const style = styles[status] || styles.PENDING
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
        {status === 'COMPLETED' || status === 'SIGNED' ? 'Signed' : status?.replace('_', ' ')}
      </span>
    )
  }

  // Get CTA button config
  const getCtaConfig = (proposal) => {
    switch (proposal.status) {
      case 'PENDING':
        return {
          label: 'Start',
          icon: ChevronRight,
          className: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
          action: () => navigate(`/customer/proposals/${proposal.id}/sign`),
        }
      case 'IN_PROGRESS':
        return {
          label: 'Resume',
          icon: ChevronRight,
          className: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
          action: () => navigate(`/customer/proposals/${proposal.id}/sign`),
        }
      case 'COMPLETED':
      case 'SIGNED':
        return {
          label: 'View',
          icon: Eye,
          className: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
          action: () => navigate(`/customer/proposals/${proposal.id}`),
        }
      case 'EXPIRED':
        return {
          label: 'Expired',
          icon: AlertCircle,
          className: 'bg-gray-200 text-gray-400 cursor-not-allowed',
          action: () => {},
          disabled: true,
        }
      default:
        return {
          label: 'View',
          icon: Eye,
          className: 'bg-gray-600 hover:bg-gray-700 text-white',
          action: () => navigate(`/customer/proposals/${proposal.id}`),
        }
    }
  }

  if (isLoading) {
    return <Loading fullScreen message="Loading your documents..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo className="h-8" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full border border-blue-200">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">eIDAS Compliant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{customer?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Manage your insurance proposals and signed documents in one place.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border border-gray-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200/50 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total Documents</p>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 border border-blue-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/50 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
              <p className="text-xs text-blue-600 mt-1">Awaiting Signature</p>
            </div>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-5 border border-amber-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/50 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <History className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
              <p className="text-xs text-amber-600 mt-1">In Progress</p>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-5 border border-green-200 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/50 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-xs text-green-600 mt-1">Completed</p>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { value: 'all', label: 'All', count: stats.total },
                { value: 'pending', label: 'Pending', count: stats.pending },
                { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
                { value: 'completed', label: 'Signed', count: stats.completed },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    statusFilter === filter.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    statusFilter === filter.value ? 'bg-white/20' : 'bg-white'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : "You don't have any proposals yet."}
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal, index) => {
              const cta = getCtaConfig(proposal)
              const Icon = cta.icon

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                    proposal.status === 'PENDING' ? 'border-blue-200 hover:border-blue-300' :
                    proposal.status === 'IN_PROGRESS' ? 'border-amber-200 hover:border-amber-300' :
                    proposal.status === 'COMPLETED' || proposal.status === 'SIGNED' ? 'border-green-200 hover:border-green-300' :
                    'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Status gradient bar */}
                  <div className={`h-1 ${
                    proposal.status === 'PENDING' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    proposal.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    proposal.status === 'COMPLETED' || proposal.status === 'SIGNED' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    'bg-gradient-to-r from-gray-300 to-gray-400'
                  }`} />

                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          proposal.status === 'PENDING' ? 'bg-blue-100' :
                          proposal.status === 'IN_PROGRESS' ? 'bg-amber-100' :
                          proposal.status === 'COMPLETED' || proposal.status === 'SIGNED' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <FileSignature className={`w-6 h-6 ${
                            proposal.status === 'PENDING' ? 'text-blue-600' :
                            proposal.status === 'IN_PROGRESS' ? 'text-amber-600' :
                            proposal.status === 'COMPLETED' || proposal.status === 'SIGNED' ? 'text-green-600' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {proposal.title || 'Insurance Proposal'}
                            </h3>
                            {getStatusBadge(proposal.status)}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Ref: {proposal.referenceNumber || `PRO-${proposal.id}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Created: {formatDate(proposal.createdAt)}
                            </span>
                            {proposal.signedAt && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Signed: {formatDate(proposal.signedAt)}
                              </span>
                            )}
                            {proposal.premium && (
                              <span className="font-medium text-gray-700">
                                Premium: {formatCurrency(proposal.premium)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {(proposal.status === 'COMPLETED' || proposal.status === 'SIGNED') && (
                          <button
                            onClick={() => {/* Download logic */}}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        )}
                        <button
                          onClick={cta.action}
                          disabled={cta.disabled}
                          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm ${cta.className}`}
                        >
                          {cta.label}
                          <Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>eIDAS Article 26 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit Encryption</span>
              </div>
            </div>
            <p>© 2025 JenusSign. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerDashboardPage
