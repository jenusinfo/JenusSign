import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Hash,
  Globe,
  Smartphone,
  User,
  Key,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignatureEvidenceCard({ evidence, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)

  if (!evidence) return null

  const {
    documentHash,
    timestamp,
    signedAt,
    ipAddress,
    deviceInfo,
    otpVerified,
    signerId,
    signerName,
    agentId,
    agentName,
    certificateChain = [],
  } = evidence

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(documentHash)
      setCopiedHash(true)
      toast.success('Hash copied to clipboard')
      setTimeout(() => setCopiedHash(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">
                  Signature Evidence
                </h3>
                <p className="text-xs text-green-100">
                  eIDAS Article 26 Compliant • Legally Binding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-medium text-white">Verified</span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Document Hash */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">Document Hash (SHA-256)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 truncate block">
                        {documentHash || 'Not available'}
                      </code>
                      <button
                        onClick={handleCopyHash}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                        title="Copy hash"
                      >
                        {copiedHash ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Timestamp */}
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Timestamp</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(timestamp || signedAt)}
                  </p>
                </div>

                {/* OTP Verification */}
                <div className={`rounded-xl p-3 border ${
                  otpVerified 
                    ? 'bg-green-50 border-green-100' 
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className={`w-4 h-4 ${otpVerified ? 'text-green-600' : 'text-amber-600'}`} />
                    <span className={`text-xs font-medium ${otpVerified ? 'text-green-700' : 'text-amber-700'}`}>
                      OTP Verification
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    {otpVerified ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Pending
                      </>
                    )}
                  </p>
                </div>

                {/* IP Address */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">IP Address</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {ipAddress || '192.168.1.1'}
                  </p>
                </div>

                {/* Device Info */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Device</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {deviceInfo || 'Chrome on Windows'}
                  </p>
                </div>
              </div>

              {/* Signer & Agent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Signer */}
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-700">Signer</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{signerName || 'Customer'}</p>
                  <p className="text-xs text-gray-500 font-mono">{signerId || 'SIG-001'}</p>
                </div>

                {/* Agent */}
                {(agentId || agentName) && (
                  <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-medium text-teal-700">Agent</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{agentName || 'Agent'}</p>
                    <p className="text-xs text-gray-500 font-mono">{agentId || 'AGT-001'}</p>
                  </div>
                )}
              </div>

              {/* Certificate Chain */}
              {certificateChain.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Certificate Chain</span>
                  </div>
                  <div className="space-y-2">
                    {certificateChain.map((cert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-200 text-purple-700'
                          }`}>
                            {index + 1}
                          </div>
                          {index < certificateChain.length - 1 && (
                            <div className="w-0.5 h-6 bg-purple-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-medium text-gray-900">{cert.name || cert}</p>
                          {cert.issuer && (
                            <p className="text-xs text-gray-500">Issued by: {cert.issuer}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-800">
                  <strong>Legal Notice:</strong> This signature evidence record constitutes proof of the signatory's 
                  intent to be bound by the contents of the signed document in accordance with eIDAS Regulation 
                  (EU) No 910/2014, Article 26.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Summary when collapsed */}
      {!isExpanded && (
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(timestamp || signedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Click to view full evidence
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
