'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
    { path: '/dashboard/realtime', label: 'Real-Time Sales', icon: 'ti ti-activity', dot: true },
    { path: '/dashboard/outlets', label: 'Outlets', icon: 'ti ti-building-store' },
    { path: '/dashboard/stock', label: 'Smart Stock', icon: 'ti ti-package', count: '3', countBg: '#633806', countText: '#FAC775' },
    { path: '/dashboard/purchase-orders', label: 'Purchase Orders', icon: 'ti ti-shopping-cart', count: '2', countBg: '#A32D2D', countText: '#F7C1C1' },
    { path: '/dashboard/invoice', label: 'Smart Invoice', icon: 'ti ti-scan', count: '4', countBg: '#A32D2D', countText: '#F7C1C1' },
    { path: '/dashboard/staff', label: 'Staff', icon: 'ti ti-users' },
    { path: '/dashboard/menu', label: 'Menu & Pricing', icon: 'ti ti-chef-hat' },
    { path: '/dashboard/reports', label: 'Sales Report', icon: 'ti ti-chart-bar' },
    { path: '/dashboard/settings', label: 'Settings', icon: 'ti ti-settings' },
  ]

  const sections = [
    { title: 'OVERVIEW', links: navLinks.slice(0, 3) },
    { title: 'OPERATIONS', links: navLinks.slice(3, 8) },
    { title: 'REPORTS', links: navLinks.slice(8) },
  ]

  const renderLink = (link: typeof navLinks[0]) => (
    <Link
      key={link.path}
      href={link.path}
      onClick={() => setIsOpen(false)}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs no-underline mb-0.5 ${
        isActive(link.path)
          ? 'bg-[#7B3F00] text-[#FAC775]'
          : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.8)]'
      }`}
    >
      <i className={`${link.icon} text-sm`} aria-hidden="true"></i>
      {link.label}
      {'dot' in link && link.dot && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>}
      {'count' in link && link.count && (
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md"
          style={{ backgroundColor: link.countBg, color: link.countText }}
        >
          {link.count}
        </span>
      )}
    </Link>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-[#1A0D00] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white shadow-lg"
      >
        <i className="ti ti-menu-2 text-lg" aria-hidden="true"></i>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - mobile: overlay slide, desktop: static */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-[220px] md:w-[188px] flex-shrink-0 bg-[#1A0D00] flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-3 py-3.5 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/logo.png" alt="JM Bariani House" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-[#FAC775] m-0">JM Bariani House</p>
              <p className="text-[10px] text-[rgba(250,199,117,0.4)] m-0">4 outlets</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-[rgba(255,255,255,0.4)] hover:text-white"
            >
              <i className="ti ti-x text-lg" aria-hidden="true"></i>
            </button>
          </div>

          {/* Navigation */}
          <div className="p-1.5 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="text-[10px] text-[rgba(250,199,117,0.35)] tracking-wider px-2 py-2 mt-1">
                  {section.title}
                </div>
                {section.links.map(renderLink)}
              </div>
            ))}
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
      </div>
    </>
  )
}
