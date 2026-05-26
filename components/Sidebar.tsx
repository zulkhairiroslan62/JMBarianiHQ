'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-[188px] flex-shrink-0 bg-[#1A0D00] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-3 py-3.5 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/logo.png" alt="JM Bariani House" className="w-full h-full object-contain" />
        </div>
        <div>
          <p className="text-xs font-medium text-[#FAC775] m-0">JM Bariani House</p>
          <p className="text-[10px] text-[rgba(250,199,117,0.4)] m-0">4 outlets</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-1.5 flex-1 overflow-y-auto">
        <div className="text-[10px] text-[rgba(250,199,117,0.35)] tracking-wider px-2 py-2 mt-1">
          OVERVIEW
        </div>
        
        <Link
          href="/dashboard"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-layout-dashboard text-sm" aria-hidden="true"></i>
          Dashboard
        </Link>

        <Link
          href="/dashboard/outlets"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/outlets')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-building-store text-sm" aria-hidden="true"></i>
          Outlets
        </Link>

        <div className="text-[10px] text-[rgba(250,199,117,0.35)] tracking-wider px-2 py-2 mt-2">
          OPERATIONS
        </div>

        <Link
          href="/dashboard/stock"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/stock')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-package text-sm" aria-hidden="true"></i>
          Smart Stock
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-[#633806] text-[#FAC775]">3</span>
        </Link>

        <Link
          href="/dashboard/purchase-orders"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/purchase-orders')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-shopping-cart text-sm" aria-hidden="true"></i>
          Purchase Orders
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-[#A32D2D] text-[#F7C1C1]">2</span>
        </Link>

        <Link
          href="/dashboard/invoice"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/invoice')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-scan text-sm" aria-hidden="true"></i>
          Smart Invoice
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-[#A32D2D] text-[#F7C1C1]">4</span>
        </Link>

        <Link
          href="/dashboard/staff"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/staff')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-users text-sm" aria-hidden="true"></i>
          Staff
        </Link>

        <Link
          href="/dashboard/menu"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/menu')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-chef-hat text-sm" aria-hidden="true"></i>
          Menu & Pricing
        </Link>

        <div className="text-[10px] text-[rgba(250,199,117,0.35)] tracking-wider px-2 py-2 mt-2">
          REPORTS
        </div>

        <Link
          href="/dashboard/reports"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/reports')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-chart-bar text-sm" aria-hidden="true"></i>
          Sales Report
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
            isActive('/dashboard/settings')
              ? 'bg-[#7B3F00] text-[#FAC775]'
              : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
          }`}
        >
          <i className="ti ti-settings text-sm" aria-hidden="true"></i>
          Settings
        </Link>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#7B3F00] flex items-center justify-center text-[10px] font-medium text-[#FAC775] flex-shrink-0">
            {session?.user?.name?.substring(0, 2).toUpperCase() || 'JM'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] font-medium text-[rgba(255,255,255,0.8)] m-0 truncate">
              {session?.user?.name || 'Owner'}
            </p>
            <p className="text-[10px] text-[rgba(255,255,255,0.35)] m-0">
              {session?.user?.role || 'OWNER'}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] transition-colors"
            title="Sign out"
          >
            <i className="ti ti-logout text-sm" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
