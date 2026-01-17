import React, { useState, useEffect } from 'react'
import { 
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Maximize2,
} from 'lucide-react'

/**
 * MobileFriendlyPdfViewer - Unified PDF viewer for both portals
 * 
 * Features:
 * - Native browser PDF rendering with fallbacks
 * - Google Docs Viewer fallback for mobile
 * - Loading states and error handling
 * - Download and fullscreen options
 * 
 * Props:
 * - src: PDF URL
 * - title: Document title
 * - height: Viewer height (default: '500px')
 * - showDownload: Show download button
 * - showFullscreen: Show fullscreen button
 * - className: Additional classes
 */
export default function MobileFriendlyPdfViewer({ 
  src, 
  title = 'Document',
  className = '',
  showDownload = true,
  showFullscreen = true,
  height = '500px',
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  // Check if external URL
  const isExternalUrl = src?.startsWith('http://') || src?.startsWith('https://')
  
  // Google Docs Viewer URL (works for external URLs on mobile)
  const googleViewerUrl = isExternalUrl 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`
    : null

  // For local PDFs, construct absolute URL
  const absoluteSrc = isExternalUrl ? src : `${window.location.origin}${src}`

  // PDF parameters for better viewing
  const pdfParams = '#toolbar=1&navpanes=0&scrollbar=1&view=FitH'

  return (
    <div className={`bg-gray-100 rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showFullscreen && (
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}
          {showDownload && (
            <a
              href={src}
              download
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className="relative bg-gray-200"
        style={{ height }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading document...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
            <p className="text-gray-700 font-medium mb-1 text-center">Unable to display PDF</p>
            <p className="text-gray-500 text-sm mb-4 text-center">
              Your browser may not support embedded PDF viewing
            </p>
            <div className="flex gap-2">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </a>
              {showDownload && (
                <a
                  href={src}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Primary: Use object tag which has better cross-browser support */}
            <object
              data={`${src}${pdfParams}`}
              type="application/pdf"
              className="w-full h-full"
              style={{ display: error ? 'none' : 'block' }}
              onLoad={handleLoad}
              onError={handleError}
            >
              {/* Fallback 1: iframe with Google Docs viewer on mobile */}
              <iframe
                src={isMobile && googleViewerUrl ? googleViewerUrl : `${src}${pdfParams}`}
                title={title}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
              >
                {/* Fallback 2: Direct link */}
                <div className="p-4 text-center">
                  <p className="text-gray-600 mb-2">
                    Your browser does not support PDF viewing.
                  </p>
                  <a href={src} className="text-blue-600 hover:underline font-medium">
                    Download the PDF
                  </a>
                </div>
              </iframe>
            </object>
          </>
        )}
      </div>
    </div>
  )
}
