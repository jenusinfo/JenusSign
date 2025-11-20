import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Shield, LogOut, Clock, CheckCircle, AlertCircle, 
Calendar, ArrowRight,  Download, } from 'lucide-react'
import toast from 'react-hot-toast'
import proposalsApi from '../../../api/proposalsApi'
import useAuthStore from '../../../shared/store/authStore'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

export default function CustomerDashboardPage() {
  const navigate = useNavigate()
  const { customer, logoutCustomer } = useAuthStore()
  const [filter, setFilter] = React.useState('all')

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['customer-proposals'],
    queryFn: proposalsApi.getCustomerProposals,
  })

  const handleLogout = () => {
    logoutCustomer()
    toast.success('Logged out successfully')
    navigate('/customer/login')
  }

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'pending') return p.status === 'PendingSignature'
    if (filter === 'in-progress') return p.status === 'InProgress'
    if (filter === 'signed') return p.status === 'Signed'
    return true
  })

  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'PendingSignature').length,
    inProgress: proposals.filter((p) => p.status === 'InProgress').length,
    signed: proposals.filter((p) => p.status === 'Signed').length,
  }

  if (isLoading) return <Loading fullScreen message="Loading your proposals..." />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JenusSign</h1>
                <p className="text-sm text-gray-600">Welcome, {customer?.fullName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-warning-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-success-600 mt-1">{stats.signed}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {[
            { key: 'all', label: 'All Proposals' },
            { key: 'pending', label: 'Pending' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'signed', label: 'Signed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "You don't have any proposals yet."
                : `No ${filter} proposals at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredProposals.map((proposal, index) => {
			  const STATUS_STYLES = {
				PendingSignature: {
				  cardBorder: "border-blue-200",
				  badgeBg: "bg-blue-50",
				  badgeDot: "bg-blue-500",
				  badgeText: "text-blue-700",
				  label: "Pending signature",
				  buttonBg: "bg-blue-600 hover:bg-blue-700 text-white",
				},
				InProgress: {
				  cardBorder: "border-yellow-300",
				  badgeBg: "bg-yellow-50",
				  badgeDot: "bg-yellow-500",
				  badgeText: "text-yellow-800",
				  label: "Started",
				  buttonBg: "bg-yellow-600 hover:bg-yellow-700 text-white",
				},
				Signed: {
				  cardBorder: "border-green-300",
				  badgeBg: "bg-green-50",
				  badgeDot: "bg-green-500",
				  badgeText: "text-green-700",
				  label: "Signed",
				  buttonBg: "bg-green-600 hover:bg-green-700 text-white",
				},
				Expired: {
				  cardBorder: "border-gray-200",
				  badgeBg: "bg-gray-100",
				  badgeDot: "bg-gray-400",
				  badgeText: "text-gray-500",
				  label: "Expired",
				  buttonBg: "bg-gray-200 text-gray-500 cursor-not-allowed",
				},
			  }

			  const styles = STATUS_STYLES[proposal.status] || STATUS_STYLES.PendingSignature

			  return (
				<motion.div
				  key={proposal.id}
				  initial={{ opacity: 0, y: 20 }}
				  animate={{ opacity: 1, y: 0 }}
				  transition={{ delay: index * 0.05 }}
				  className={`p-5 rounded-2xl bg-white border ${styles.cardBorder}
							  shadow-sm hover:shadow-md cursor-pointer transition`}
				  onClick={() => navigate(`/customer/proposals/${proposal.id}/sign`)}
				>
				  {/* Header */}
				  <div className="flex justify-between items-start mb-3">
					<div>
					  <h3 className="text-lg font-semibold text-gray-900">
						{proposal.productType}
					  </h3>
					  <span className="text-xs inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
						Proposal
					  </span>
					</div>
					<FileText className="w-5 h-5 text-gray-400" />
				  </div>

				  {/* Status Badge */}
				  <div
					className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm 
								${styles.badgeBg} ${styles.badgeText}`}
				  >
					<span className={`w-2 h-2 rounded-full ${styles.badgeDot}`} />
					{styles.label}
				  </div>

				  {/* Dates */}
				  <div className="mt-4 space-y-1 text-sm text-gray-600">
					<div className="flex items-center gap-2">
					  <Calendar className="w-4 h-4" />
					  <span>Valid until: {formatDate(proposal.expiryDate)}</span>
					</div>
					{proposal.status === "Signed" && (
					  <div className="flex items-center gap-2 text-green-700">
						<CheckCircle className="w-4 h-4" />
						<span>Signed: {formatDate(proposal.signedAt)}</span>
					  </div>
					)}
				  </div>

				  {/* Button */}
				  <button
					className={`mt-5 w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${styles.buttonBg}`}
				  >
					{proposal.status === "Signed" ? (
					  <>
						<Download className="w-4 h-4" /> View & Download
					  </>
					) : proposal.status === "PendingSignature" ? (
					  <>Start</>
					) : proposal.status === "InProgress" ? (
					  <>Resume</>
					) : (
					  <>Expired</>
					)}
				  </button>
				</motion.div>
			  )
			})}


          </div>
        )}
      </div>
    </div>
  )
}
