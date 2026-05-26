'use client'

import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'

export default function TopBar() {
  const { data: session } = useSession()
  const today = new Date()

  return (
    <div className="h-12 border-b border-[hsl(var(--color-border-tertiary))] px-4 flex items-center justify-between flex-shrink-0 bg-[hsl(var(--color-background-primary))]">
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
          Dashboard
        </span>
        <span className="text-[11px] text-[hsl(var(--color-text-tertiary))]">
          {formatDate(today)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <select className="text-[11.5px] px-2 py-1 rounded-md border border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>

        <div className="relative cursor-pointer">
          <i className="ti ti-bell text-lg text-[hsl(var(--color-text-secondary))]" aria-hidden="true"></i>
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#E24B4A] rounded-full"></span>
        </div>

        <div className="w-6 h-6 rounded-full bg-[#7B3F00] flex items-center justify-center text-[10px] font-medium text-[#FAC775]">
          {session?.user?.name?.substring(0, 2).toUpperCase() || 'JM'}
        </div>
      </div>
    </div>
  )
}
