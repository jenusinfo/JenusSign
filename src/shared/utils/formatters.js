import { format, parseISO } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'MMM dd, yyyy')
  } catch {
    return ''
  }
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'MMM dd, yyyy HH:mm')
  } catch {
    return ''
  }
}

export const getStatusColor = (status) => {
  const colors = {
    Draft: 'badge-draft',
    PendingSignature: 'badge-pending',
    InProgress: 'badge-in-progress',
    Signed: 'badge-signed',
    Rejected: 'badge-rejected',
    Expired: 'badge-expired',
    Active: 'badge-signed',
    Inactive: 'badge-expired',
  }
  return colors[status] || 'badge-draft'
}

export const getStatusLabel = (status) => {
  const labels = {
    PendingSignature: 'Pending Signature',
    InProgress: 'In Progress',
  }
  return labels[status] || status
}


export const formatCurrency = (value, currency = 'EUR') => {
  if (value === null || value === undefined || value === '') return ''
  try {
    const number = Number(value)
    if (Number.isNaN(number)) {
      return String(value)
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  } catch {
    return String(value)
  }
}
