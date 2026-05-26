'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface OCRResult {
  supplier: string
  invoiceNumber: string | null
  date: string | null
  items: Array<{
    name: string
    quantity: number
    unit: string
    price: number
    subtotal: number
  }>
  total: number
  confidence: number
}

export default function InvoicePage() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    setProcessing(false)
    setOcrResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploading(false)
      setProcessing(true)

      const response = await fetch('/api/invoice/ocr', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'OCR failed')
      }

      setOcrResult(result.data)
      setProcessing(false)
    } catch (err: any) {
      setError(err.message)
      setUploading(false)
      setProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-[#27500A]'
    if (confidence >= 85) return 'text-[#854F0B]'
    return 'text-[#A32D2D]'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Smart Invoice</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            OCR powered by Claude AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#EAF3DE] text-[#27500A] px-2 py-1 rounded">
            <i className="ti ti-brain text-xs mr-1" aria-hidden="true"></i>
            Claude AI Active
          </span>
        </div>
      </div>

      {/* Upload Section */}
      {!ocrResult && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-6">
          <div 
            className="border-2 border-dashed border-[hsl(var(--color-border-secondary))] rounded-lg p-8 text-center"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
                <i className="ti ti-upload text-2xl text-[hsl(var(--color-text-secondary))]" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
                  Upload Invoice
                </p>
                <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                  Drag and drop or click to browse • JPG, PNG, WebP
                </p>
              </div>
              <label className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00] cursor-pointer">
                {uploading ? 'Uploading...' : processing ? 'Processing with AI...' : 'Select File'}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading || processing}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Processing Steps */}
      {processing && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] flex items-center justify-center text-xs font-medium text-[#FAC775]">
                ✓
              </div>
              <span className="text-sm text-[hsl(var(--color-text-primary))]">Upload</span>
            </div>
            <div className="flex-1 h-px bg-[hsl(var(--color-border-tertiary))]"></div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] flex items-center justify-center animate-pulse">
                <i className="ti ti-brain text-sm text-[#FAC775]" aria-hidden="true"></i>
              </div>
              <span className="text-sm text-[hsl(var(--color-text-primary))]">AI Processing</span>
            </div>
            <div className="flex-1 h-px bg-[hsl(var(--color-border-tertiary))]"></div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[hsl(var(--color-background-secondary))] flex items-center justify-center text-xs font-medium text-[hsl(var(--color-text-tertiary))]">
                3
              </div>
              <span className="text-sm text-[hsl(var(--color-text-tertiary))]">Review</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-[#FDEAEA] border border-[#A32D2D] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ti ti-alert-circle text-[#A32D2D] text-lg" aria-hidden="true"></i>
            <div>
              <p className="text-sm font-medium text-[#A32D2D] mb-1">OCR Failed</p>
              <p className="text-xs text-[#A32D2D]">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setError(null)}
            className="mt-3 text-sm text-[#7B3F00] hover:text-[#8B4A00] font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && (
        <div className="space-y-4">
          <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Extracted Data</h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getConfidenceColor(ocrResult.confidence)}`}>
                  Confidence: {ocrResult.confidence}%
                </span>
                <button 
                  onClick={() => setOcrResult(null)}
                  className="text-xs text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text-primary))]"
                >
                  Upload New
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  value={ocrResult.supplier}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={ocrResult.invoiceNumber || ''}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
                  Date
                </label>
                <input
                  type="text"
                  value={ocrResult.date || ''}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]"
                />
              </div>
            </div>

            <div className="border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(var(--color-background-secondary))] border-b border-[hsl(var(--color-border-tertiary))]">
                    <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Item</th>
                    <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Qty</th>
                    <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Unit</th>
                    <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Price</th>
                    <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ocrResult.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                      <td className="px-3 py-2 text-sm text-[hsl(var(--color-text-primary))]">{item.name}</td>
                      <td className="px-3 py-2 text-sm text-[hsl(var(--color-text-secondary))]">{item.quantity}</td>
                      <td className="px-3 py-2 text-sm text-[hsl(var(--color-text-secondary))]">{item.unit}</td>
                      <td className="px-3 py-2 text-sm text-[hsl(var(--color-text-secondary))]">RM {item.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm font-medium text-[hsl(var(--color-text-primary))]">RM {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[hsl(var(--color-background-secondary))]">
                    <td colSpan={4} className="px-3 py-2 text-sm font-medium text-[hsl(var(--color-text-primary))] text-right">Total</td>
                    <td className="px-3 py-2 text-sm font-semibold text-[hsl(var(--color-text-primary))]">RM {ocrResult.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-[#27500A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3B6D11]">
                <i className="ti ti-check text-sm mr-1" aria-hidden="true"></i>
                Approve & Update Inventory
              </button>
              <button className="bg-transparent border border-[#A32D2D] text-[#A32D2D] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#A32D2D] hover:text-white">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
