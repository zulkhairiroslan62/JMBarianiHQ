'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesReportChartProps {
  data: Array<{
    date: string
    revenue: number
  }>
}

export default function SalesReportChart({ data }: SalesReportChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7B3F00" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#7B3F00" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11, fill: '#6B7280' }}
          stroke="#E5E7EB"
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#6B7280' }}
          stroke="#E5E7EB"
          tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '12px'
          }}
          formatter={(value: any) => [formatCurrency(value), 'Revenue']}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#7B3F00"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={{ r: 3, fill: '#7B3F00' }}
          activeDot={{ r: 5, fill: '#7B3F00' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
