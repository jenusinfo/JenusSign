import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Shield,
  Download,
  Sparkles,
  Award,
  FileCheck,
  Mail,
  X,
} from 'lucide-react'

export default function SignatureCelebrationPopup({ open, onClose, proposalTitle, onViewDocument }) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-md w-full"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success Card */}
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border-2 border-green-200 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-green-200 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-200 rounded-full"
              />
            </div>

            {/* Content */}
            <div className="relative px-6 py-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                  className="relative"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Sparkle badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: [0, -10, 10, 0] }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="absolute -bottom-1 -left-2 w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Award className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Document Signed!
                </h2>
                <p className="text-gray-600">
                  {proposalTitle || 'Your document'} has been signed with an eIDAS-compliant Advanced Electronic Signature.
                </p>
              </motion.div>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-green-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">eIDAS Compliant</p>
                  <p className="text-[10px] text-gray-500">Article 26 AES</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <FileCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Legally Valid</p>
                  <p className="text-[10px] text-gray-500">EU Regulation</p>
                </div>
              </motion.div>

              {/* Email Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 justify-center text-xs text-gray-500 mb-6"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>A copy has been sent to your email</span>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewDocument || onClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-green-500/25 transition-all"
              >
                <Download className="w-5 h-5" />
                View Signed Document
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
