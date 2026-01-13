import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Eye,
  AlertCircle,
  Lock,
} from 'lucide-react'
import MobileFriendlyPdfViewer from './MobileFriendlyPdfViewer'

/**
 * DocumentCarousel - Displays envelope documents one at a time with confirmation
 * 
 * Props:
 * - documents: Array of { id, title, url, pages?, confirmed? }
 * - onAllConfirmed: Callback when all documents are confirmed
 * - onDocumentConfirmed: Callback when a single document is confirmed
 */
export default function DocumentCarousel({ 
  documents = [], 
  onAllConfirmed,
  onDocumentConfirmed,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confirmedDocs, setConfirmedDocs] = useState({})
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState({})

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
    }
  }

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleStepClick = (index) => {
    // Can only navigate to confirmed documents or the next unconfirmed one
    const canNavigate = index <= confirmedCount
    if (canNavigate) {
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
      {/* Progress Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Review Documents ({confirmedCount}/{documents.length} confirmed)
          </h3>
          {allConfirmed && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Reviewed
            </span>
          )}
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {documents.map((doc, index) => {
            const isConfirmed = confirmedDocs[doc.id]
            const isCurrent = index === currentIndex
            const canAccess = index <= confirmedCount

            return (
              <React.Fragment key={doc.id}>
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!canAccess}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                    ${isCurrent 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                      : isConfirmed 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                        : canAccess
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isConfirmed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : canAccess ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline truncate max-w-[100px]">
                    {doc.title}
                  </span>
                  <span className="sm:hidden">{index + 1}</span>
                </button>

                {index < documents.length - 1 && (
                  <div className={`flex-1 h-0.5 min-w-[20px] ${
                    confirmedDocs[doc.id] ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Current Document Viewer */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Document Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCurrentConfirmed ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {isCurrentConfirmed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{currentDoc.title}</h4>
                <p className="text-xs text-gray-500">
                  Document {currentIndex + 1} of {documents.length}
                  {currentDoc.pages && ` • ${currentDoc.pages} pages`}
                </p>
              </div>
            </div>
            
            <a
              href={currentDoc.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <Eye className="w-3.5 h-3.5" />
              Fullscreen
            </a>
          </div>
        </div>

        {/* PDF Viewer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDoc.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <MobileFriendlyPdfViewer
                  src={currentDoc.url}
                  title={currentDoc.title}
                  height="400px"
                  showDownload={true}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Confirmation Section */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          {isCurrentConfirmed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Document reviewed and confirmed</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs">
                  Please review this document carefully before confirming. You must confirm each document before signing.
                </p>
              </div>
              
              <button
                onClick={handleConfirmDocument}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                I have reviewed this document
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {documents.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                disabled={index > confirmedCount}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-600 w-4'
                    : confirmedDocs[documents[index]?.id]
                      ? 'bg-green-400 hover:bg-green-500'
                      : index <= confirmedCount
                        ? 'bg-gray-300 hover:bg-gray-400'
                        : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === documents.length - 1 || !isCurrentConfirmed}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentIndex === documents.length - 1 || !isCurrentConfirmed
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* All Confirmed Message */}
      {allConfirmed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">All documents reviewed</h4>
              <p className="text-sm text-green-700">
                You can now proceed to provide your consent and signature below.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
