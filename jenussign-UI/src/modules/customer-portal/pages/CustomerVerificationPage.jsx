import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  const [cameraReady, setCameraReady] = useState(false)

  // Separate refs for each file input to avoid conflicts
  const frontFileInputRef = useRef(null)
  const backFileInputRef = useRef(null)
  const selfieFileInputRef = useRef(null)
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

  const startCamera = useCallback(async (forSelfie = false) => {
    try {
      setCameraError(null)
      setCameraReady(false)

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
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

      // Small delay to ensure video element is mounted
      await new Promise(resolve => setTimeout(resolve, 100))

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('autoplay', 'true')
        videoRef.current.muted = true

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true)
              setCameraActive(true)
            })
            .catch(err => {
              console.error('Video play error:', err)
              setCameraError('Could not start video playback')
            })
        }
      } else {
        // Video ref not ready yet, try again after a short delay
        setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
            videoRef.current.play().catch(console.error)
            setCameraReady(true)
            setCameraActive(true)
          }
        }, 200)
      }

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
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setCameraReady(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  // FIX: Don't reset captureMode to 'upload' after capturing
  // Keep the camera mode so subsequent steps also use camera
  const handleCameraCapture = useCallback((type) => {
    const imageData = capturePhoto()
    if (!imageData) {
      toast.error('Could not capture image')
      return
    }

    // Stop camera after capture but keep captureMode as 'camera'
    stopCamera()

    if (type === 'front') {
      setIdFrontImage(imageData)
      toast.success('Front ID captured!')
    } else if (type === 'back') {
      setIdBackImage(imageData)
      toast.success('Back ID captured!')
    } else if (type === 'selfie') {
      setSelfieImage(imageData)
      toast.success('Selfie captured!')
    }
    // Note: We intentionally do NOT set setCaptureMode('upload') here
    // so that the next step continues with camera mode
  }, [capturePhoto, stopCamera])

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

    // Reset the input so the same file can be selected again if needed
    e.target.value = ''
  }

  const retakePhoto = (type) => {
    if (type === 'front') setIdFrontImage(null)
    else if (type === 'back') setIdBackImage(null)
    else if (type === 'selfie') setSelfieImage(null)

    // If in camera mode, restart the camera for retake
    if (captureMode === 'camera') {
      const forSelfie = type === 'selfie'
      startCamera(forSelfie)
    }
  }

  const toggleCaptureMode = useCallback((mode, forSelfie = false) => {
    if (mode === 'camera') {
      setCaptureMode('camera')
      startCamera(forSelfie)
    } else {
      setCaptureMode('upload')
      stopCamera()
    }
  }, [startCamera, stopCamera])

  // Handle advancing to next step - maintain camera mode if applicable
  const advanceToNextStep = useCallback((nextStep, forSelfie = false) => {
    setScanningStep(nextStep)
    // If we're in camera mode, start the camera for the next step
    if (captureMode === 'camera') {
      // Small delay to ensure the DOM updates with the new step's video element
      setTimeout(() => {
        startCamera(forSelfie)
      }, 100)
    }
  }, [captureMode, startCamera])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Process ID images (simulated OCR)
  const processIdImages = async () => {
    setIsProcessing(true)
    setScanningStep('processing')

    // Simulated OCR processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulated extracted data - use session data when available
    const mockExtractedData = {
      fullName: session?.customerName || 'ANDREAS CONSTANTINOU',
      idNumber: session?.eidData?.idNumber || session?.expectedIdNumber || ('K' + Math.floor(100000 + Math.random() * 900000)),
      dateOfBirth: session?.expectedDateOfBirth || '1985-03-12',
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
      nationalId: session.eidData?.idNumber || session.expectedIdNumber || 'X1234567',
      dateOfBirth: session.expectedDateOfBirth || '1985-03-12',
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

      {/* 1. Manual ID Entry Option */}
      <button
        onClick={() => setVerificationMethod('manual')}
        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Manual ID Entry</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-700 rounded-full">MANUAL</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isIndividual
                ? 'Provide your birth date and ID number manually'
                : 'Enter company registration details'}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <IdCard className="w-3 h-3" />
              <span>Quick and simple • No camera needed</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </button>

      {/* 2. Cyprus eID Verification Option */}
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
              <span className="font-semibold text-gray-900">Cyprus eID Verification</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">AUTOMATIC</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Instant verification using your government digital ID
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure • Full audit trail • eIDAS compliant</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </button>

      {/* 3. ID Scan & Selfie Option */}
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
                <span className="font-semibold text-gray-900">ID Scan & Selfie</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full">SMART SCAN</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Take photos of your ID card + a selfie for automatic verification
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-purple-600">
                <Camera className="w-3 h-3" />
                <span>Camera or upload • Data auto-extracted</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </button>
      )}
    </div>
  )

  // ID Scanning UI
  const IdScanningUI = () => (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['front', 'back', 'selfie'].map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scanningStep === s ? 'bg-purple-600 text-white' :
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
            {idx < 2 && <div className={`w-12 h-1 rounded ${(s === 'front' && idFrontImage) || (s === 'back' && idBackImage) ? 'bg-green-500' : 'bg-gray-200'
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'camera'
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
                  {/* FIX: Removed capture attribute to allow file picker on mobile */}
                  <input
                    ref={frontFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'front')}
                    className="hidden"
                  />
                  <button
                    onClick={() => frontFileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Select an existing photo from your device
                  </p>
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
                    {/* Loading indicator while camera initializes */}
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                          <p className="text-white text-sm">Starting camera...</p>
                        </div>
                      </div>
                    )}
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
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {cameraError}
                    </div>
                  )}
                  <button
                    onClick={() => handleCameraCapture('front')}
                    disabled={!cameraReady}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  onClick={() => advanceToNextStep('back', false)}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'camera'
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
                  {/* FIX: Removed capture attribute to allow file picker on mobile */}
                  <input
                    ref={backFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'back')}
                    className="hidden"
                  />
                  <button
                    onClick={() => backFileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Select an existing photo from your device
                  </p>
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
                    {/* Loading indicator while camera initializes */}
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                          <p className="text-white text-sm">Starting camera...</p>
                        </div>
                      </div>
                    )}
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
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {cameraError}
                    </div>
                  )}
                  <button
                    onClick={() => handleCameraCapture('back')}
                    disabled={!cameraReady}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  onClick={() => advanceToNextStep('selfie', true)}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => toggleCaptureMode('camera', true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${captureMode === 'camera'
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
                  {/* FIX: Removed capture attribute to allow file picker on mobile */}
                  <input
                    ref={selfieFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'selfie')}
                    className="hidden"
                  />
                  <button
                    onClick={() => selfieFileInputRef.current?.click()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Choose Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    Select an existing selfie from your device
                  </p>
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
                    {/* Loading indicator while camera initializes */}
                    {!cameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                          <p className="text-white text-sm">Starting camera...</p>
                        </div>
                      </div>
                    )}
                    {/* Face oval guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-4 border-white/50 rounded-full" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Position your face within the oval
                    </div>
                  </div>
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {cameraError}
                    </div>
                  )}
                  <button
                    onClick={() => handleCameraCapture('selfie')}
                    disabled={!cameraReady}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Continue to Contact Verification
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      )}

      {/* Back button for ID scanning steps */}
      {['front', 'back', 'selfie'].includes(scanningStep) && (
        <button
          onClick={() => {
            stopCamera()
            setVerificationMethod(null)
            setScanningStep('front')
            setIdFrontImage(null)
            setIdBackImage(null)
            setSelfieImage(null)
            setCaptureMode('upload')
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to verification options
        </button>
      )}
    </div>
  )

  // Manual Entry Form JSX for Individuals
  const manualEntryFormJSX = (
    <form onSubmit={handleIdentitySubmit} className="space-y-4 text-sm">
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
          National ID number
        </label>
        <input
          type="text"
          value={form.idNumber}
          onChange={handleChange('idNumber')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g. K123456"
          required
        />
      </div>

      <p className="text-[11px] text-gray-500 italic">
        For this demo, any valid date and ID will succeed.
      </p>

      <button
        type="submit"
        disabled={identityMutation.isLoading}
        className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {identityMutation.isLoading ? 'Verifying…' : 'Verify Identity'}
      </button>

      <button
        type="button"
        onClick={() => setVerificationMethod(null)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to verification options
      </button>
    </form>
  )

  // Business Form JSX
  const businessFormJSX = (
    <form onSubmit={handleIdentitySubmit} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          Date of Registration
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
          Registration Number (ΗΕ/ΑΕ/ΟΕ/ΛΤΔ)
        </label>
        <input
          type="text"
          value={form.registrationNumber}
          onChange={handleChange('registrationNumber')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g. HE12345"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
          <IdCard className="w-4 h-4 text-gray-400" />
          TIN (Tax Identification Number)
        </label>
        <input
          type="text"
          value={form.tin}
          onChange={handleChange('tin')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g. 12345678A"
          required
        />
      </div>

      <p className="text-[11px] text-gray-500 italic">
        For this demo, any values will succeed.
      </p>

      <button
        type="submit"
        disabled={identityMutation.isLoading}
        className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {identityMutation.isLoading ? 'Verifying…' : 'Verify Business'}
      </button>

      <button
        type="button"
        onClick={() => setVerificationMethod(null)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to verification options
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Compact header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Secure Verification
            </h1>
            <p className="text-[11px] text-gray-500">
              {session.companyName}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { key: 'identity', label: 'Identity' },
            { key: 'contact', label: 'Contact' },
            { key: 'otp', label: 'Confirm' },
          ].map((s, idx) => (
            <React.Fragment key={s.key}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${step === s.key
                    ? 'bg-primary-600 text-white'
                    : idx < ['identity', 'contact', 'otp'].indexOf(step)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
              >
                {idx < ['identity', 'contact', 'otp'].indexOf(step) ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-4 text-center">{idx + 1}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < 2 && <div className="w-6 h-0.5 bg-gray-200 rounded" />}
            </React.Fragment>
          ))}
        </div>

        {/* Main content card */}
        <motion.div
          key={step + verificationMethod}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
        >
          {/* Step 1: Identity Verification */}
          {step === 'identity' && (
            <>
              {!verificationMethod ? (
                <VerificationMethodSelection />
              ) : verificationMethod === 'idscan' ? (
                <IdScanningUI />
              ) : verificationMethod === 'manual' ? (
                isIndividual ? manualEntryFormJSX : businessFormJSX
              ) : null}
            </>
          )}

          {/* Step 2: Contact confirmation */}
          {step === 'contact' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
              <p className="text-xs text-gray-600 mb-2">
                Please confirm your contact details so we can send you a one-time code.
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
                        <span className="text-gray-900">{session?.eidData?.idNumber || session?.expectedIdNumber || 'X1234567'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span><br />
                        <span className="text-gray-900">{session?.eidData?.dateOfBirth || '12 March 1985'}</span>
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
