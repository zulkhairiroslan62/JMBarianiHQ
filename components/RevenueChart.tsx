'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: any[]
  outlets: any[]
  colors: string[]
}

export default function RevenueChart({ data, outlets, colors }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 11, fill: '#6B7280' }}
          stroke="#E5E7EB"
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
          formatter={(value: any) => `RM${value.toFixed(2)}`}
        />
        {outlets.map((outlet, idx) => (
          <Line
            key={outlet.id}
            type="monotone"
            dataKey={outlet.name}
            stroke={colors[idx]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
