import React from 'react'
import { FileSignature } from 'lucide-react'

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg`}>
        <FileSignature className="w-2/3 h-2/3 text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-gray-900 dark:text-white leading-tight`}>
            JenusSign
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
            eIDAS Digital Signing
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
