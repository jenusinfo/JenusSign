import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Type,
  Check,
  X,
  RefreshCw,
} from 'lucide-react'

/**
 * SignatureCapture Component
 * 
 * A comprehensive signature capture component with three modes:
 * - Draw: Touch/mouse drawing on canvas
 * - Type: Type name and select from script fonts
 * - Upload: Upload signature image file
 * 
 * Props:
 * - onSignatureChange: Callback with { hasSignature: boolean, dataUrl: string|null, method: 'draw'|'type'|'upload' }
 * - defaultName: Pre-fill name for typed signature (e.g., from verification)
 * - width: Canvas width (default: 600)
 * - height: Canvas height (default: 220)
 * - disabled: Disable all interactions
 */

// Google Fonts script font options
const SIGNATURE_FONTS = [
  { id: 'dancing', name: 'Dancing Script', family: "'Dancing Script', cursive", weight: '700' },
  { id: 'greatvibes', name: 'Great Vibes', family: "'Great Vibes', cursive", weight: '400' },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", weight: '400' },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive", weight: '400' },
]

// Load Google Fonts
const loadGoogleFonts = () => {
  const fontFamilies = SIGNATURE_FONTS.map(f => 
    `${f.name.replace(' ', '+')}:wght@${f.weight}`
  ).join('&family=')
  
  const linkId = 'signature-google-fonts'
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`
    document.head.appendChild(link)
  }
}

export default function SignatureCapture({
  onSignatureChange,
  defaultName = '',
  width = 600,
  height = 220,
  disabled = false,
}) {
  // Tab state
  const [activeTab, setActiveTab] = useState('draw') // 'draw' | 'type' | 'upload'
  
  // Draw state
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const [hasDrawing, setHasDrawing] = useState(false)
  
  // Type state
  const [typedName, setTypedName] = useState(defaultName)
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0])
  const typeCanvasRef = useRef(null)
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Load fonts on mount
  useEffect(() => {
    loadGoogleFonts()
  }, [])

  // Update parent when signature changes
  const notifyChange = useCallback((hasSignature, dataUrl, method) => {
    if (onSignatureChange) {
      onSignatureChange({ hasSignature, dataUrl, method })
    }
  }, [onSignatureChange])

  // ============ DRAW MODE ============
  
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  useEffect(() => {
    initCanvas()
  }, [initCanvas])

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
    if (disabled) return
    e.preventDefault()
    isDrawingRef.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleDraw = (e) => {
    if (!isDrawingRef.current || disabled) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handleEndDraw = (e) => {
    if (!isDrawingRef.current) return
    e?.preventDefault()
    isDrawingRef.current = false
    
    // Check if canvas has content
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const hasContent = imageData.data.some((pixel, index) => {
        // Check non-alpha channels for non-background color
        if (index % 4 === 3) return false // Skip alpha
        const bgValue = index % 4 === 0 ? 249 : index % 4 === 1 ? 250 : 251 // #f9fafb
        return Math.abs(pixel - bgValue) > 10
      })
      
      setHasDrawing(hasContent)
      if (hasContent) {
        notifyChange(true, canvas.toDataURL('image/png'), 'draw')
      }
    }
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
    notifyChange(false, null, 'draw')
  }

  // Touch events
  const handleTouchStart = (e) => handleStartDraw(e)
  const handleTouchMove = (e) => handleDraw(e)
  const handleTouchEnd = (e) => handleEndDraw(e)

  // ============ TYPE MODE ============
  
  const renderTypedSignature = useCallback(() => {
    const canvas = typeCanvasRef.current
    if (!canvas || !typedName.trim()) return null
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set font and measure
    const fontSize = Math.min(72, Math.max(36, 400 / typedName.length))
    ctx.font = `${selectedFont.weight} ${fontSize}px ${selectedFont.family}`
    ctx.fillStyle = '#1e3a5f'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Draw the signature
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2)
    
    return canvas.toDataURL('image/png')
  }, [typedName, selectedFont])

  useEffect(() => {
    if (activeTab === 'type' && typedName.trim()) {
      // Small delay to ensure fonts are loaded
      const timer = setTimeout(() => {
        const dataUrl = renderTypedSignature()
        if (dataUrl) {
          notifyChange(true, dataUrl, 'type')
        }
      }, 100)
      return () => clearTimeout(timer)
    } else if (activeTab === 'type') {
      notifyChange(false, null, 'type')
    }
  }, [activeTab, typedName, selectedFont, renderTypedSignature, notifyChange])

  // ============ UPLOAD MODE ============
  
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadPreview(event.target.result)
      notifyChange(true, event.target.result, 'upload')
    }
    reader.readAsDataURL(file)
  }

  const handleClearUpload = () => {
    setUploadedFile(null)
    setUploadPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    notifyChange(false, null, 'upload')
  }

  // ============ TAB CHANGE ============
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    
    // Notify parent about current signature state for new tab
    if (tab === 'draw') {
      notifyChange(hasDrawing, hasDrawing ? canvasRef.current?.toDataURL('image/png') : null, 'draw')
    } else if (tab === 'type') {
      const hasTyped = typedName.trim().length > 0
      notifyChange(hasTyped, hasTyped ? renderTypedSignature() : null, 'type')
    } else if (tab === 'upload') {
      notifyChange(!!uploadPreview, uploadPreview, 'upload')
    }
  }

  // ============ RENDER ============
  
  const tabs = [
    { id: 'draw', label: 'Draw', icon: FileText },
    { id: 'type', label: 'Type', icon: Type },
    { id: 'upload', label: 'Upload', icon: Upload },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            disabled={disabled}
            className={`
              flex-1 inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 
              rounded-lg text-sm font-medium border transition-all
              ${activeTab === id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* DRAW TAB */}
        {activeTab === 'draw' && (
          <motion.div
            key="draw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden"
              style={{
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            >
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full cursor-crosshair block"
                style={{
                  height: `${height}px`,
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  msTouchAction: 'none',
                }}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDraw}
                onMouseUp={handleEndDraw}
                onMouseLeave={handleEndDraw}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
            
            <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
              <span>Use your mouse or finger (on touch devices) to draw your signature.</span>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  disabled={disabled}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClearCanvas()
                  }}
                  disabled={disabled}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TYPE TAB */}
        {activeTab === 'type' && (
          <motion.div
            key="type"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Type your full name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your name..."
                disabled={disabled}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:bg-gray-100"
                maxLength={50}
              />
            </div>

            {/* Font Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select signature style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SIGNATURE_FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font)}
                    disabled={disabled || !typedName.trim()}
                    className={`
                      relative p-3 rounded-xl border-2 transition-all text-center
                      ${selectedFont.id === font.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${(!typedName.trim() || disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {selectedFont.id === font.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className="text-xl text-gray-800 truncate h-8 flex items-center justify-center"
                      style={{ fontFamily: font.family, fontWeight: font.weight }}
                    >
                      {typedName.trim() || 'Sample'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 truncate">
                      {font.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {typedName.trim() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-6 flex items-center justify-center min-h-[120px]">
                  <div
                    className="text-4xl sm:text-5xl text-[#1e3a5f] text-center break-words max-w-full"
                    style={{ fontFamily: selectedFont.family, fontWeight: selectedFont.weight }}
                  >
                    {typedName}
                  </div>
                </div>
                
                {/* Hidden canvas for generating image */}
                <canvas
                  ref={typeCanvasRef}
                  width={width}
                  height={height}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {!typedName.trim() && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8 text-center">
                <Type className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Type your name above to see the signature preview
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTypedName('')}
                disabled={disabled || !typedName}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {!uploadPreview ? (
              <label
                className={`
                  border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 
                  p-8 flex flex-col items-center justify-center cursor-pointer
                  hover:border-blue-400 hover:bg-blue-50 transition-colors
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={disabled}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload signature image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, or GIF up to 5MB
                </p>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-green-200 rounded-xl bg-green-50 p-4 flex items-center justify-center">
                  <img
                    src={uploadPreview}
                    alt="Uploaded signature"
                    className="max-w-full max-h-40 object-contain"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">
                      {uploadedFile?.name || 'Signature uploaded'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearUpload}
                    disabled={disabled}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
