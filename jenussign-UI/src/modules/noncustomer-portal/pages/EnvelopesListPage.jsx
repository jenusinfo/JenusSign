import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  MoreVertical,
  Calendar,
  User,
  FileText,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { envelopesApi } from '../../../api/envelopesApi'
import Loading from '../../../shared/components/Loading'

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

const EnvelopesListPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Fetch envelopes from API
  const { data: envelopesResponse, isLoading } = useQuery({
    queryKey: ['envelopes', searchQuery, statusFilter],
    queryFn: () => envelopesApi.getEnvelopes({
      search: searchQuery || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }),
  })

  const envelopes = envelopesResponse?.items || []

  if (isLoading) {
    return <Loading message="Loading envelopes..." />
  }

  const filteredEnvelopes = envelopes.filter((env) => {
    const matchesSearch =
      env.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || env.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Envelopes</h1>
          <p className="text-gray-500 mt-1">Manage document signing envelopes</p>
        </div>
        <Link
          to="/portal/envelopes/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Envelope
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, reference, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Envelopes List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-4">Envelope</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredEnvelopes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No envelopes found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Link
                to="/portal/envelopes/new"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create new envelope
              </Link>
            </div>
          ) : (
            filteredEnvelopes.map((envelope, index) => (
              <motion.div
                key={envelope.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-gray-50 transition-colors"
              >
                <Link to={`/portal/envelopes/${envelope.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                    {/* Envelope Info */}
                    <div className="col-span-1 md:col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{envelope.title}</h3>
                          <p className="text-sm text-gray-500">{envelope.reference}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{envelope.documentsCount} documents</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="col-span-1 md:col-span-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{envelope.customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{envelope.customer.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 md:col-span-2">
                      <StatusBadge status={envelope.status} />
                    </div>

                    {/* Created Date */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(envelope.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 md:col-span-1 flex justify-end">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{envelopes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {envelopes.filter((e) => e.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {envelopes.filter((e) => e.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-red-600">
            {envelopes.filter((e) => e.status === 'EXPIRED').length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EnvelopesListPage
