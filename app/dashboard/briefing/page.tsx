'use client'

import { useState, useEffect } from 'react'

export default function BriefingPage() {
  const [briefing, setBriefing] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const fetchBriefing = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/briefing')
      const data = await res.json()
      if (data.briefing) setBriefing(data.briefing)
      if (data.stats) setStats(data.stats)
      if (data.lowStock) setLowStock(data.lowStock)
    } catch {} finally { setLoading(false); setRegenerating(false) }
  }

  useEffect(() => { fetchBriefing() }, [])

  if (loading) return <div className="space-y-4"><h1 className="text-xl font-semibold">Executive Briefing</h1><p className="text-sm text-[hsl(var(--color-text-tertiary))]">Generating AI briefing...</p></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">
            <i className="ti ti-brain text-[#7B3F00] mr-2"></i>Executive Briefing
          </h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">AI-powered daily business intelligence</p>
        </div>
        <button onClick={fetchBriefing} disabled={regenerating}
          className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00] disabled:opacity-50">
          <i className={`ti ti-refresh text-sm mr-1 ${regenerating ? 'animate-spin' : ''}`}></i>
          {regenerating ? 'Generating...' : 'Regenerate'}</button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Today's Revenue</p>
          <p className="text-lg font-bold text-[hsl(var(--color-text-primary))]">RM {stats?.todayRevenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Transactions</p>
          <p className="text-lg font-bold text-[hsl(var(--color-text-primary))]">{stats?.todayTransactions || 0}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">All-Time Revenue</p>
          <p className="text-lg font-bold text-[hsl(var(--color-text-primary))]">RM {(stats?.allTimeRevenue || 0).toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 border ${(stats?.lowStockCount || 0) > 0 ? 'bg-[#FDEAEA] border-[#A32D2D]' : 'bg-[#EAF3DE] border-[#27500A]'}`}>
          <p className={`text-xs ${(stats?.lowStockCount || 0) > 0 ? 'text-[#A32D2D]' : 'text-[#27500A]'}`}>Low Stock Alerts</p>
          <p className={`text-lg font-bold ${(stats?.lowStockCount || 0) > 0 ? 'text-[#A32D2D]' : 'text-[#27500A]'}`}>
            {stats?.lowStockCount || 0}</p>
        </div>
      </div>

      {/* AI Briefing */}
      <div className="bg-gradient-to-br from-[#1A0D00] to-[#2A1A0A] border border-[#7B3F00]/30 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#7B3F00] flex items-center justify-center">
            <i className="ti ti-brain text-xs text-[#FAC775]"></i>
          </div>
          <span className="text-xs font-medium text-[#FAC775]">AI Analyst</span>
          {regenerating && <span className="text-[10px] text-[#FAC775]/60 animate-pulse">Thinking...</span>}
        </div>
        <div className="text-sm text-[#FAC775]/90 leading-relaxed whitespace-pre-line">
          {briefing || 'No briefing available. Click Regenerate.'}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
            <i className="ti ti-alert-triangle text-[#A32D2D] mr-1"></i>Low Stock Items</h3>
          <div className="space-y-2">
            {lowStock.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                <span className="text-sm text-[hsl(var(--color-text-primary))]">{item.itemName}</span>
                <span className="text-sm font-medium text-[#A32D2D]">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
