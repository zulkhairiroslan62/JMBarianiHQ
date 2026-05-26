'use client'

import { useState } from 'react'

export default function InvoicePage() {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const invoices = [
    { id: 'INV-001', supplier: 'Fresh Mart Sdn Bhd', status: 'PENDING', confidence: 96, items: 8, total: 2450, date: '2026-05-26' },
    { id: 'INV-002', supplier: 'Spice World Trading', status: 'PENDING', confidence: 89, items: 5, total: 890, date: '2026-05-25' },
    { id: 'INV-003', supplier: 'Meat Supply Co', status: 'APPROVED', confidence: 98, items: 12, total: 3200, date: '2026-05-24' },
    { id: 'INV-004', supplier: 'Fresh Mart Sdn Bhd', status: 'APPROVED', confidence: 95, items: 6, total: 1850, date: '2026-05-23' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FEF3E8] text-[#854F0B]'
      case 'APPROVED': return 'bg-[#EAF3DE] text-[#27500A]'
      case 'REJECTED': return 'bg-[#FDEAEA] text-[#A32D2D]'
      default: return 'bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]'
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
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-6">
        <div className="border-2 border-dashed border-[hsl(var(--color-border-secondary))] rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
              <i className="ti ti-upload text-2xl text-[hsl(var(--color-text-secondary))]" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
                Upload Invoice
              </p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                Drag and drop or click to browse • PDF, JPG, PNG
              </p>
            </div>
            <button 
              className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00]"
              disabled={uploading || processing}
            >
              {uploading ? 'Uploading...' : processing ? 'Processing with AI...' : 'Select File'}
            </button>
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      {processing && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#7B3F00] flex items-center justify-center text-xs font-medium text-[#FAC775]">
                1
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

      {/* Invoice List */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Invoice ID</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Supplier</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Confidence</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Items</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Total</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Date</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">{invoice.id}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{invoice.supplier}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getConfidenceColor(invoice.confidence)}`}>
                      {invoice.confidence}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{invoice.items} items</td>
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">
                    RM {invoice.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-tertiary))]">{invoice.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {invoice.status === 'PENDING' && (
                        <>
                          <button className="text-[#27500A] hover:text-[#3B6D11] text-xs font-medium">
                            Approve
                          </button>
                          <button className="text-[#A32D2D] hover:text-[#C13838] text-xs font-medium">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="text-[#7B3F00] hover:text-[#8B4A00] text-xs font-medium">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
