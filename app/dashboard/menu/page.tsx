import { prisma } from '@/lib/prisma'

export default async function MenuPage() {
  // Fetch menu items from first outlet (Subang Jaya HQ)
  const outlet = await prisma.outlet.findFirst({
    where: { name: 'Subang Jaya (HQ)' },
  })

  const menuItems = await prisma.menuItem.findMany({
    where: {
      outletId: outlet?.id,
    },
    orderBy: {
      category: 'asc',
    },
  })

  // Calculate summary stats
  const totalItems = menuItems.length
  const avgMargin = menuItems.reduce((sum, item) => sum + item.margin, 0) / totalItems
  const bestSeller = menuItems[0] // Simplified - in real app would track actual sales
  const soldToday = Math.floor(Math.random() * 500) + 500 // Mock data

  const getMarginColor = (margin: number) => {
    if (margin >= 70) return 'text-[#27500A]'
    if (margin >= 50) return 'text-[#854F0B]'
    return 'text-[#A32D2D]'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Menu & Pricing</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            Manage menu items, pricing, and margins
          </p>
        </div>
        <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>
          Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Items</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">{totalItems}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Avg Margin</p>
          <p className="text-2xl font-semibold text-[#27500A]">{avgMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Best Seller</p>
          <p className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">{bestSeller?.name || 'N/A'}</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Sold Today</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">{soldToday}</p>
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Item Name</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Category</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Price</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Cost</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Margin</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Sold Today</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => {
                const soldTodayRandom = Math.floor(Math.random() * 150) + 50
                return (
                  <tr key={item.id} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                    <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-primary))]">RM {item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">RM {item.cost.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${getMarginColor(item.margin)}`}>
                        {item.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{soldTodayRandom}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded ${
                        item.status === 'ACTIVE' 
                          ? 'bg-[#EAF3DE] text-[#27500A]' 
                          : 'bg-[#FEE] text-[#A00]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[#7B3F00] hover:text-[#8B4A00] text-xs font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
