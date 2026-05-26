'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InventoryItem {
  id: string; itemName: string; quantity: number; unit: string
  status: string; shelfLife: string | null; outletId: string
  outlet: { name: string }
  createdAt: string; updatedAt: string
  stockOrders: Array<{ quantity: number; status: string }>
}

interface WasteLog {
  id: string; quantity: number; reason: string
  inventory: { itemName: string }
  outlet: { name: string }
  createdAt: string
}

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/inventory')
      const data = await res.json()
      if (data.inventory) setInventory(data.inventory)
      if (data.wasteLogs) setWasteLogs(data.wasteLogs)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchData() }, [])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OUT_OF_STOCK': case 'ORDER': return 'bg-[#FDEAEA] text-[#A32D2D]'
      case 'OVERSTOCK': return 'bg-[#FEF3E8] text-[#854F0B]'
      default: return 'bg-[#EAF3DE] text-[#27500A]'
    }
  }

  const getAiSuggestion = (item: InventoryItem) => {
    if (item.quantity <= 0) return { text: 'URGENT: Order immediately', icon: 'ti ti-alert-triangle', color: '#A32D2D' }
    if (item.quantity < 10) return { text: `Order ${Math.ceil(50 - item.quantity)}${item.unit}`, icon: 'ti ti-trending-up', color: '#854F0B' }
    if (item.quantity > 100) return { text: 'Reduce next order', icon: 'ti ti-trending-down', color: '#27500A' }
    return { text: 'Stock sufficient', icon: 'ti ti-check', color: '#27500A' }
  }

  if (loading) {
    return <div className="space-y-4"><h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Smart Stock</h1>
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
        <p className="text-sm text-[hsl(var(--color-text-tertiary))]">Loading inventory...</p></div></div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Smart Stock</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            {inventory.length} items across all outlets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} disabled={refreshing}
            className="bg-transparent border border-[hsl(var(--color-border-secondary))] text-[hsl(var(--color-text-primary))] px-3 py-1.5 rounded-md text-sm hover:bg-[hsl(var(--color-background-secondary))]">
            <i className={`ti ti-refresh text-sm mr-1 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true"></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}</button>
          <Link href="/dashboard/purchase-orders"
            className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
            <i className="ti ti-shopping-cart text-sm mr-1" aria-hidden="true"></i>Create PO</Link>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Total Items</p>
          <p className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">{inventory.length}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Need Reorder</p>
          <p className="text-lg font-semibold text-[#A32D2D]">{inventory.filter(i => i.status === 'ORDER' || i.status === 'OUT_OF_STOCK').length}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Overstock</p>
          <p className="text-lg font-semibold text-[#854F0B]">{inventory.filter(i => i.status === 'OVERSTOCK').length}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Waste Reported</p>
          <p className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">{wasteLogs.length} entries</p>
        </div>
      </div>

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-[hsl(var(--color-background-secondary))] rounded-full flex items-center justify-center">
            <i className="ti ti-package text-2xl text-[hsl(var(--color-text-tertiary))]"></i></div>
          <p className="text-sm text-[hsl(var(--color-text-tertiary))] mb-1">No inventory items yet</p>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Approve an invoice to auto-create inventory items</p>
        </div>
      ) : (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Item</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Stock</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">AI Suggestion</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Outlet</th>
                  <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const ai = getAiSuggestion(item)
                  return (
                    <tr key={item.id} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                      <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-primary))]">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">
                        {item.quantity} {item.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-1 rounded ${getStatusStyle(item.status)}`}>
                          {item.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">
                        <div className="flex items-center gap-1">
                          <i className="ti ti-brain text-sm" style={{ color: ai.color }} aria-hidden="true"></i>
                          <span style={{ color: ai.color }}>{ai.text}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-tertiary))]">{item.outlet?.name || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-tertiary))]">
                        {new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Waste Log */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Waste Log</h3>
        {wasteLogs.length === 0 ? (
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">No waste reported</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {wasteLogs.slice(0, 10).map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                <div>
                  <p className="text-sm text-[hsl(var(--color-text-primary))]">{w.inventory?.itemName} — {w.reason}</p>
                  <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                    {w.outlet?.name || '-'} • {new Date(w.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-sm font-medium text-[#A32D2D]">{w.quantity} unit{w.quantity !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
