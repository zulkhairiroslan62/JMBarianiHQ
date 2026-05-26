import RealTimeDashboard from '@/components/RealTimeDashboard'

export default function RealTimePage() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">
            Real-Time Sales Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-1">
            Live sales tracking, peak hours analysis, and best-selling items
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Live Updates</span>
        </div>
      </div>

      <RealTimeDashboard />
    </div>
  )
}
