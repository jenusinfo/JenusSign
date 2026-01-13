import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  Hash,
  Clock,
  Globe,
  Award,
  Loader2,
  AlertTriangle,
  Download,
  Lock,
  Building2,
} from 'lucide-react'

// This page would be hosted at /verify/:verificationCode
// It allows anyone to verify the authenticity of a signed document

export default function DocumentVerificationPage() {
  const { verificationCode: codeFromUrl } = useParams()
  const navigate = useNavigate()
  
  const [verificationCode, setVerificationCode] = useState(codeFromUrl || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Auto-verify if code is in URL
  useEffect(() => {
    if (codeFromUrl) {
      setVerificationCode(codeFromUrl)
      handleVerify(codeFromUrl)
    }
  }, [codeFromUrl])

  const handleVerify = async (code) => {
    const codeToVerify = code || verificationCode
    if (!codeToVerify.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    // Update URL if manually entered
    if (!codeFromUrl || codeFromUrl !== codeToVerify) {
      navigate(`/verify/${codeToVerify}`, { replace: true })
    }

    try {
      // In production, this would call your API
      // const response = await fetch(`/api/verify/${codeToVerify}`)
      // const data = await response.json()

      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate verification result
      const mockResult = {
        valid: true,
        envelope: {
          referenceNumber: 'PR-2025-0001',
          title: 'Motor Insurance Proposal',
          status: 'Signed',
          signedAt: '2025-01-05T14:32:15Z',
          expiresAt: '2035-01-05T14:32:15Z',
        },
        documents: [
          { title: 'Motor Insurance Proposal', pages: 5, hash: 'a3f2b8c1...d8e9f0a1' },
          { title: 'Terms & Conditions', pages: 12, hash: 'b4c3d2e1...e9f0a1b2' },
          { title: 'Privacy Policy', pages: 3, hash: 'c5d4e3f2...f0a1b2c3' },
        ],
        signer: {
          name: 'Yiannis Kleanthous',
          idMasked: 'AB******89',
          country: 'CY',
          verificationMethod: 'OTP (SMS)',
        },
        signature: {
          timestamp: '2025-01-05T14:32:15Z',
          timestampAuthority: 'FreeTSA.org',
          certificateIssuer: 'JCC Trust Services (Cyprus)',
          algorithm: 'SHA-256 with RSA',
          ipAddress: '192.168.1.***',
        },
        tenant: {
          name: 'Hydra Insurance',
          logo: '/hydra-logo.png',
        },
        integrity: {
          documentHashValid: true,
          signatureValid: true,
          timestampValid: true,
          certificateValid: true,
          notExpired: true,
        },
      }

      setResult(mockResult)
    } catch (err) {
      setError('Unable to verify document. Please check the verification code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">JenusSign</h1>
              <p className="text-xs text-gray-500">Document Verification Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Verify Document Authenticity
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter the verification code from the signed document to verify its authenticity.
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="Enter verification code (e.g., PR20250001)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading || !verificationCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Verification Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 ${
              result.valid 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  {result.valid ? (
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {result.valid ? 'Document Verified' : 'Verification Failed'}
                  </h2>
                  <p className="text-white/80">
                    {result.valid 
                      ? 'This document is authentic and has not been modified since signing.'
                      : 'This document could not be verified. It may have been tampered with.'}
                  </p>
                </div>
              </div>
            </div>

            {result.valid && (
              <>
                {/* Tenant Branding */}
                {result.tenant && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issued by</p>
                        <p className="text-lg font-semibold text-gray-900">{result.tenant.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Details */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Envelope Details
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Reference Number</p>
                        <p className="font-mono font-semibold text-gray-900">{result.envelope.referenceNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Title</p>
                        <p className="font-semibold text-gray-900">{result.envelope.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Signed On</p>
                        <p className="font-semibold text-gray-900">{formatDate(result.envelope.signedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Valid Until</p>
                        <p className="font-semibold text-gray-900">{formatDate(result.envelope.expiresAt)}</p>
                      </div>
                    </div>

                    {/* Documents List */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Documents in Envelope</p>
                      <div className="space-y-2">
                        {result.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{doc.title}</span>
                              <span className="text-xs text-gray-500">({doc.pages} pages)</span>
                            </div>
                            <code className="text-xs text-gray-500 font-mono">{doc.hash}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signer Details */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Signer Information
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{result.signer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID (Masked)</p>
                        <p className="font-mono font-semibold text-gray-900">{result.signer.idMasked}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-semibold text-gray-900">{result.signer.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Verification Method</p>
                        <p className="font-semibold text-gray-900">{result.signer.verificationMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Details */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-600" />
                      Cryptographic Evidence
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Timestamp</p>
                        <p className="font-semibold text-gray-900">{formatDate(result.signature.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Timestamp Authority</p>
                        <p className="font-semibold text-gray-900">{result.signature.timestampAuthority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Certificate Issuer</p>
                        <p className="font-semibold text-gray-900">{result.signature.certificateIssuer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Algorithm</p>
                        <p className="font-mono font-semibold text-gray-900">{result.signature.algorithm}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrity Checks */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Integrity Verification
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(result.integrity).map(([key, value]) => (
                        <div 
                          key={key}
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            value ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          {value ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            value ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Legal Notice</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        This verification confirms that the document was signed using an Advanced Electronic Signature (AES) 
                        compliant with EU Regulation No 910/2014 (eIDAS) Article 26. This verification result is provided 
                        as-is and does not constitute legal advice. For legal matters, consult with a qualified professional.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instructions when no result */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How to Verify a Document
            </h3>
            <div className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
              <p>1. Find the verification code on the signed document's audit page</p>
              <p>2. Enter the code in the field above</p>
              <p>3. Click "Verify" to confirm the document's authenticity</p>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">
                The verification code looks like: <code className="bg-white px-2 py-1 rounded font-mono">PR20250001</code>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2025 JenusSign by Jenus Technologies. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                eIDAS Compliant
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                AES Certified
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
