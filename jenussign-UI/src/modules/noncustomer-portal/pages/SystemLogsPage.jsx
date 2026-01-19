import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  LogIn,
  Eye,
  Edit,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Server,
  Shield,
  Info,
} from 'lucide-react'
import { logsApi } from '../../../api/logsApi'
import Loading from '../../../shared/components/Loading'

const eventTypeConfig = {
  EMAIL_SENT: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Email Sent' },
  EMAIL_FAILED: { icon: Mail, color: 'text-red-600', bg: 'bg-red-100', label: 'Email Failed' },
  SMS_SENT: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100', label: 'SMS Sent' },
  SMS_FAILED: { icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-100', label: 'SMS Failed' },
  ENVELOPE_CREATED: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Envelope Created' },
  ENVELOPE_VIEWED: { icon: Eye, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Envelope Viewed' },
  ENVELOPE_SIGNED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Envelope Signed' },
  ENVELOPE_EXPIRED: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Envelope Expired' },
  OTP_VERIFIED: { icon: Shield, color: 'text-green-600', bg: 'bg-green-100', label: 'OTP Verified' },
  LOGIN_SUCCESS: { icon: LogIn, color: 'text-green-600', bg: 'bg-green-100', label: 'Login Success' },
  LOGIN_FAILED: { icon: LogIn, color: 'text-red-600', bg: 'bg-red-100', label: 'Login Failed' },
  API_CALL: { icon: Server, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'API Call' },
  CERTIFICATE_CHECK: { icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Certificate Check' },
  USER_CREATED: { icon: User, color: 'text-blue-600', bg: 'bg-blue-100', label: 'User Created' },
  USER_UPDATED: { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-100', label: 'User Updated' },
  USER_DELETED: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: 'User Deleted' },
}

const severityConfig = {
  INFO: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Info' },
  WARNING: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Warning' },
  ERROR: { color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
}

const SystemLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedLogId, setExpandedLogId] = useState(null)
  const logsPerPage = 10

  // Fetch logs from API
  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['systemLogs', searchQuery, eventFilter, severityFilter, dateRange, currentPage],
    queryFn: () => logsApi.getLogs({
      search: searchQuery,
      eventType: eventFilter,
      severity: severityFilter,
      fromDate: dateRange.from,
      toDate: dateRange.to,
      page: currentPage,
      pageSize: logsPerPage,
    }),
  })

  // Transform API response to expected format
  const logs = (logsData?.logs || logsData || []).map(log => ({
    id: log.id,
    timestamp: log.timestamp || log.createdAt,
    eventType: log.eventType,
    severity: log.severity || 'INFO',
    message: log.message,
    envelopeId: log.envelopeId,
    envelopeRef: log.envelopeRef || log.businessKey,
    customerId: log.customerId,
    customerName: log.customerName,
    userId: log.userId,
    userName: log.userName,
    metadata: log.metadata || {},
  }))

  const totalCount = logsData?.totalCount || logs.length
  const totalPages = Math.ceil(totalCount / logsPerPage)
  
  // Client-side filtering as fallback if API doesn't support filtering
  const filteredLogs = logs

  // Calculate stats from current data
  const infoCount = logs.filter(l => l.severity === 'INFO').length
  const warningCount = logs.filter(l => l.severity === 'WARNING').length
  const errorCount = logs.filter(l => l.severity === 'ERROR').length

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: '—', time: '—' }
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
  }

  const handleExport = async () => {
    try {
      const blob = await logsApi.exportLogs({
        search: searchQuery,
        eventType: eventFilter,
        severity: severityFilter,
        fromDate: dateRange.from,
        toDate: dateRange.to,
      }, 'csv')
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export functionality is not yet available')
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const getEventConfig = (eventType) => {
    return eventTypeConfig[eventType] || { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100', label: eventType }
  }

  if (isLoading) {
    return <Loading message="Loading system logs..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500 mt-1">Audit trail and event history for compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Events</option>
            <optgroup label="Envelopes">
              <option value="ENVELOPE_CREATED">Envelope Created</option>
              <option value="ENVELOPE_VIEWED">Envelope Viewed</option>
              <option value="ENVELOPE_SIGNED">Envelope Signed</option>
              <option value="ENVELOPE_EXPIRED">Envelope Expired</option>
            </optgroup>
            <optgroup label="Communications">
              <option value="EMAIL_SENT">Email Sent</option>
              <option value="EMAIL_FAILED">Email Failed</option>
              <option value="SMS_SENT">SMS Sent</option>
              <option value="SMS_FAILED">SMS Failed</option>
            </optgroup>
            <optgroup label="Authentication">
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="OTP_VERIFIED">OTP Verified</option>
            </optgroup>
            <optgroup label="System">
              <option value="API_CALL">API Call</option>
              <option value="CERTIFICATE_CHECK">Certificate Check</option>
            </optgroup>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Severity</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <FileText className="w-4 h-4" />
            Total Events
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Info
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {infoCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Warnings
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {warningCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <XCircle className="w-4 h-4" />
            Errors
          </div>
          <p className="text-2xl font-bold text-red-600">
            {errorCount}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User/Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, index) => {
                const eventConfig = getEventConfig(log.eventType)
                const EventIcon = eventConfig.icon
                const { date, time } = formatTimestamp(log.timestamp)
                const sevConfig = severityConfig[log.severity] || severityConfig.INFO

                return (
                  <React.Fragment key={log.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        expandedLogId === log.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${eventConfig.bg} flex items-center justify-center`}>
                            <EventIcon className={`w-4 h-4 ${eventConfig.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{eventConfig.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">{log.message}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.envelopeRef ? (
                          <span className="text-sm font-mono text-indigo-600">{log.envelopeRef}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.userName || log.customerName || '—'}</div>
                        {log.userName && log.customerName && (
                          <div className="text-xs text-gray-500">{log.customerName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${sevConfig.bg} ${sevConfig.color}`}>
                          {sevConfig.label}
                        </span>
                      </td>
                    </motion.tr>

                    {/* Expanded Details */}
                    {expandedLogId === log.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-500 mb-1">Log ID</p>
                              <p className="font-mono text-gray-900">{log.id}</p>
                            </div>
                            {log.envelopeId && (
                              <div>
                                <p className="font-medium text-gray-500 mb-1">Envelope ID</p>
                                <p className="font-mono text-gray-900">{log.envelopeId}</p>
                              </div>
                            )}
                            {log.customerId && (
                              <div>
                                <p className="font-medium text-gray-500 mb-1">Customer ID</p>
                                <p className="font-mono text-gray-900">{log.customerId}</p>
                              </div>
                            )}
                            {log.userId && (
                              <div>
                                <p className="font-medium text-gray-500 mb-1">User ID</p>
                                <p className="font-mono text-gray-900">{log.userId}</p>
                              </div>
                            )}
                            {log.metadata && Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key}>
                                <p className="font-medium text-gray-500 mb-1 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-gray-900">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalCount)} of {totalCount} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemLogsPage
