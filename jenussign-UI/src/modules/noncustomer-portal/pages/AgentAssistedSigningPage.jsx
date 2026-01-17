import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  Smartphone,
  Send,
  Eye,
  Loader2,
  ChevronRight,
  MessageSquare,
  PenTool,
  AlertCircle,
  Check,
  Camera,
  Volume2,
  Download,
  FileCheck,
  ClipboardList,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/store/authStore'

// Mock envelope data
const MOCK_ENVELOPES = {
  'env-001': {
    id: 'env-001',
    reference: 'PR-2025-0001',
    title: 'Home Insurance Proposal',
    customer: {
      id: 'cust-001',
      name: 'Yiannis Kleanthous',
      email: 'yiannis.kleanthous@email.com',
      mobile: '+357 99 123 456',
      idNumber: 'X1234567',
    },
    documents: [
      { id: 'doc-1', name: 'Home Insurance Proposal', pages: 4 },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3 },
      { id: 'doc-3', name: 'Privacy Policy', pages: 2 },
    ],
  },
  'env-002': {
    id: 'env-002',
    reference: 'PR-2025-0002',
    title: 'Motor Insurance Proposal',
    customer: {
      id: 'cust-002',
      name: 'Charis Constantinou',
      email: null,
      mobile: '+357 99 654 321',
      idNumber: 'M7654321',
    },
    documents: [
      { id: 'doc-1', name: 'Motor Insurance Proposal', pages: 4 },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3 },
    ],
  },
}

// Signing steps
const STEPS = {
  CONFIRM_PRESENCE: 1,
  REVIEW_DOCUMENTS: 2,
  CAPTURE_CONSENT: 3,
  CUSTOMER_VERIFICATION: 4,
  SIGNATURE_CAPTURE: 5,
  OTP_VERIFICATION: 6,
  COMPLETE: 7,
}

