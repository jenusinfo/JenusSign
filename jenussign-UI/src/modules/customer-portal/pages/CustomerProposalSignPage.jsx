import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import SignatureEvidenceCard from './SignatureEvidenceCard'
import SignatureCelebrationPopup from './SignatureCelebrationPopup'
import MobileFriendlyPdfViewer from './MobileFriendlyPdfViewer'
import DocumentCarousel from './DocumentCarouselV2'
import { envelopesApi } from '../../../api/envelopeMockApi'
import SignatureCapture from './SignatureCapture'

import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Shield,
  Upload,
  Mail,
  Download,
  User,
  Eye,
  AlertTriangle,
  Package,
} from 'lucide-react'
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

const CustomerProposalSignPage = () => {
  // We support BOTH:
  // - /customer/proposals/:resolvedProposalId/sign (legacy)
  // - /customer/sign/:token (email link)
  const { proposalId: routeProposalId, token } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Envelope state (replaces proposal)
  const [envelope, setEnvelope] = useState(null)
  const [envelopeLoading, setEnvelopeLoading] = useState(true)
  const [linkError, setLinkError] = useState(null)

  // Document carousel state
  const [allDocsConfirmed, setAllDocsConfirmed] = useState(false)
  const [confirmedDocIds, setConfirmedDocIds] = useState([])

  // Consent state
  const [checkedConsents, setCheckedConsents] = useState({})

  const [signatureData, setSignatureData] = useState({
    hasSignature: false,
    dataUrl: null,
    method: null,
  })

  // Signature state
  const [activeSigTab, setActiveSigTab] = useState('draw') // 'draw' | 'upload'
  const [signatureCaptured, setSignatureCaptured] = useState(false)
  const [uploadedSignatureFile, setUploadedSignatureFile] = useState(null)

  // OTP & completion state
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [signingCompleted, setSigningCompleted] = useState(false)

  // Result state
  const [signedPackage, setSignedPackage] = useState(null)
  const [evidence, setEvidence] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Verification state
  const [isVerified, setIsVerified] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(true)

  // Refs
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const otpRef = useRef(null)

  console.log('[CustomerProposalSignPage] routeProposalId:', routeProposalId, 'token:', token)

  // --------- Load envelope by token or proposalId ----------
  useEffect(() => {
    const loadEnvelope = async () => {
      try {
        setEnvelopeLoading(true)
        
        if (token) {
          // Load via token (email link)
          const data = await envelopesApi.getEnvelopeByToken(token)
          setEnvelope(data)
        } else if (routeProposalId) {
          // Legacy: load by proposal ID - map to envelope
          // The proposalId maps to tokens: prop-001 -> demo1, prop-002 -> demo2, etc.
          const tokenMap = {
            'prop-001': 'demo1',
            'prop-002': 'demo2', 
            'prop-003': 'demo3',
            'prop-005': 'business1',
          }
          const mappedToken = tokenMap[routeProposalId]
          
          if (mappedToken) {
            const data = await envelopesApi.getEnvelopeByToken(mappedToken)
            setEnvelope(data)
          } else {
            // Try direct envelope lookup
            try {
              const data = await envelopesApi.getEnvelope(routeProposalId)
              setEnvelope(data)
            } catch {
              throw new Error('Proposal not found')
            }
          }
        }
      } catch (err) {
        console.error('Failed to load envelope', err)
        setLinkError(err.message || 'Invalid or expired signing link.')
      } finally {
        setEnvelopeLoading(false)
      }
    }

    loadEnvelope()
  }, [routeProposalId, token])

  // --------- Check verification status ----------
  useEffect(() => {
    if (!envelope && !routeProposalId) return

    // Try multiple possible verification keys for backward compatibility
    // The verification page stores with proposalId (e.g., 'prop-001')
    const keysToCheck = [
      routeProposalId && `verified_${routeProposalId}`,           // e.g., verified_prop-001
      envelope?.id && `verified_${envelope.id}`,                  // e.g., verified_env-001
      envelope?.session?.proposalId && `verified_${envelope.session.proposalId}`, // from session
      token && `verified_token_${token}`,                         // token-based
    ].filter(Boolean)

    for (const key of keysToCheck) {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        try {
          const verification = JSON.parse(stored)
          const thirtyMinutes = 30 * 60 * 1000
          if (verification.idVerified && (Date.now() - verification.timestamp) < thirtyMinutes) {
            console.log('[CustomerProposalSignPage] User verified via sessionStorage key:', key)
            setIsVerified(true)
            setCheckingVerification(false)
            return
          }
        } catch (e) {
          console.error('Error parsing verification state', e)
        }
      }
    }

    // If we have a token, user came from direct link route which goes through verification
    if (token) {
      console.log('[CustomerProposalSignPage] User has token - assuming verified')
      setIsVerified(true)
      setCheckingVerification(false)
      return
    }

    // Not verified
    setIsVerified(false)
    setCheckingVerification(false)
  }, [envelope, token, routeProposalId])

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

  // --------- Canvas helpers ----------
  const getPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handleStartDraw = (e) => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    isDrawingRef.current = true
  }

  const handleDraw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const handleEndDraw = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    setSignatureCaptured(true)
  }

  // Touch event handling for mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0] || e.changedTouches[0]
      if (!touch) return { x: 0, y: 0 }

      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    const handleTouchStart = (e) => {
      e.preventDefault()
      const ctx = canvas.getContext('2d')
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      isDrawingRef.current = true
    }

    const handleTouchMove = (e) => {
      e.preventDefault()
      if (!isDrawingRef.current) return
      const ctx = canvas.getContext('2d')
      const { x, y } = getPos(e)
      ctx.lineTo(x, y)
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    const handleTouchEnd = (e) => {
      e.preventDefault()
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      setSignatureCaptured(true)
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [activeSigTab, signingCompleted, envelopeLoading, isVerified, allDocsConfirmed])

  const handleClearCanvas = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setSignatureCaptured(false)
  }

  // --------- Upload signature ----------
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadedSignatureFile(file)
    setSignatureCaptured(true)
  }

  // --------- Document confirmation handler ----------
  const handleDocumentConfirmed = async (docId, index) => {
    setConfirmedDocIds(prev => [...prev, docId])
    
    // Track in API
    if (envelope) {
      try {
        await envelopesApi.confirmDocumentViewed(envelope.id, docId)
      } catch (err) {
        console.error('Failed to track document confirmation', err)
      }
    }
  }

  const handleAllDocsConfirmed = () => {
    setAllDocsConfirmed(true)
  }

  // --------- Mutation: complete signing ----------
  const completeSigningMutation = useMutation({
    mutationFn: (otpCode) => envelopesApi.completeSigning(envelope.id, otpCode),
    onSuccess: async (result) => {
      setSignedPackage({
        signedPdfUrl: result.signedDocumentUrl,
        auditPdfUrl: result.auditTrailUrl,
      })

      // Update envelope in local state
      setEnvelope(prev => ({
        ...prev,
        status: 'SIGNED',
        signedAt: result.envelope.signedAt,
      }))

      // Set evidence from result
      setEvidence(result.evidence)

      setSigningCompleted(true)
      setShowCelebration(true)
    },
    onError: (err) => {
      console.error('Error completing signing', err)
      alert(err.message || 'Error completing signing')
    },
  })

  // --------- OTP handling ----------
  const handleStartSigning = async () => {
    // Save signature to envelope first
    if (envelope) {
      try {
        const signatureData = {
          type: activeSigTab === 'draw' ? 'Drawn' : 'Uploaded',
          imageBase64: activeSigTab === 'draw' ? canvasRef.current?.toDataURL() : null,
        }
        await envelopesApi.saveSignature(envelope.id, signatureData)
      } catch (err) {
        console.error('Failed to save signature', err)
      }
    }
    
    // Request OTP
    try {
      await envelopesApi.requestSigningOtp(envelope.id)
    } catch (err) {
      console.error('Failed to request OTP', err)
    }
    
    setShowOtp(true)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()

    if (otp !== '123456') {
      alert('Invalid OTP. Use 123456 for the demo.')
      return
    }
    completeSigningMutation.mutate(otp)
  }

  const handleBackToDashboard = () => {
    navigate('/customer/dashboard')
  }

  // --------- Error state ----------
  if (linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Signing link problem</h1>
          <p className="text-gray-600 mb-4">{linkError}</p>
          <button
            onClick={() => navigate('/customer/login')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go to customer login
          </button>
        </div>
      </div>
    )
  }

  // --------- Loading states ----------
  if (checkingVerification || envelopeLoading) {
    return <Loading fullScreen message="Loading..." />
  }

  if (!envelope) {
    return (
      <div className="p-8 text-center">
        <p className="font-semibold mb-2">Envelope not found</p>
        <p className="text-sm text-gray-500">
          Unable to load the signing envelope.
        </p>
      </div>
    )
  }

  // --------- Verification Required Screen ----------
  if (!isVerified && !signingCompleted) {
    const tokenMap = {
      'env-001': 'demo1',
      'env-002': 'demo2',
      'env-003': 'demo3',
    }
    const verificationToken = token || tokenMap[envelope.id] || 'demo1'

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Identity Verification Required
          </h1>
          <p className="text-gray-600 mb-2">
            For your security and to comply with <strong>eIDAS regulations</strong>, we need to verify your identity before you can sign.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This ensures that only you can sign documents intended for you.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Documents to sign:</p>
            <p className="font-medium text-gray-900">{envelope.title}</p>
            <p className="text-sm text-gray-600">{envelope.referenceNumber}</p>
            <p className="text-xs text-gray-500 mt-2">
              {envelope.documents?.length || 0} document(s) in this envelope
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/customer/sign/${verificationToken}`)}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Verify My Identity
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --------- PDF URLs ----------
  const signedPdfUrl = signedPackage?.signedPdfUrl || envelope.signedDocumentUrl || '/samples/demo-home-signed-esealed.pdf'
  const auditPdfUrl = signedPackage?.auditPdfUrl || envelope.auditTrailUrl || '/samples/home-insurance-audit-trail-PR-2025-0001.pdf'

  // --------- Signing Completed View ----------
  if (signingCompleted) {
    return (
      <>
        <SignatureCelebrationPopup
          open={showCelebration}
          onClose={() => setShowCelebration(false)}
        />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* LEFT: Signed & eSealed Document card */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Final Signed &amp; eSealed Documents
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      All documents in this envelope have been signed and sealed.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={signedPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Signed PDF</span>
                    </a>

                    <a
                      href={auditPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Audit Trail PDF</span>
                    </a>
                  </div>
                </div>

                {/* Success banner */}
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      All Documents Successfully Signed &amp; eSealed
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your signature has been applied to all {envelope.documents?.length || 1} document(s), 
                      an electronic seal has been added, and the audit trail is attached.
                    </p>
                  </div>
                </div>

                {/* Documents list */}
                <div className="flex-1 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    Documents in This Envelope
                  </h3>
                  <div className="space-y-2">
                    {envelope.documents?.map((doc, index) => (
                      <div 
                        key={doc.id}
                        className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.pages} pages</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Signed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-gray-500">
                  Signed on: {formatDate(envelope.signedAt || new Date().toISOString())}
                </p>
              </div>

              {/* RIGHT: Signature Evidence card */}
              <SignatureEvidenceCard 
                evidence={evidence} 
                auditPdfUrl={auditPdfUrl}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  // --------- Computed values for signing form ----------
  const requiredConsents = envelope.consents?.filter(c => c.isRequired) || []
  const allRequiredConsentsChecked = requiredConsents.every(c => checkedConsents[c.id])

  const canClickSign =
    !signingCompleted &&
    (envelope.status === 'PENDING' || envelope.status === 'DRAFT') &&
    allDocsConfirmed &&
    allRequiredConsentsChecked &&
    signatureCaptured

  // --------- Main Signing View ----------
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                {envelope.title}
              </h1>
              <p className="text-gray-600 text-sm truncate">
                {envelope.referenceNumber} • {envelope.documents?.length || 0} document(s)
              </p>
            </div>
            <StatusBadge status={signingCompleted ? 'Signed' : envelope.status} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          
          {/* Step 1: Document Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DocumentCarousel
              documents={envelope.documents?.map(doc => ({
                id: doc.id,
                title: doc.title,
                url: doc.url,
                pages: doc.pages,
              })) || []}
              onAllConfirmed={handleAllDocsConfirmed}
              onDocumentConfirmed={handleDocumentConfirmed}
            />
          </motion.div>

          {/* Step 2: Consent & Signature (only shown after all docs confirmed) */}
          {allDocsConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Left column: Properties & Consents */}
              <div className="space-y-4">
                {/* Document Properties */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Envelope Details</h2>

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-600 flex-shrink-0">Reference:</dt>
                      <dd className="font-mono text-xs text-gray-800 text-right truncate">
                        {envelope.referenceNumber}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-600 flex-shrink-0">Documents:</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {envelope.documents?.length || 0} document(s)
                      </dd>
                    </div>

                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-600 flex-shrink-0">Status:</dt>
                      <dd className="font-semibold capitalize text-amber-600 text-right">
                        {envelope.status?.toLowerCase() || 'pending'}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-600 flex-shrink-0">Valid Until:</dt>
                      <dd className="font-medium text-gray-900 text-right">
                        {formatDate(envelope.expiryDate)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Consent card */}
                {envelope.consents && envelope.consents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Consent</h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Please read and accept the terms below before signing.
                    </p>

                    <div className="space-y-3">
                      {envelope.consents.map((consent) => (
                        <label
                          key={consent.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 flex-shrink-0"
                            checked={!!checkedConsents[consent.id]}
                            onChange={(e) =>
                              setCheckedConsents((prev) => ({
                                ...prev,
                                [consent.id]: e.target.checked,
                              }))
                            }
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {consent.label}
                              {consent.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </p>
                            {consent.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {consent.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {!allRequiredConsentsChecked && (
                      <p className="mt-2 text-xs text-red-600">
                        Please accept all required consents to continue.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right column: Signature & OTP */}
              <div className="space-y-4">
                {/* Electronic Signature card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Electronic Signature
                  </h2>

                  {/* Tabs */}
                  <div className="flex mb-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSigTab('draw')}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium border ${
                        activeSigTab === 'draw'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Draw</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSigTab('upload')}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium border ${
                        activeSigTab === 'upload'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Upload className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Upload</span>
                    </button>
                  </div>

                  {/* Draw / Upload UI */}
                  {activeSigTab === 'draw' ? (
                    <>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden"
                        style={{
                          touchAction: 'none',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none'
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={220}
                          className="w-full h-[220px] cursor-crosshair block"
                          style={{
                            touchAction: 'none',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                            msTouchAction: 'none'
                          }}
                          onMouseDown={handleStartDraw}
                          onMouseMove={handleDraw}
                          onMouseUp={handleEndDraw}
                          onMouseLeave={handleEndDraw}
                        />
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
                        <span>Use your mouse or finger to draw your signature.</span>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleClearCanvas}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleClearCanvas()
                              setSignatureCaptured(false)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload signature image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="block w-full text-sm text-gray-700"
                      />
                      {uploadedSignatureFile && (
                        <div className="mt-2 w-full max-w-xs border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img
                            src={URL.createObjectURL(uploadedSignatureFile)}
                            alt="Signature preview"
                            className="max-w-full max-h-32 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sign button */}
                  <button
                    type="button"
                    disabled={!canClickSign}
                    onClick={handleStartSigning}
                    className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                      canClickSign
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Sign All Documents ({envelope.documents?.length || 0})</span>
                  </button>

                  {!canClickSign && !signatureCaptured && allRequiredConsentsChecked && (
                    <p className="mt-2 text-xs text-amber-600 text-center">
                      Please draw or upload your signature above
                    </p>
                  )}
                </div>

                {/* OTP card */}
                {showOtp && !signingCompleted && (
                  <div
                    ref={otpRef}
                    className="bg-blue-50 rounded-2xl border border-blue-200 p-4 sm:p-5 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Enter the one-time passcode
                        </h3>
                        <p className="text-xs text-gray-600">
                          For this demo, use <span className="font-mono font-semibold">123456</span>.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.3em] text-center font-mono text-lg bg-white"
                        placeholder="••••••"
                      />
                      <button
                        type="submit"
                        disabled={completeSigningMutation.isPending}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        {completeSigningMutation.isPending ? (
                          <span>Signing all documents…</span>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Confirm & Sign All Documents</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerProposalSignPage
