'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface RealtimeData {
  totalRevenue: number
  totalOrders: number
  peakHoursData: Array<{
    hour: number
    hourLabel: string
    revenue: number
    orders: number
  }>
  bestSelling: Array<{
    name: string
    quantity: number
    revenue: number
    category: string
  }>
  latestSales: Array<{
    id: string
    time: string
    item: string
    outlet: string
    quantity: number
    amount: number
  }>
  lastUpdated: string
}

export default function RealTimeDashboard() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard/realtime')
      const result = await response.json()
      setData(result)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch realtime data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-6 text-center">
          <p className="text-[hsl(var(--color-text-tertiary))]">Loading real-time data...</p>
        </div>
      </div>
    )
  }

  // Find peak hour
  const peakHour = data.peakHoursData.reduce((max, curr) => 
    curr.revenue > max.revenue ? curr : max
  , data.peakHoursData[0])

  return (
    <div className="space-y-3">
      {/* Live Revenue Counter */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#7B3F00] to-[#5A2F00] rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs opacity-90">Live Revenue Today</p>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(data.totalRevenue)}</p>
          <p className="text-xs opacity-75">
            {data.totalOrders} orders • Updated {Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000)}s ago
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mb-2">Peak Hour Today</p>
          <p className="text-2xl font-bold text-[hsl(var(--color-text-primary))] mb-1">
            {peakHour.hourLabel}
          </p>
          <p className="text-xs text-[hsl(var(--color-text-secondary))]">
            {formatCurrency(peakHour.revenue)} • {peakHour.orders} orders
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mb-2">Average Order Value</p>
          <p className="text-2xl font-bold text-[hsl(var(--color-text-primary))] mb-1">
            {formatCurrency(data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0)}
          </p>
          <p className="text-xs text-[hsl(var(--color-text-secondary))]">
            Per transaction
          </p>
        </div>
      </div>

      {/* Peak Hours Heatmap & Best Selling */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-3">
        {/* Peak Hours Heatmap */}
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
              Sales by Hour — Today
            </p>
            <span className="text-xs text-[hsl(var(--color-text-tertiary))]">
              Business hours: 11:00 - 22:00
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.peakHoursData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="hourLabel" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                stroke="#E5E7EB"
                interval={1}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                stroke="#E5E7EB"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value), 'Revenue']
                  return [value, 'Orders']
                }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data.peakHoursData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.revenue === peakHour.revenue ? '#7B3F00' : '#FAC775'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Selling Items */}
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
            Top Selling Items Today
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.bestSelling.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7B3F00] w-5">#{idx + 1}</span>
                    <p className="text-xs font-medium text-[hsl(var(--color-text-primary))] truncate">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] ml-7">
                    {item.category}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs font-medium text-[hsl(var(--color-text-primary))]">
                    {item.quantity}x
                  </p>
                  <p className="text-[10px] text-[hsl(var(--color-text-secondary))]">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Sales Feed */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
            Live Sales Feed
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-[hsl(var(--color-text-tertiary))]">Live</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.latestSales.map((sale) => (
            <div 
              key={sale.id} 
              className="flex items-center justify-between p-2 bg-[hsl(var(--color-background-secondary))] rounded-md hover:bg-[hsl(var(--color-background-tertiary))] transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono text-[hsl(var(--color-text-tertiary))] w-12">
                  {sale.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[hsl(var(--color-text-primary))] truncate">
                    {sale.item}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--color-text-tertiary))]">
                    {sale.outlet} • Qty: {sale.quantity}
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium text-[#7B3F00] ml-2">
                {formatCurrency(sale.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
