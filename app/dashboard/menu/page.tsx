'use client'

export default function MenuPage() {
  const menuItems = [
    { name: 'Nasi Briyani Ayam', price: 15, cost: 6, margin: 60, category: 'Main', status: 'ACTIVE', soldToday: 145 },
    { name: 'Nasi Briyani Kambing', price: 18, cost: 8, margin: 55.6, category: 'Main', status: 'ACTIVE', soldToday: 98 },
    { name: 'Nasi Briyani Daging', price: 17, cost: 7.5, margin: 55.9, category: 'Main', status: 'ACTIVE', soldToday: 112 },
    { name: 'Roti Canai', price: 2.5, cost: 0.8, margin: 68, category: 'Side', status: 'ACTIVE', soldToday: 234 },
    { name: 'Teh Tarik', price: 3, cost: 0.5, margin: 83.3, category: 'Beverage', status: 'ACTIVE', soldToday: 189 },
    { name: 'Milo Ais', price: 3.5, cost: 0.7, margin: 80, category: 'Beverage', status: 'ACTIVE', soldToday: 156 },
  ]

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
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Items</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">24</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Avg Margin</p>
          <p className="text-2xl font-semibold text-[#27500A]">67.1%</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Best Seller</p>
          <p className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">Roti Canai</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Sold Today</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">934</p>
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
              {menuItems.map((item, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-primary))]">RM {item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">RM {item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getMarginColor(item.margin)}`}>
                      {item.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{item.soldToday}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-2 py-1 rounded bg-[#EAF3DE] text-[#27500A]">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#7B3F00] hover:text-[#8B4A00] text-xs font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
