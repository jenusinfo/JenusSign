import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, FileSignature } from 'lucide-react'

/**
 * Loading - Unified loading component for both portals
 * 
 * Props:
 * - fullScreen: boolean - cover entire screen
 * - message: string - loading message
 * - showLogo: boolean - show JenusSign logo
 * - size: 'sm' | 'md' | 'lg'
 */
export default function Loading({
  fullScreen = false,
  message = 'Loading...',
  showLogo = true,
  size = 'md',
}) {
  const sizes = {
    sm: { spinner: 'w-6 h-6', text: 'text-sm', logo: 'w-8 h-8' },
    md: { spinner: 'w-8 h-8', text: 'text-base', logo: 'w-12 h-12' },
    lg: { spinner: 'w-12 h-12', text: 'text-lg', logo: 'w-16 h-16' },
  }

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      {showLogo && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`${sizes[size].logo} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg`}
        >
          <FileSignature className="w-1/2 h-1/2 text-white" />
        </motion.div>
      )}
      
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizes[size].spinner} text-blue-600 animate-spin`} />
        {message && (
          <p className={`${sizes[size].text} text-gray-600 font-medium`}>
            {message}
          </p>
        )}
      </div>
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}

/**
 * LoadingOverlay - Overlay loading for async operations
 */
export function LoadingOverlay({ message = 'Processing...', show = true }) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
    >
      <Loading message={message} showLogo={true} size="lg" />
    </motion.div>
  )
}

/**
 * LoadingButton - Button with loading state
 */
export function LoadingButton({
  loading = false,
  children,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
