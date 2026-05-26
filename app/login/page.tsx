'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A0D00] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2A1A0F] rounded-lg border border-[rgba(255,255,255,0.07)] p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="JM Bariani House" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-[#FAC775] text-center mb-2">
            JM Bariani House
          </h1>
          <p className="text-sm text-[rgba(250,199,117,0.4)] text-center mb-8">
            Restaurant Management System
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgba(255,255,255,0.8)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#1A0D00] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#7B3F00] focus:ring-1 focus:ring-[#7B3F00]"
                placeholder="owner@jmbarianihouse.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgba(255,255,255,0.8)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#1A0D00] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#7B3F00] focus:ring-1 focus:ring-[#7B3F00]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-[#A32D2D] bg-opacity-20 border border-[#A32D2D] rounded-lg p-3">
                <p className="text-sm text-[#F7C1C1]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B3F00] hover:bg-[#8B4A00] text-[#FAC775] font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.07)]">
            <p className="text-xs text-[rgba(255,255,255,0.3)] text-center">
              Demo credentials: owner@jmbarianihouse.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
