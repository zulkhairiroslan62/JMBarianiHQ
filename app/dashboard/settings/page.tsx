'use client'

import { signOut, useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Settings</h1>
        <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
          System configuration and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
              Name
            </label>
            <input
              type="text"
              defaultValue={session?.user?.name || ''}
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
              Email
            </label>
            <input
              type="email"
              defaultValue={session?.user?.email || ''}
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--color-text-secondary))] mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={session?.user?.role || ''}
              disabled
              className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-tertiary))] text-[hsl(var(--color-text-tertiary))] cursor-not-allowed"
            />
          </div>
          <button className="bg-[#7B3F00] text-[#FAC775] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
            Save Changes
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))]">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">AI Forecasting</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Enable Claude AI for stock predictions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[hsl(var(--color-background-secondary))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B3F00]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))]">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Invoice OCR</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Automatic invoice scanning with Claude Vision</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[hsl(var(--color-background-secondary))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B3F00]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))]">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Auto-refresh Dashboard</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Update data every 5 minutes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[hsl(var(--color-background-secondary))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B3F00]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Email Notifications</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Receive alerts for critical events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-[hsl(var(--color-background-secondary))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B3F00]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[#A32D2D] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[#A32D2D] mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">Sign Out</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">End your current session</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-transparent border border-[#A32D2D] text-[#A32D2D] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#A32D2D] hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-4">System Information</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-[hsl(var(--color-text-tertiary))]">Version</span>
            <span className="text-[hsl(var(--color-text-primary))] font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[hsl(var(--color-text-tertiary))]">Database</span>
            <span className="text-[hsl(var(--color-text-primary))] font-medium">PostgreSQL</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[hsl(var(--color-text-tertiary))]">AI Provider</span>
            <span className="text-[hsl(var(--color-text-primary))] font-medium">Claude (Anthropic)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[hsl(var(--color-text-tertiary))]">Last Updated</span>
            <span className="text-[hsl(var(--color-text-primary))] font-medium">2026-05-26</span>
          </div>
        </div>
      </div>
    </div>
  )
}
