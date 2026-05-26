'use client'

export default function PurchaseOrdersPage() {
  const orders = [
    { id: 'PO-001', supplier: 'Fresh Mart Sdn Bhd', status: 'PENDING', total: 2450, items: 8, date: '2026-05-26' },
    { id: 'PO-002', supplier: 'Spice World Trading', status: 'PENDING', total: 890, items: 5, date: '2026-05-25' },
    { id: 'PO-003', supplier: 'Meat Supply Co', status: 'APPROVED', total: 3200, items: 12, date: '2026-05-24' },
    { id: 'PO-004', supplier: 'Fresh Mart Sdn Bhd', status: 'RECEIVED', total: 1850, items: 6, date: '2026-05-23' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FEF3E8] text-[#854F0B]'
      case 'APPROVED': return 'bg-[#EAF3DE] text-[#27500A]'
      case 'RECEIVED': return 'bg-[#E8F4F8] text-[#185FA5]'
      case 'LATE': return 'bg-[#FDEAEA] text-[#A32D2D]'
      default: return 'bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Purchase Orders</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            Manage supplier orders and deliveries
          </p>
        </div>
        <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>
          Create PO
        </button>
      </div>

      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">PO Number</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Supplier</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Items</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Total</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Date</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">{order.id}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{order.supplier}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{order.items} items</td>
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">
                    RM {order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-tertiary))]">{order.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button className="text-[#27500A] hover:text-[#3B6D11] text-xs font-medium">
                            Approve
                          </button>
                          <button className="text-[#A32D2D] hover:text-[#C13838] text-xs font-medium">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="text-[#7B3F00] hover:text-[#8B4A00] text-xs font-medium">
                        View
                      </button>
                    </div>
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
