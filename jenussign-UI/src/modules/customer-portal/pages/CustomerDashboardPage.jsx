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
  Download,
  Eye,
  Calendar,
  Shield,
  ShieldCheck,
  Lock,
  FileSignature,
  User,
  LogOut,
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { envelopesApi } from '../../../api/envelopesApi'
import useAuthStore from '../../../shared/store/authStore'
import Loading from '../../../shared/components/Loading'
import StatusBadge from '../../../shared/components/StatusBadge'
import { ComplianceBadge } from '../../../shared/components/ComplianceBadges'
import { 
  ENVELOPE_STATUS, 
  getStatusConfig, 
  componentPresets, 
  animations 
} from '../../../shared/constants/designSystem'

/**
 * CustomerDashboardPage - Customer's envelope/document dashboard
 * 
 * Features:
 * - List all envelopes for the customer
 * - Filter by status
 * - Search functionality
 * - Quick actions (sign, view, download)
 */
const CustomerDashboardPage = () => {
  const navigate = useNavigate()
  const { customer, logoutCustomer } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch customer envelopes using the unified envelope API
  const { data: envelopes = [], isLoading } = useQuery({
    queryKey: ['customer-envelopes', customer?.email],
    queryFn: () => envelopesApi.getCustomerEnvelopes(customer?.email),
    enabled: !!customer?.email,
  })

  const handleLogout = () => {
    logoutCustomer()
    navigate('/customer/login')
    toast.success('Logged out successfully')
  }

  // Filter envelopes
  const filteredEnvelopes = envelopes.filter((env) => {
    const matchesSearch =
      env.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || env.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats calculation
  const stats = {
    total: envelopes.length,
    pending: envelopes.filter((e) => 
      e.status === ENVELOPE_STATUS.PENDING || e.status === ENVELOPE_STATUS.SENT
    ).length,
    inProgress: envelopes.filter((e) => e.status === ENVELOPE_STATUS.IN_PROGRESS).length,
    completed: envelopes.filter((e) => 
      e.status === ENVELOPE_STATUS.COMPLETED || e.status === ENVELOPE_STATUS.SIGNED
    ).length,
  }

  // Get CTA button config based on envelope status
  const getCtaConfig = (envelope) => {
    const statusConfig = getStatusConfig(envelope.status)
    
    switch (envelope.status) {
      case ENVELOPE_STATUS.PENDING:
      case ENVELOPE_STATUS.SENT:
        return {
          label: 'Start Signing',
          icon: ChevronRight,
          className: componentPresets.button.primary,
          action: () => navigate(`/customer/sign/${envelope.token}`),
        }
      case ENVELOPE_STATUS.IN_PROGRESS:
        return {
          label: 'Continue',
          icon: ChevronRight,
          className: componentPresets.button.warning,
          action: () => navigate(`/customer/sign/${envelope.token}`),
        }
      case ENVELOPE_STATUS.COMPLETED:
      case ENVELOPE_STATUS.SIGNED:
        return {
          label: 'View',
          icon: Eye,
          className: componentPresets.button.success,
          action: () => navigate(`/customer/envelopes/${envelope.id}`),
        }
      case ENVELOPE_STATUS.EXPIRED:
        return {
          label: 'Expired',
          icon: AlertCircle,
          className: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed',
          action: () => {},
          disabled: true,
        }
      default:
        return {
          label: 'View',
          icon: Eye,
          className: componentPresets.button.secondary,
          action: () => navigate(`/customer/envelopes/${envelope.id}`),
        }
    }
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Format currency helper
  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('en-CY', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return <Loading fullScreen message="Loading your documents..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileSignature className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 hidden sm:block">JenusSign</span>
              </div>
              
              {/* Compliance badges */}
              <div className="hidden sm:flex items-center gap-2">
                <ComplianceBadge type="secure" size="sm" />
                <ComplianceBadge type="eidas" size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* User info */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{customer?.email}</span>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          {...animations.cardEnter}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back{customer?.name ? `, ${customer.name}` : ''}!
              </h1>
              <p className="text-blue-100 text-sm">
                You have {stats.pending + stats.inProgress} document{stats.pending + stats.inProgress !== 1 ? 's' : ''} awaiting your signature.
              </p>
            </div>
            
            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-xs text-blue-200">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-xs text-blue-200">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs text-blue-200">Completed</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { value: 'all', label: 'All', count: stats.total },
                { value: ENVELOPE_STATUS.PENDING, label: 'Pending', count: stats.pending },
                { value: ENVELOPE_STATUS.IN_PROGRESS, label: 'In Progress', count: stats.inProgress },
                { value: ENVELOPE_STATUS.COMPLETED, label: 'Completed', count: stats.completed },
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

        {/* Envelopes List */}
        <div className="space-y-4">
          {filteredEnvelopes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : "You don't have any documents yet."}
              </p>
            </div>
          ) : (
            filteredEnvelopes.map((envelope, index) => {
              const cta = getCtaConfig(envelope)
              const Icon = cta.icon
              const statusConfig = getStatusConfig(envelope.status)

              return (
                <motion.div
                  key={envelope.id}
                  {...animations.listItem(index)}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                    envelope.status === ENVELOPE_STATUS.PENDING || envelope.status === ENVELOPE_STATUS.SENT
                      ? 'border-blue-200 hover:border-blue-300'
                      : envelope.status === ENVELOPE_STATUS.IN_PROGRESS
                        ? 'border-amber-200 hover:border-amber-300'
                        : envelope.status === ENVELOPE_STATUS.COMPLETED || envelope.status === ENVELOPE_STATUS.SIGNED
                          ? 'border-green-200 hover:border-green-300'
                          : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Status gradient bar */}
                  <div className={`h-1 ${statusConfig.gradient}`} />

                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.iconBg}`}>
                          <FileSignature className={`w-6 h-6 ${statusConfig.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {envelope.title}
                            </h3>
                            <StatusBadge status={envelope.status} size="sm" />
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Ref: {envelope.referenceNumber}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Created: {formatDate(envelope.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              {envelope.documents?.length || 0} document{envelope.documents?.length !== 1 ? 's' : ''}
                            </span>
                            {envelope.completedAt && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Signed: {formatDate(envelope.completedAt)}
                              </span>
                            )}
                            {envelope.premium && (
                              <span className="font-medium text-gray-700">
                                Premium: {formatCurrency(envelope.premium, envelope.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        {(envelope.status === ENVELOPE_STATUS.COMPLETED || envelope.status === ENVELOPE_STATUS.SIGNED) && (
                          <a
                            href="/samples/demo-signed-esealed.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        )}
                        <button
                          onClick={cta.action}
                          disabled={cta.disabled}
                          className={cta.className}
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
