'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InvoiceItem { id: string; name: string; quantity: number; unit: string; price: number; subtotal: number }
interface Invoice {
  id: string; supplier: string; invoiceNumber: string | null; rawImageUrl: string; ocrData: string | null
  confidence: number | null; status: string; createdAt: string; outletId: string | null
  paidAmount: number | null; paidAt: string | null; paymentMethod: string | null
  revokedAt: string | null; revokedNote: string | null
  items: InvoiceItem[]
}
interface OcrData { supplier: string; invoiceNumber: string | null; date: string | null; items: OcrItem[]; total: number; confidence: number }
interface OcrItem { name: string; quantity: number; unit: string; price: number; subtotal: number }

const statusColors: Record<string, string> = {
  PENDING: '#854F0B', APPROVED: '#27500A', PAID: '#1A5B7A', REVOKED: '#6B3F3F', REJECTED: '#A32D2D',
}
const statusBgs: Record<string, string> = {
  PENDING: '#FEF3E8', APPROVED: '#EAF3DE', PAID: '#E0F0F7', REVOKED: '#F0E0E0', REJECTED: '#FDEAEA',
}

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [imageViewer, setImageViewer] = useState<{ url: string; supplier: string } | null>(null)
  const [revokeModal, setRevokeModal] = useState<Invoice | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [revoking, setRevoking] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [paidModal, setPaidModal] = useState<Invoice | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoice/save')
      const data = await res.json()
      if (data.invoices) setInvoices(data.invoices)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [])

  const parseOcr = (data: string | null): OcrData | null => {
    if (!data) return null
    try { return JSON.parse(data) } catch { return null }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleRevoke = async () => {
    if (!revokeModal) return
    setRevoking(true); setActionMsg(null)
    try {
      const res = await fetch('/api/invoice/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: revokeModal.id, reason: revokeReason }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Revoke failed')
      setActionMsg({ type: 'success', text: `Invoice revoked! ${result.inventoryRollback?.length || 0} inventory items reverted, ${result.posCancelled || 0} POs cancelled.` })
      setRevokeModal(null); setRevokeReason('')
      fetchInvoices()
    } catch (err: any) { setActionMsg({ type: 'error', text: err.message }) }
    finally { setRevoking(false) }
  }

  const handleMarkPaid = async () => {
    if (!paidModal) return
    try {
      const res = await fetch('/api/invoice/save', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markPaid', invoiceId: paidModal.id, paidAmount: parseFloat(payAmount) || 0, paymentMethod: payMethod }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed')
      setActionMsg({ type: 'success', text: `Invoice #${paidModal.invoiceNumber || paidModal.id.substring(0, 8)} marked as PAID.` })
      setPaidModal(null); fetchInvoices()
    } catch (err: any) { setActionMsg({ type: 'error', text: err.message }) }
  }

  if (loading) return <div className="space-y-4"><h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Invoice History</h1>
    <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
      <p className="text-sm text-[hsl(var(--color-text-tertiary))]">Loading...</p></div></div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Invoice History</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">{invoices.length} record{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/invoice" className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>New Invoice</Link>
      </div>

      {/* Action Message */}
      {actionMsg && (
        <div className={`rounded-lg p-3 ${actionMsg.type === 'success' ? 'bg-[#EAF3DE] border border-[#27500A]' : 'bg-[#FDEAEA] border border-[#A32D2D]'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs ${actionMsg.type === 'success' ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>{actionMsg.text}</p>
            <button onClick={() => setActionMsg(null)} className="text-xs underline">OK</button>
          </div>
        </div>
      )}

      {/* Empty */}
      {invoices.length === 0 && !loading ? (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
            <i className="ti ti-file-text text-2xl text-[hsl(var(--color-text-tertiary))]"></i></div>
          <p className="text-sm text-[hsl(var(--color-text-tertiary))] mb-4">No invoices uploaded yet</p>
          <Link href="/dashboard/invoice" className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00]">Upload First Invoice</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const ocr = parseOcr(inv.ocrData)
            const isExpanded = expandedId === inv.id
            const canRevoke = inv.status === 'APPROVED' || inv.status === 'PAID'
            const canPay = inv.status === 'APPROVED'
            return (
              <div key={inv.id} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
                {/* Summary Row */}
                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[hsl(var(--color-background-secondary))]"
                  onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                  {inv.rawImageUrl ? (
                    <div className="w-10 h-12 rounded overflow-hidden flex-shrink-0 border border-[hsl(var(--color-border-tertiary))] cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setImageViewer({ url: inv.rawImageUrl, supplier: inv.supplier }) }}>
                      <img src={inv.rawImageUrl} alt="" className="w-full h-full object-cover" /></div>
                  ) : (
                    <div className="w-10 h-12 rounded flex-shrink-0 bg-[hsl(var(--color-background-secondary))] flex items-center justify-center">
                      <i className="ti ti-file-unknown text-lg text-[hsl(var(--color-text-tertiary))]"></i></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] truncate">{inv.supplier}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[hsl(var(--color-text-tertiary))]">{formatDate(inv.createdAt)}</span>
                      {inv.invoiceNumber && <span className="text-[11px] text-[hsl(var(--color-text-tertiary))]">#{inv.invoiceNumber}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">RM {ocr?.total?.toFixed(2) || '0.00'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block"
                      style={{ color: statusColors[inv.status] || '#666', backgroundColor: statusBgs[inv.status] || '#f0f0f0' }}>
                      {inv.status}{inv.paidAt ? ` (${formatDate(inv.paidAt)})` : ''}{inv.revokedAt ? ` (${formatDate(inv.revokedAt)})` : ''}
                    </span>
                  </div>
                  <i className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} text-[hsl(var(--color-text-tertiary))]`}></i>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--color-border-tertiary))] p-3">
                    {inv.items.length > 0 ? (
                      <div className="space-y-1">
                        <div className="grid grid-cols-4 gap-2 px-2 py-1 text-[10px] font-medium text-[hsl(var(--color-text-tertiary))]">
                          <span className="col-span-2">Item</span><span>Qty</span><span className="text-right">Subtotal</span></div>
                        {inv.items.map((item) => (
                          <div key={item.id} className="grid grid-cols-4 gap-2 px-2 py-1 text-xs text-[hsl(var(--color-text-primary))] border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                            <span className="col-span-2 truncate">{item.name}</span>
                            <span>{item.quantity} {item.unit}</span>
                            <span className="text-right">RM {item.subtotal.toFixed(2)}</span></div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-[hsl(var(--color-text-tertiary))]">No items</p>}
                    {ocr?.confidence && <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mt-2">Confidence: {ocr.confidence}%</p>}
                    {inv.revokedNote && <p className="text-[10px] text-[#A32D2D] mt-1">Revoke reason: {inv.revokedNote}</p>}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-[hsl(var(--color-border-tertiary))]">
                      {canPay && (
                        <button onClick={() => { setPaidModal(inv); setPayAmount((ocr?.total || 0).toString()); setPayMethod('CASH') }}
                          className="text-[11px] px-3 py-1.5 rounded bg-[#1A5B7A] text-white hover:bg-[#1A6B8F]">
                          <i className="ti ti-currency-ringgit text-xs mr-1"></i>Mark Paid</button>
                      )}
                      {canRevoke && (
                        <button onClick={() => setRevokeModal(inv)}
                          className="text-[11px] px-3 py-1.5 rounded border border-[#A32D2D] text-[#A32D2D] hover:bg-[#FDEAEA]">
                          <i className="ti ti-arrow-back-up text-xs mr-1"></i>Revoke</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setImageViewer(null)}>
          <div className="max-w-2xl max-h-[90vh] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1A0D00] px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#FAC775]">{imageViewer.supplier}</span>
              <button onClick={() => setImageViewer(null)} className="text-white/60 hover:text-white"><i className="ti ti-x"></i></button>
            </div>
            <img src={imageViewer.url} alt="Invoice" className="max-w-full max-h-[80vh] object-contain bg-white" />
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setRevokeModal(null)}>
          <div className="bg-[hsl(var(--color-background-primary))] rounded-lg p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-[hsl(var(--color-text-primary))] mb-1">Revoke Invoice</h3>
            <p className="text-xs text-[hsl(var(--color-text-tertiary))] mb-3">
              Revoke invoice from <strong>{revokeModal.supplier}</strong>#{revokeModal.invoiceNumber || ''}?
              This will revert inventory changes and cancel related POs.</p>
            <textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revoking (optional)"
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))] mb-3" rows={2} />
            <div className="flex gap-2">
              <button onClick={handleRevoke} disabled={revoking}
                className="flex-1 bg-[#A32D2D] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#B83D3D] disabled:opacity-50">
                {revoking ? 'Revoking...' : 'Confirm Revoke'}</button>
              <button onClick={() => setRevokeModal(null)} className="bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))] px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {paidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPaidModal(null)}>
          <div className="bg-[hsl(var(--color-background-primary))] rounded-lg p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-[hsl(var(--color-text-primary))] mb-3">Mark as Paid</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">Amount Paid (RM)</label>
                <input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">Payment Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE_BANKING">Online Banking</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleMarkPaid} className="flex-1 bg-[#1A5B7A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1A6B8F]">
                Confirm Payment</button>
              <button onClick={() => setPaidModal(null)} className="bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))] px-4 py-2 rounded-md text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
