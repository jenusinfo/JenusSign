import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Printer,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  Send,
  Eye,
  Loader2,
  ChevronRight,
  PenTool,
  Check,
  Download,
  Upload,
  Scan,
  X,
  FileCheck,
  Stamp,
  AlertCircle,
  Info,
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
      { id: 'doc-1', name: 'Home Insurance Proposal', pages: 4, url: '/samples/proposal.pdf' },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3, url: '/samples/terms.pdf' },
      { id: 'doc-3', name: 'Privacy Policy', pages: 2, url: '/samples/privacy.pdf' },
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
      { id: 'doc-1', name: 'Motor Insurance Proposal', pages: 4, url: '/samples/proposal.pdf' },
      { id: 'doc-2', name: 'Terms & Conditions', pages: 3, url: '/samples/terms.pdf' },
    ],
  },
}

// Signing steps
const STEPS = {
  PRINT_DOCUMENTS: 1,
  CUSTOMER_SIGNS: 2,
  SCAN_UPLOAD: 3,
  AGENT_DECLARATION: 4,
  AGENT_OTP: 5,
  COMPLETE: 6,
}

const PhysicalSignatureUploadPage = () => {
  const { envelopeId } = useParams()
  const navigate = useNavigate()
  const { agent } = useAuthStore()

  // State
  const [currentStep, setCurrentStep] = useState(STEPS.PRINT_DOCUMENTS)
  const [isLoading, setIsLoading] = useState(false)
  const [envelope, setEnvelope] = useState(null)

  // Print state
  const [documentsPrinted, setDocumentsPrinted] = useState(false)
  const [printedDocuments, setPrintedDocuments] = useState({})

  // Physical sign state
  const [customerSigned, setCustomerSigned] = useState(false)
  const [witnessPresent, setWitnessPresent] = useState(false)
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0])

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Agent declaration state
  const [agentDeclarations, setAgentDeclarations] = useState({
    witnessedSignature: false,
    verifiedIdentity: false,
    customerConsented: false,
    uploadsAccurate: false,
  })

  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpResendTimer, setOtpResendTimer] = useState(0)
  const otpInputRefs = useRef([])

  // Load envelope
  useEffect(() => {
    const env = MOCK_ENVELOPES[envelopeId]
    if (env) {
      setEnvelope(env)
      const printed = {}
      env.documents.forEach(doc => { printed[doc.id] = false })
      setPrintedDocuments(printed)
    }
  }, [envelopeId])

  // OTP resend timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendTimer])

  const allDocumentsPrinted = Object.values(printedDocuments).every(v => v)
  const allDeclarationsConfirmed = Object.values(agentDeclarations).every(v => v)

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

  // File upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const newFiles = files.map((file, idx) => ({
        id: `file-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadedAt: new Date().toISOString(),
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
      toast.success(`${files.length} file(s) uploaded`)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Send OTP to agent
  const sendAgentOtp = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOtpSent(true)
      setOtpResendTimer(60)
      toast.success('OTP sent to your email')
    } catch (err) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP and complete
  const verifyOtpAndComplete = async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Documents sealed successfully')
      setCurrentStep(STEPS.COMPLETE)
    } catch (err) {
      toast.error('Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.COMPLETE))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, STEPS.PRINT_DOCUMENTS))

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
            <h1 className="text-2xl font-bold text-gray-900">Physical Signature Upload</h1>
            <p className="text-sm text-gray-500">{envelope.title} • {envelope.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          <PenTool className="w-4 h-4" />
          Print-Sign-Scan
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          {[
            { step: 1, label: 'Print' },
            { step: 2, label: 'Sign' },
            { step: 3, label: 'Scan' },
            { step: 4, label: 'Declare' },
            { step: 5, label: 'Seal' },
            { step: 6, label: 'Complete' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep >= item.step
                    ? currentStep === item.step ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  currentStep >= item.step ? 'text-purple-600 font-medium' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </div>
              {index < 5 && (
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
            {/* Step 1: Print Documents */}
            {currentStep === STEPS.PRINT_DOCUMENTS && (
              <motion.div
                key="print"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Print Documents</h2>
                    <p className="text-sm text-gray-500">Download and print all documents for physical signature</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Print all documents listed below. The customer will sign these physical copies.
                </p>

                <div className="space-y-3 mb-6">
                  {envelope.documents.map((doc) => (
                    <div key={doc.id} className={`border rounded-xl p-4 transition-colors ${
                      printedDocuments[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            printedDocuments[doc.id] ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {printedDocuments[doc.id] ? (
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
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setPrintedDocuments(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                              printedDocuments[doc.id]
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {printedDocuments[doc.id] ? 'Printed ✓' : 'Mark Printed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const allPrinted = {}
                    envelope.documents.forEach(doc => { allPrinted[doc.id] = true })
                    setPrintedDocuments(allPrinted)
                    toast.success('All documents marked as printed')
                  }}
                  className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Download className="w-5 h-5" />
                  Download All & Mark Printed
                </button>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!allDocumentsPrinted}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customer Signs */}
            {currentStep === STEPS.CUSTOMER_SIGNS && (
              <motion.div
                key="sign"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <PenTool className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Customer Physical Signature</h2>
                    <p className="text-sm text-gray-500">Have the customer sign the printed documents</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Physical Signature Instructions</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Ensure customer signs all pages that require signature</li>
                        <li>• Customer should use a blue or black pen</li>
                        <li>• Date should be added next to each signature</li>
                        <li>• Customer should initial any corrections</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Signing Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Signature Date</label>
                      <input
                        type="date"
                        value={signatureDate}
                        onChange={(e) => setSignatureDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={customerSigned}
                      onChange={(e) => setCustomerSigned(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Customer has signed all documents</p>
                      <p className="text-sm text-gray-500">
                        I confirm that <strong>{envelope.customer.name}</strong> has physically signed all required documents
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={witnessPresent}
                      onChange={(e) => setWitnessPresent(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">I witnessed the signature</p>
                      <p className="text-sm text-gray-500">
                        I was present when the customer signed the documents
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
                    disabled={!customerSigned || !witnessPresent}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Scan & Upload */}
            {currentStep === STEPS.SCAN_UPLOAD && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Scan className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Scan & Upload Signed Documents</h2>
                    <p className="text-sm text-gray-500">Upload scanned copies of the signed documents</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Scanning Requirements</p>
                      <ul className="text-sm text-amber-700 mt-2 space-y-1">
                        <li>• Scan at minimum 200 DPI resolution</li>
                        <li>• Ensure signatures are clearly visible</li>
                        <li>• Include all pages, even those without signatures</li>
                        <li>• PDF format preferred, images also accepted</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors mb-4"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Click to upload scanned documents</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG (max 25MB each)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</p>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={uploadedFiles.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Agent Declaration */}
            {currentStep === STEPS.AGENT_DECLARATION && (
              <motion.div
                key="declare"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Agent Declaration</h2>
                    <p className="text-sm text-gray-500">Confirm your declarations before sealing</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Important Legal Notice</p>
                      <p className="text-sm text-red-700 mt-1">
                        By completing this process, you are taking responsibility for verifying the authenticity 
                        of the physical signatures and uploading accurate scans. Your identity and actions will 
                        be recorded in the audit trail.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={agentDeclarations.witnessedSignature}
                      onChange={(e) => setAgentDeclarations(prev => ({ ...prev, witnessedSignature: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">I witnessed the physical signature</p>
                      <p className="text-sm text-gray-500">
                        I was physically present when the customer signed the documents
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={agentDeclarations.verifiedIdentity}
                      onChange={(e) => setAgentDeclarations(prev => ({ ...prev, verifiedIdentity: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">I verified the customer's identity</p>
                      <p className="text-sm text-gray-500">
                        I checked the customer's ID document and confirmed their identity as <strong>{envelope.customer.name}</strong>
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={agentDeclarations.customerConsented}
                      onChange={(e) => setAgentDeclarations(prev => ({ ...prev, customerConsented: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">The customer gave informed consent</p>
                      <p className="text-sm text-gray-500">
                        The customer understood the documents they were signing and consented willingly
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={agentDeclarations.uploadsAccurate}
                      onChange={(e) => setAgentDeclarations(prev => ({ ...prev, uploadsAccurate: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Uploaded scans are accurate</p>
                      <p className="text-sm text-gray-500">
                        The uploaded files are unaltered scans of the physically signed documents
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
                    disabled={!allDeclarationsConfirmed}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Seal
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Agent OTP */}
            {currentStep === STEPS.AGENT_OTP && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Stamp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Apply eSeal</h2>
                    <p className="text-sm text-gray-500">Verify your identity to seal the documents</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Agent eSeal Verification</p>
                      <p className="text-sm text-purple-700 mt-1">
                        An OTP will be sent to <strong>your email</strong> ({agent?.email || 'your registered email'}). 
                        Enter it below to apply the organizational eSeal to the documents.
                      </p>
                    </div>
                  </div>
                </div>

                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-2">OTP will be sent to:</p>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{agent?.email || 'agent@company.com'}</span>
                      </div>
                    </div>

                    <button
                      onClick={sendAgentOtp}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      Send OTP to My Email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">Enter the 6-digit code sent to your email</p>
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
                          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ))}
                    </div>

                    <button
                      onClick={verifyOtpAndComplete}
                      disabled={isLoading || otpCode.join('').length !== 6}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Stamp className="w-5 h-5" />
                          Apply eSeal & Complete
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      {otpResendTimer > 0 ? (
                        <p className="text-sm text-gray-500">Resend in {otpResendTimer}s</p>
                      ) : (
                        <button
                          onClick={sendAgentOtp}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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

            {/* Step 6: Complete */}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Sealed!</h2>
                <p className="text-gray-600 mb-6">
                  The physically signed documents have been uploaded and protected with an organizational eSeal.
                </p>

                {/* Download Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-purple-800 mb-3 flex items-center justify-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Documents Ready for Download
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        toast.success('Downloading sealed document...')
                        // In production: window.open(`/api/envelopes/${envelopeId}/sealed-document`, '_blank')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-purple-300 rounded-xl text-purple-700 font-medium hover:bg-purple-50 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Sealed Document
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Downloading audit trail...')
                        // In production: window.open(`/api/envelopes/${envelopeId}/audit-trail`, '_blank')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-purple-300 rounded-xl text-purple-700 font-medium hover:bg-purple-50 transition-colors"
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
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
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
                      <span className="font-medium text-purple-600">Physical Signature (Print-Sign-Scan)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signed By:</span>
                      <span className="font-medium">{envelope.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signature Date:</span>
                      <span className="font-medium">{signatureDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Witnessed By:</span>
                      <span className="font-medium">{agent?.name || 'Agent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uploaded By:</span>
                      <span className="font-medium text-purple-600">{agent?.name || 'Agent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">eSeal Applied By:</span>
                      <span className="font-medium text-purple-600">{agent?.name || 'Agent'} (OTP Verified)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Files Uploaded:</span>
                      <span className="font-medium">{uploadedFiles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timestamp:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Protection:</span>
                      <span className="font-medium text-purple-600">eSeal (JCC Trust Services)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Document Retention:</strong> The original physically signed documents should be 
                      retained per your organization's document retention policy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Link
                    to={`/portal/envelopes/${envelopeId}`}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
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
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signing Method</p>
                  <p className="font-medium text-purple-600">Physical Signature</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer (Signer)</p>
                  <p className="font-medium text-gray-900">{envelope.customer.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agent (Witness & eSeal)</p>
                  <p className="font-medium text-gray-900">{agent?.name || 'Current Agent'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stamp className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">eSeal Applied By</p>
                  <p className="font-medium text-indigo-600">Agent (OTP Required)</p>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-800">
                <strong>Note:</strong> Physical signatures are protected with an organizational eSeal. 
                The agent's identity is recorded as the person who uploaded and sealed the documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhysicalSignatureUploadPage
