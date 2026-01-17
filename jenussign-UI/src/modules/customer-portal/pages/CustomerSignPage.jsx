import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { envelopesApi } from '../../../api/envelopesApi'
import DocumentCarousel from '../../../shared/components/DocumentCarousel'
import SignatureCapture from '../../../shared/components/SignatureCapture'
import SignatureEvidenceCard from '../../../shared/components/SignatureEvidenceCard'
import SignatureCelebrationPopup from '../../../shared/components/SignatureCelebrationPopup'
import Loading from '../../../shared/components/Loading'
import StatusBadge from '../../../shared/components/StatusBadge'
import { ComplianceBadge } from '../../../shared/components/ComplianceBadges'
import { 
  ENVELOPE_STATUS,
  componentPresets, 
  animations 
} from '../../../shared/constants/designSystem'

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Shield,
  Mail,
  Download,
  User,
  AlertTriangle,
  Package,
  FileSignature,
  Lock,
} from 'lucide-react'

/**
 * CustomerSignPage - Main document signing workflow
 * 
 * Supports:
 * - Token-based access via email link (/customer/sign/:envelopeId)
 * - Verification check before allowing signing
 * - Document carousel for multi-document envelopes
 * - Consent checkbox collection
 * - Three signature capture methods (draw/type/upload)
 * - OTP verification for signing
 * - Success celebration and evidence display
 */
