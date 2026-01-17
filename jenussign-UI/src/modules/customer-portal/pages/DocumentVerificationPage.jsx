import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  FileText,
  Calendar,
  User,
  Lock,
  Hash,
  Clock,
  Globe,
  Award,
  XCircle,
  Search,
  FileSignature,
  ArrowRight,
} from 'lucide-react'

import { componentPresets, animations } from '../../shared/constants/designSystem'
import { ComplianceBadge } from '../../shared/components/ComplianceBadges'

/**
 * DocumentVerificationPage - Public verification portal
 * 
 * Allows anyone to verify a signed document's authenticity
 * by entering a verification code or scanning a QR code.
 * 
 * Accessible at: /verify/:code or /verify (with manual entry)
 */
const DocumentVerificationPage = () => {
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const codeFromUrl = code || searchParams.get('code')

  const [verificationCode, setVerificationCode] = useState(codeFromUrl || '')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Auto-verify if code in URL
  useEffect(() => {
    if (codeFromUrl) {
      handleVerify()
    }
  }, [codeFromUrl])

  const handleVerify = async (e) => {
    e?.preventDefault()
    
    if (!verificationCode.trim()) {
      setError('Please enter a verification code')
      return
    }

    setVerifying(true)
    setError(null)
    setResult(null)

    // Simulate verification API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock verification result
    // In production, this would call the backend verification API
    const mockResults = {
      'DEMO123': {
        valid: true,
        documentTitle: 'Home Insurance Proposal',
        referenceNumber: 'PR-2025-0001',
        signedAt: '2025-01-15T14:35:22Z',
        signerName: 'Yiannis Kleanthous',
        signerId: 'X1234567',
        documentHash: 'a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
        certificateIssuer: 'JCC Cyprus Trust Center',
        timestampAuthority: 'FreeTSA.org',
        eidasCompliance: true,
      },
      'PR20250001': {
        valid: true,
        documentTitle: 'Home Insurance Proposal',
        referenceNumber: 'PR-2025-0001',
        signedAt: '2025-01-15T14:35:22Z',
        signerName: 'Yiannis Kleanthous',
        signerId: 'X•••••67',
        documentHash: 'a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
        certificateIssuer: 'JCC Cyprus Trust Center',
        timestampAuthority: 'FreeTSA.org',
        eidasCompliance: true,
      },
    }

    const normalizedCode = verificationCode.replace(/-/g, '').toUpperCase()
    const foundResult = mockResults[normalizedCode] || mockResults[verificationCode]

    if (foundResult) {
      setResult(foundResult)
    } else {
      setResult({ valid: false })
    }

    setVerifying(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileSignature className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">JenusSign</h1>
                <p className="text-xs text-gray-500">Document Verification Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ComplianceBadge type="eidas" size="sm" />
              <ComplianceBadge type="secure" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div {...animations.cardEnter}>
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Document Authenticity
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter the verification code from your signed document to confirm its authenticity and integrity.
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="p-6">
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                        placeholder="Enter code (e.g., DEMO123)"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 font-mono text-lg tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={verifying}
                      className={componentPresets.button.primary + ' px-6'}
                    >
                      {verifying ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                      <span className="hidden sm:inline ml-2">Verify</span>
                    </button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                {/* Demo hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700 text-center">
                    <strong>Demo:</strong> Try codes <span className="font-mono">DEMO123</span> or <span className="font-mono">PR20250001</span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Verification Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl shadow-lg border overflow-hidden ${
                result.valid 
                  ? 'bg-white border-green-200' 
                  : 'bg-white border-red-200'
              }`}
            >
              {/* Result Header */}
              <div className={`px-6 py-5 ${
                result.valid 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {result.valid ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">
                      {result.valid ? 'Document Verified' : 'Verification Failed'}
                    </h2>
                    <p className="text-sm opacity-90">
                      {result.valid 
                        ? 'This document is authentic and has not been altered.' 
                        : 'No matching document found for this verification code.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Result Details */}
              {result.valid && (
                <div className="p-6 space-y-4">
                  {/* Document Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Document</span>
                      </div>
                      <p className="font-semibold text-gray-900">{result.documentTitle}</p>
                      <p className="text-sm text-gray-500">Ref: {result.referenceNumber}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Signed At</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatDate(result.signedAt)}</p>
                      <p className="text-sm text-gray-500">TSA: {result.timestampAuthority}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Signer</span>
                      </div>
                      <p className="font-semibold text-gray-900">{result.signerName}</p>
                      <p className="text-sm text-gray-500 font-mono">ID: {result.signerId}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Certificate</span>
                      </div>
                      <p className="font-semibold text-gray-900">{result.certificateIssuer}</p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        eIDAS Compliant
                      </p>
                    </div>
                  </div>

                  {/* Document Hash */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">Document Hash (SHA-256)</span>
                    </div>
                    <code className="text-xs font-mono text-purple-900 break-all">
                      {result.documentHash}
                    </code>
                  </div>

                  {/* eIDAS Compliance */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">eIDAS Article 26 Compliance</p>
                        <p className="text-sm text-green-700 mt-1">
                          This document was signed with an Advanced Electronic Signature (AES) that meets all requirements 
                          of the eIDAS Regulation (EU) No 910/2014. The signature is legally binding across all EU member states.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invalid Result */}
              {!result.valid && (
                <div className="p-6">
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Document Not Found</p>
                        <p className="text-sm text-red-700 mt-1">
                          The verification code you entered does not match any signed document in our system. 
                          Please check the code and try again, or contact the document sender for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Cryptographic Verification',
                description: 'Each document has a unique cryptographic hash that ensures integrity.',
              },
              {
                icon: Lock,
                title: 'Tamper-Evident',
                description: 'Any modification to the document will invalidate the signature.',
              },
              {
                icon: Award,
                title: 'EU Recognized',
                description: 'eIDAS compliant signatures are legally binding across the EU.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                {...animations.listItem(index)}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>© 2025 JenusSign</span>
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-green-600" />
              <span>Secured by 256-bit encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DocumentVerificationPage
