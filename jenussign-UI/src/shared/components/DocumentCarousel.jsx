import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  AlertCircle,
  Lock,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import MobileFriendlyPdfViewer from '../../shared/components/MobileFriendlyPdfViewer'
import { animations, componentPresets } from '../../shared/constants/designSystem'

/**
 * DocumentCarousel - Mobile-first swipeable document carousel
 * 
 * Used in both Customer Portal and Agent Portal for reviewing
 * multiple documents in an envelope before signing.
 * 
 * Features:
 * - Swipe gestures for navigation
 * - Visual card stack effect
 * - Clear progress indication
 * - Large touch-friendly buttons
 * - Document confirmation tracking
 * 
 * Props:
 * - documents: Array of { id, title, url, pages?, status? }
 * - onAllConfirmed: Callback when all documents are confirmed
 * - onDocumentConfirmed: Callback when a single document is confirmed
 * - showProgress: Show progress header (default: true)
 * - envelopeTitle: Title for the envelope header
 */
export default function DocumentCarousel({ 
  documents = [], 
  onAllConfirmed,
  onDocumentConfirmed,
  showProgress = true,
  envelopeTitle = 'Document Package',
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confirmedDocs, setConfirmedDocs] = useState({})
  const [direction, setDirection] = useState(0)
  const constraintsRef = useRef(null)

  const currentDoc = documents[currentIndex]
  const isCurrentConfirmed = confirmedDocs[currentDoc?.id]
  const allConfirmed = documents.every(doc => confirmedDocs[doc.id])
  const confirmedCount = Object.values(confirmedDocs).filter(Boolean).length

  const handleConfirmDocument = () => {
    if (!currentDoc) return

    const newConfirmed = { ...confirmedDocs, [currentDoc.id]: true }
    setConfirmedDocs(newConfirmed)
    
    if (onDocumentConfirmed) {
      onDocumentConfirmed(currentDoc.id, currentIndex)
    }

    // Check if all documents are now confirmed
    const allNowConfirmed = documents.every(doc => newConfirmed[doc.id])
    if (allNowConfirmed && onAllConfirmed) {
      onAllConfirmed()
    } else if (currentIndex < documents.length - 1) {
      // Auto-advance to next document after short delay
      setTimeout(() => {
        setDirection(1)
        setCurrentIndex(currentIndex + 1)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentIndex < documents.length - 1 && isCurrentConfirmed) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleDragEnd = (event, info) => {
    const threshold = 50
    if (info.offset.x < -threshold && currentIndex < documents.length - 1 && isCurrentConfirmed) {
      handleNext()
    } else if (info.offset.x > threshold && currentIndex > 0) {
      handlePrevious()
    }
  }

  const handleDocumentSelect = (index) => {
    if (index <= confirmedCount || index === currentIndex) {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    }
  }

  if (!documents.length) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No documents to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with envelope info */}
      {showProgress && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{envelopeTitle}</h2>
              <p className="text-blue-100 text-sm">
                {documents.length} document{documents.length !== 1 ? 's' : ''} to review
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-100">Progress</span>
              <span className="font-medium">{confirmedCount} of {documents.length} reviewed</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(confirmedCount / documents.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Pills - Horizontal Scrollable */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {documents.map((doc, index) => {
            const isConfirmed = confirmedDocs[doc.id]
            const isCurrent = index === currentIndex
            const canAccess = index <= confirmedCount

            return (
              <button
                key={doc.id}
                onClick={() => handleDocumentSelect(index)}
                disabled={!canAccess}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
                  transition-all whitespace-nowrap
                  ${isCurrent 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                    : isConfirmed 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : canAccess
                        ? 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isConfirmed ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : canAccess ? (
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrent ? 'border-white text-white' : 'border-current'}`}>
                    {index + 1}
                  </span>
                ) : (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="max-w-[120px] truncate">{doc.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Card Stack Container */}
      <div 
        ref={constraintsRef}
        className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl p-3 sm:p-4 overflow-hidden"
        style={{ minHeight: '500px' }}
      >
        {/* Stacked cards behind (visual effect) */}
        {documents.slice(currentIndex + 1, currentIndex + 3).map((doc, i) => (
          <div
            key={doc.id}
            className="absolute inset-3 sm:inset-4 bg-white rounded-xl shadow-sm border border-gray-200"
            style={{
              transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.03})`,
              opacity: 1 - (i + 1) * 0.2,
              zIndex: -i - 1,
            }}
          />
        ))}

        {/* Current Document Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentDoc.id}
            custom={direction}
            variants={animations.slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {/* Document Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCurrentConfirmed ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {isCurrentConfirmed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className="text-blue-600 font-bold">{currentIndex + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{currentDoc.title}</h3>
                    <p className="text-xs text-gray-500">
                      {currentDoc.pages ? `${currentDoc.pages} pages` : 'Document'} • Swipe to navigate
                    </p>
                  </div>
                </div>

                <a
                  href={currentDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </a>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="p-3 sm:p-4">
              <MobileFriendlyPdfViewer
                src={currentDoc.url}
                title={currentDoc.title}
                height="350px"
                showDownload={true}
              />
            </div>

            {/* Action Footer */}
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
              {isCurrentConfirmed ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Reviewed ✓</span>
                  </div>
                  {currentIndex < documents.length - 1 && (
                    <button
                      onClick={handleNext}
                      className={componentPresets.button.primary}
                    >
                      Next Document
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs">
                      Please review this document carefully. Scroll through all pages before confirming.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleConfirmDocument}
                    className={`${componentPresets.button.primary} w-full py-3`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    I've Reviewed This Document
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe Hints (only show on first document if not confirmed) */}
        {currentIndex === 0 && !isCurrentConfirmed && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full"
            >
              Swipe left/right to navigate
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`flex-1 sm:flex-none ${currentIndex === 0 ? componentPresets.button.ghost + ' opacity-50 cursor-not-allowed' : componentPresets.button.secondary}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Page Indicators */}
        <div className="hidden sm:flex items-center gap-2">
          {documents.map((doc, index) => (
            <button
              key={doc.id}
              onClick={() => handleDocumentSelect(index)}
              disabled={index > confirmedCount}
              className={`
                w-3 h-3 rounded-full transition-all
                ${index === currentIndex 
                  ? 'bg-blue-600 scale-125' 
                  : confirmedDocs[doc.id]
                    ? 'bg-green-400 hover:bg-green-500'
                    : index <= confirmedCount
                      ? 'bg-gray-300 hover:bg-gray-400'
                      : 'bg-gray-200 cursor-not-allowed'
                }
              `}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === documents.length - 1 || !isCurrentConfirmed}
          className={`flex-1 sm:flex-none ${(currentIndex === documents.length - 1 || !isCurrentConfirmed) ? componentPresets.button.ghost + ' opacity-50 cursor-not-allowed' : componentPresets.button.primary}`}
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* All Confirmed Celebration */}
      {allConfirmed && (
        <motion.div
          {...animations.celebration}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white shadow-lg shadow-green-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">All Documents Reviewed! 🎉</h3>
              <p className="text-green-100 text-sm mt-1">
                You've reviewed all {documents.length} documents. Scroll down to provide your consent and signature.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 animate-pulse hidden sm:block" />
          </div>
        </motion.div>
      )}
    </div>
  )
}
