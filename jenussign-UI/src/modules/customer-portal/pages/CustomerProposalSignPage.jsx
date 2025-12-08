import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import SignatureEvidenceCard from './SignatureEvidenceCard'
import SignatureCelebrationPopup from './SignatureCelebrationPopup'
import MobileFriendlyPdfViewer from './MobileFriendlyPdfViewer'
import { signingSessionsApi } from '../../../api/mockApi'

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
} from 'lucide-react'
import proposalsApi from '../../../api/proposalsApi' // <- adjust path if needed
import StatusBadge from '../../../shared/components/StatusBadge'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

// Mobile PDF Preview - Shows embedded viewer with option to open fullscreen
const MobilePdfPreview = ({ src, title }) => {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex-shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          Fullscreen
        </a>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200">
        <MobileFriendlyPdfViewer
          src={src}
          title={title}
          height="350px"
          showDownload={true}
        />
      </div>
    </div>
  )
}

const CustomerProposalSignPage = () => {
  // We support BOTH:
  // - /customer/proposals/:resolvedProposalId/sign
  // - /customer/sign/:token
  const { proposalId: routeProposalId, token } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [checkedConsents, setCheckedConsents] = useState({})
  const [activeSigTab, setActiveSigTab] = useState('draw') // 'draw' | 'upload'
  const [signatureCaptured, setSignatureCaptured] = useState(false)
  const [uploadedSignatureFile, setUploadedSignatureFile] = useState(null)

  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [signingCompleted, setSigningCompleted] = useState(false)

  const [signedPackage, setSignedPackage] = useState(null)
  const [evidence, setEvidence] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // NEW: resolve proposalId from token (for email link)
  const [resolvedProposalId, setResolvedProposalId] = useState(routeProposalId || null)
  const [linkError, setLinkError] = useState(null)

  // Store signing session data for PDF URLs
  const [signingSession, setSigningSession] = useState(null)

  // NEW: Verification state checking
  const [isVerified, setIsVerified] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(true)

  console.log('[CustomerProposalSignPage] routeProposalId:', routeProposalId, 'token:', token)
  console.log('[CustomerProposalSignPage] resolvedProposalId state:', resolvedProposalId)

  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const otpRef = useRef(null)

  // If we have a token but no proposalId, look up the signing session
  useEffect(() => {
    if (!routeProposalId && token) {
      signingSessionsApi
        .getSessionByToken(token)
        .then((session) => {
          // this should be 'prop-001' from DEMO_SIGNING_SESSIONS
          setResolvedProposalId(session.proposalId)
          // Store the full session for PDF URLs
          setSigningSession(session)
        })
        .catch((err) => {
          console.error('Failed to resolve signing session', err)
          setLinkError(err.message || 'Invalid or expired signing link.')
        })
    }
  }, [routeProposalId, token])

  // --------- Load proposal ----------
  const { data: proposal, isLoading } = useQuery({
    queryKey: ['customer-proposal', resolvedProposalId],
    queryFn: () => proposalsApi.getCustomerProposal(resolvedProposalId),
    enabled: !!resolvedProposalId && !linkError, // only run when we have a valid id
  })

  // --------- Check verification status ----------
  useEffect(() => {
    if (!resolvedProposalId) {
      return
    }

    // If user came via token (direct link), they went through CustomerVerificationPage
    // Check sessionStorage for verification state
    const stored = sessionStorage.getItem(`verified_${resolvedProposalId}`)
    if (stored) {
      try {
        const verification = JSON.parse(stored)
        // Check if verification is less than 30 minutes old
        const thirtyMinutes = 30 * 60 * 1000
        if (verification.idVerified && (Date.now() - verification.timestamp) < thirtyMinutes) {
          console.log('[CustomerProposalSignPage] User verified via sessionStorage')
          setIsVerified(true)
          setCheckingVerification(false)
          return
        }
      } catch (e) {
        console.error('Error parsing verification state', e)
      }
    }

    // If we have a token, user came from direct link route which goes through verification
    // The verification page should have set sessionStorage, but if not, we trust the token flow
    if (token) {
      console.log('[CustomerProposalSignPage] User has token - assuming verified via CustomerVerificationPage')
      setIsVerified(true)
      setCheckingVerification(false)
      return
    }

    // Not verified - user came from dashboard without verification
    console.log('[CustomerProposalSignPage] User NOT verified - needs identity verification')
    setIsVerified(false)
    setCheckingVerification(false)
  }, [resolvedProposalId, token])

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

  // Initialize consent checkboxes
  useEffect(() => {
    if (proposal?.consents) {
      const init = {}
      proposal.consents.forEach(c => {
        init[c.proposalConsentId] = !!c.value
      })
      setCheckedConsents(init)
    }
  }, [proposal])

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

    // Scale coordinates from CSS display size to canvas internal resolution
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

  // MOBILE FIX: Handle touch events with native listeners to prevent scroll
  // This ensures preventDefault works (React uses passive listeners by default)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0] || e.changedTouches[0]
      if (!touch) return { x: 0, y: 0 }

      // IMPORTANT: Scale coordinates from CSS display size to canvas internal resolution
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    const handleTouchStart = (e) => {
      e.preventDefault() // Prevent scroll
      const ctx = canvas.getContext('2d')
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      isDrawingRef.current = true
    }

    const handleTouchMove = (e) => {
      e.preventDefault() // Prevent scroll
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

    // Attach with passive: false to allow preventDefault
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
    // Re-run when: tab changes, signing completes (view change), or loading finishes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSigTab, signingCompleted, isLoading, isVerified])

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

  // --------- Mutation: complete signing ----------
  const completeSigningMutation = useMutation({
    // we pass the OTP as the variable
    mutationFn: (otpCode) => proposalsApi.verifySigningOtp(resolvedProposalId, otpCode),
    onSuccess: async (result, otpCode) => {
      // Fetch signed & audit PDF URLs
      const pkg = await proposalsApi.getAuditPackage(resolvedProposalId)
      setSignedPackage(pkg)

      // Update the single proposal in cache
      queryClient.setQueryData(['customer-proposal', resolvedProposalId], (prev) =>
        prev
          ? {
            ...prev,
            status: 'Signed',
            signatureStatus: 'Completed',
          }
          : prev
      )

      // Invalidate the list so dashboard refreshes
      queryClient.invalidateQueries(['customer-proposals'])
      setEvidence({
        documentHash:
          'SHA256:a3f5b9c2e8d1f4a7b6c3e92df58ab1cde74df8f36b9c25ed8f1a4b7c0e3d6f9a2',
        timestamp: new Date().toLocaleString(), // later from backend
        ip: '192.168.1.100',                    // later from backend
        device: 'Chrome on Windows 10',         // later from backend
        otpRef: 'OTP-2025-10-26-XXX123',        // later from backend (masked)
        signerId: proposal.customerId || 'CUS-12345',
        agentId: 'AGT-67890',                   // later from backend
        certificateChain: [
          'Root CA: JCC Trust Services',
          'Intermediate CA: JCC eIDAS Qualified',
          'End Entity: JenusSign Platform Certificate',
        ],
        eidasLevel: 'eIDAS Article 26 Compliant',
      })

      setSigningCompleted(true)
      setShowCelebration(true)
    },
    onError: (err) => {
      console.error('Error completing signing', err)
      alert(err.message || 'Error completing signing')
    },
  })

  // Show loading while checking verification
  if (checkingVerification) {
    return <Loading fullScreen message="Checking verification status..." />
  }

  if (isLoading) return <Loading fullScreen message="Loading proposal..." />

  if (!proposal) {
    return (
      <div className="p-8 text-center">
        <p className="font-semibold mb-2">Proposal not found</p>
        <p className="text-sm text-gray-500">
          Tried to load proposal with id: <code>{String(resolvedProposalId)}</code>
        </p>
      </div>
    )
  }

  // --------- Verification Required Screen ----------
  if (!isVerified && !signingCompleted) {
    // Determine the correct verification route
    // Map proposal IDs to demo tokens for now
    const tokenMap = {
      'prop-001': 'demo1',
      'prop-002': 'demo2',
      'prop-003': 'demo3',
      'prop-005': 'business1'
    }
    const verificationToken = tokenMap[resolvedProposalId] || 'demo1'

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
            For your security and to comply with <strong>eIDAS regulations</strong>, we need to verify your identity before you can sign this document.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This ensures that only you can sign documents intended for you.
          </p>

          {/* Proposal info card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Document to sign:</p>
            <p className="font-medium text-gray-900">{proposal.title}</p>
            <p className="text-sm text-gray-600">{proposal.proposalRef}</p>
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

          <p className="mt-6 text-xs text-gray-500">
            🔒 Your data is encrypted and protected under GDPR
          </p>
        </div>
      </div>
    )
  }

  // DYNAMIC PDF URLs - use proposal data or signing session, with fallbacks
  const draftPdfUrl = proposal.documentUrl || signingSession?.documentUrl || '/samples/home-insurance-proposal-PR-2025-0001.pdf'
  const signedPdfUrl = signedPackage?.signedPdfUrl || proposal.signedDocumentUrl || signingSession?.signedDocumentUrl || '/samples/demo-home-signed-esealed.pdf'
  const auditPdfUrl = signedPackage?.auditPdfUrl || proposal.auditTrailUrl || signingSession?.auditTrailUrl || '/samples/home-insurance-audit-trail-PR-2025-0001.pdf'

  // If signing is completed, show the "final" view
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
                {/* Header + download buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Final Signed &amp; eSealed Document
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      Merged PDF containing your proposal and the audit trail page.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Final merged PDF (proposal + audit page) */}
                    <a
                      href={signedPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download final PDF</span>
                    </a>

                    {/* Audit trail PDF */}
                    <a
                      href={auditPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Audit trail PDF</span>
                    </a>
                  </div>
                </div>

                {/* Success banner */}
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Document Successfully Signed &amp; eSealed
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your signature has been applied, an electronic seal has been added, and the
                      audit page is attached as the last page of the PDF.
                    </p>
                  </div>
                </div>

                {/* Visual document illustration */}
                <div className="flex-1 rounded-xl bg-gray-50 border border-gray-200 p-6 flex flex-col lg:flex-row items-center gap-8">
                  {/* Fake "document thumbnail" */}
                  <div className="relative w-40 h-56 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between overflow-hidden">
                    {/* Header bar */}
                    <div className="h-6 bg-gray-100 border-b border-gray-200 flex items-center px-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mr-1" />
                      <div className="w-2 h-2 rounded-full bg-amber-400 mr-1" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>

                    {/* Content lines */}
                    <div className="flex-1 px-4 py-3 space-y-2">
                      <div className="h-2 w-5/6 rounded bg-gray-100" />
                      <div className="h-2 w-4/6 rounded bg-gray-100" />
                      <div className="h-2 w-3/4 rounded bg-gray-100 mt-3" />
                      <div className="h-2 w-2/3 rounded bg-gray-100" />
                      <div className="h-2 w-1/2 rounded bg-gray-100" />
                    </div>

                    {/* Bottom: signature line + seal */}
                    <div className="px-4 pb-4 pt-2">
                      <div className="h-[1px] w-24 bg-gray-300 mb-1" />
                      <p className="text-[9px] text-gray-500">Digitally signed</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-7 w-12 rounded bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center">
                          <span className="text-[9px] text-gray-400">Sig</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          <Shield className="w-3 h-3" />
                          <span>eSealed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium text-gray-900">
                      What this final PDF contains
                    </p>
                    <ul className="text-xs text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          <strong>Insurance Proposal:</strong> all pages exactly as presented
                          to the customer at signing time.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          <strong>Audit Page:</strong> an additional page appended at the end
                          with signature evidence (timestamps, IP/device, OTP reference, and
                          participant IDs).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>
                          <strong>Platform eSeal:</strong> the PDF is protected with a
                          platform certificate so tampering will be detected by PDF viewers
                          (e.g. Adobe Reader).
                        </span>
                      </li>
                    </ul>

                    <p className="text-[11px] text-gray-500">
                      To see the technical certificate details, open the PDF in Adobe Reader and
                      check <em>Signature Properties &gt; Certificate Details</em>.
                    </p>
                  </div>
                </div>

                {/* Signed on info (kept from your original) */}
                <p className="mt-3 text-[11px] text-gray-500">
                  Signed on: {formatDate(proposal.signedAt || new Date().toISOString())}
                </p>
              </div>


              {/* RIGHT: Signature Evidence card */}
              <SignatureEvidenceCard evidence={evidence} auditPdfUrl={auditPdfUrl} />
            </div>
          </div>
        </div>
      </>
    )
  }



  const requiredConsents = proposal.consents?.filter(c => c.isRequired) || []
  const allRequiredConsentsChecked = requiredConsents.every(
    c => checkedConsents[c.proposalConsentId]
  )

  const canClickSign =
    !signingCompleted &&
    (proposal.status === 'PendingSignature' || proposal.status === 'InProgress') &&
    allRequiredConsentsChecked &&
    signatureCaptured


  // --------- OTP handling ----------
  const handleStartSigning = () => {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">{proposal.title}</h1>
              <p className="text-gray-600 text-sm truncate">{proposal.proposalRef}</p>
            </div>
            <StatusBadge status={signingCompleted ? 'Signed' : proposal.status} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* LEFT: PDF viewer - Hidden on mobile by default, shown in collapsible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card h-full hidden lg:block"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {signingCompleted ? 'Signed Document' : 'Proposal Document'}
            </h2>

            <MobileFriendlyPdfViewer
              src={signingCompleted ? signedPdfUrl : draftPdfUrl}
              title={proposal.title}
              height="640px"
            />

            {signingCompleted && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href={signedPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </a>
                <a
                  href={auditPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Audit Trail</span>
                </a>
              </div>
            )}
          </motion.div>

          {/* Mobile PDF Preview Card */}
          <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-2 overflow-hidden">
            <MobilePdfPreview
              src={signingCompleted ? signedPdfUrl : draftPdfUrl}
              title={signingCompleted ? 'Signed Document' : 'Proposal Document'}
            />
          </div>

          {/* RIGHT: properties, consent & signature as separate cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-5 min-w-0"
          >
            {/* 1. Document Properties */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Document Properties</h2>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 flex-shrink-0">Type:</dt>
                  <dd className="font-medium text-gray-900 text-right truncate">
                    {proposal.type || 'Proposal'}
                  </dd>
                </div>

                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 flex-shrink-0">Status:</dt>
                  <dd className="font-semibold capitalize text-amber-600 text-right">
                    {proposal.status?.toLowerCase() || 'pending'}
                  </dd>
                </div>

                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 flex-shrink-0">Valid Until:</dt>
                  <dd className="font-medium text-gray-900 text-right">
                    {formatDate(proposal.expiryDate)}
                  </dd>
                </div>

                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 flex-shrink-0">Document ID:</dt>
                  <dd className="font-mono text-xs text-gray-800 text-right truncate max-w-[150px] sm:max-w-none">
                    {proposal.proposalRef || proposal.id}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 2. Consent card */}
            {proposal.consents && proposal.consents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Consent</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Please read and accept the terms below before signing this document.
                </p>

                <div className="space-y-3">
                  {proposal.consents.map((consent) => (
                    <label
                      key={consent.proposalConsentId}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 flex-shrink-0"
                        checked={!!checkedConsents[consent.proposalConsentId]}
                        onChange={(e) =>
                          setCheckedConsents((prev) => ({
                            ...prev,
                            [consent.proposalConsentId]: e.target.checked,
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

            {/* 3. Electronic Signature card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Electronic Signature
              </h2>

              {/* Tabs */}
              <div className="flex mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSigTab('draw')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium border ${activeSigTab === 'draw'
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
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium border ${activeSigTab === 'upload'
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
                    // Touch events handled by native listeners in useEffect (for proper preventDefault support)
                    />
                  </div>
                  <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
                    <span>Use your mouse or finger (on touch devices) to draw your signature.</span>
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
                          setCheckedConsents({})
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

              {/* Main Sign button */}
              <button
                type="button"
                disabled={!canClickSign}
                onClick={handleStartSigning}
                className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          ${canClickSign
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Shield className="w-4 h-4" />
                <span>Sign Document</span>
              </button>
            </div>

            {/* 4. OTP card */}
            {showOtp && !signingCompleted && (
              <div
                ref={otpRef}
                className="bg-blue-50 rounded-2xl border border-blue-200 p-4 sm:p-5 space-y-3 overflow-hidden">
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {completeSigningMutation.isPending ? (
                      <span>Confirming…</span>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Confirm Signature</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default CustomerProposalSignPage
