/**
 * JenusSign Design System Constants
 * 
 * Unified design tokens for both Customer Portal and Agent/Broker Portal
 * Ensures visual consistency across the entire platform
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary brand colors (Blue/Indigo gradient family)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Secondary (Teal for accents)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
}

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Primary gradients
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  primaryHover: 'hover:from-blue-700 hover:to-indigo-700',
  primaryDark: 'bg-gradient-to-r from-blue-700 to-indigo-700',
  
  // Success gradients
  success: 'bg-gradient-to-r from-green-500 to-emerald-600',
  successHover: 'hover:from-green-600 hover:to-emerald-700',
  
  // Warning gradients
  warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
  warningHover: 'hover:from-amber-600 hover:to-orange-700',
  
  // Background gradients
  pageBg: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
  cardHeader: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  successHeader: 'bg-gradient-to-r from-green-500 to-emerald-600',
  
  // Status bar gradients (thin accent lines)
  statusPending: 'bg-gradient-to-r from-blue-400 to-indigo-500',
  statusInProgress: 'bg-gradient-to-r from-amber-400 to-orange-500',
  statusCompleted: 'bg-gradient-to-r from-green-400 to-emerald-500',
  statusExpired: 'bg-gradient-to-r from-gray-300 to-gray-400',
}

// ============================================================================
// ENVELOPE & DOCUMENT STATUS CONSTANTS
// ============================================================================

export const ENVELOPE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  SENT: 'SENT',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SIGNED: 'SIGNED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  DECLINED: 'DECLINED',
}

export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  VIEWED: 'VIEWED',
  CONFIRMED: 'CONFIRMED',
  SIGNED: 'SIGNED',
}

// Status display configuration
export const statusConfig = {
  [ENVELOPE_STATUS.DRAFT]: {
    label: 'Draft',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    gradient: gradients.statusExpired,
  },
  [ENVELOPE_STATUS.PENDING]: {
    label: 'Pending',
    bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: gradients.statusPending,
  },
  [ENVELOPE_STATUS.SENT]: {
    label: 'Sent',
    bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: gradients.statusPending,
  },
  [ENVELOPE_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    bgColor: 'bg-gradient-to-r from-amber-100 to-orange-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    gradient: gradients.statusInProgress,
  },
  [ENVELOPE_STATUS.COMPLETED]: {
    label: 'Completed',
    bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    gradient: gradients.statusCompleted,
  },
  [ENVELOPE_STATUS.SIGNED]: {
    label: 'Signed',
    bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    gradient: gradients.statusCompleted,
  },
  [ENVELOPE_STATUS.EXPIRED]: {
    label: 'Expired',
    bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-400',
    gradient: gradients.statusExpired,
  },
  [ENVELOPE_STATUS.CANCELLED]: {
    label: 'Cancelled',
    bgColor: 'bg-gradient-to-r from-red-100 to-rose-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    gradient: 'bg-gradient-to-r from-red-400 to-rose-500',
  },
  [ENVELOPE_STATUS.DECLINED]: {
    label: 'Declined',
    bgColor: 'bg-gradient-to-r from-red-100 to-rose-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    gradient: 'bg-gradient-to-r from-red-400 to-rose-500',
  },
}

// Helper to get status config with fallback
export const getStatusConfig = (status) => {
  const normalizedStatus = status?.toUpperCase?.()?.replace(/ /g, '_')
  return statusConfig[normalizedStatus] || statusConfig[ENVELOPE_STATUS.PENDING]
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families (using system fonts that look professional)
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    display: "'Plus Jakarta Sans', 'Inter', sans-serif",
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
}

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const layout = {
  // Border radius
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Max widths
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Card padding
  cardPadding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
  },
}

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  colored: {
    blue: 'shadow-lg shadow-blue-500/25',
    green: 'shadow-lg shadow-green-500/25',
    amber: 'shadow-lg shadow-amber-500/25',
  },
}

// ============================================================================
// ANIMATION VARIANTS (for Framer Motion)
// ============================================================================

export const animations = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  
  // Card animations
  cardEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  
  // Staggered list items
  listItem: (index) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.3 },
  }),
  
  // Slide variants for carousel
  slideVariants: {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    }),
  },
  
  // Expand/collapse
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  
  // Success celebration
  celebration: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: 'spring', duration: 0.5 },
  },
}

// ============================================================================
// COMPONENT PRESETS
// ============================================================================

export const componentPresets = {
  // Buttons
  button: {
    primary: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
              bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
              text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed`,
    secondary: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
                bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 
                transition-all disabled:opacity-60 disabled:cursor-not-allowed`,
    success: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
              text-white shadow-lg shadow-green-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed`,
    warning: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
              bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 
              text-white shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed`,
    danger: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
             bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 
             text-white shadow-lg shadow-red-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed`,
    ghost: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
            text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all`,
  },
  
  // Cards
  card: {
    base: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
    elevated: 'bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden',
    interactive: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all cursor-pointer',
  },
  
  // Inputs
  input: {
    base: `w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`,
    error: `w-full px-4 py-2.5 rounded-xl border border-red-300 text-gray-900 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`,
  },
  
  // Badges
  badge: {
    base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
  },
}

// ============================================================================
// eIDAS COMPLIANCE BADGES
// ============================================================================

export const complianceBadges = {
  eidas: {
    label: 'eIDAS Compliant',
    icon: 'Shield',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  secure: {
    label: 'Secure',
    icon: 'ShieldCheck',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
  },
  gdpr: {
    label: 'GDPR Protected',
    icon: 'Lock',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  encrypted: {
    label: '256-bit Encryption',
    icon: 'Lock',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
  },
}

export default {
  colors,
  gradients,
  ENVELOPE_STATUS,
  DOCUMENT_STATUS,
  statusConfig,
  getStatusConfig,
  typography,
  layout,
  shadows,
  animations,
  componentPresets,
  complianceBadges,
}
