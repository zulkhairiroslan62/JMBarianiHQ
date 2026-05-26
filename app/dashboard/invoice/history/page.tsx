'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  subtotal: number
}

interface Invoice {
  id: string
  supplier: string
  invoiceNumber: string | null
  rawImageUrl: string
  ocrData: string | null
  confidence: number | null
  status: string
  createdAt: string
  items: InvoiceItem[]
}

interface OcrData {
  supplier: string
  invoiceNumber: string | null
  date: string | null
  items: InvoiceItem[]
  total: number
  confidence: number
}

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [imageViewer, setImageViewer] = useState<{ url: string; supplier: string } | null>(null)

  // Fetch invoices on mount
  useState(() => {
    fetch('/api/invoice/save')
      .then(r => r.json())
      .then(data => { if (data.invoices) setInvoices(data.invoices); setLoading(false) })
      .catch(() => setLoading(false))
  })

  const parseOcr = (data: string | null): OcrData | null => {
    if (!data) return null
    try { return JSON.parse(data) } catch { return null }
  }

  const getStatusStyle = (status: string) => {
    if (status === 'APPROVED') return 'bg-[#EAF3DE] text-[#27500A]'
    if (status === 'PENDING') return 'bg-[#FEF3E8] text-[#854F0B]'
    return 'bg-[#FDEAEA] text-[#A32D2D]'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Invoice History</h1>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
          <p className="text-sm text-[hsl(var(--color-text-tertiary))]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Invoice History</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <Link href="/dashboard/invoice" className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
            <i className="ti ti-file-text text-2xl text-[hsl(var(--color-text-tertiary))]" aria-hidden="true"></i>
          </div>
          <p className="text-sm text-[hsl(var(--color-text-tertiary))] mb-4">No invoices uploaded yet</p>
          <Link href="/dashboard/invoice" className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
            Upload First Invoice
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const ocr = parseOcr(invoice.ocrData)
            const isExpanded = expandedId === invoice.id
            return (
              <div key={invoice.id} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
                {/* Summary Row */}
                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[hsl(var(--color-background-secondary))]"
                  onClick={() => setExpandedId(isExpanded ? null : invoice.id)}>
                  {/* Thumbnail */}
                  {invoice.rawImageUrl ? (
                    <div className="w-12 h-14 rounded overflow-hidden flex-shrink-0 border border-[hsl(var(--color-border-tertiary))] cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setImageViewer({ url: invoice.rawImageUrl, supplier: invoice.supplier }) }}>
                      <img src={invoice.rawImageUrl} alt={invoice.supplier} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-14 rounded flex-shrink-0 bg-[hsl(var(--color-background-secondary))] flex items-center justify-center">
                      <i className="ti ti-file-unknown text-lg text-[hsl(var(--color-text-tertiary))]" aria-hidden="true"></i>
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] truncate">{invoice.supplier}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[hsl(var(--color-text-tertiary))]">
                        {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {invoice.invoiceNumber && (
                        <span className="text-[11px] text-[hsl(var(--color-text-tertiary))]">#{invoice.invoiceNumber}</span>
                      )}
                    </div>
                  </div>
                  {/* Total & Status */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">
                      RM {ocr?.total?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <i className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} text-[hsl(var(--color-text-tertiary))] transition-transform`} aria-hidden="true"></i>
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--color-border-tertiary))] p-3">
                    {invoice.items.length > 0 ? (
                      <div className="space-y-1">
                        <div className="grid grid-cols-4 gap-2 px-2 py-1 text-[10px] font-medium text-[hsl(var(--color-text-tertiary))]">
                          <span className="col-span-2">Item</span><span>Qty</span><span className="text-right">Subtotal</span>
                        </div>
                        {invoice.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-4 gap-2 px-2 py-1 text-xs text-[hsl(var(--color-text-primary))] border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                            <span className="col-span-2 truncate">{item.name}</span>
                            <span>{item.quantity} {item.unit}</span>
                            <span className="text-right">RM {item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[hsl(var(--color-text-tertiary))]">No items recorded</p>
                    )}
                    {ocr?.confidence && (
                      <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mt-2">
                        OCR Confidence: {ocr.confidence}% &middot; {ocr.items?.length || 0} items extracted
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setImageViewer(null)}>
          <div className="max-w-2xl max-h-[90vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1A0D00] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#FAC775]">{imageViewer.supplier} Invoice</span>
              <button onClick={() => setImageViewer(null)} className="text-white/60 hover:text-white">
                <i className="ti ti-x" aria-hidden="true"></i>
              </button>
            </div>
            <img src={imageViewer.url} alt="Invoice" className="max-w-full max-h-[80vh] object-contain bg-white" />
          </div>
        </div>
      )}
    </div>
  )
}
