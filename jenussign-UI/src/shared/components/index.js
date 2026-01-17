/**
 * JenusSign Shared Components
 * 
 * Central export file for all shared components used across both
 * Customer Portal and Agent/Broker Portal.
 */

// UI Components
export { default as Loading, LoadingOverlay, LoadingButton, Skeleton, CardSkeleton } from './Loading'
export { default as StatusBadge } from './StatusBadge'
export { ComplianceBadge, ComplianceBadgeBar, TrustIndicatorBar } from './ComplianceBadges'

// Document Components
export { default as MobileFriendlyPdfViewer } from './MobileFriendlyPdfViewer'
export { default as DocumentCarousel } from './DocumentCarousel'

// Signature Components
export { default as SignatureCapture } from './SignatureCapture'

// Re-export design system constants
export * from '../constants/designSystem'
