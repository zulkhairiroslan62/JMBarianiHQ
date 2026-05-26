import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  // Fetch real outlets
  const outlets = await prisma.outlet.findMany({
    orderBy: { name: 'asc' },
  })

  // Mock stats (in real app, would aggregate from sales data)
  const stats = {
    todayRevenue: 29000,
    todayOrders: 418,
    stockValue: 58400,
    activeStaff: 40,
    revenueChange: 12,
    ordersChange: 8,
  }

  const outletColors = ['#C8440A', '#185FA5', '#1D9E75', '#BA7517']

  return (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Today's Revenue
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {formatCurrency(stats.todayRevenue)}
          </p>
          <p className="text-[11px] text-[#3B6D11] mt-0.5">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +{stats.revenueChange}% vs yesterday
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Total Orders
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {stats.todayOrders}
          </p>
          <p className="text-[11px] text-[#3B6D11] mt-0.5">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +{stats.ordersChange}%
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Stock Value
          </p>
          <p className="text-lg font-medium text-[#A32D2D]">
            {formatCurrency(stats.stockValue)}
          </p>
          <p className="text-[11px] text-[#A32D2D] mt-0.5">
            Overstock this month
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Active Staff
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {stats.activeStaff}
          </p>
          <p className="text-[11px] text-[#854F0B] mt-0.5">
            All outlets operational
          </p>
        </div>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-[1fr_220px] gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3.5">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-2.5">
            Revenue per Outlet — Last 7 Days
          </p>
          <div className="h-[170px] flex items-center justify-center text-[hsl(var(--color-text-tertiary))] text-sm">
            Chart placeholder (Recharts integration)
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {outlets.map((outlet, idx) => (
              <span key={outlet.id} className="text-[11px] text-[hsl(var(--color-text-secondary))] flex items-center gap-1">
                <span className="w-2.5 h-0.5 inline-block rounded" style={{ backgroundColor: outletColors[idx] }}></span>
                {outlet.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3.5 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
            Alerts
          </p>
          
          <div className="flex items-start gap-2 p-2 bg-[#FEF3E8] rounded-md">
            <i className="ti ti-alert-triangle text-[#854F0B] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#854F0B] mb-0.5">Low Stock</p>
              <p className="text-[10px] text-[#854F0B] opacity-80">3 items need reorder</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-[#EAF3DE] rounded-md">
            <i className="ti ti-check text-[#27500A] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#27500A] mb-0.5">POS Connected</p>
              <p className="text-[10px] text-[#27500A] opacity-80">AcePOS live sync active</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-[#FEF3E8] rounded-md">
            <i className="ti ti-clock text-[#854F0B] text-sm mt-0.5" aria-hidden="true"></i>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-[#854F0B] mb-0.5">Pending PO</p>
              <p className="text-[10px] text-[#854F0B] opacity-80">2 orders awaiting approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outlet Cards */}
      <div className="grid grid-cols-4 gap-2">
        {outlets.map((outlet) => {
          const progress = Math.min(100, Math.floor(Math.random() * 40) + 60)
          const todayRevenue = Math.floor((outlet.targetDaily * progress) / 100)
          const todayOrders = Math.floor(Math.random() * 50) + 70

          return (
            <div key={outlet.id} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-[hsl(var(--color-text-primary))]">{outlet.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  outlet.status === 'ACTIVE' 
                    ? 'bg-[#EAF3DE] text-[#27500A]' 
                    : 'bg-[#FEE] text-[#A00]'
                }`}>
                  {outlet.status}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[hsl(var(--color-text-tertiary))]">Target</span>
                  <span className="text-[hsl(var(--color-text-secondary))]">
                    {formatCurrency(outlet.targetDaily)}
                  </span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--color-background-secondary))] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7B3F00] rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[hsl(var(--color-text-tertiary))]">Orders</span>
                <span className="font-medium text-[hsl(var(--color-text-primary))]">
                  {todayOrders}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
