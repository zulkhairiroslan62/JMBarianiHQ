'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface OCRResult {
  supplier: string; invoiceNumber: string | null; date: string | null
  items: Array<{ name: string; quantity: number; unit: string; price: number; subtotal: number }>
  total: number; confidence: number
}

export default function InvoicePage() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<{ text: string; invoiceId: string } | null>(null)
  const [editableResult, setEditableResult] = useState<OCRResult | null>(null)
  const uploadedFileRef = useRef<File | null>(null)

  const handleFileUpload = async (file: File) => {
    setError(null); setSuccessMsg(null); setUploading(true); setProcessing(false)
    setOcrResult(null); setEditableResult(null)
    uploadedFileRef.current = file
    try {
      const formData = new FormData(); formData.append('file', file)
      setUploading(false); setProcessing(true)
      const res = await fetch('/api/invoice/ocr', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'OCR failed')
      // Check for duplicate detection from OCR
      if (result.error === 'duplicate') throw new Error(result.message)
      setOcrResult(result.data); setEditableResult({ ...result.data }); setProcessing(false)
    } catch (err: any) { setError(err.message); setUploading(false); setProcessing(false) }
  }

  const handleApprove = async () => {
    if (!editableResult) return
    setSaving(true); setError(null)
    try {
      let imageBase64 = ''
      if (uploadedFileRef.current) {
        const bytes = await uploadedFileRef.current.arrayBuffer()
        imageBase64 = `data:${uploadedFileRef.current.type};base64,${Buffer.from(bytes).toString('base64')}`
      }
      const res = await fetch('/api/invoice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editableResult, imageBase64, outletId: (session?.user as any)?.outletId }),
      })
      const result = await res.json()
      if (!res.ok) {
        if (result.error === 'duplicate') throw new Error(result.message)
        throw new Error(result.error || 'Save failed')
      }
      setSuccessMsg({
        text: `Approved! ${result.itemsCreated} items recorded. ${result.inventory?.length || 0} inventory items updated. PO #${result.poCreated?.substring(0, 8)} created.`,
        invoiceId: result.invoiceId,
      })
      setSaving(false)
    } catch (err: any) { setError(err.message); setSaving(false) }
  }

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFileUpload(f) }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }
  const resetAll = () => { setOcrResult(null); setEditableResult(null); setSuccessMsg(null); setError(null) }
  const getConfidenceColor = (c: number) => c >= 95 ? 'text-[#27500A]' : c >= 85 ? 'text-[#854F0B]' : 'text-[#A32D2D]'

  const handleFieldUpdate = (f: string, v: string) => {
    if (!editableResult) return
    if (f === 'supplier') setEditableResult({ ...editableResult, supplier: v })
    else if (f === 'invoiceNumber') setEditableResult({ ...editableResult, invoiceNumber: v })
    else if (f === 'date') setEditableResult({ ...editableResult, date: v })
  }
  const handleItemUpdate = (idx: number, f: string, v: string) => {
    if (!editableResult) return
    const items = [...editableResult.items]
    if (f === 'name') items[idx] = { ...items[idx], name: v }
    else if (f === 'qty') items[idx] = { ...items[idx], quantity: parseFloat(v) || 0, subtotal: (items[idx].price) * (parseFloat(v) || 0) }
    else if (f === 'price') items[idx] = { ...items[idx], price: parseFloat(v) || 0, subtotal: items[idx].quantity * (parseFloat(v) || 0) }
    setEditableResult({ ...editableResult, items, total: items.reduce((s, i) => s + i.subtotal, 0) })
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
            <i className="ti ti-history text-xs mr-1" aria-hidden="true"></i>History</Link>
          <span className="text-[11px] bg-[#EAF3DE] text-[#27500A] px-2 py-1 rounded">
            <i className="ti ti-brain text-xs mr-1" aria-hidden="true"></i>Active</span>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="bg-[#EAF3DE] border border-[#27500A] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ti ti-circle-check text-[#27500A] text-lg" aria-hidden="true"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#27500A] mb-1">Invoice Approved! &#10003;</p>
              <p className="text-xs text-[#27500A]">{successMsg.text}</p>
              <div className="flex gap-4 mt-3">
                <Link href="/dashboard/invoice/history" className="text-xs font-medium text-[#27500A] underline">View History</Link>
                <button onClick={resetAll} className="text-xs font-medium text-[#27500A] underline">Upload New</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      {!result && !successMsg && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-6">
          <div className="border-2 border-dashed border-[hsl(var(--color-border-secondary))] rounded-lg p-8 text-center"
            onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
                <i className="ti ti-upload text-2xl text-[hsl(var(--color-text-secondary))]" aria-hidden="true"></i></div>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">Upload Invoice</p>
                <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Drag & drop or click to browse &bull; JPG, PNG</p>
              </div>
              <label className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-[#8B4A00]">
                {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Select File'}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={uploading || processing} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] text-xs font-medium text-[#FAC775] flex items-center justify-center">&#10003;</div>
              <span className="text-sm text-[hsl(var(--color-text-primary))]">Upload</span></div>
            <div className="flex-1 h-px bg-[hsl(var(--color-border-tertiary))]"></div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] animate-pulse flex items-center justify-center">
                <i className="ti ti-brain text-sm text-[#FAC775]" aria-hidden="true"></i></div>
              <span className="text-sm text-[hsl(var(--color-text-primary))]">AI Processing</span></div>
            <div className="flex-1 h-px bg-[hsl(var(--color-border-tertiary))]"></div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[hsl(var(--color-background-secondary))] text-xs font-medium text-[hsl(var(--color-text-tertiary))] flex items-center justify-center">3</div>
              <span className="text-sm text-[hsl(var(--color-text-tertiary))]">Review</span></div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#FDEAEA] border border-[#A32D2D] rounded-lg p-4">
          <div className="flex items-start gap-2">
            <i className="ti ti-alert-circle text-[#A32D2D] text-lg mt-0.5" aria-hidden="true"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#A32D2D] mb-1">{saving ? 'Error' : 'OCR Failed'}</p>
              <p className="text-xs text-[#A32D2D]">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-xs text-[#7B3F00] underline self-start">Dismiss</button>
          </div>
        </div>
      )}

      {/* OCR Results */}
      {result && !successMsg && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Extracted Data</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getConfidenceColor(ocrResult?.confidence || 0)}`}>
                {ocrResult?.confidence || 0}% confidence</span>
              <button onClick={resetAll} className="text-xs text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text-primary))]">Reset</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['supplier','invoiceNumber','date'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
                  {f === 'supplier' ? 'Supplier' : f === 'invoiceNumber' ? 'Invoice #' : 'Date'}</label>
                <input type="text" value={(result as any)[f] || ''} onChange={(e) => handleFieldUpdate(f, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
              </div>
            ))}
          </div>

          <div className="border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-[hsl(var(--color-background-secondary))] border-b border-[hsl(var(--color-border-tertiary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Item</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Qty</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Price</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-3 py-2">Subtotal</th>
              </tr></thead>
              <tbody>
                {result.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                    <td className="px-3 py-1.5"><input type="text" value={item.name} onChange={(e) => handleItemUpdate(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-primary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5"><input type="number" value={item.quantity} onChange={(e) => handleItemUpdate(idx, 'qty', e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-secondary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5"><input type="number" step="0.01" value={item.price} onChange={(e) => handleItemUpdate(idx, 'price', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-transparent rounded bg-transparent text-[hsl(var(--color-text-secondary))] hover:border-[hsl(var(--color-border-tertiary))]" /></td>
                    <td className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--color-text-primary))]">RM {item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-[hsl(var(--color-background-secondary))]">
                  <td colSpan={3} className="px-3 py-2 text-sm font-medium text-right text-[hsl(var(--color-text-primary))]">Total</td>
                  <td className="px-3 py-2 text-sm font-semibold text-[hsl(var(--color-text-primary))]">RM {result.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleApprove} disabled={saving}
              className="flex-1 bg-[#27500A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3B6D11] disabled:opacity-50">
              <i className="ti ti-check text-sm mr-1" aria-hidden="true"></i>
              {saving ? 'Saving...' : 'Approve & Update Inventory'}</button>
            <button onClick={resetAll}
              className="bg-transparent border border-[#A32D2D] text-[#A32D2D] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#A32D2D] hover:text-white">
              Reject</button>
          </div>
        </div>
      )}
    </div>
  )
}
