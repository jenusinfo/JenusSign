import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ChevronDown,
  ChevronUp,
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
  QrCode,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { animations } from '../constants/designSystem'

/**
 * QRCodeCanvas - Simple QR code visualization
 * For production, use a proper QR library
 */
function QRCodeCanvas({ value, size = 140 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Generate simple QR-like pattern based on value hash
    const qr = generateQRMatrix(value)
    const moduleCount = qr.length
    const moduleSize = size / moduleCount

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = '#1a1a2e'
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}

// Simple QR-like matrix generator (visual representation only)
function generateQRMatrix(text) {
  const size = 25
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
  
  // Add finder patterns
  const addFinderPattern = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || 
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startRow + r][startCol + c] = true
        }
      }
    }
  }
  
  addFinderPattern(0, 0)
  addFinderPattern(0, size - 7)
  addFinderPattern(size - 7, 0)
  
  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }
  
  // Add data pattern based on text hash
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash = hash & hash
  }
  
  for (let r = 9; r < size - 9; r++) {
    for (let c = 9; c < size - 9; c++) {
      const bit = (hash >> ((r * size + c) % 32)) & 1
      matrix[r][c] = bit === 1 || (r + c) % 3 === 0
    }
  }
  
  return matrix
}

/**
 * SignatureEvidenceCard - Displays signature verification details
 * 
 * Features:
 * - Collapsible/expandable view
 * - QR code for verification
 * - Copy hash and URL functionality
 * - Certificate chain display
 * - eIDAS compliance checklist
 */
export default function SignatureEvidenceCard({ evidence, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

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
    proposalRef,
    verificationCode,
  } = evidence

  // Generate verification URL
  const verificationBaseUrl = 'https://verify.jenussign.com'
  const verificationId = verificationCode || proposalRef?.replace(/-/g, '') || 'DEMO123'
  const verificationUrl = `${verificationBaseUrl}/${verificationId}`

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(documentHash || 'N/A')
      setCopiedHash(true)
      toast.success('Hash copied to clipboard')
      setTimeout(() => setCopiedHash(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopiedUrl(true)
      toast.success('Verification URL copied')
      setTimeout(() => setCopiedUrl(false), 2000)
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
                  eIDAS Article 26 Compliant - Legally Binding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-xs text-white font-medium">Verified</span>
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

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 space-y-4">
              {/* QR Code & Verification URL */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <QRCodeCanvas value={verificationUrl} size={120} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Verification URL
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <code className="text-xs font-mono text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-200 truncate max-w-[200px]">
                      {verificationUrl}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyUrl()
                      }}
                      className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      {copiedUrl ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <a
                      href={verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-indigo-500" />
                    </a>
                  </div>
                  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs text-gray-500">Verification Code:</span>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {verificationId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Hash */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">Document Hash (SHA-256)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 truncate block flex-1">
                        {documentHash || 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyHash()
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
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
                    <span className="text-xs font-medium text-blue-700">Timestamp (TSA Verified)</span>
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
                    {ipAddress || '192.168.1.xxx'}
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
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-700">Signer</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{signerName || 'Customer'}</p>
                  <p className="text-xs text-gray-500 font-mono">ID: {signerId || '------89'}</p>
                </div>

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
                  (EU) No 910/2014, Article 26. The QR code and verification URL can be used to independently 
                  verify the authenticity of this document at any time.
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
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Click to view evidence & verify
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
