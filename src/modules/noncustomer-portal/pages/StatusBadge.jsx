import React from 'react'
import { Clock, Send, CheckCircle2, AlertCircle, XCircle, FileText } from 'lucide-react'

const statusConfig = {
  // Proposal statuses
  Draft: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    icon: FileText,
    label: 'Draft' 
  },
  PendingSignature: { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700', 
    icon: Clock,
    label: 'Pending Signature' 
  },
  InProgress: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-700', 
    icon: Send,
    label: 'In Progress' 
  },
  Signed: { 
    bg: 'bg-green-100', 
    text: 'text-green-700', 
    icon: CheckCircle2,
    label: 'Signed' 
  },
  Completed: { 
    bg: 'bg-green-100', 
    text: 'text-green-700', 
    icon: CheckCircle2,
    label: 'Completed' 
  },
  Rejected: { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    icon: XCircle,
    label: 'Rejected' 
  },
  Expired: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-600', 
    icon: AlertCircle,
    label: 'Expired' 
  },
  PhysicalSigning: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-700', 
    icon: FileText,
    label: 'Physical Signing' 
  },
  
  // Customer statuses
  Active: { 
    bg: 'bg-green-100', 
    text: 'text-green-700', 
    icon: CheckCircle2,
    label: 'Active' 
  },
  Inactive: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    icon: AlertCircle,
    label: 'Inactive' 
  },
  Pending: { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700', 
    icon: Clock,
    label: 'Pending' 
  },
}

const StatusBadge = ({ status, showIcon = false, size = 'default' }) => {
  const config = statusConfig[status] || statusConfig.Draft
  const Icon = config.icon

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-xs',
    large: 'px-4 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  )
}

export default StatusBadge
