'use client'

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Sales Report</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            Revenue trends and performance analytics
          </p>
        </div>
        <div className="flex gap-2">
          <select className="text-xs px-3 py-1.5 rounded-md border border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
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
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">RM 103,740</p>
          <p className="text-[11px] text-[#27500A] mt-1">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +15.2% vs last week
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Orders</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">2,674</p>
          <p className="text-[11px] text-[#27500A] mt-1">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +8.4%
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Avg Order Value</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">RM 38.80</p>
          <p className="text-[11px] text-[#27500A] mt-1">
            <i className="ti ti-trending-up text-[11px]" aria-hidden="true"></i> +6.2%
          </p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Profit Margin</p>
          <p className="text-2xl font-semibold text-[#27500A]">67.1%</p>
          <p className="text-[11px] text-[hsl(var(--color-text-tertiary))] mt-1">Consistent</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Revenue Trend</h3>
        <div className="h-[250px] flex items-center justify-center text-[hsl(var(--color-text-tertiary))] text-sm">
          Chart placeholder (Recharts line chart)
        </div>
      </div>

      {/* Outlet Performance */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Outlet Performance</h3>
        <div className="space-y-3">
          {[
            { name: 'Damansara', revenue: 32450, orders: 892, growth: 18.5 },
            { name: 'Subang', revenue: 28920, orders: 745, growth: 12.3 },
            { name: 'Cheras', revenue: 24180, orders: 621, growth: 15.8 },
            { name: 'Puchong', revenue: 18190, orders: 416, growth: 10.2 },
          ].map((outlet) => (
            <div key={outlet.name} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{outlet.name}</p>
                <p className="text-xs text-[hsl(var(--color-text-tertiary))]">{outlet.orders} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                  RM {outlet.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-[#27500A]">+{outlet.growth}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">Top Selling Items</h3>
        <div className="space-y-2">
          {[
            { name: 'Roti Canai', sold: 1638, revenue: 4095 },
            { name: 'Nasi Briyani Ayam', sold: 1015, revenue: 15225 },
            { name: 'Teh Tarik', sold: 1323, revenue: 3969 },
            { name: 'Nasi Briyani Daging', sold: 784, revenue: 13328 },
            { name: 'Milo Ais', sold: 1092, revenue: 3822 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[hsl(var(--color-border-tertiary))] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[hsl(var(--color-text-tertiary))]">#{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{item.name}</p>
                  <p className="text-xs text-[hsl(var(--color-text-tertiary))]">{item.sold} sold</p>
                </div>
              </div>
              <p className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                RM {item.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
