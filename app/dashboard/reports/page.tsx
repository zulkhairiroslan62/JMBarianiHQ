import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import SalesReportChart from '@/components/SalesReportChart'

export default async function ReportsPage() {
  // Get last 30 days of sales data
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const sales = await prisma.sale.findMany({
    where: {
      date: {
        gte: thirtyDaysAgo,
        lte: today,
      },
    },
    include: {
      menuItem: true,
      outlet: true,
    },
  })

  // Calculate total revenue and orders
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalOrders = sales.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate profit margin (assuming 40% cost on average)
  const estimatedCost = totalRevenue * 0.4
  const estimatedProfit = totalRevenue - estimatedCost
  const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0

  // Get previous 30 days for comparison
  const sixtyDaysAgo = new Date(thirtyDaysAgo)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30)

  const previousSales = await prisma.sale.findMany({
    where: {
      date: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
  })

  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0)
  const previousOrders = previousSales.length
  const previousAvgOrderValue = previousOrders > 0 ? previousRevenue / previousOrders : 0

  const revenueChange = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0
  const ordersChange = previousOrders > 0 
    ? ((totalOrders - previousOrders) / previousOrders) * 100 
    : 0
  const avgOrderChange = previousAvgOrderValue > 0 
    ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 
    : 0

  // Generate daily revenue data for chart (last 30 days)
  const dailyRevenue: { [key: string]: number } = {}
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyRevenue[dateStr] = 0
  }

  sales.forEach(sale => {
    const dateStr = sale.date.toISOString().split('T')[0]
    if (dailyRevenue[dateStr] !== undefined) {
      dailyRevenue[dateStr] += sale.total
    }
  })

  const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue,
  }))

  // Calculate outlet performance
  const outletPerformance: { [key: string]: { name: string; revenue: number; orders: number } } = {}
  
  sales.forEach(sale => {
    const outletId = sale.outletId
    if (!outletPerformance[outletId]) {
      outletPerformance[outletId] = {
        name: sale.outlet.name,
        revenue: 0,
        orders: 0,
      }
    }
    outletPerformance[outletId].revenue += sale.total
    outletPerformance[outletId].orders += 1
  })

  const outlets = Object.values(outletPerformance).sort((a, b) => b.revenue - a.revenue)

  // Calculate top selling items
  const itemSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

  sales.forEach(sale => {
    const itemId = sale.menuItemId
    if (!itemSales[itemId]) {
      itemSales[itemId] = {
        name: sale.menuItem.name,
        quantity: 0,
        revenue: 0,
      }
    }
    itemSales[itemId].quantity += sale.quantity
    itemSales[itemId].revenue += sale.total
  })

  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Sales Report</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            Last 30 days revenue trends and performance analytics
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
            <i className="ti ti-download text-sm mr-1" aria-hidden="true"></i>
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {formatCurrency(totalRevenue)}
          </p>
          <p className={`text-[11px] mt-1 ${revenueChange >= 0 ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>
            <i className={`ti ${revenueChange >= 0 ? 'ti-trending-up' : 'ti-trending-down'} text-[11px]`} aria-hidden="true"></i> 
            {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs last 30 days
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Orders</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {totalOrders.toLocaleString()}
          </p>
          <p className={`text-[11px] mt-1 ${ordersChange >= 0 ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>
            <i className={`ti ${ordersChange >= 0 ? 'ti-trending-up' : 'ti-trending-down'} text-[11px]`} aria-hidden="true"></i>
            {ordersChange >= 0 ? '+' : ''}{ordersChange.toFixed(1)}%
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Avg Order Value</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {formatCurrency(avgOrderValue)}
          </p>
          <p className={`text-[11px] mt-1 ${avgOrderChange >= 0 ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>
            <i className={`ti ${avgOrderChange >= 0 ? 'ti-trending-up' : 'ti-trending-down'} text-[11px]`} aria-hidden="true"></i>
            {avgOrderChange >= 0 ? '+' : ''}{avgOrderChange.toFixed(1)}%
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Profit Margin</p>
          <p className="text-2xl font-semibold text-[#27500A]">{profitMargin.toFixed(1)}%</p>
          <p className="text-[11px] text-[hsl(var(--color-text-tertiary))] mt-1">Estimated</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
          Revenue Trend — Last 30 Days
        </h3>
        <SalesReportChart data={chartData} />
      </div>

      {/* Outlet Performance */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Outlet Performance</h3>
        <div className="space-y-3">
          {outlets.map((outlet, idx) => {
            const percentage = totalRevenue > 0 ? (outlet.revenue / totalRevenue) * 100 : 0
            const colors = ['#C8440A', '#185FA5', '#1D9E75', '#BA7517']
            
            return (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{outlet.name}</p>
                    <p className="text-xs text-[hsl(var(--color-text-tertiary))]">{outlet.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                    {formatCurrency(outlet.revenue)}
                  </p>
                  <p className="text-xs text-[#27500A]">{percentage.toFixed(1)}% of total</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Top Selling Items</h3>
        <div className="space-y-2">
          {topItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[hsl(var(--color-text-tertiary))]">#{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{item.name}</p>
                  <p className="text-xs text-[hsl(var(--color-text-tertiary))]">{item.quantity} sold</p>
                </div>
              </div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                {formatCurrency(item.revenue)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
