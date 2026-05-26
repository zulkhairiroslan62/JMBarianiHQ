'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface OCRResult {
  supplier: string
  invoiceNumber: string | null
  date: string | null
  items: Array<{ name: string; quantity: number; unit: string; price: number; subtotal: number }>
  total: number
  confidence: number
}

export default function InvoicePage() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null)
  const [editableResult, setEditableResult] = useState<OCRResult | null>(null)
  const uploadedFileRef = useRef<File | null>(null)

  const handleFileUpload = async (file: File) => {
    setError(null)
    setSuccessMsg(null)
    setSavedInvoiceId(null)
    setUploading(true)
    setProcessing(false)
    setOcrResult(null)
    uploadedFileRef.current = file

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
      if (!response.ok) throw new Error(result.error || 'OCR failed')

      setOcrResult(result.data)
      setEditableResult({ ...result.data })
      setProcessing(false)
    } catch (err: any) {
      setError(err.message)
      setUploading(false)
      setProcessing(false)
    }
  }

  const handleApprove = async () => {
    if (!editableResult) return
    setSaving(true)
    setError(null)

    try {
      // Convert uploaded image to base64
      let imageBase64 = ''
      if (uploadedFileRef.current) {
        const bytes = await uploadedFileRef.current.arrayBuffer()
        const buffer = Buffer.from(bytes)
        imageBase64 = `data:${uploadedFileRef.current.type};base64,${buffer.toString('base64')}`
      }

      const response = await fetch('/api/invoice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editableResult,
          imageBase64,
          outletId: (session?.user as any)?.outletId || undefined,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Save failed')

      setSavedInvoiceId(result.invoiceId)
      setSuccessMsg(`Invoice approved! ${result.itemsCreated} items recorded. Inventory & PO updated.`)
      setSaving(false)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFileUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-[#27500A]'
    if (confidence >= 85) return 'text-[#854F0B]'
    return 'text-[#A32D2D]'
  }

  const handleFieldUpdate = (field: string, value: string) => {
    if (!editableResult) return
    if (field === 'supplier') setEditableResult({ ...editableResult, supplier: value })
    else if (field === 'invoiceNumber') setEditableResult({ ...editableResult, invoiceNumber: value })
    else if (field === 'date') setEditableResult({ ...editableResult, date: value })
  }

  const handleItemUpdate = (idx: number, field: string, value: string) => {
    if (!editableResult) return
    const items = [...editableResult.items]
    if (field === 'name') items[idx] = { ...items[idx], name: value }
    else if (field === 'quantity') items[idx] = { ...items[idx], quantity: parseFloat(value) || 0 }
    else if (field === 'price') items[idx] = { ...items[idx], price: parseFloat(value) || 0, subtotal: (parseFloat(value) || 0) * items[idx].quantity }
    const newTotal = items.reduce((sum, i) => sum + i.subtotal, 0)
    setEditableResult({ ...editableResult, items, total: newTotal })
  }

  const result = editableResult || ocrResult

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Smart Invoice</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">OCR powered by Claude AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/invoice/history" className="text-[11px] px-3 py-1.5 rounded bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]">
            <i className="ti ti-history text-xs mr-1" aria-hidden="true"></i>Invoice History
          </Link>
          <span className="text-[11px] bg-[#EAF3DE] text-[#27500A] px-2 py-1 rounded">
            <i className="ti ti-brain text-xs mr-1" aria-hidden="true"></i>Claude AI Active
          </span>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-[#EAF3DE] border border-[#27500A] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ti ti-circle-check text-[#27500A] text-lg" aria-hidden="true"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#27500A] mb-1">Invoice Approved!</p>
              <p className="text-xs text-[#27500A]">{successMsg}</p>
              <div className="flex gap-3 mt-3">
                <Link href="/dashboard/invoice/history" className="text-xs font-medium text-[#27500A] underline">View History</Link>
                <button onClick={() => { setOcrResult(null); setEditableResult(null); setSuccessMsg(null); setSavedInvoiceId(null) }} className="text-xs font-medium text-[#27500A] underline">Upload New</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!result && !successMsg && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-6">
          <div className="border-2 border-dashed border-[hsl(var(--color-border-secondary))] rounded-lg p-8 text-center"
            onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
                <i className="ti ti-upload text-2xl text-[hsl(var(--color-text-secondary))]" aria-hidden="true"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">Upload Invoice</p>
                <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Drag and drop or click to browse &bull; JPG, PNG, WebP</p>
              </div>
              <label className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00] cursor-pointer">
                {uploading ? 'Uploading...' : processing ? 'Processing with AI...' : 'Select File'}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={uploading || processing} />
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
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] flex items-center justify-center text-xs font-medium text-[#FAC775]">&#10003;</div>
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
              <div className="w-7 h-7 rounded-full bg-[hsl(var(--color-background-secondary))] flex items-center justify-center text-xs font-medium text-[hsl(var(--color-text-tertiary))]">3</div>
              <span className="text-sm text-[hsl(var(--color-text-tertiary))]">Review</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#FDEAEA] border border-[#A32D2D] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ti ti-alert-circle text-[#A32D2D] text-lg" aria-hidden="true"></i>
            <div>
              <p className="text-sm font-medium text-[#A32D2D] mb-1">{saving ? 'Save Failed' : 'OCR Failed'}</p>
              <p className="text-xs text-[#A32D2D]">{error}</p>
            </div>
          </div>
          <button onClick={() => setError(null)} className="mt-3 text-sm text-[#7B3F00] hover:text-[#8B4A00] font-medium">Try Again</button>
        </div>
      )}

      {/* OCR Results */}
      {result && !successMsg && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Extracted Data</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getConfidenceColor(ocrResult?.confidence || 0)}`}>
                Confidence: {ocrResult?.confidence || 0}%
              </span>
              <button onClick={() => { setOcrResult(null); setEditableResult(null) }} className="text-xs text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text-primary))]">Upload New</button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">Supplier</label>
              <input type="text" value={result.supplier} onChange={(e) => handleFieldUpdate('supplier', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">Invoice #</label>
              <input type="text" value={result.invoiceNumber || ''} onChange={(e) => handleFieldUpdate('invoiceNumber', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">Date</label>
              <input type="text" value={result.date || ''} onChange={(e) => handleFieldUpdate('date', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
            </div>
          </div>

          <div className="border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--color-background-secondary))] border-b border-[hsl(var(--color-border-tertiary))]">
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Item</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Qty</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Price</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                    <td className="px-3 py-1.5"><input type="text" value={item.name} onChange={(e) => handleItemUpdate(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-primary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5"><input type="number" value={item.quantity} onChange={(e) => handleItemUpdate(idx, 'quantity', e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-secondary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5"><input type="number" step="0.01" value={item.price} onChange={(e) => handleItemUpdate(idx, 'price', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-secondary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--color-text-primary))]">RM {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-[hsl(var(--color-background-secondary))]">
                  <td colSpan={3} className="px-3 py-2 text-sm font-medium text-[hsl(var(--color-text-primary))] text-right">Total</td>
                  <td className="px-3 py-2 text-sm font-semibold text-[hsl(var(--color-text-primary))]">RM {result.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleApprove} disabled={saving}
              className="flex-1 bg-[#27500A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3B6D11] disabled:opacity-50">
              <i className="ti ti-check text-sm mr-1" aria-hidden="true"></i>
              {saving ? 'Saving...' : 'Approve & Update Inventory'}
            </button>
            <button onClick={() => { setOcrResult(null); setEditableResult(null) }}
              className="bg-transparent border border-[#A32D2D] text-[#A32D2D] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#A32D2D] hover:text-white">
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
