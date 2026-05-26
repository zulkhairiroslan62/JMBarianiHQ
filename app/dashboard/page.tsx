import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import RevenueChart from '@/components/RevenueChart'

export default async function DashboardPage() {
  // Fetch real outlets
  const outlets = await prisma.outlet.findMany({
    orderBy: { name: 'asc' },
  })

  // Calculate today's stats from real sales data
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Today's sales
  const todaySales = await prisma.sale.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  // Yesterday's sales
  const yesterdaySales = await prisma.sale.findMany({
    where: {
      date: {
        gte: yesterday,
        lt: today,
      },
    },
  })

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0)
  const revenueChange = yesterdayRevenue > 0 
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : 0

  const todayOrders = todaySales.length
  const yesterdayOrders = yesterdaySales.length
  const ordersChange = yesterdayOrders > 0
    ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100)
    : 0

  // Stock value
  const inventory = await prisma.inventory.findMany()
  const stockValue = inventory.reduce((sum, item) => sum + (item.quantity * 10), 0) // Rough estimate

  // Active staff
  const activeStaff = await prisma.staff.count()

  // Get last 7 days revenue per outlet for chart
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const last7DaysSales = await prisma.sale.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      outlet: true,
    },
  })

  // Group by date and outlet
  const chartData: any[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayData: any = { date: dateStr }
    
    outlets.forEach(outlet => {
      const outletSales = last7DaysSales.filter(
        sale => sale.outletId === outlet.id && 
        sale.date >= dayStart && 
        sale.date <= dayEnd
      )
      const revenue = outletSales.reduce((sum, sale) => sum + sale.total, 0)
      dayData[outlet.name] = revenue
    })

    chartData.push(dayData)
  }

  const stats = {
    todayRevenue,
    todayOrders,
    stockValue,
    activeStaff,
    revenueChange,
    ordersChange,
  }

  const outletColors = ['#C8440A', '#185FA5', '#1D9E75', '#BA7517']

  return (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Today's Revenue
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {formatCurrency(stats.todayRevenue)}
          </p>
          <p className={`text-[11px] mt-0.5 ${stats.revenueChange >= 0 ? 'text-[#3B6D11]' : 'text-[#A32D2D]'}`}>
            <i className={`ti ${stats.revenueChange >= 0 ? 'ti-trending-up' : 'ti-trending-down'} text-[11px]`} aria-hidden="true"></i> 
            {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% vs yesterday
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-secondary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">
            Total Orders
          </p>
          <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
            {stats.todayOrders}
          </p>
          <p className={`text-[11px] mt-0.5 ${stats.ordersChange >= 0 ? 'text-[#3B6D11]' : 'text-[#A32D2D]'}`}>
            <i className={`ti ${stats.ordersChange >= 0 ? 'ti-trending-up' : 'ti-trending-down'} text-[11px]`} aria-hidden="true"></i> 
            {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange}%
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
            {inventory.filter(i => i.status === 'OVERSTOCK').length} items overstock
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3.5">
          <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-2.5">
            Revenue per Outlet — Last 7 Days
          </p>
          <RevenueChart data={chartData} outlets={outlets} colors={outletColors} />
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
            <div>
              <p className="text-[11px] font-medium text-[#854F0B]">Low Stock Alert</p>
              <p className="text-[10.5px] text-[#854F0B] mt-0.5">
                {inventory.filter(i => i.status === 'ORDER').length} items need reorder
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-[#E8F5F1] rounded-md">
            <i className="ti ti-check-circle text-[#1D9E75] text-sm mt-0.5" aria-hidden="true"></i>
            <div>
              <p className="text-[11px] font-medium text-[#1D9E75]">All Systems OK</p>
              <p className="text-[10.5px] text-[#1D9E75] mt-0.5">
                {outlets.length} outlets operational
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Outlet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {outlets.map((outlet, idx) => {
          // Calculate outlet revenue today
          const outletTodaySales = todaySales.filter(s => s.outletId === outlet.id)
          const outletRevenue = outletTodaySales.reduce((sum, sale) => sum + sale.total, 0)
          const targetProgress = outlet.targetDaily > 0 
            ? Math.round((outletRevenue / outlet.targetDaily) * 100)
            : 0

          return (
            <div
              key={outlet.id}
              className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: outletColors[idx] }}
                ></div>
                <p className="text-xs font-medium text-[hsl(var(--color-text-primary))]">
                  {outlet.name}
                </p>
              </div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
                {formatCurrency(outletRevenue)}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 bg-[hsl(var(--color-background-tertiary))] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(targetProgress, 100)}%`,
                      backgroundColor: outletColors[idx],
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-[hsl(var(--color-text-tertiary))]">
                  {targetProgress}%
                </span>
              </div>
              <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mt-1">
                Target: {formatCurrency(outlet.targetDaily)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
