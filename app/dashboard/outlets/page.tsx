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

  const tagStyles: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="min-h-screen bg-[#f5f6f8] p-8"><p className="text-gray-500">Loading outlets...</p></div>

  return (
    <div className="min-h-screen bg-[#f5f6f8]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Outlets</h1>
            <p className="text-gray-500 mt-1">Monitor all restaurant branches in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 w-80">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search outlets..." className="w-full outline-none text-sm bg-transparent" />
            </div>
            <button className="text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition duration-200"
              style={{ background: 'linear-gradient(135deg, #9a5b13 0%, #c77b1d 100%)' }}>
              <i className="ti ti-plus mr-1"></i> Add Outlet
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Revenue', value: `RM ${(overview?.totalRevenue || 0).toLocaleString()}`, badge: '▲ vs yesterday', badgeColor: 'text-green-600', icon: '💰', bg: 'bg-green-100' },
            { label: 'Orders Today', value: `${overview?.totalOrders || 0}`, badge: '▲ All outlets', badgeColor: 'text-green-600', icon: '📦', bg: 'bg-blue-100' },
            { label: 'Top Outlet', value: overview?.topOutlet?.name || '-', badge: '🔥 Best Today', badgeColor: 'text-amber-600', icon: '🏆', bg: 'bg-amber-100' },
            { label: 'Alerts', value: `${overview?.alerts || 0}`, badge: 'Needs attention', badgeColor: 'text-red-500', icon: '⚠️', bg: 'bg-red-100' },
          ].map((card, i) => (
            <div key={i} className="rounded-3xl p-6 shadow-sm" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <h2 className="text-3xl font-extrabold mt-2">{card.value}</h2>
                  <p className={`${card.badgeColor} text-sm mt-2`}>{card.badge}</p>
                </div>
                <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center text-3xl`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Outlet Cards */}
        <div className="grid grid-cols-2 gap-6">
          {filtered.map((outlet) => (
            <div key={outlet.id} className="rounded-3xl p-6 shadow-sm outlet-card transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div className="flex gap-5">
                {/* Image */}
                <img src={outlet.image} alt={outlet.name}
                  className="w-44 h-40 rounded-2xl object-cover flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{outlet.name}</h2>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          {outlet.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">{outlet.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-semibold ${outlet.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {outlet.growth >= 0 ? '▲' : '▼'} {Math.abs(outlet.growth)}%
                      </div>
                      <div className="text-gray-400 text-xs">vs yesterday</div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-5 mt-6">
                    <div>
                      <p className="text-gray-500 text-sm">Today&apos;s Revenue</p>
                      <h3 className="text-4xl font-extrabold mt-1 text-gray-900">RM {outlet.todayRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="flex justify-center">
                      {/* Progress Ring */}
                      <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                        style={{
                          background: `radial-gradient(closest-side, white 78%, transparent 80% 100%),
                            conic-gradient(#22c55e ${outlet.targetPct}%, #e5e7eb 0)`,
                        }}>
                        <div className="text-center">
                          <div className="font-extrabold text-xl text-gray-900">{outlet.targetPct}%</div>
                          <div className="text-xs text-gray-500">Target</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Daily Target</p>
                      <h3 className="text-2xl font-bold mt-1 text-gray-900">RM {outlet.dailyTarget.toLocaleString()}</h3>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${outlet.targetPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* 4 Stat Boxes */}
                  <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                    {[
                      { label: 'Orders', value: outlet.todayOrders },
                      { label: 'Menu Items', value: outlet.menuItems },
                      { label: 'Inventory', value: outlet.inventory },
                      { label: 'Staff', value: outlet.staff },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-4">
                        <div className="text-gray-500 text-xs">{stat.label}</div>
                        <div className="font-extrabold text-2xl mt-1 text-gray-900">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between mt-6">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${tagStyles[outlet.tagColor] || 'bg-gray-100 text-gray-700'}`}>
                      {outlet.tag}
                    </div>
                    <div className="flex gap-3">
                      <Link href={`/dashboard/analytics`}
                        className="px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-100 transition font-medium text-sm bg-white text-gray-700">
                        Analytics
                      </Link>
                      <Link href={`/dashboard/outlets/${outlet.id}`}
                        className="text-white px-5 py-3 rounded-2xl font-semibold shadow-md text-sm transition hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #9a5b13 0%, #c77b1d 100%)' }}>
                        Manage Outlet
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No outlets found matching "{search}"</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .outlet-card {
          transition: all 0.25s ease;
        }
        .outlet-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  )
}
