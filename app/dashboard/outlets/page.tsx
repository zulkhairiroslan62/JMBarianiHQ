import { prisma } from '@/lib/prisma'

export default async function OutletsPage() {
  const outlets = await prisma.outlet.findMany({
    include: {
      _count: {
        select: {
          menuItems: true,
          inventory: true,
          staff: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Outlets</h1>
        <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>
          Add Outlet
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {outlets.map((outlet) => {
          const progress = Math.min(100, Math.floor(Math.random() * 120) + 60)
          const todayRevenue = Math.floor((outlet.targetDaily * progress) / 100)
          const todayOrders = Math.floor(Math.random() * 50) + 70

          return (
            <div key={outlet.id} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-medium text-[hsl(var(--color-text-primary))] mb-1">
                    {outlet.name}
                  </h3>
                  <p className="text-xs text-[hsl(var(--color-text-tertiary))]">
                    {outlet.address}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded ${
                  outlet.status === 'ACTIVE' 
                    ? 'bg-[#EAF3DE] text-[#27500A]' 
                    : 'bg-[#FEE] text-[#A00]'
                }`}>
                  {outlet.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[hsl(var(--color-text-tertiary))]">Daily Target</span>
                    <span className="text-[hsl(var(--color-text-secondary))]">
                      RM {todayRevenue.toLocaleString()} / RM {outlet.targetDaily.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--color-background-secondary))] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#7B3F00] rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[hsl(var(--color-border-tertiary))]">
                  <div>
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mb-0.5">Orders Today</p>
                    <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">{todayOrders}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mb-0.5">Revenue</p>
                    <p className="text-lg font-medium text-[hsl(var(--color-text-primary))]">
                      RM {todayRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[hsl(var(--color-border-tertiary))]">
                  <div>
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mb-0.5">Menu Items</p>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{outlet._count.menuItems}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mb-0.5">Inventory</p>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{outlet._count.inventory}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))] mb-0.5">Staff</p>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{outlet._count.staff}</p>
                  </div>
                </div>

                <button className="w-full text-sm text-[#7B3F00] hover:text-[#8B4A00] font-medium py-2 border border-[hsl(var(--color-border-secondary))] rounded-md hover:bg-[hsl(var(--color-background-secondary))]">
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
