import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Download,
  Mail,
  X,
  Sparkles,
  PartyPopper,
  Shield,
  FileText,
} from 'lucide-react'

import { componentPresets } from '../constants/designSystem'

/**
 * SignatureCelebrationPopup - Success celebration after signing
 * 
 * Features:
 * - Animated celebration with confetti effect
 * - Download links for signed documents
 * - Email confirmation notice
 * - Dismissible modal
 * - Properly centered and scrollable
 */
export default function SignatureCelebrationPopup({
  open,
  onClose,
  proposalTitle = 'Document',
  onViewDocument,
  signedDocumentUrl = '/samples/demo-signed-esealed.pdf',
  auditTrailUrl = '/samples/demo-audit-trail.pdf',
}) {
  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container - Centered with overflow scroll */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-lg"
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  {/* Celebration Header */}
                  <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 px-6 py-8 text-center relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            y: -20, 
                            x: Math.random() * 400 - 200,
                            opacity: 0,
                            rotate: Math.random() * 360
                          }}
                          animate={{ 
                            y: 400, 
                            opacity: [0, 1, 1, 0],
                            rotate: Math.random() * 360 + 180
                          }}
                          transition={{ 
                            duration: 3 + Math.random() * 2, 
                            repeat: Infinity,
                            delay: Math.random() * 2
                          }}
                          className="absolute text-2xl text-white/30"
                          style={{ left: `${Math.random() * 100}%` }}
                        >
                          {['✦', '✧', '○', '◇', '★'][Math.floor(Math.random() * 5)]}
                        </motion.div>
                      ))}
                    </div>

                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2, duration: 0.5 }}
                      className="relative z-10"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.4 }}
                        >
                          <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative z-10 mt-4"
                    >
                      <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <PartyPopper className="w-5 h-5" />
                        Successfully Signed!
                        <Sparkles className="w-5 h-5" />
                      </h2>
                      <p className="text-green-100 mt-1 text-sm">
                        Your documents have been legally signed
                      </p>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Document Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{proposalTitle}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Signed and sealed with eIDAS-compliant digital signature
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email Notice */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          Confirmation email sent
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          A copy of the signed documents has been sent to your registered email address.
                        </p>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="space-y-2">
                      <a
                        href={signedDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${componentPresets.button.success} w-full justify-center py-2.5`}
                      >
                        <Download className="w-4 h-4" />
                        Download Signed Document
                      </a>
                      
                      <a
                        href={auditTrailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${componentPresets.button.secondary} w-full justify-center py-2.5`}
                      >
                        <Shield className="w-4 h-4" />
                        Download Audit Trail
                      </a>
                    </div>

                    {/* Security Note */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>
                          Your signature is protected by eIDAS Article 26 compliance and 256-bit encryption.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={onClose}
                      className={`${componentPresets.button.primary} w-full justify-center py-2.5`}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
