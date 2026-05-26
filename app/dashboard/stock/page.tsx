'use client'

export default function StockPage() {
  const inventory = [
    { name: 'Rice (Basmati)', qty: 50, unit: 'kg', status: 'SUFFICIENT', aiSuggestion: 'Order 30kg', shelfLife: '2026-06-15' },
    { name: 'Chicken', qty: 15, unit: 'kg', status: 'ORDER', aiSuggestion: 'Order 40kg', shelfLife: '2026-05-28' },
    { name: 'Mutton', qty: 8, unit: 'kg', status: 'ORDER', aiSuggestion: 'Order 25kg', shelfLife: '2026-05-27' },
    { name: 'Beef', qty: 12, unit: 'kg', status: 'SUFFICIENT', aiSuggestion: 'No action', shelfLife: '2026-05-29' },
    { name: 'Cooking Oil', qty: 25, unit: 'liter', status: 'OVERSTOCK', aiSuggestion: 'Reduce order', shelfLife: '2026-08-20' },
    { name: 'Spices Mix', qty: 5, unit: 'kg', status: 'SUFFICIENT', aiSuggestion: 'Order 3kg', shelfLife: '2026-07-10' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER': return 'bg-[#FDEAEA] text-[#A32D2D]'
      case 'OVERSTOCK': return 'bg-[#FEF3E8] text-[#854F0B]'
      default: return 'bg-[#EAF3DE] text-[#27500A]'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Smart Stock</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            AI-powered demand forecasting
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent border border-[hsl(var(--color-border-secondary))] text-[hsl(var(--color-text-primary))] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[hsl(var(--color-background-secondary))]">
            <i className="ti ti-refresh text-sm mr-1" aria-hidden="true"></i>
            Refresh Forecast
          </button>
          <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
            <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Item Name</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Current Stock</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">AI Suggestion</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Shelf Life</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-primary))]">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">
                    {item.qty} {item.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">
                    <div className="flex items-center gap-1">
                      <i className="ti ti-brain text-[#7B3F00] text-sm" aria-hidden="true"></i>
                      {item.aiSuggestion}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-tertiary))]">{item.shelfLife}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#7B3F00] hover:text-[#8B4A00] text-xs font-medium">
                      Generate PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Waste Log</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))]">
            <div>
              <p className="text-sm text-[hsl(var(--color-text-primary))]">Chicken - Expired</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Damansara • 2026-05-25</p>
            </div>
            <span className="text-sm font-medium text-[#A32D2D]">2.5 kg</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-[hsl(var(--color-text-primary))]">Rice - Damaged packaging</p>
              <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Subang • 2026-05-24</p>
            </div>
            <span className="text-sm font-medium text-[#A32D2D]">1.2 kg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
