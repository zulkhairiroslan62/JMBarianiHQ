import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function OutletDetailPage({ params }: { params: { id: string } }) {
  const outlet = await prisma.outlet.findUnique({
    where: { id: params.id },
    include: {
      menuItems: {
        orderBy: { name: 'asc' },
      },
      inventory: {
        orderBy: { itemName: 'asc' },
      },
      staff: {
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!outlet) {
    notFound()
  }

  // Get today's sales for this outlet
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todaySales = await prisma.sale.findMany({
    where: {
      outletId: outlet.id,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const todayOrders = todaySales.length
  const targetProgress = outlet.targetDaily > 0 
    ? Math.round((todayRevenue / outlet.targetDaily) * 100)
    : 0

  // Get last 7 days sales
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const last7DaysSales = await prisma.sale.findMany({
    where: {
      outletId: outlet.id,
      date: {
        gte: sevenDaysAgo,
      },
    },
  })

  const last7DaysRevenue = last7DaysSales.reduce((sum, sale) => sum + sale.total, 0)
  const avgDailyRevenue = last7DaysRevenue / 7

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/outlets"
            className="text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-text-primary))]"
          >
            <i className="ti ti-arrow-left text-lg" aria-hidden="true"></i>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">
              {outlet.name}
            </h1>
            <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
              {outlet.address}
            </p>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded ${
          outlet.status === 'ACTIVE' 
            ? 'bg-[#EAF3DE] text-[#27500A]' 
            : 'bg-[#FEE] text-[#A00]'
        }`}>
          {outlet.status}
        </span>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Today's Revenue</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {formatCurrency(todayRevenue)}
          </p>
          <p className="text-[11px] text-[hsl(var(--color-text-secondary))] mt-1">
            Target: {formatCurrency(outlet.targetDaily)}
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Orders Today</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {todayOrders}
          </p>
          <p className="text-[11px] text-[hsl(var(--color-text-secondary))] mt-1">
            {targetProgress}% of target
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">7-Day Average</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {formatCurrency(avgDailyRevenue)}
          </p>
          <p className="text-[11px] text-[hsl(var(--color-text-secondary))] mt-1">
            Per day
          </p>
        </div>

        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Staff</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">
            {outlet.staff.length}
          </p>
          <p className="text-[11px] text-[hsl(var(--color-text-secondary))] mt-1">
            Active employees
          </p>
        </div>
      </div>

      {/* Target Progress */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
            Daily Target Progress
          </h3>
          <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
            {targetProgress}%
          </span>
        </div>
        <div className="h-3 bg-[hsl(var(--color-background-secondary))] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#7B3F00] rounded-full transition-all"
            style={{ width: `${Math.min(targetProgress, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-2">
          {formatCurrency(todayRevenue)} of {formatCurrency(outlet.targetDaily)} target
        </p>
      </div>

      {/* Staff List */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
          Staff ({outlet.staff.length})
        </h3>
        <div className="space-y-2">
          {outlet.staff.slice(0, 5).map((staff) => (
            <div key={staff.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                  {staff.name}
                </p>
                <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                  {staff.role}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]">
                {staff.shift}
              </span>
            </div>
          ))}
          {outlet.staff.length > 5 && (
            <p className="text-xs text-[hsl(var(--color-text-tertiary))] text-center pt-2">
              +{outlet.staff.length - 5} more staff
            </p>
          )}
        </div>
      </div>

      {/* Inventory Status */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
          Inventory Status ({outlet.inventory.length} items)
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 bg-[#EAF3DE] rounded">
            <p className="text-xs text-[#27500A] mb-1">Sufficient</p>
            <p className="text-lg font-bold text-[#27500A]">
              {outlet.inventory.filter(i => i.status === 'SUFFICIENT').length}
            </p>
          </div>
          <div className="text-center p-2 bg-[#FEF3E8] rounded">
            <p className="text-xs text-[#854F0B] mb-1">Need Order</p>
            <p className="text-lg font-bold text-[#854F0B]">
              {outlet.inventory.filter(i => i.status === 'ORDER').length}
            </p>
          </div>
          <div className="text-center p-2 bg-[#E8F5F1] rounded">
            <p className="text-xs text-[#1D9E75] mb-1">Overstock</p>
            <p className="text-lg font-bold text-[#1D9E75]">
              {outlet.inventory.filter(i => i.status === 'OVERSTOCK').length}
            </p>
          </div>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {outlet.inventory.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-[hsl(var(--color-text-primary))]">{item.itemName}</span>
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--color-text-secondary))]">
                  {item.quantity} {item.unit}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  item.status === 'SUFFICIENT' ? 'bg-[#EAF3DE] text-[#27500A]' :
                  item.status === 'ORDER' ? 'bg-[#FEF3E8] text-[#854F0B]' :
                  'bg-[#E8F5F1] text-[#1D9E75]'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
          Menu Items ({outlet.menuItems.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {outlet.menuItems.slice(0, 6).map((item) => (
            <div key={item.id} className="p-2 border border-[hsl(var(--color-border-tertiary))] rounded">
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-1">
                {item.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--color-text-tertiary))]">
                  {item.category}
                </span>
                <span className="text-sm font-medium text-[#7B3F00]">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {outlet.menuItems.length > 6 && (
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] text-center mt-3">
            +{outlet.menuItems.length - 6} more items
          </p>
        )}
      </div>
    </div>
  )
}
