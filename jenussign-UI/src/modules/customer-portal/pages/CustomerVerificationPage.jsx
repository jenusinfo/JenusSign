import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  User,
  CreditCard,
  Camera,
  Upload,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Globe,
  Scan,
  RefreshCw,
  X,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../../../shared/components/Logo'
import useAuthStore from '../../../shared/store/authStore'
import {
  getSigningSession,
  verifyIdentity as apiVerifyIdentity,
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
} from '../../../api/signingApi'

// Verification method options
const VERIFICATION_METHODS = {
  MANUAL: 'manual',
  CY_LOGIN: 'cy_login',
  OCR_SCAN: 'ocr_scan',
}

// Verification steps
const STEPS = {
  LOADING: 'loading',
  SELECT_METHOD: 'select_method',
  IDENTITY_VERIFICATION: 'identity_verification',
  CONTACT_VERIFICATION: 'contact_verification',
  VERIFIED: 'verified',
  ERROR: 'error',
}

const CustomerVerificationPage = () => {
  const { token } = useParams()  // Token from URL path
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setCustomerAuth } = useAuthStore()

  // State
  const [currentStep, setCurrentStep] = useState(STEPS.LOADING)
  const [verificationMethod, setVerificationMethod] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Envelope data (would come from API)
  const [envelopeData, setEnvelopeData] = useState(null)
  const [envelopeId, setEnvelopeId] = useState(null)  // Internal ID from token lookup

  // Identity verification state
  const [identityVerified, setIdentityVerified] = useState(false)
  const [manualFormData, setManualFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
  })

  // OCR state
  const [ocrStep, setOcrStep] = useState('select') // select, capture, processing, confirm
  const [capturedImage, setCapturedImage] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Contact verification state
  const [contactMethod, setContactMethod] = useState('email') // email or sms
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const otpInputRefs = useRef([])

  // Customer data from token/API
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailFull: '',
    phone: '',
    phoneFull: '',
    idNumberLast4: '',
    dateOfBirth: '',
  })

  // Load envelope data on mount
  useEffect(() => {
    loadEnvelopeData()
  }, [token])

  // OTP resend timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendTimer])

  const loadEnvelopeData = async () => {
    setIsLoading(true)
    try {
      const data = await getSigningSession(token)

      if (!data) {
        throw new Error('Invalid or expired link')
      }

      setEnvelopeId(data.sessionId)
      setEnvelopeData({
        id: data.sessionId,
        reference: data.reference || '',
        title: data.title || '',
        status: data.status || 'Pending',
        documentCount: data.documentCount ?? data.documents?.length ?? 0,
        expiresAt: data.expiresAt,
        customer: {
          name: data.customerName || '',
          email: data.customerEmail || '',
        },
        agent: {
          name: data.agent?.name || '',
          company: data.agent?.company || '',
        },
      })

      setCustomerData({
        firstName: data.customerInfo?.firstName || '',
        lastName: data.customerInfo?.lastName || '',
        email: data.customerInfo?.maskedEmail || data.customerEmail || '',
        emailFull: data.customerEmail || '',
        phone: data.customerInfo?.maskedPhone || data.customerPhone || '',
        phoneFull: data.customerPhone || '',
        idNumberLast4: data.customerInfo?.idNumberLast4 || '',
        dateOfBirth: '',
      })

      // Check if user is already verified (e.g., from session)
      const isAlreadyVerified = sessionStorage.getItem(`verified_${token}`)
      
      if (isAlreadyVerified) {
        // Already verified, go directly to signing
        navigate(`/customer/sign/${token}`)
        return
      }

      setCurrentStep(STEPS.SELECT_METHOD)
    } catch (err) {
      setError('Failed to load envelope. The link may be invalid or expired.')
      setCurrentStep(STEPS.ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // IDENTITY VERIFICATION HANDLERS
  // ============================================

  const handleManualVerification = async () => {
    if (!manualFormData.firstName || !manualFormData.lastName || !manualFormData.idNumber || !manualFormData.dateOfBirth) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiVerifyIdentity(token, {
        idNumber: manualFormData.idNumber,
        fullName: `${manualFormData.firstName} ${manualFormData.lastName}`.trim(),
        dateOfBirth: manualFormData.dateOfBirth,
        method: 'ManualEntry',
      })

      if (response?.success) {
        setIdentityVerified(true)
        setCurrentStep(STEPS.CONTACT_VERIFICATION)
        toast.success('Identity verified successfully')
      } else {
        toast.error(response?.errorMessage || 'The information provided does not match our records. Please try again.')
      }
    } catch (err) {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCyLogin = async () => {
    setIsLoading(true)
    try {
      // In production, this would redirect to Cyprus government eID portal
      // For demo, simulate the flow
      toast.success('Redirecting to CY Login...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful CY Login return
      setIdentityVerified(true)
      setCurrentStep(STEPS.CONTACT_VERIFICATION)
      toast.success('CY Login verification successful')
    } catch (err) {
      toast.error('CY Login verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOcrCapture = async (imageData) => {
    setCapturedImage(imageData)
    setOcrStep('processing')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Simulate OCR result
      setOcrResult({
        firstName: 'Yiannis',
        lastName: 'Kleanthous',
        idNumber: 'X1234567',
        dateOfBirth: '1985-03-12',
        documentType: 'National ID Card',
        expiryDate: '2028-05-15',
        confidence: 98.5,
      })
      setOcrStep('confirm')
    } catch (err) {
      toast.error('Failed to process document. Please try again.')
      setOcrStep('select')
    }
  }

  const confirmOcrResult = async () => {
    setIsLoading(true)
    try {
      const response = await apiVerifyIdentity(token, {
        idNumber: ocrResult?.idNumber,
        fullName: `${ocrResult?.firstName || ''} ${ocrResult?.lastName || ''}`.trim(),
        dateOfBirth: ocrResult?.dateOfBirth,
        method: 'IdCardScan',
      })

      if (response?.success) {
        setIdentityVerified(true)
        setCurrentStep(STEPS.CONTACT_VERIFICATION)
        toast.success('Identity verified via document scan')
      } else {
        toast.error(response?.errorMessage || 'Verification failed')
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      toast.error('Unable to access camera. Please upload an image instead.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      setCameraActive(false)
    }
  }

  const captureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      stopCamera()
      handleOcrCapture(imageData)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        handleOcrCapture(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // ============================================
  // CONTACT VERIFICATION HANDLERS
  // ============================================

  const sendOtp = async () => {
    setIsLoading(true)
    try {
      const channel = contactMethod === 'email' ? 'Email' : 'Sms'
      const response = await apiRequestOtp(token, channel)
      if (response?.success) {
        setOtpSent(true)
        setOtpResendTimer(60)
        toast.success(`OTP sent to ${response?.maskedDestination || (contactMethod === 'email' ? customerData.email : customerData.phone)}`)
      } else {
        toast.error(response?.errorMessage || 'Failed to send OTP')
      }
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
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

  const verifyOtp = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiVerifyOtp(token, code)

      if (response?.success) {
        sessionStorage.setItem(`verified_${token}`, 'true')
        sessionStorage.setItem(`verification_method_${token}`, verificationMethod)
        sessionStorage.setItem(`envelope_id_${token}`, envelopeId)

        const customerAuthData = {
          id: envelopeId,
          name: envelopeData?.customer?.name || `${customerData.firstName} ${customerData.lastName}`.trim(),
          email: customerData.emailFull || envelopeData?.customer?.email,
          phone: customerData.phoneFull,
          verifiedAt: new Date().toISOString(),
          verificationMethod: verificationMethod,
        }
        setCustomerAuth(`customer_${token}`, customerAuthData)

        setCurrentStep(STEPS.VERIFIED)
        toast.success('Verification complete!')

        setTimeout(() => {
          navigate(`/customer/sign/${token}`)
        }, 2000)
      } else {
        toast.error(response?.errorMessage || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // RENDER METHODS
  // ============================================

  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your documents...</p>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadEnvelopeData}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  const renderSelectMethod = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
        <p className="text-gray-600">
          Before you can view and sign your documents, we need to verify your identity.
        </p>
      </div>

      {/* Envelope Info */}
      {envelopeData && (
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-indigo-900">{envelopeData.title}</p>
              <p className="text-sm text-indigo-600">
                Reference: {envelopeData.reference} • {envelopeData.documentCount} documents
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                From: {envelopeData.agent.name}, {envelopeData.agent.company}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Methods */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Choose verification method:</p>

        {/* Manual Verification */}
        <button
          onClick={() => {
            setVerificationMethod(VERIFICATION_METHODS.MANUAL)
            setCurrentStep(STEPS.IDENTITY_VERIFICATION)
          }}
          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Manual Verification</h3>
              <p className="text-sm text-gray-500">Enter your personal details to verify</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </button>

        {/* CY Login */}
        <button
          onClick={() => {
            setVerificationMethod(VERIFICATION_METHODS.CY_LOGIN)
            setCurrentStep(STEPS.IDENTITY_VERIFICATION)
          }}
          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">CY Login</h3>
              <p className="text-sm text-gray-500">Use your Cyprus government eID</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </button>

        {/* OCR Scan */}
        <button
          onClick={() => {
            setVerificationMethod(VERIFICATION_METHODS.OCR_SCAN)
            setCurrentStep(STEPS.IDENTITY_VERIFICATION)
          }}
          className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Scan ID Document</h3>
              <p className="text-sm text-gray-500">Scan your National ID or Passport</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </button>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-700">Your data is secure</p>
          <p>All verification is encrypted and compliant with eIDAS and GDPR regulations.</p>
        </div>
      </div>
    </div>
  )

  const renderManualVerification = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep(STEPS.SELECT_METHOD)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to options
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Verification</h2>
        <p className="text-gray-600">Enter your details exactly as they appear in our records</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={manualFormData.firstName}
              onChange={(e) => setManualFormData({ ...manualFormData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={manualFormData.lastName}
              onChange={(e) => setManualFormData({ ...manualFormData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
          <input
            type="text"
            value={manualFormData.idNumber}
            onChange={(e) => setManualFormData({ ...manualFormData, idNumber: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your ID number"
          />
          <p className="text-xs text-gray-500 mt-1">National ID or Passport number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={manualFormData.dateOfBirth}
            onChange={(e) => setManualFormData({ ...manualFormData, dateOfBirth: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleManualVerification}
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Identity
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )

  const renderCyLogin = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep(STEPS.SELECT_METHOD)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to options
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">CY Login Verification</h2>
        <p className="text-gray-600">You will be redirected to the Cyprus government eID portal</p>
      </div>

      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-800">Secure Government Authentication</p>
            <p className="text-green-600 mt-1">
              CY Login uses your Cyprus eID credentials for secure identity verification.
              You'll be redirected back after authentication.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">You will need:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Cyprus eID card or Mobile ID
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Card reader (for eID card) or smartphone (for Mobile ID)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            Your PIN code
          </li>
        </ul>
      </div>

      <button
        onClick={handleCyLogin}
        disabled={isLoading}
        className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to CY Login...
          </>
        ) : (
          <>
            <Globe className="w-5 h-5" />
            Continue with CY Login
          </>
        )}
      </button>
    </div>
  )

  const renderOcrScan = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          stopCamera()
          setOcrStep('select')
          setCapturedImage(null)
          setOcrResult(null)
          setCurrentStep(STEPS.SELECT_METHOD)
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to options
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Scan ID Document</h2>
        <p className="text-gray-600">
          {ocrStep === 'select' && 'Take a photo or upload an image of your ID'}
          {ocrStep === 'capture' && 'Position your ID within the frame'}
          {ocrStep === 'processing' && 'Processing your document...'}
          {ocrStep === 'confirm' && 'Please confirm the extracted information'}
        </p>
      </div>

      {/* Select capture method */}
      {ocrStep === 'select' && (
        <div className="space-y-3">
          <button
            onClick={() => {
              setOcrStep('capture')
              startCamera()
            }}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Use Camera</h3>
                <p className="text-sm text-gray-500">Take a photo of your ID</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Upload Image</h3>
                <p className="text-sm text-gray-500">Upload an existing photo of your ID</p>
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="bg-amber-50 rounded-xl p-4 mt-4">
            <p className="text-sm text-amber-800">
              <strong>Accepted documents:</strong> Cyprus National ID Card, Passport, EU ID Card
            </p>
          </div>
        </div>
      )}

      {/* Camera capture */}
      {ocrStep === 'capture' && (
        <div className="space-y-4">
          <div className="relative aspect-[3/2] bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* ID frame overlay */}
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                stopCamera()
                setOcrStep('select')
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={captureFromCamera}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {ocrStep === 'processing' && (
        <div className="text-center py-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
            <Scan className="absolute inset-0 m-auto w-10 h-10 text-purple-600" />
          </div>
          <p className="text-gray-600">Scanning and extracting information...</p>
        </div>
      )}

      {/* Confirm OCR result */}
      {ocrStep === 'confirm' && ocrResult && (
        <div className="space-y-4">
          {capturedImage && (
            <div className="aspect-[3/2] bg-gray-100 rounded-xl overflow-hidden">
              <img src={capturedImage} alt="Captured ID" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Information extracted successfully</span>
              <span className="ml-auto text-sm text-green-600">{ocrResult.confidence}% confidence</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium text-gray-900">{ocrResult.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium text-gray-900">{ocrResult.firstName} {ocrResult.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Number:</span>
                <span className="font-medium text-gray-900">{ocrResult.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span className="font-medium text-gray-900">{ocrResult.dateOfBirth}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setOcrStep('select')
                setCapturedImage(null)
                setOcrResult(null)
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Retake
            </button>
            <button
              onClick={confirmOcrResult}
              disabled={isLoading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirm & Continue
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderIdentityVerification = () => {
    switch (verificationMethod) {
      case VERIFICATION_METHODS.MANUAL:
        return renderManualVerification()
      case VERIFICATION_METHODS.CY_LOGIN:
        return renderCyLogin()
      case VERIFICATION_METHODS.OCR_SCAN:
        return renderOcrScan()
      default:
        return null
    }
  }

  const renderContactVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verified!</h2>
        <p className="text-gray-600">Now let's verify your contact information</p>
      </div>

      {!otpSent ? (
        <>
          {/* Contact method selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Send verification code to:</p>

            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              contactMethod === 'email' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={contactMethod === 'email'}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{customerData.email}</p>
              </div>
            </label>

            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              contactMethod === 'sms' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="contactMethod"
                value="sms"
                checked={contactMethod === 'sms'}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">SMS</p>
                <p className="text-sm text-gray-500">{customerData.phone}</p>
              </div>
            </label>
          </div>

          <button
            onClick={sendOtp}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </>
      ) : (
        <>
          {/* OTP Input */}
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-sm text-indigo-800">
              We've sent a 6-digit code to{' '}
              <span className="font-medium">
                {contactMethod === 'email' ? customerData.email : customerData.phone}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter verification code
            </label>
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
          </div>

          <button
            onClick={verifyOtp}
            disabled={isLoading || otpCode.join('').length !== 6}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {otpResendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {otpResendTimer}s
              </p>
            ) : (
              <button
                onClick={sendOtp}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Didn't receive the code? Resend
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )

  const renderVerified = () => (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
      <p className="text-gray-600 mb-6">Redirecting you to your documents...</p>
      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
    </div>
  )

  // ============================================
  // MAIN RENDER
  // ============================================

  if (currentStep === STEPS.LOADING) {
    return renderLoading()
  }

  if (currentStep === STEPS.ERROR) {
    return renderError()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center">
          <Logo size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep + (verificationMethod || '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === STEPS.SELECT_METHOD && renderSelectMethod()}
              {currentStep === STEPS.IDENTITY_VERIFICATION && renderIdentityVerification()}
              {currentStep === STEPS.CONTACT_VERIFICATION && renderContactVerification()}
              {currentStep === STEPS.VERIFIED && renderVerified()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact your agent or our support team</p>
          <p className="mt-2">
            <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a>
            {' • '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default CustomerVerificationPage
