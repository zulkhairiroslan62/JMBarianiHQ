'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OutletData {
  id: string; name: string; address: string; status: string
  todayRevenue: number; yesterdayRevenue: number; growth: number
  dailyTarget: number; targetPct: number; todayOrders: number
  menuItems: number; inventory: number; staff: number
  tag: string; tagColor: string; image: string
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<OutletData[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      const res = await fetch('/api/outlets/dashboard')
      const data = await res.json()
      if (data.outlets) setOutlets(data.outlets)
      if (data.overview) setOverview(data.overview)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = outlets.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen text-gray-900" style={{ background: '#f5f6f8', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-[1600px] mx-auto p-8">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[2.5rem] font-extrabold tracking-[-0.03em] text-gray-900">Outlets</h1>
            <p className="text-gray-500 mt-1.5">Monitor all restaurant branches in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 w-80">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search outlets..." className="w-full outline-none text-sm bg-transparent placeholder:text-gray-400" />
            </div>
            <button className="text-white px-7 py-[14px] rounded-2xl font-semibold shadow-lg transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(168,106,28,0.35)]"
              style={{ background: 'linear-gradient(135deg, #a86a1c 0%, #d88a28 100%)' }}>
              <span className="mr-1.5">+</span> Add Outlet
            </button>
          </div>
        </div>

        {/* ===== OVERVIEW CARDS ===== */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue', value: `RM ${(overview?.totalRevenue || 0).toLocaleString()}`, badge: '+12.6% vs yesterday', icon: '💰', iconBg: '#dcfce7', col: '#22c55e' },
            { label: 'Orders Today', value: `${overview?.totalOrders || 0}`, badge: '+8.4% vs yesterday', icon: '📦', iconBg: '#dbeafe', col: '#3b82f6' },
            { label: 'Top Outlet', value: overview?.topOutlet?.name || '-', badge: '🔥 Best Seller Today', icon: '🏆', iconBg: '#fef3c7', col: '#d97706' },
            { label: 'Alerts', value: `${overview?.alerts || 0}`, badge: 'Needs attention', icon: '⚠️', iconBg: '#fee2e2', col: '#ef4444', badgeCol: 'text-red-500' },
          ].map((card, i) => (
            <div key={i} className="rounded-[20px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs tracking-wide uppercase font-medium">{card.label}</p>
                  <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em] mt-2">{card.value}</h2>
                  <p className={`${card.badgeCol || 'text-green-600'} text-sm mt-2 font-medium`}>{card.badge}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style={{ background: card.iconBg }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== OUTLET CARDS ===== */}
        <div className="grid grid-cols-2 gap-6">
          {filtered.map((outlet) => (
            <div key={outlet.id} className="rounded-[20px] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
              style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%)', border: '1px solid rgba(255,255,255,0.7)' }}>
              <div className="flex gap-6">
                {/* Image */}
                <div className="w-48 h-44 rounded-[20px] overflow-hidden flex-shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.02]">
                  <img src={outlet.image} alt={outlet.name}
                    className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(.4,0,.2,1)] hover:scale-110" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-[1.35rem] font-bold tracking-[-0.01em] text-gray-900">
                          {outlet.name}
                        </h2>
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                          ● {outlet.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1.5">{outlet.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold ${outlet.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {outlet.growth >= 0 ? '▲' : '▼'} {Math.abs(outlet.growth)}%
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5">vs yesterday</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-5 mt-6">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Today&apos;s Revenue</p>
                      <h3 className="text-[2.2rem] font-extrabold tracking-[-0.03em] leading-tight mt-1">
                        RM {outlet.todayRevenue.toLocaleString()}
                      </h3>
                    </div>
                    <div className="flex justify-center items-start">
                      {/* Animated Progress Ring */}
                      <div className="relative w-[90px] h-[90px]">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="4"
                            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - outlet.targetPct / 100)}`}
                            className="transition-all duration-700 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-extrabold text-lg tracking-[-0.02em]">{outlet.targetPct}%</span>
                          <span className="text-[10px] text-gray-400 font-medium -mt-0.5">Target</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Daily Target</p>
                      <h3 className="text-xl font-bold tracking-[-0.01em] mt-1">RM {outlet.dailyTarget.toLocaleString()}</h3>
                      <div className="w-full bg-gray-100 rounded-full h-[10px] mt-4 overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${outlet.targetPct}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />
                      </div>
                    </div>
                  </div>

                  {/* 4 Stats */}
                  <div className="grid grid-cols-4 gap-3 mt-6">
                    {[
                      { label: 'Orders', value: outlet.todayOrders },
                      { label: 'Menu', value: outlet.menuItems },
                      { label: 'Stock', value: outlet.inventory },
                      { label: 'Staff', value: outlet.staff },
                    ].map((s, i) => (
                      <div key={i} className="bg-gray-50/80 rounded-2xl py-3.5 px-3 text-center transition-all duration-[250ms] hover:bg-gray-100">
                        <div className="text-gray-400 text-[11px] uppercase tracking-wider font-medium">{s.label}</div>
                        <div className="font-extrabold text-xl mt-1 tracking-[-0.02em]">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100/50">
                    <PerformanceTag tag={outlet.tag} color={outlet.tagColor} />
                    <div className="flex gap-3">
                      <Link href="/dashboard/analytics"
                        className="px-5 py-[11px] rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium text-sm
                          transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)]
                          hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        Analytics
                      </Link>
                      <button
                        className="text-white px-6 py-[11px] rounded-2xl font-semibold text-sm
                          transition-all duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)]
                          hover:scale-[1.03] hover:shadow-[0_8px_20px_rgba(168,106,28,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #a86a1c 0%, #d88a28 100%)' }}>
                        Manage Outlet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No outlets found matching &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PerformanceTag({ tag, color }: { tag: string; color: string }) {
  const styles: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/50',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/50',
    red: 'bg-red-50 text-red-700 border border-red-200/50',
  }
  return (
    <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide ${styles[color] || 'bg-gray-50 text-gray-600 border border-gray-200/50'}`}>
      {tag}
    </span>
  )
}
