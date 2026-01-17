import React from 'react'
import { getStatusConfig } from '../constants/designSystem'

/**
 * StatusBadge - Unified status badge component for both portals
 * 
 * Props:
 * - status: string (PENDING, IN_PROGRESS, COMPLETED, SIGNED, etc.)
 * - size: 'sm' | 'md' | 'lg'
 * - showDot: boolean - whether to show animated status dot
 * - className: additional classes
 */
export default function StatusBadge({ 
  status, 
  size = 'md', 
  showDot = true,
  className = '' 
}) {
  const config = getStatusConfig(status)
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  }
  
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  }

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showDot && (
        <span className={`${dotSizes[size]} rounded-full ${config.dotColor} animate-pulse`} />
      )}
      {config.label}
    </span>
  )
}
