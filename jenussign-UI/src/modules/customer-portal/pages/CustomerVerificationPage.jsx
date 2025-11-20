import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
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
  const [verificationMethod, setVerificationMethod] = useState('manual') // 'manual' | 'eid'
  const [eidDialogOpen, setEidDialogOpen] = useState(false)
  const [form, setForm] = useState({
    dateOfBirth: '',
    idNumber: '',
    dateOfRegistration: '',
    registrationNumber: '',
    tin: '',
    email: '',
    mobile: '',
    channel: 'EMAIL', // 'SMS' | 'EMAIL'
    otp: '',
  })

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

      // Mark customer as "logged in" for this proposal
      const emailToUse = form.email || session.prefilledEmail
      setCustomerAuth({ email: emailToUse })

      toast.success('Contact verified. Loading your proposal…')

      // Navigate into existing signing page (protected route)
      navigate(`/customer/proposals/${session.proposalId}/sign`)
    },
    onError: () => {
      toast.error('Could not verify code. Please try again.')
    },
  })

  // ----- Handlers -----

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    if (!session) return

    setVerificationMethod('manual')

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

    // Simulated data returned by Cyprus eID
    const eidPayload = {
      fullName: session.customerName || 'Cyprus eID Demo User',
      nationalId: 'X1234567',
      dateOfBirth: '1985-03-12',
      email: session.prefilledEmail || 'eid.user@example.com',
      mobile: session.prefilledMobile || '+357 99 123456',
    }

    // Pre-fill identity (for individuals)
    setForm((prev) => ({
      ...prev,
      dateOfBirth: eidPayload.dateOfBirth,
      idNumber: eidPayload.nationalId,
    }))

    // Pre-fill contact
    setForm((prev) => ({
      ...prev,
      email: eidPayload.email || prev.email,
      mobile: eidPayload.mobile || prev.mobile,
      channel: eidPayload.mobile ? 'SMS' : 'EMAIL',
    }))

    toast.success('Verified via Cyprus eID (demo). Please confirm your contact details.')

    // Skip manual identity form and go to contact step
    setStep('contact')
    setEidDialogOpen(false)
  }

  // ----- Render -----

  if (isLoading || !session) {
    return <Loading fullScreen message="Loading your secure signing session." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/customer/login')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-primary-600" />
            <span>Secure signing powered by JenusSign</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Session summary card */}
        <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Signing Invitation
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {isIndividual ? 'Individual customer' : 'Business customer'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We just need to confirm your identity and contact details before showing your proposal.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-gray-500">
            <p>Proposal ID: {session.proposalId}</p>
            <p>Link token: {token.slice(0, 6)}••••</p>
            <p>Requested: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* eID option – individuals only */}
        {isIndividual && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-900">
                Prefer to use your national digital identity?
              </p>
              <p className="text-[11px] text-blue-900/80 mt-0.5">
                In production, you would be redirected to the official Cyprus eID portal. In this demo,
                we simulate that, pre-fill your identity and contact details, and still verify your
                contact with a one-time code.
              </p>
            </div>
            <button
              type="button"
              onClick={openEidDialog}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold">
                eID
              </span>
              <span>Verify with Cyprus eID (Demo)</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Step description */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <h1 className="text-sm font-semibold text-gray-900">
                {step === 'identity' && 'Step 1 · Confirm your identity'}
                {step === 'contact' && 'Step 2 · Confirm your contact details'}
                {step === 'otp' && 'Step 3 · Enter your one-time code'}
              </h1>
            </div>

            <ol className="space-y-2 text-xs text-gray-600">
              <li className={step === 'identity' ? 'font-semibold text-gray-900' : ''}>
                1. Confirm identity ({isIndividual ? 'date of birth & ID' : 'registration details'})
              </li>
              <li className={step === 'contact' ? 'font-semibold text-gray-900' : ''}>
                2. Confirm email {isIndividual && 'and mobile'} and receive a one-time code
                {verificationMethod === 'eid' && ' (prefilled via eID in this demo)'}
              </li>
              <li className={step === 'otp' ? 'font-semibold text-gray-900' : ''}>
                3. Enter the code to open your proposal and sign
              </li>
            </ol>

            <div className="pt-2 border-t border-dashed border-gray-200 mt-2 text-xs text-gray-500">
              <p>
                We never ask for your password or banking PIN. If something looks suspicious,
                close this window and contact your insurance provider.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: Dynamic form per step */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            {step === 'identity' && (
              <form onSubmit={handleIdentitySubmit} className="space-y-4 text-sm">
                <p className="text-xs text-gray-600 mb-2">
                  Please enter the details that we have on file for you.
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
                        ID / Passport number
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
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        Date of registration
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
                        Registration number or TIN
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
              </form>
            )}

            {step === 'contact' && (
              <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
                <p className="text-xs text-gray-600 mb-2">
                  Confirm how we can reach you. We’ll send a one-time code to open your proposal.
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
                  Enter the 6-digit code we sent you. For this prototype, the valid code is{' '}
                  <span className="font-mono font-semibold">123456</span>.
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-[0.3em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        </div>
      </main>

      {/* Fake Cyprus eID popup */}
      {eidDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Cyprus eID Provider (Demo)
              </h2>
            </div>

            <p className="text-xs text-gray-600">
              In a real integration, you would be redirected to the official Cyprus eID portal to
              authenticate. For this demo, we simulate that step and return verified identity data.
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 space-y-1 text-xs text-gray-800">
              <p className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <span>
                  <span className="font-medium">Name:</span>{' '}
                  {session?.customerName || 'Cyprus eID Demo User'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <IdCard className="w-3 h-3 text-gray-400" />
                <span>
                  <span className="font-medium">National ID:</span> X1234567
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>
                  <span className="font-medium">Date of birth:</span> 1985-03-12
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span>
                  <span className="font-medium">Email:</span>{' '}
                  {session?.prefilledEmail || 'eid.user@example.com'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>
                  <span className="font-medium">Mobile:</span>{' '}
                  {session?.prefilledMobile || '+357 99 123456'}
                </span>
              </p>
            </div>

            <p className="text-[11px] text-gray-500">
              By clicking <span className="font-semibold">Confirm</span>, you simulate a successful
              eID login and allow us to use these details to pre-fill your verification steps.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleEidDemoCancel}
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEidDemoConfirm}
                className="px-3 py-2 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Confirm eID Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerVerificationPage
