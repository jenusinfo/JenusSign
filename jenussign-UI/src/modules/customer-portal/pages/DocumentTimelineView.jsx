import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Eye,
  AlertCircle,
  Lock,
  Package,
  Sparkles,
  ArrowDown,
} from 'lucide-react'
import MobileFriendlyPdfViewer from './MobileFriendlyPdfViewer'

/**
 * DocumentTimelineView - Vertical timeline document review
 * 
 * All documents visible in a single scrollable view with expand/collapse.
 * Great for seeing the full picture of what needs to be signed.
 * 
 * Props:
 * - documents: Array of { id, title, url, pages?, confirmed? }
 * - onAllConfirmed: Callback when all documents are confirmed
 * - onDocumentConfirmed: Callback when a single document is confirmed
 */
export default function DocumentTimelineView({ 
  documents = [], 
  onAllConfirmed,
  onDocumentConfirmed,
}) {
  const [expandedDoc, setExpandedDoc] = useState(documents[0]?.id || null)
  const [confirmedDocs, setConfirmedDocs] = useState({})
  const docRefs = useRef({})

  const allConfirmed = documents.every(doc => confirmedDocs[doc.id])
  const confirmedCount = Object.values(confirmedDocs).filter(Boolean).length

  // Find first unconfirmed document index
  const firstUnconfirmedIndex = documents.findIndex(doc => !confirmedDocs[doc.id])

  const handleConfirmDocument = (docId, docIndex) => {
    const newConfirmed = { ...confirmedDocs, [docId]: true }
    setConfirmedDocs(newConfirmed)
    
    if (onDocumentConfirmed) {
      onDocumentConfirmed(docId, docIndex)
    }

    // Check if all documents are now confirmed
    const allNowConfirmed = documents.every(doc => newConfirmed[doc.id])
    if (allNowConfirmed && onAllConfirmed) {
      onAllConfirmed()
    } else {
      // Auto-expand and scroll to next unconfirmed document
      const nextUnconfirmed = documents.find((doc, i) => i > docIndex && !newConfirmed[doc.id])
      if (nextUnconfirmed) {
        setExpandedDoc(nextUnconfirmed.id)
        setTimeout(() => {
          docRefs.current[nextUnconfirmed.id]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }, 300)
      }
    }
  }

  const handleToggleExpand = (docId, docIndex) => {
    // Can only expand if previous docs are confirmed
    const canExpand = docIndex <= confirmedCount
    if (!canExpand) return

    setExpandedDoc(expandedDoc === docId ? null : docId)
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
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-xl">Document Package</h2>
            <p className="text-blue-100 text-sm mt-1">
              Review and confirm each document before signing
            </p>
            
            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Your Progress</span>
                <span className="font-semibold">{confirmedCount}/{documents.length} Complete</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(confirmedCount / documents.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 sm:left-6" />
        
        <div className="space-y-4">
          {documents.map((doc, index) => {
            const isConfirmed = confirmedDocs[doc.id]
            const isExpanded = expandedDoc === doc.id
            const canAccess = index <= confirmedCount
            const isNext = index === firstUnconfirmedIndex

            return (
              <div 
                key={doc.id}
                ref={el => docRefs.current[doc.id] = el}
                className="relative"
              >
                {/* Timeline Node */}
                <div className={`
                  absolute left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center z-10
                  transition-all duration-300
                  ${isConfirmed 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                    : isNext
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                      : canAccess
                        ? 'bg-white border-2 border-gray-300 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {isConfirmed ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : canAccess ? (
                    <span className="font-bold text-sm sm:text-base">{index + 1}</span>
                  ) : (
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Document Card */}
                <div className={`
                  ml-14 sm:ml-16 rounded-2xl border transition-all duration-300 overflow-hidden
                  ${isExpanded 
                    ? 'bg-white border-blue-200 shadow-lg shadow-blue-500/10' 
                    : isConfirmed
                      ? 'bg-green-50 border-green-200'
                      : canAccess
                        ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}>
                  {/* Card Header - Always visible */}
                  <button
                    onClick={() => handleToggleExpand(doc.id, index)}
                    disabled={!canAccess}
                    className={`
                      w-full px-4 py-4 flex items-center justify-between gap-3 text-left
                      ${canAccess ? '' : 'cursor-not-allowed'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold truncate ${
                          isConfirmed ? 'text-green-800' : 'text-gray-900'
                        }`}>
                          {doc.title}
                        </h3>
                        {isConfirmed && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Reviewed
                          </span>
                        )}
                        {isNext && !isConfirmed && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
                            Review Now
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {doc.pages ? `${doc.pages} pages` : 'Document'} • {isConfirmed ? 'Confirmed' : 'Pending review'}
                      </p>
                    </div>

                    {canAccess && (
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-transform
                        ${isExpanded ? 'bg-blue-100 rotate-180' : 'bg-gray-100'}
                      `}>
                        <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                    )}
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 border-t border-gray-100">
                          {/* PDF Viewer */}
                          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <MobileFriendlyPdfViewer
                              src={doc.url}
                              title={doc.title}
                              height="400px"
                              showDownload={true}
                            />
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              Open Fullscreen
                            </a>

                            {!isConfirmed && (
                              <button
                                onClick={() => handleConfirmDocument(doc.id, index)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                                I've Reviewed This Document
                              </button>
                            )}

                            {isConfirmed && (
                              <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-100 text-green-700">
                                <CheckCircle2 className="w-5 h-5" />
                                Document Reviewed
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connector arrow for next step */}
                {index < documents.length - 1 && !isExpanded && !confirmedDocs[doc.id] && index === firstUnconfirmedIndex && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-14 sm:ml-16 mt-2 flex items-center gap-2 text-blue-600"
                  >
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                    <span className="text-xs font-medium">Click to expand and review</span>
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* All Confirmed Message */}
      {allConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-5 text-white shadow-lg shadow-green-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">All Documents Reviewed! 🎉</h3>
              <p className="text-green-100 text-sm mt-1">
                Great job! You can now proceed to provide your consent and electronic signature below.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
