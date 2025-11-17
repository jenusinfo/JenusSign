import React from 'react'
import { getStatusColor, getStatusLabel } from '../utils/formatters'

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}
