import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding mock data for presentation...')

  // Get all outlets, menu items, inventory, and staff
  const outlets = await prisma.outlet.findMany()
  const menuItems = await prisma.menuItem.findMany()
  const inventory = await prisma.inventory.findMany()
  const staff = await prisma.staff.findMany()

  if (outlets.length === 0 || menuItems.length === 0) {
    console.error('Please run main seed first: npm run db:seed')
    process.exit(1)
  }

  console.log(`Found ${outlets.length} outlets, ${menuItems.length} menu items`)

  // Generate 30 days of sales data with realistic patterns
  const today = new Date()
  let totalSales = 0

  for (let day = 29; day >= 0; day--) {
    const date = new Date(today)
    date.setDate(date.getDate() - day)
    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    for (const outlet of outlets) {
      // Weekend gets 1.5x more sales
      const baseSales = isWeekend ? 60 : 40
      const salesCount = baseSales + Math.floor(Math.random() * 20)

      for (let i = 0; i < salesCount; i++) {
        // Random time during business hours (11am - 10pm)
        const hour = 11 + Math.floor(Math.random() * 11)
        const minute = Math.floor(Math.random() * 60)
        const saleTime = new Date(date)
        saleTime.setHours(hour, minute, 0, 0)

        // Pick random menu item from this outlet
        const outletMenuItems = menuItems.filter(m => m.outletId === outlet.id)
        const randomItem = outletMenuItems[Math.floor(Math.random() * outletMenuItems.length)]
        const quantity = 1 + Math.floor(Math.random() * 3) // 1-3 quantity

        await prisma.sale.create({
          data: {
            outletId: outlet.id,
            menuItemId: randomItem.id,
            quantity,
            total: randomItem.price * quantity,
            date: saleTime,
            createdAt: saleTime,
          },
        })

        totalSales++
      }
    }
  }

  console.log(`Created ${totalSales} sales records (30 days)`)

  // Generate purchase orders (mix of pending, approved, completed)
  const suppliers = [
    'Syarikat Beras Nasional',
    'Fresh Meat Suppliers Sdn Bhd',
    'Spice Trading Co.',
    'Vegetable Wholesalers',
    'Packaging Solutions',
  ]

  const poStatuses = ['PENDING', 'APPROVED', 'COMPLETED', 'COMPLETED', 'COMPLETED']
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const poDate = new Date(today)
    poDate.setDate(poDate.getDate() - daysAgo)

    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const status = poStatuses[Math.floor(Math.random() * poStatuses.length)]

    const totalAmount = 500 + Math.floor(Math.random() * 3000)
    const notes = `PO-${String(i + 1).padStart(4, '0')} - Rice, Chicken, Spices`

    await prisma.purchaseOrder.create({
      data: {
        supplierName: supplier,
        status,
        total: totalAmount,
        notes,
        createdAt: poDate,
      },
    })
  }

  console.log('Created 20 purchase orders')

  // Generate invoices from suppliers
  const invoiceSuppliers = [
    'Beras Nasional Berhad',
    'Metro Meat Supply',
    'Spice Kingdom Trading',
    'Fresh Veg Wholesalers',
  ]

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const invDate = new Date(today)
    invDate.setDate(invDate.getDate() - daysAgo)

    const supplier = invoiceSuppliers[Math.floor(Math.random() * invoiceSuppliers.length)]
    const totalAmount = 800 + Math.floor(Math.random() * 2500)

    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(i + 1).padStart(5, '0')}`,
        supplier,
        rawImageUrl: `/mock-invoices/invoice-${i + 1}.jpg`,
        ocrData: JSON.stringify({
          supplier,
          total: totalAmount,
          items: ['Rice', 'Chicken', 'Spices'],
        }),
        confidence: 0.85 + Math.random() * 0.15,
        status: 'APPROVED',
        createdAt: invDate,
      },
    })
  }

  console.log('Created 15 supplier invoices')

  // Generate attendance records (last 30 days)
  let attendanceCount = 0
  for (let day = 29; day >= 0; day--) {
    const date = new Date(today)
    date.setDate(date.getDate() - day)

    for (const staffMember of staff) {
      // 95% attendance rate
      const isPresent = Math.random() > 0.05
      const status = isPresent ? 'PRESENT' : 'ABSENT'

      await prisma.attendance.create({
        data: {
          staffId: staffMember.id,
          date,
          status,
        },
      })
      attendanceCount++
    }
  }

  console.log(`Created ${attendanceCount} attendance records (30 days)`)

  // Generate waste logs (food waste tracking)
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const wasteDate = new Date(today)
    wasteDate.setDate(wasteDate.getDate() - daysAgo)

    const outlet = outlets[Math.floor(Math.random() * outlets.length)]
    const outletInventory = inventory.filter((inv: any) => inv.outletId === outlet.id)
    const randomInventory = outletInventory[Math.floor(Math.random() * outletInventory.length)]

    const wasteReasons = [
      'Past expiry date',
      'Cooking error',
      'Storage issue',
      'End of day disposal',
      'Delivery damage',
      'Quality control rejection',
    ]

    await prisma.wasteLog.create({
      data: {
        inventoryId: randomInventory.id,
        outletId: outlet.id,
        quantity: 0.5 + Math.random() * 3, // 0.5 - 3.5 kg
        reason: wasteReasons[Math.floor(Math.random() * wasteReasons.length)],
        date: wasteDate,
        createdAt: wasteDate,
      },
    })
  }

  console.log('Created 25 waste logs')

  console.log('\n✅ Mock data seeding completed!')
  console.log('Summary:')
  console.log(`- Sales: ${totalSales} transactions (30 days)`)
  console.log('- Purchase Orders: 20 (mix of pending/approved/completed)')
  console.log('- Invoices: 15 supplier invoices')
  console.log(`- Attendance: ${attendanceCount} records (30 days)`)
  console.log('- Waste Logs: 25 entries')
}

main()
  .catch((e) => {
    console.error('Mock seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
