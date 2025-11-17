import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  User,
  Building,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Pen,
  Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import proposalsApi from '../../../api/proposalsApi'
import Loading from '../../../shared/components/Loading'

const STEPS = [
  { id: 'identity', label: 'Identity Verification', icon: User },
  { id: 'contact', label: 'Contact Verification', icon: Mail },
  { id: 'review', label: 'Review & Consent', icon: FileText },
  { id: 'signature', label: 'Signature', icon: Pen },
  { id: 'confirm', label: 'Confirm', icon: Lock },
]

export default function CustomerProposalSignPage() {
  const { proposalId } = useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)

  // Step 1: Identity data
  const [customerType, setCustomerType] = useState('Individual')
  const [identityData, setIdentityData] = useState({
    dateOfBirth: '',
    nationalId: '',
    idCountryOfIssue: 'CY',
    registrationNumber: '',
    registrationDate: '',
    registrationCountryOfIssue: 'CY',
  })

  // Step 2: Contact data
  const [contactData, setContactData] = useState({
    email: 'john.doe@email.com',
    phone: '+35799123456',
  })
  const [contactOtp, setContactOtp] = useState('')
  const [contactOtpSent, setContactOtpSent] = useState(false)

  // Step 3: Consents
  const [consents, setConsents] = useState({})

  // Step 4: Signature
  const [signatureType, setSignatureType] = useState('draw')
  const [signatureData, setSignatureData] = useState(null)
  const canvasRef = React.useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Step 5: Final OTP
  const [signingOtp, setSigningOtp] = useState('')
  const [signingOtpSent, setSigningOtpSent] = useState(false)

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['customer-proposal', proposalId],
    queryFn: () => proposalsApi.getCustomerProposal(proposalId),
  })

  const verifyIdentityMutation = useMutation({
    mutationFn: (data) => proposalsApi.verifyIdentity(proposalId, data),
    onSuccess: () => {
      toast.success('Identity verified successfully')
      setCurrentStep(1)
    },
  })

  const requestContactOtpMutation = useMutation({
    mutationFn: (data) => proposalsApi.requestContactOtp(proposalId, data),
    onSuccess: () => {
      setContactOtpSent(true)
      toast.success('OTP sent to your email/phone! Use 123456 for demo')
    },
  })

  const verifyContactOtpMutation = useMutation({
    mutationFn: (otp) => proposalsApi.verifyContactOtp(proposalId, otp),
    onSuccess: () => {
      toast.success('Contact verified successfully')
      setCurrentStep(2)
    },
  })

  const saveConsentsMutation = useMutation({
    mutationFn: (data) => proposalsApi.saveConsents(proposalId, data),
    onSuccess: () => {
      toast.success('Consents saved')
      setCurrentStep(3)
    },
  })

  const saveSignatureMutation = useMutation({
    mutationFn: (data) => proposalsApi.saveSignature(proposalId, data),
    onSuccess: () => {
      toast.success('Signature captured')
      setCurrentStep(4)
    },
  })

  const requestSigningOtpMutation = useMutation({
    mutationFn: () => proposalsApi.requestSigningOtp(proposalId),
    onSuccess: () => {
      setSigningOtpSent(true)
      toast.success('Final OTP sent! Use 123456 for demo')
    },
  })

  const verifySigningOtpMutation = useMutation({
    mutationFn: (otp) => proposalsApi.verifySigningOtp(proposalId, otp),
    onSuccess: () => {
      toast.success('Document signed successfully!')
      navigate('/customer/dashboard')
    },
  })

  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    const data = { customerType, ...identityData }
    verifyIdentityMutation.mutate(data)
  }

  const handleRequestContactOtp = (e) => {
    e.preventDefault()
    requestContactOtpMutation.mutate(contactData)
  }

  const handleVerifyContactOtp = (e) => {
    e.preventDefault()
    verifyContactOtpMutation.mutate(contactOtp)
  }

  const handleConsentsSubmit = (e) => {
    e.preventDefault()
    const requiredConsents = proposal?.consents?.filter((c) => c.isRequired) || []
    const allRequiredAccepted = requiredConsents.every((c) => consents[c.proposalConsentId])

    if (!allRequiredAccepted) {
      toast.error('Please accept all required consents')
      return
    }

    const consentsArray = Object.entries(consents).map(([id, value]) => ({
      proposalConsentId: id,
      value,
    }))
    saveConsentsMutation.mutate(consentsArray)
  }

  const handleSaveSignature = () => {
    if (signatureType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current
      const dataUrl = canvas.toDataURL()
      saveSignatureMutation.mutate({
        type: 'Draw',
        imageBase64: dataUrl,
      })
    }
  }

  const handleRequestSigningOtp = () => {
    requestSigningOtpMutation.mutate()
  }

  const handleVerifySigningOtp = (e) => {
    e.preventDefault()
    verifySigningOtpMutation.mutate(signingOtp)
  }

  // Canvas drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  if (isLoading) return <Loading fullScreen message="Loading proposal..." />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sign Proposal</h1>
              <p className="text-gray-600">{proposal?.proposalRef}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : isCompleted
                        ? 'bg-success-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <p className={`text-xs text-center ${isActive ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-full h-1 mt-2 ${
                        index < currentStep ? 'bg-success-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          {/* Step 0: Identity Verification */}
          {currentStep === 0 && (
            <form onSubmit={handleIdentitySubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Identity Verification</h2>
                <p className="text-gray-600 mb-6">
                  Please verify your identity using the information from the Insurance Core System.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCustomerType('Individual')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      customerType === 'Individual'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                    <p className="font-medium">Individual</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('Company')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      customerType === 'Company'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                    <p className="font-medium">Company</p>
                  </button>
                </div>
              </div>

              {customerType === 'Individual' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={identityData.dateOfBirth}
                      onChange={(e) =>
                        setIdentityData({ ...identityData, dateOfBirth: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      value={identityData.nationalId}
                      onChange={(e) =>
                        setIdentityData({ ...identityData, nationalId: e.target.value })
                      }
                      placeholder="ID123456"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Issue
                    </label>
                    <select
                      value={identityData.idCountryOfIssue}
                      onChange={(e) =>
                        setIdentityData({ ...identityData, idCountryOfIssue: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="CY">Cyprus</option>
                      <option value="GR">Greece</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={identityData.registrationNumber}
                      onChange={(e) =>
                        setIdentityData({ ...identityData, registrationNumber: e.target.value })
                      }
                      placeholder="HE123456"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Date
                    </label>
                    <input
                      type="date"
                      value={identityData.registrationDate}
                      onChange={(e) =>
                        setIdentityData({ ...identityData, registrationDate: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Registration
                    </label>
                    <select
                      value={identityData.registrationCountryOfIssue}
                      onChange={(e) =>
                        setIdentityData({
                          ...identityData,
                          registrationCountryOfIssue: e.target.value,
                        })
                      }
                      className="input"
                      required
                    >
                      <option value="CY">Cyprus</option>
                      <option value="GR">Greece</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={verifyIdentityMutation.isPending}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <span>{verifyIdentityMutation.isPending ? 'Verifying...' : 'Verify Identity'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 1: Contact Verification */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Verification</h2>
                <p className="text-gray-600 mb-6">
                  Verify your contact information with a one-time password.
                </p>
              </div>

              {!contactOtpSent ? (
                <form onSubmit={handleRequestContactOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={contactData.email}
                      onChange={(e) =>
                        setContactData({ ...contactData, email: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) =>
                        setContactData({ ...contactData, phone: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={requestContactOtpMutation.isPending}
                      className="btn btn-primary"
                    >
                      {requestContactOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyContactOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={contactOtp}
                      onChange={(e) =>
                        setContactOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="123456"
                      maxLength={6}
                      className="input tracking-widest text-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={verifyContactOtpMutation.isPending}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <span>{verifyContactOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Step 2: Review & Consent */}
          {currentStep === 2 && (
            <form onSubmit={handleConsentsSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Review & Consent</h2>
                <p className="text-gray-600 mb-6">
                  Please review and accept the required consents.
                </p>
              </div>

              {proposal?.consents && proposal.consents.length > 0 ? (
                <div className="space-y-4">
                  {proposal.consents.map((consent) => (
                    <div key={consent.proposalConsentId} className="p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents[consent.proposalConsentId] || false}
                          onChange={(e) =>
                            setConsents({
                              ...consents,
                              [consent.proposalConsentId]: e.target.checked,
                            })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {consent.label}
                            {consent.isRequired && (
                              <span className="text-danger-600 ml-1">*</span>
                            )}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No consents required for this proposal.</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saveConsentsMutation.isPending}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <span>{saveConsentsMutation.isPending ? 'Saving...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Signature */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Provide Signature</h2>
                <p className="text-gray-600 mb-6">Draw your signature in the box below.</p>
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border border-gray-300 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="btn btn-secondary mt-4"
                >
                  Clear
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  disabled={saveSignatureMutation.isPending}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <span>{saveSignatureMutation.isPending ? 'Saving...' : 'Save Signature'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Final Confirmation</h2>
                <p className="text-gray-600 mb-6">
                  Enter the OTP sent to your email/phone to complete the signing process.
                </p>
              </div>

              {!signingOtpSent ? (
                <div>
                  <button
                    type="button"
                    onClick={handleRequestSigningOtp}
                    disabled={requestSigningOtpMutation.isPending}
                    className="btn btn-primary"
                  >
                    {requestSigningOtpMutation.isPending ? 'Sending...' : 'Request OTP'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifySigningOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP to Sign
                    </label>
                    <input
                      type="text"
                      value={signingOtp}
                      onChange={(e) =>
                        setSigningOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="123456"
                      maxLength={6}
                      className="input tracking-widest text-lg"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={verifySigningOtpMutation.isPending}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {verifySigningOtpMutation.isPending ? 'Signing...' : 'Sign Document'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