const CustomerSignPage = () => {
  const { token } = useParams()  // Token from URL path
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Verification state
  const [isVerified, setIsVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState(null)
  const [checkingVerification, setCheckingVerification] = useState(true)

  // Envelope state
  const [envelope, setEnvelope] = useState(null)
  const [envelopeLoading, setEnvelopeLoading] = useState(true)
  const [linkError, setLinkError] = useState(null)

  // Document carousel state
  const [allDocsConfirmed, setAllDocsConfirmed] = useState(false)
  const [confirmedDocIds, setConfirmedDocIds] = useState([])

  // Consent state
  const [checkedConsents, setCheckedConsents] = useState({})

  // Signature state
  const [signatureData, setSignatureData] = useState({
    hasSignature: false,
    dataUrl: null,
    method: null,
  })

  // OTP & completion state
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [signingCompleted, setSigningCompleted] = useState(false)

  // Result state
  const [signedPackage, setSignedPackage] = useState(null)
  const [evidence, setEvidence] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Refs
  const otpRef = useRef(null)

  // --------- Check verification status first ----------
  useEffect(() => {
    const checkVerification = () => {
      // Check if user has completed verification for this token
      const verified = sessionStorage.getItem(`verified_${token}`)
      const method = sessionStorage.getItem(`verification_method_${token}`)
      
      if (verified === 'true') {
        setIsVerified(true)
        setVerificationMethod(method)
        setCheckingVerification(false)
      } else {
        // Not verified - redirect to verification page
        setCheckingVerification(false)
        navigate(`/customer/verify/${token}`, { replace: true })
      }
    }

    if (token) {
      checkVerification()
    }
  }, [token, navigate])

  // --------- Load envelope after verification confirmed ----------
  useEffect(() => {
    const loadEnvelope = async () => {
      // Don't load until verification is confirmed
      if (!isVerified || checkingVerification) return

      try {
        setEnvelopeLoading(true)
        
        if (token) {
          // Load envelope by token (user is already verified)
          const data = await envelopesApi.getEnvelopeByToken(token)
          setEnvelope(data)
          
          // Check if already completed
          if (data.status === ENVELOPE_STATUS.COMPLETED || data.status === ENVELOPE_STATUS.SIGNED) {
            setSigningCompleted(true)
            setEvidence(data.signatureEvidence)
          }
        } else {
          throw new Error('No token provided')
        }
      } catch (err) {
        console.error('Failed to load envelope', err)
        setLinkError(err.message || 'Invalid or expired signing link.')
      } finally {
        setEnvelopeLoading(false)
      }
    }

    loadEnvelope()
  }, [token, isVerified, checkingVerification])

  // --------- Initialize consent checkboxes ----------
  useEffect(() => {
    if (envelope?.consents) {
      const init = {}
      envelope.consents.forEach(c => {
        init[c.id] = !!c.response
      })
      setCheckedConsents(init)
    }
  }, [envelope])

  // --------- Scroll to OTP when shown ----------
  useEffect(() => {
    if (showOtp && otpRef.current) {
      otpRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [showOtp])

  // --------- Handlers ----------
  
  const handleDocumentConfirmed = (docId, index) => {
    setConfirmedDocIds(prev => [...prev, docId])
    
    // Update envelope document status
    if (envelope) {
      envelopesApi.confirmDocument(envelope.id, docId)
    }
  }

  const handleAllDocsConfirmed = () => {
    setAllDocsConfirmed(true)
  }

  const handleConsentChange = (consentId, checked) => {
    setCheckedConsents(prev => ({ ...prev, [consentId]: checked }))
    
    // Persist consent
    if (envelope) {
      envelopesApi.saveConsent(envelope.id, consentId, checked)
    }
  }

  const handleSignatureChange = (data) => {
    setSignatureData(data)
  }

  // Check if all required consents are checked
  const requiredConsents = envelope?.consents?.filter(c => c.required) || []
  const allRequiredConsentsChecked = requiredConsents.every(c => checkedConsents[c.id])

  // Can proceed to signing?
  const canClickSign = allDocsConfirmed && allRequiredConsentsChecked && signatureData.hasSignature

  // Start signing (show OTP)
  const handleStartSigning = async () => {
    if (!canClickSign) return
    
    try {
      // Send OTP
      await envelopesApi.sendOtp(envelope.id, 'EMAIL')
      toast.success('Verification code sent to your email')
      setShowOtp(true)
    } catch (error) {
      toast.error('Failed to send verification code')
    }
  }

  // Complete signing mutation
  const completeSigningMutation = useMutation({
    mutationFn: async () => {
      // Verify OTP first
      await envelopesApi.verifyOtp(envelope.id, otp)
      
      // Complete signing
      return envelopesApi.completeSigning(envelope.id, {
        signatureDataUrl: signatureData.dataUrl,
        method: signatureData.method,
        consents: checkedConsents,
      })
    },
    onSuccess: (result) => {
      setSigningCompleted(true)
      setSignedPackage(result)
      setEvidence(result.evidence)
      setShowCelebration(true)
      
      // Update envelope in cache
      queryClient.invalidateQueries(['customer-envelopes'])
      
      toast.success('Documents signed successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Signing failed. Please try again.')
    },
  })

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }
    completeSigningMutation.mutate()
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // ========== RENDER: Checking Verification ==========
  if (checkingVerification) {
    return <Loading fullScreen message="Checking verification status..." />
  }

  // ========== RENDER: Not Verified (should redirect, but just in case) ==========
  if (!isVerified) {
    return <Loading fullScreen message="Redirecting to verification..." />
  }

  // ========== RENDER: Loading Envelope ==========
  if (envelopeLoading) {
    return <Loading fullScreen message="Loading your documents..." />
  }

  // ========== RENDER: Link Error ==========
  if (linkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div 
          {...animations.cardEnter}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-600 mb-6">{linkError}</p>
          <button
            onClick={() => navigate('/customer/login')}
            className={componentPresets.button.primary}
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    )
  }

  // ========== RENDER: No Envelope ==========
  if (!envelope) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div 
          {...animations.cardEnter}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No Document Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the document you're looking for. The link may have expired or been used already.
          </p>
          <button
            onClick={() => navigate('/customer/login')}
            className={componentPresets.button.primary}
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    )
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">{envelope.title}</h1>
                <p className="text-xs text-gray-500">Ref: {envelope.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Verification Badge */}
              {isVerified && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Verified</span>
                </div>
              )}
              <StatusBadge status={envelope.status} />
              <ComplianceBadge type="eidas" size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {signingCompleted ? (
          // ========== COMPLETED STATE ==========
          <motion.div
            {...animations.cardEnter}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Documents Signed Successfully!</h2>
              <p className="text-green-100">
                Your signature has been applied to all documents in this envelope.
              </p>
            </div>

            {/* Document Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSignature className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{envelope.title}</h3>
                  <p className="text-sm text-gray-500">Ref: {envelope.referenceNumber}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {envelope.customer?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Signed {formatDate(new Date())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Downloads */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Your Documents</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href={signedPackage?.signedDocumentUrl || '/samples/demo-signed-esealed.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className={componentPresets.button.success + ' w-full justify-center'}
                >
                  <Download className="w-4 h-4" />
                  Download Signed Document
                </a>
                <a
                  href={signedPackage?.auditTrailUrl || '/samples/demo-audit-trail.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  className={componentPresets.button.secondary + ' w-full justify-center'}
                >
                  <FileText className="w-4 h-4" />
                  Download Audit Trail
                </a>
              </div>
            </div>

            {/* Signature Evidence */}
            {evidence && (
              <SignatureEvidenceCard evidence={evidence} />
            )}
          </motion.div>
        ) : (
          // ========== SIGNING WORKFLOW ==========
          <motion.div
            {...animations.cardEnter}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Left column: Documents & Consents */}
            <div className="space-y-6">
              {/* Document Carousel */}
              <DocumentCarousel
                documents={envelope.documents || []}
                onDocumentConfirmed={handleDocumentConfirmed}
                onAllConfirmed={handleAllDocsConfirmed}
                envelopeTitle={envelope.title}
              />

              {/* Consents Section */}
              {envelope.consents && envelope.consents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Required Consents
                  </h3>
                  
                  <div className="space-y-3">
                    {envelope.consents.map((consent) => (
                      <label
                        key={consent.id}
                        className={`
                          flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                          ${checkedConsents[consent.id] 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={checkedConsents[consent.id] || false}
                          onChange={(e) => handleConsentChange(consent.id, e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">{consent.text}</span>
                          {consent.required && (
                            <span className="ml-1 text-xs text-red-500">*</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {!allRequiredConsentsChecked && (
                    <p className="mt-3 text-xs text-amber-600">
                      Please accept all required consents to continue.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right column: Signature & OTP */}
            <div className="space-y-6">
              {/* Electronic Signature card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-blue-600" />
                  Electronic Signature
                </h3>

                <SignatureCapture
                  onSignatureChange={handleSignatureChange}
                  defaultName={envelope.customer?.name || ''}
                />

                {/* Sign button */}
                <button
                  type="button"
                  disabled={!canClickSign}
                  onClick={handleStartSigning}
                  className={`
                    mt-6 w-full py-3
                    ${canClickSign 
                      ? componentPresets.button.success 
                      : 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed'}
                  `}
                >
                  <Shield className="w-5 h-5" />
                  <span>Sign All Documents ({envelope.documents?.length || 0})</span>
                </button>

                {!canClickSign && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {!allDocsConfirmed && 'Review all documents • '}
                    {!allRequiredConsentsChecked && 'Accept all consents • '}
                    {!signatureData.hasSignature && 'Add your signature'}
                  </p>
                )}
              </div>

              {/* OTP Verification */}
              {showOtp && !signingCompleted && (
                <motion.div
                  ref={otpRef}
                  {...animations.cardEnter}
                  className="bg-blue-50 rounded-2xl border border-blue-200 p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Enter Verification Code</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        We've sent a 6-digit code to your email.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.3em] text-center font-mono text-xl bg-white"
                      placeholder="------"
                    />
                    
                    {/* Demo hint */}
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                      <p className="text-xs text-amber-700 text-center">
                        <strong>Demo:</strong> Use code <span className="font-mono font-bold">123456</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={completeSigningMutation.isPending || otp.length !== 6}
                      className={`${componentPresets.button.primary} w-full py-3`}
                    >
                      {completeSigningMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing documents...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Confirm & Sign All Documents
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Security Notice */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">eIDAS Compliant Signing</p>
                    <p>
                      Your signature will be cryptographically bound to the documents with a 
                      qualified timestamp, creating a legally binding Advanced Electronic Signature 
                      under EU Regulation 910/2014.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Celebration Popup */}
      <SignatureCelebrationPopup
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        proposalTitle={envelope.title}
        onViewDocument={() => {
          setShowCelebration(false)
        }}
      />
    </div>
  )
}

export default CustomerSignPage
