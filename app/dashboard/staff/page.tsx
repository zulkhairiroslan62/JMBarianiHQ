'use client'

export default function StaffPage() {
  const staff = [
    { name: 'Ahmad bin Ali', role: 'Chef', outlet: 'Damansara', shift: 'FULL', status: 'PRESENT' },
    { name: 'Siti Nurhaliza', role: 'Cashier', outlet: 'Damansara', shift: 'MORNING', status: 'PRESENT' },
    { name: 'Kumar Raj', role: 'Waiter', outlet: 'Subang', shift: 'EVENING', status: 'ABSENT' },
    { name: 'Lee Wei Ming', role: 'Kitchen Helper', outlet: 'Subang', shift: 'FULL', status: 'ABSENT' },
    { name: 'Fatimah Zahra', role: 'Chef', outlet: 'Cheras', shift: 'MORNING', status: 'PRESENT' },
    { name: 'Raj Kumar', role: 'Cashier', outlet: 'Cheras', shift: 'EVENING', status: 'PRESENT' },
    { name: 'Wong Mei Ling', role: 'Waiter', outlet: 'Puchong', shift: 'FULL', status: 'PRESENT' },
    { name: 'Hassan Ibrahim', role: 'Kitchen Helper', outlet: 'Puchong', shift: 'MORNING', status: 'MC' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-[#EAF3DE] text-[#27500A]'
      case 'ABSENT': return 'bg-[#FDEAEA] text-[#A32D2D]'
      case 'MC': return 'bg-[#FEF3E8] text-[#854F0B]'
      case 'LEAVE': return 'bg-[#E8F4F8] text-[#185FA5]'
      default: return 'bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]'
    }
  }

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case 'MORNING': return 'bg-[#FFF4E6] text-[#BA7517]'
      case 'EVENING': return 'bg-[#E8F4F8] text-[#185FA5]'
      case 'FULL': return 'bg-[#F3E8FF] text-[#7C3AED]'
      default: return 'bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Staff Management</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">
            Manage staff attendance and shifts
          </p>
        </div>
        <button className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1" aria-hidden="true"></i>
          Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Total Staff</p>
          <p className="text-2xl font-semibold text-[hsl(var(--color-text-primary))]">28</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Present Today</p>
          <p className="text-2xl font-semibold text-[#27500A]">24</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">Absent</p>
          <p className="text-2xl font-semibold text-[#A32D2D]">2</p>
        </div>
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-3">
          <p className="text-[10.5px] text-[hsl(var(--color-text-tertiary))] mb-1">On Leave/MC</p>
          <p className="text-2xl font-semibold text-[#854F0B]">2</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-border-tertiary))] bg-[hsl(var(--color-background-secondary))]">
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Name</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Role</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Outlet</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Shift</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Status Today</th>
                <th className="text-left text-[10.5px] font-medium text-[hsl(var(--color-text-tertiary))] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((person, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--color-border-tertiary))] hover:bg-[hsl(var(--color-background-secondary))]">
                  <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--color-text-primary))]">{person.name}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{person.role}</td>
                  <td className="px-4 py-3 text-sm text-[hsl(var(--color-text-secondary))]">{person.outlet}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${getShiftBadge(person.shift)}`}>
                      {person.shift}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(person.status)}`}>
                      {person.status}
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