const AgentAssistedSigningPage = () => {
  const { envelopeId } = useParams()
  const navigate = useNavigate()
  const { agent } = useAuthStore()

  // State
  const [currentStep, setCurrentStep] = useState(STEPS.CONFIRM_PRESENCE)
  const [isLoading, setIsLoading] = useState(false)
  const [envelope, setEnvelope] = useState(null)

  // Consent state
  const [consentConfirmed, setConsentConfirmed] = useState({
    customerPresent: false,
    customerIdentified: false,
    customerConsents: false,
    agentDeclaration: false,
  })

  // Document review state
  const [documentsReviewed, setDocumentsReviewed] = useState({})

  // Verification state
  const [verificationMethod, setVerificationMethod] = useState('id_verbal')
  const [idVerified, setIdVerified] = useState(false)

  // Signature state
  const [signatureData, setSignatureData] = useState(null)

  // OTP state
  const [otpChannel, setOtpChannel] = useState('sms')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const otpInputRefs = useRef([])

  // Canvas ref for signature
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Load envelope
  useEffect(() => {
    const env = MOCK_ENVELOPES[envelopeId]
    if (env) {
      setEnvelope(env)
      const reviewed = {}
      env.documents.forEach(doc => { reviewed[doc.id] = false })
      setDocumentsReviewed(reviewed)
      setOtpChannel(env.customer.email ? 'email' : 'sms')
    }
  }, [envelopeId])

  // OTP resend timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendTimer])

  const allConsentConfirmed = Object.values(consentConfirmed).every(v => v)
  const allDocumentsReviewed = Object.values(documentsReviewed).every(v => v)

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newOtp = [...otpCode]
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtpCode(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
    } else {
      const newOtp = [...otpCode]
      newOtp[index] = value.replace(/\D/g, '')
      setOtpCode(newOtp)
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Send OTP
  const sendOtp = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOtpSent(true)
      setOtpResendTimer(60)
      toast.success(`OTP sent to customer's ${otpChannel === 'sms' ? 'mobile' : 'email'}`)
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP
  const verifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('OTP verified successfully')
      setCurrentStep(STEPS.COMPLETE)
    } catch (err) {
      toast.error('Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Canvas signature methods
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      const canvas = canvasRef.current
      if (canvas) {
        setSignatureData(canvas.toDataURL())
      }
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setSignatureData(null)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.COMPLETE))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, STEPS.CONFIRM_PRESENCE))

  if (!envelope) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/portal/envelopes/${envelopeId}`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent-Assisted Signing</h1>
            <p className="text-sm text-gray-500">{envelope.title} • {envelope.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
          <Users className="w-4 h-4" />
          Customer Present
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          {[
            { step: 1, label: 'Presence' },
            { step: 2, label: 'Review' },
            { step: 3, label: 'Consent' },
            { step: 4, label: 'Verify ID' },
            { step: 5, label: 'Signature' },
            { step: 6, label: 'OTP' },
            { step: 7, label: 'Complete' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= item.step
                    ? currentStep === item.step ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  currentStep >= item.step ? 'text-indigo-600 font-medium' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </div>
              {index < 6 && (
                <div className={`flex-1 h-1 mx-1 rounded ${
                  currentStep > item.step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Confirm Customer Presence */}
            {currentStep === STEPS.CONFIRM_PRESENCE && (
              <motion.div
                key="presence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Confirm Customer Presence</h2>
                    <p className="text-sm text-gray-500">Verify the customer is physically present with you</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Important Notice</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Agent-assisted signing requires the customer to be physically present. 
                        The customer will provide verbal OTP verification, which you will enter on their behalf. 
                        All actions are logged in the audit trail.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{envelope.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Number</p>
                      <p className="font-medium text-gray-900">{envelope.customer.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mobile</p>
                      <p className="font-medium text-gray-900">{envelope.customer.mobile}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{envelope.customer.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentConfirmed.customerPresent}
                      onChange={(e) => setConsentConfirmed(prev => ({ ...prev, customerPresent: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Customer is physically present</p>
                      <p className="text-sm text-gray-500">I confirm the customer named above is with me right now</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentConfirmed.customerIdentified}
                      onChange={(e) => setConsentConfirmed(prev => ({ ...prev, customerIdentified: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Customer identity verified</p>
                      <p className="text-sm text-gray-500">I have verified the customer's identity using a valid ID document</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!consentConfirmed.customerPresent || !consentConfirmed.customerIdentified}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review Documents */}
            {currentStep === STEPS.REVIEW_DOCUMENTS && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Review Documents with Customer</h2>
                    <p className="text-sm text-gray-500">Go through each document with the customer</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Show each document to the customer on your screen or print them out. 
                  Mark each document as reviewed once the customer has seen it.
                </p>

                <div className="space-y-3">
                  {envelope.documents.map((doc) => (
                    <div key={doc.id} className={`border rounded-xl p-4 transition-colors ${
                      documentsReviewed[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            documentsReviewed[doc.id] ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {documentsReviewed[doc.id] ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{doc.pages} pages</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDocumentsReviewed(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                              documentsReviewed[doc.id]
                                ? 'bg-green-100 text-green-700'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            {documentsReviewed[doc.id] ? 'Reviewed ✓' : 'Mark Reviewed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!allDocumentsReviewed}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Capture Consent */}
            {currentStep === STEPS.CAPTURE_CONSENT && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Record Customer Consent</h2>
                    <p className="text-sm text-gray-500">Obtain verbal consent from the customer</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Read aloud to customer:</strong> "Do you confirm that you have reviewed all the documents, 
                    understand their contents, and consent to signing them electronically? Your verbal consent will be 
                    recorded as part of the audit trail."
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentConfirmed.customerConsents}
                      onChange={(e) => setConsentConfirmed(prev => ({ ...prev, customerConsents: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Customer has given verbal consent</p>
                      <p className="text-sm text-gray-500">
                        The customer has verbally confirmed they understand and agree to sign the documents
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentConfirmed.agentDeclaration}
                      onChange={(e) => setConsentConfirmed(prev => ({ ...prev, agentDeclaration: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Agent Declaration</p>
                      <p className="text-sm text-gray-500">
                        I, <strong>{agent?.name || 'Agent'}</strong>, declare that I am assisting this customer with their 
                        signing process at their request, and all information recorded is accurate to the best of my knowledge.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!consentConfirmed.customerConsents || !consentConfirmed.agentDeclaration}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Customer Verification */}
            {currentStep === STEPS.CUSTOMER_VERIFICATION && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Verify Customer Identity</h2>
                    <p className="text-sm text-gray-500">Confirm the customer's ID document</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setVerificationMethod('id_verbal')}
                      className={`p-4 border-2 rounded-xl text-left transition-colors ${
                        verificationMethod === 'id_verbal' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-6 h-6 text-indigo-600 mb-2" />
                      <p className="font-medium text-gray-900">Verbal Verification</p>
                      <p className="text-sm text-gray-500">Verify ID details verbally</p>
                    </button>
                    <button
                      onClick={() => setVerificationMethod('id_scan')}
                      className={`p-4 border-2 rounded-xl text-left transition-colors ${
                        verificationMethod === 'id_scan' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Camera className="w-6 h-6 text-indigo-600 mb-2" />
                      <p className="font-medium text-gray-900">Scan ID Document</p>
                      <p className="text-sm text-gray-500">Take photo of ID card</p>
                    </button>
                  </div>

                  {verificationMethod === 'id_verbal' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Ask the customer to show their ID and verify the following details match:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{envelope.customer.name}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-600">ID Number:</span>
                          <span className="font-medium">{envelope.customer.idNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={idVerified}
                      onChange={(e) => setIdVerified(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">I have verified the customer's ID</p>
                      <p className="text-sm text-gray-500">The ID document matches the customer details above</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!idVerified}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Signature Capture */}
            {currentStep === STEPS.SIGNATURE_CAPTURE && (
              <motion.div
                key="signature"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <PenTool className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Capture Signature</h2>
                    <p className="text-sm text-gray-500">Have the customer draw their signature</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Ask the customer to draw their signature on the pad below, or on a tablet/touchscreen if available.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-4">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full bg-white rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={clearSignature}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear signature
                  </button>
                  {signatureData && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Signature captured
                    </span>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!signatureData}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 6: OTP Verification */}
            {currentStep === STEPS.OTP_VERIFICATION && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">OTP Verification</h2>
                    <p className="text-sm text-gray-500">Customer receives and reads OTP aloud</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Verbal OTP Entry</p>
                      <p className="text-sm text-amber-700 mt-1">
                        The OTP will be sent to the customer's {otpChannel === 'sms' ? 'mobile phone' : 'email'}. 
                        Ask them to read the code aloud, and enter it below. This process is recorded in the audit trail.
                      </p>
                    </div>
                  </div>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setOtpChannel('sms')}
                        disabled={!envelope.customer.mobile}
                        className={`flex-1 p-4 border-2 rounded-xl text-left transition-colors ${
                          otpChannel === 'sms' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!envelope.customer.mobile ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Smartphone className="w-5 h-5 text-indigo-600 mb-2" />
                        <p className="font-medium text-gray-900">SMS</p>
                        <p className="text-sm text-gray-500">{envelope.customer.mobile || 'Not available'}</p>
                      </button>
                      <button
                        onClick={() => setOtpChannel('email')}
                        disabled={!envelope.customer.email}
                        className={`flex-1 p-4 border-2 rounded-xl text-left transition-colors ${
                          otpChannel === 'email' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!envelope.customer.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Mail className="w-5 h-5 text-indigo-600 mb-2" />
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500">{envelope.customer.email || 'Not available'}</p>
                      </button>
                    </div>

                    <button
                      onClick={sendOtp}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      Send OTP to Customer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">
                        OTP sent to customer's {otpChannel === 'sms' ? 'mobile' : 'email'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ask the customer to read the 6-digit code aloud
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {otpCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ))}
                    </div>

                    <button
                      onClick={verifyOtp}
                      disabled={isLoading || otpCode.join('').length !== 6}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Verify & Complete Signing'
                      )}
                    </button>

                    <div className="text-center">
                      {otpResendTimer > 0 ? (
                        <p className="text-sm text-gray-500">Resend in {otpResendTimer}s</p>
                      ) : (
                        <button
                          onClick={sendOtp}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-start">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Complete */}
            {currentStep === STEPS.COMPLETE && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border border-gray-200 p-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing Complete!</h2>
                <p className="text-gray-600 mb-6">
                  The documents have been signed successfully with agent assistance.
                </p>

                {/* Download Section */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center justify-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Documents Ready for Download
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        toast.success('Downloading signed document...')
                        // In production: window.open(`/api/envelopes/${envelopeId}/signed-document`, '_blank')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-green-300 rounded-xl text-green-700 font-medium hover:bg-green-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Signed Document
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Downloading audit trail...')
                        // In production: window.open(`/api/envelopes/${envelopeId}/audit-trail`, '_blank')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-green-300 rounded-xl text-green-700 font-medium hover:bg-green-50 transition-colors"
                    >
                      <ClipboardList className="w-5 h-5" />
                      Audit Trail
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Downloading complete package...')
                      // In production: download ZIP with both files
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Complete Package (Document + Audit Trail)
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Audit Record Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signing Method:</span>
                      <span className="font-medium text-amber-600">Agent-Assisted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Agent:</span>
                      <span className="font-medium">{agent?.name || 'Agent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-medium">{envelope.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OTP Channel:</span>
                      <span className="font-medium">{otpChannel === 'sms' ? 'SMS' : 'Email'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OTP Delivered To:</span>
                      <span className="font-medium">{envelope.customer.mobile || envelope.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">OTP Entered By:</span>
                      <span className="font-medium text-amber-600">Agent (Verbal from Customer)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timestamp:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">eIDAS Compliance:</span>
                      <span className="font-medium text-green-600">AES (Article 26)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Link
                    to={`/portal/envelopes/${envelopeId}`}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Envelope
                  </Link>
                  <Link
                    to="/portal/envelopes"
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Envelopes
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Signing Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signing Method</p>
                  <p className="font-medium text-amber-600">Agent-Assisted</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agent</p>
                  <p className="font-medium text-gray-900">{agent?.name || 'Current Agent'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{envelope.customer.name}</p>
                  <p className="text-xs text-gray-500">{envelope.customer.mobile}</p>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> This signing session is being recorded. The audit trail will show this was an 
                agent-assisted signing with verbal OTP verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentAssistedSigningPage
