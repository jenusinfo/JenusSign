import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  User,
  Building2,
  Calendar,
  IdCard,
  Mail,
  Phone,
  KeyRound,
  Camera,
  Upload,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Zap,
  Scan,
  CreditCard,
  AlertCircle,
  X,
  RefreshCw,
  Smartphone,
  Monitor,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { signingSessionsApi } from '../../../api/mockApi'
import useAuthStore from '../../../stores/authStore'
import Loading from '../../../shared/components/Loading'
import { formatDate } from '../../../shared/utils/formatters'

const CustomerVerificationPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { setCustomerAuth } = useAuthStore()

  const [step, setStep] = useState('identity') // 'identity' | 'contact' | 'otp'
  const [verificationMethod, setVerificationMethod] = useState(null) // null | 'eid' | 'idscan' | 'manual'
  const [eidDialogOpen, setEidDialogOpen] = useState(false)
  
  // ID Scanning state
  const [idFrontImage, setIdFrontImage] = useState(null)
  const [idBackImage, setIdBackImage] = useState(null)
  const [selfieImage, setSelfieImage] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [scanningStep, setScanningStep] = useState('front') // 'front' | 'back' | 'selfie' | 'processing' | 'complete'
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [captureMode, setCaptureMode] = useState('upload') // 'upload' | 'camera'
  const [cameraError, setCameraError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [form, setForm] = useState({
    dateOfBirth: '',
    idNumber: '',
    dateOfRegistration: '',
    registrationNumber: '',
    tin: '',
    email: '',
    mobile: '',
    channel: 'EMAIL',
    otp: '',
  })

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
  }, [])

  // 1. Load signing session (from token)
  const { data: session, isLoading } = useQuery({
    queryKey: ['signing-session', token],
    queryFn: () => signingSessionsApi.getSessionByToken(token),
  })

  const isIndividual = session?.customerType === 'INDIVIDUAL'

  // 2. Identity verification mutation (manual path)
  const identityMutation = useMutation({
    mutationFn: (payload) => signingSessionsApi.verifyIdentity(token, payload),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error('The details do not match our records. Please check and try again.')
        return
      }
      toast.success('Identity verified')
      setStep('contact')
    },
    onError: () => {
      toast.error('Could not verify identity. Please try again later.')
    },
  })

  // 3. Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: (payload) => signingSessionsApi.sendOtp(token, payload),
    onSuccess: () => {
      toast.success('We have sent you a 6-digit code.')
      setStep('otp')
    },
    onError: () => {
      toast.error('Could not send code. Please try again.')
    },
  })

  // 4. Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (payload) => signingSessionsApi.verifyOtp(token, payload),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error('The code is not correct. Please try again.')
        return
      }
      const emailToUse = form.email || session.prefilledEmail
      setCustomerAuth(`customer-token-${Date.now()}`, { email: emailToUse })
      toast.success('Contact verified. Loading your proposal…')
      navigate(`/customer/proposals/${session.proposalId}/sign`)
    },
    onError: () => {
      toast.error('Could not verify code. Please try again.')
    },
  })

  // ===== Camera Functions =====
  
  const startCamera = async (forSelfie = false) => {
    try {
      setCameraError(null)
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints = {
        video: {
          facingMode: forSelfie ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('autoplay', 'true')
        videoRef.current.muted = true
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(console.error)
        }
      }
      
      setCameraActive(true)
      toast.success(`Camera activated (${forSelfie ? 'front' : 'rear'})`)
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError(err.message || 'Could not access camera')
      setCaptureMode('upload')
      
      if (err.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access or use upload mode.')
      } else if (err.name === 'NotFoundError') {
        toast.error('No camera found. Please use upload mode.')
      } else {
        toast.error('Could not access camera. Please use upload mode.')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const handleCameraCapture = (type) => {
    const imageData = capturePhoto()
    if (!imageData) {
      toast.error('Could not capture image')
      return
    }

    if (type === 'front') {
      setIdFrontImage(imageData)
      toast.success('Front ID captured!')
      stopCamera()
      setCaptureMode('upload')
    } else if (type === 'back') {
      setIdBackImage(imageData)
      toast.success('Back ID captured!')
      stopCamera()
      setCaptureMode('upload')
    } else if (type === 'selfie') {
      setSelfieImage(imageData)
      toast.success('Selfie captured!')
      stopCamera()
      setCaptureMode('upload')
    }
  }

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target.result
      if (type === 'front') {
        setIdFrontImage(imageData)
        toast.success('Front ID uploaded!')
      } else if (type === 'back') {
        setIdBackImage(imageData)
        toast.success('Back ID uploaded!')
      } else if (type === 'selfie') {
        setSelfieImage(imageData)
        toast.success('Selfie uploaded!')
      }
    }
    reader.readAsDataURL(file)
  }

  const retakePhoto = (type) => {
    if (type === 'front') setIdFrontImage(null)
    else if (type === 'back') setIdBackImage(null)
    else if (type === 'selfie') setSelfieImage(null)
  }

  const toggleCaptureMode = (mode, forSelfie = false) => {
    if (mode === 'camera') {
      setCaptureMode('camera')
      startCamera(forSelfie)
    } else {
      setCaptureMode('upload')
      stopCamera()
    }
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Process ID images (simulated OCR)
  const processIdImages = async () => {
    setIsProcessing(true)
    setScanningStep('processing')
    
    // Simulated OCR processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulated extracted data
    const mockExtractedData = {
      fullName: session?.customerName || 'ANDREAS CONSTANTINOU',
      idNumber: 'K' + Math.floor(100000 + Math.random() * 900000),
      dateOfBirth: '1985-03-12',
      nationality: 'CYP',
      expiryDate: '2028-03-15',
      faceMatchScore: 98.5,
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setExtractedData(mockExtractedData)
    setForm(prev => ({
      ...prev,
      dateOfBirth: mockExtractedData.dateOfBirth,
      idNumber: mockExtractedData.idNumber,
    }))
    
    setScanningStep('complete')
    setIsProcessing(false)
    toast.success('Identity verified successfully!')
  }

  // Auto-process when all images captured
  useEffect(() => {
    if (idFrontImage && idBackImage && selfieImage && scanningStep === 'selfie') {
      processIdImages()
    }
  }, [selfieImage])

  // Continue after ID scan complete
  const handleIdScanComplete = () => {
    setStep('contact')
  }

  // ----- Handlers -----

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    if (!session) return

    if (isIndividual) {
      identityMutation.mutate({
        customerType: 'INDIVIDUAL',
        dateOfBirth: form.dateOfBirth,
        idNumber: form.idNumber,
      })
    } else {
      identityMutation.mutate({
        customerType: 'BUSINESS',
        dateOfRegistration: form.dateOfRegistration,
        registrationNumber: form.registrationNumber,
        tin: form.tin,
      })
    }
  }

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!session) return

    const email = form.email || session.prefilledEmail
    const mobile = form.mobile || session.prefilledMobile

    if (!email) {
      toast.error('Please provide an email address')
      return
    }
    if (isIndividual && form.channel === 'SMS' && !mobile) {
      toast.error('Please provide a mobile number for SMS')
      return
    }

    sendOtpMutation.mutate({
      channel: isIndividual ? form.channel : 'EMAIL',
      email,
      mobile,
    })
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!form.otp) {
      toast.error('Please enter the 6-digit code')
      return
    }
    verifyOtpMutation.mutate({ otp: form.otp })
  }

  // ----- eID demo flow -----
  const openEidDialog = () => {
    setEidDialogOpen(true)
  }

  const handleEidDemoCancel = () => {
    setEidDialogOpen(false)
  }

  const handleEidDemoConfirm = () => {
    if (!session) return

    setVerificationMethod('eid')

    const eidPayload = {
      fullName: session.customerName || 'Cyprus eID Demo User',
      nationalId: 'X1234567',
      dateOfBirth: '1985-03-12',
      email: session.prefilledEmail || 'eid.user@example.com',
      mobile: session.prefilledMobile || '+357 99 123456',
    }

    setForm((prev) => ({
      ...prev,
      dateOfBirth: eidPayload.dateOfBirth,
      idNumber: eidPayload.nationalId,
      email: eidPayload.email || prev.email,
      mobile: eidPayload.mobile || prev.mobile,
      channel: eidPayload.mobile ? 'SMS' : 'EMAIL',
    }))

    toast.success('Verified via Cyprus eID (demo). Please confirm your contact details.')
    setStep('contact')
    setEidDialogOpen(false)
  }

  // ----- Render -----

  if (isLoading || !session) {
    return <Loading fullScreen message="Loading your secure signing session." />
  }

  // Verification method selection cards
  const VerificationMethodSelection = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Choose how you'd like to verify your identity:
      </p>
      
      {/* Cyprus eID Option */}
      <button
        onClick={openEidDialog}
        className="w-full p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-md transition-all text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Cyprus eID</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">RECOMMENDED</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Instant verification using your government digital ID
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <Zap className="w-3 h-3" />
              <span>Fastest • Most Secure</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </button>

      {/* ID Card Scan Option */}
      {isIndividual && (
        <button
          onClick={() => setVerificationMethod('idscan')}
          className="w-full p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-400 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Scan ID Card</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full">SMART</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Take photos of your ID card + selfie for verification
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                <Camera className="w-3 h-3" />
                <span>Camera or Upload • Auto-extract data</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </button>
      )}

      {/* Manual Entry Option */}
      <button
        onClick={() => setVerificationMethod('manual')}
        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-900">Enter Details Manually</span>
            <p className="text-xs text-gray-600 mt-1">
              {isIndividual 
                ? 'Enter your date of birth and ID number' 
                : 'Enter company registration details'}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <IdCard className="w-3 h-3" />
              <span>Traditional method</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </button>
    </div>
  )

  // ID Scanning UI
  const IdScanningUI = () => (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['front', 'back', 'selfie'].map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
              scanningStep === s ? 'bg-purple-600 text-white' :
              (scanningStep === 'processing' || scanningStep === 'complete' || 
               (s === 'front' && idFrontImage) || 
               (s === 'back' && idBackImage) || 
               (s === 'selfie' && selfieImage)) 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {(s === 'front' && idFrontImage) || (s === 'back' && idBackImage) || (s === 'selfie' && selfieImage) || scanningStep === 'processing' || scanningStep === 'complete'
                ? <Check className="w-4 h-4" />
                : idx + 1}
            </div>
            {idx < 2 && <div className={`w-12 h-1 rounded ${
              (s === 'front' && idFrontImage) || (s === 'back' && idBackImage) ? 'bg-green-500' : 'bg-gray-200'
            }`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Front ID Step */}
      {scanningStep === 'front' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan Front of ID Card
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Take a photo of the front of your Cyprus ID card
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => toggleCaptureMode('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'upload' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'camera' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
          </div>

          {!idFrontImage ? (
            <>
              {captureMode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full max-w-md mx-auto aspect-[16/10] bg-gray-900 rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(1)' }}
                    />
                    {/* ID Card overlay guide */}
                    <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Position ID card within the frame
                    </div>
                  </div>
                  <button
                    onClick={() => handleCameraCapture('front')}
                    disabled={!cameraActive}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Capture Photo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <img src={idFrontImage} alt="Front ID" className="w-full max-w-md mx-auto rounded-xl border-2 border-green-300" />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => retakePhoto('front')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Retake
                </button>
                <button
                  onClick={() => setScanningStep('back')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back ID Step */}
      {scanningStep === 'back' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan Back of ID Card
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Now take a photo of the back of your ID card
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => toggleCaptureMode('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'upload' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'camera' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
          </div>

          {!idBackImage ? (
            <>
              {captureMode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e, 'back')}
                    className="hidden"
                    id="back-upload"
                  />
                  <button
                    onClick={() => document.getElementById('back-upload')?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full max-w-md mx-auto aspect-[16/10] bg-gray-900 rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Position ID card within the frame
                    </div>
                  </div>
                  <button
                    onClick={() => handleCameraCapture('back')}
                    disabled={!cameraActive}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Capture Photo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <img src={idBackImage} alt="Back ID" className="w-full max-w-md mx-auto rounded-xl border-2 border-green-300" />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => retakePhoto('back')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Retake
                </button>
                <button
                  onClick={() => {
                    setScanningStep('selfie')
                    setCaptureMode('upload')
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selfie Step */}
      {scanningStep === 'selfie' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Take a Selfie
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Position your face in the frame for verification
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => toggleCaptureMode('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'upload' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                captureMode === 'camera' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
          </div>

          {!selfieImage ? (
            <>
              {captureMode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileSelect(e, 'selfie')}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <button
                    onClick={() => document.getElementById('selfie-upload')?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Face oval guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-4 border-white/50 rounded-full" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Position your face within the oval
                    </div>
                  </div>
                  <button
                    onClick={() => handleCameraCapture('selfie')}
                    disabled={!cameraActive}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Capture Selfie
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <img src={selfieImage} alt="Selfie" className="w-full max-w-sm mx-auto rounded-xl border-2 border-green-300" />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => retakePhoto('selfie')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Step */}
      {scanningStep === 'processing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Verifying Your Identity
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>⚙️ Extracting data from ID card...</p>
            <p>🔍 Verifying document authenticity...</p>
            <p>🤳 Matching face with ID photo...</p>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {scanningStep === 'complete' && extractedData && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Identity Verified Successfully!
          </h3>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-4 text-left">
            <h4 className="text-sm font-medium text-green-800 mb-3">Extracted Information:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{extractedData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Number:</span>
                <span className="font-medium text-gray-900">{extractedData.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span className="font-medium text-gray-900">{formatDate(extractedData.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nationality:</span>
                <span className="font-medium text-gray-900">{extractedData.nationality}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Face Match:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {extractedData.faceMatchScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>All captured images are processed securely and not stored</span>
          </div>

          <button
            onClick={handleIdScanComplete}
            className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            Continue to Contact Verification
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => {
          stopCamera()
          setVerificationMethod(null)
          setScanningStep('front')
          setIdFrontImage(null)
          setIdBackImage(null)
          setSelfieImage(null)
          setExtractedData(null)
        }}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Choose different method
      </button>
    </div>
  )

  // Manual verification form
  const ManualVerificationForm = () => (
    <form onSubmit={handleIdentitySubmit} className="space-y-4 text-sm">
      <p className="text-xs text-gray-600 mb-2">
        Please confirm a few details so we know it's you.
      </p>

      {isIndividual ? (
        <>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              Date of birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <IdCard className="w-4 h-4 text-gray-400" />
              ID card number
            </label>
            <input
              type="text"
              value={form.idNumber}
              onChange={handleChange('idNumber')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. X1234567"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              Date of registration / incorporation
            </label>
            <input
              type="date"
              value={form.dateOfRegistration}
              onChange={handleChange('dateOfRegistration')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <Building2 className="w-4 h-4 text-gray-400" />
              Registration / TIN number
            </label>
            <input
              type="text"
              value={form.registrationNumber}
              onChange={handleChange('registrationNumber')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. HE123456 or TIN"
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={identityMutation.isLoading}
        className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {identityMutation.isLoading ? 'Verifying…' : 'Continue'}
      </button>

      <button
        type="button"
        onClick={() => setVerificationMethod(null)}
        className="w-full text-sm text-gray-500 hover:text-gray-700"
      >
        ← Choose different method
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/customer/login')}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">Secure Connection</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verify Your Identity</h1>
          <p className="text-sm text-gray-600 mt-1">
            {session.proposalTitle || 'Document'} for {session.customerName}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['Identity', 'Contact', 'Verification'].map((label, idx) => {
            const stepMap = ['identity', 'contact', 'otp']
            const isActive = step === stepMap[idx]
            const isComplete = stepMap.indexOf(step) > idx
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isActive ? 'bg-blue-100 text-blue-700' : 
                  isComplete ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isComplete && <Check className="w-3 h-3" />}
                  {label}
                </div>
                {idx < 2 && <div className={`w-8 h-0.5 ${isComplete ? 'bg-green-300' : 'bg-gray-200'}`} />}
              </React.Fragment>
            )
          })}
        </div>

        {/* Main Card */}
        <motion.div
          key={step + verificationMethod}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          {step === 'identity' && !verificationMethod && (
            <VerificationMethodSelection />
          )}

          {step === 'identity' && verificationMethod === 'idscan' && (
            <IdScanningUI />
          )}

          {step === 'identity' && verificationMethod === 'manual' && (
            <ManualVerificationForm />
          )}

          {step === 'contact' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-700">Identity Verified</p>
                  <p className="text-xs text-gray-500">
                    {verificationMethod === 'eid' && 'via Cyprus eID'}
                    {verificationMethod === 'idscan' && 'via ID Card Scan'}
                    {verificationMethod === 'manual' && 'via Manual Entry'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-2">
                Confirm how we can reach you. We'll send a one-time code to open your proposal.
              </p>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email || session.prefilledEmail || ''}
                  onChange={handleChange('email')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {isIndividual && (
                <>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Mobile number (optional if using email)
                    </label>
                    <input
                      type="tel"
                      value={form.mobile || session.prefilledMobile || ''}
                      onChange={handleChange('mobile')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+357 99 123456"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Where should we send your code?
                    </p>
                    <div className="flex gap-3 text-xs">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="channel"
                          value="SMS"
                          checked={form.channel === 'SMS'}
                          onChange={handleChange('channel')}
                          className="h-3 w-3"
                        />
                        <span>SMS</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="channel"
                          value="EMAIL"
                          checked={form.channel === 'EMAIL'}
                          onChange={handleChange('channel')}
                          className="h-3 w-3"
                        />
                        <span>Email</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {!isIndividual && (
                <p className="text-[11px] text-gray-500">
                  For businesses, we send the one-time code to the registered contact email.
                </p>
              )}

              <button
                type="submit"
                disabled={sendOtpMutation.isLoading}
                className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {sendOtpMutation.isLoading ? 'Sending code…' : 'Send code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
              <p className="text-xs text-gray-600 mb-2">
                Enter the 6-digit code we sent you. For this demo, the valid code is{' '}
                <span className="font-mono font-semibold bg-gray-100 px-1.5 py-0.5 rounded">123456</span>.
              </p>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  One-time code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.otp}
                  onChange={handleChange('otp')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-lg tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifyOtpMutation.isLoading}
                className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {verifyOtpMutation.isLoading ? 'Verifying…' : 'Verify & open proposal'}
              </button>
            </form>
          )}
        </motion.div>

        {/* Security footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Your data is encrypted and protected</span>
        </div>
      </main>

      {/* Cyprus eID Dialog */}
      <AnimatePresence>
        {eidDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Cyprus eID Provider</h2>
                    <p className="text-xs text-blue-100">Government Identity Service (Demo)</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Demo Mode:</strong> In production, you would be redirected to the official Cyprus eID portal to authenticate securely.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 mb-3">Simulated data:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Name:</span><br />
                        <span className="text-gray-900">{session?.customerName || 'Demo User'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <IdCard className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">ID:</span><br />
                        <span className="text-gray-900">X1234567</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span><br />
                        <span className="text-gray-900">12 March 1985</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Email:</span><br />
                        <span className="text-gray-900">{session?.prefilledEmail || 'eid.user@example.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleEidDemoCancel}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEidDemoConfirm}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm eID Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomerVerificationPage
