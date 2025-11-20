// SignatureCelebrationPopup.jsx
import React from 'react'

export default function SignatureCelebrationPopup({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-w-sm rounded-3xl bg-slate-900 px-6 py-6 text-center text-slate-50 shadow-2xl animate-fadeIn">
        
        <div className="text-4xl mb-3">🔥</div>

        <p className="text-sm font-bold text-amber-300 tracking-wide">
          CONFIRMED!
        </p>

        <p className="text-sm text-gray-200 mt-2">
          Your coverage just got locked in with one click!
        </p>

        <p className="text-sm mt-1 font-semibold text-emerald-300 flex items-center justify-center gap-1">
          Hydra mode: ON <span>🛡️</span>
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md hover:bg-emerald-300 transition"
        >
          Awesome, show me my signed document
        </button>
      </div>
    </div>
  )
}
