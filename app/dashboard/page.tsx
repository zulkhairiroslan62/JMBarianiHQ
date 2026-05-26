'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  stockValue: number
  activeStaff: number
  revenueChange: number
  ordersChange: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load stats:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[hsl(var(--color-text-secondary))]">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Today's Revenue
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {formatCurrency(stats?.todayRevenue || 14820)}
          </p>
          <p className="text-[11px] text-[#3B6D11] mt-0.5">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +{stats?.revenueChange || 12}% vs yesterday
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Total Orders
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {stats?.todayOrders || 382}
          </p>
          <p className="text-[11px] text-[#3B6D11] mt-0.5">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +{stats?.ordersChange || 8}%
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Stock Value
          </p>
          <p className="text-lg font-medium text-[#A32D2D]">
            {formatCurrency(stats?.stockValue || 58400)}
          </p>
          <p className="text-[11px] text-[#A32D2D] mt-0.5">
            Overstock this month
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Active Staff
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {stats?.activeStaff || 28}
          </p>
          <p className="text-[11px] text-[#854F0B] mt-0.5">
            2 absent — Subang
          </p>
        </div>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-[1fr_220px] gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3.5">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-2.5">
            Revenue per Outlet — Last 7 Days
          </p>
          <div className="h-[170px] flex items-center justify-center text-[hsl(var(--color-text-tertiary))] text-sm">
            Chart placeholder (Recharts integration)
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="text-[11px] text-[hsl(var(--color-text-secondary))] flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#C8440A] inline-block rounded"></span>
              Damansara
            </span>
            <span className="text-[11px] text-[hsl(var(--color-text-secondary))] flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#185FA5] inline-block rounded"></span>
              Subang
            </span>
            <span className="text-[11px] text-[hsl(var(--color-text-secondary))] flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#1D9E75] inline-block rounded"></span>
              Cheras
            </span>
            <span className="text-[11px] text-[hsl(var(--color-text-secondary))] flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#BA7517] inline-block rounded"></span>
              Puchong
            </span>
          </div>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3.5 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
            Alerts
          </p>
          
          <div className="flex items-start gap-2 p-2 bg-[#FEF3E8] rounded-md">
            <i className="ti ti-alert-triangle text-[#854F0B] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#854F0B] mb-0.5">Low Stock</p>
              <p className="text-[10px] text-[#854F0B] opacity-80">3 items need reorder</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-[#FDEAEA] rounded-md">
            <i className="ti ti-user-x text-[#A32D2D] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#A32D2D] mb-0.5">Staff Absent</p>
              <p className="text-[10px] text-[#A32D2D] opacity-80">2 staff at Subang</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-[#FEF3E8] rounded-md">
            <i className="ti ti-clock text-[#854F0B] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#854F0B] mb-0.5">Pending PO</p>
              <p className="text-[10px] text-[#854F0B] opacity-80">2 orders awaiting approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outlet Cards */}
      <div className="grid grid-cols-4 gap-2">
        {['Damansara', 'Subang', 'Cheras', 'Puchong'].map((outlet, idx) => (
          <div key={outlet} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[hsl(var(--color-text-primary))]">{outlet}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#27500A]">Active</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[hsl(var(--color-text-tertiary))]">Target</span>
                <span className="text-[hsl(var(--color-text-secondary))]">
                  {formatCurrency([5000, 4500, 4000, 3500][idx])}
                </span>
              </div>
              <div className="h-1.5 bg-[hsl(var(--color-background-secondary))] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#7B3F00] rounded-full"
                  style={{ width: `${[85, 72, 68, 91][idx]}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[hsl(var(--color-text-tertiary))]">Orders</span>
              <span className="font-medium text-[hsl(var(--color-text-primary))]">
                {[112, 98, 87, 85][idx]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
