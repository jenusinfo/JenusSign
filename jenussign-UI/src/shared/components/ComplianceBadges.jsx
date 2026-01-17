import React from 'react'
import { Shield, ShieldCheck, Lock } from 'lucide-react'
import { complianceBadges } from '../constants/designSystem'

/**
 * ComplianceBadge - Single compliance badge
 */
export function ComplianceBadge({ type, size = 'md', className = '' }) {
  const config = complianceBadges[type]
  if (!config) return null
  
  const icons = {
    Shield,
    ShieldCheck,
    Lock,
  }
  
  const Icon = icons[config.icon] || Shield
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  return (
    <div 
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      <span>{config.label}</span>
    </div>
  )
}

/**
 * ComplianceBadgeBar - Horizontal bar of compliance badges
 * Used in headers and footers
 */
export function ComplianceBadgeBar({ 
  badges = ['secure', 'eidas', 'gdpr'], 
  size = 'sm',
  className = '' 
}) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {badges.map((badge) => (
        <ComplianceBadge key={badge} type={badge} size={size} />
      ))}
    </div>
  )
}

/**
 * TrustIndicatorBar - Top bar showing security indicators
 * Used on customer-facing pages
 */
export function TrustIndicatorBar({ className = '' }) {
  return (
    <div className={`bg-white/10 backdrop-blur-sm border-b border-white/10 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-6 text-xs text-white/90">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>Secure Connection</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span>eIDAS Compliant</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-300" />
            <span>GDPR Protected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplianceBadge
