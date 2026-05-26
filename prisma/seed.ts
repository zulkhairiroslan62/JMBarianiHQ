import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create outlets
  const outlets = await Promise.all([
    prisma.outlet.create({
      data: {
        name: 'Damansara',
        address: 'Jalan Damansara, Kuala Lumpur',
        targetDaily: 5000,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'Subang',
        address: 'Subang Jaya, Selangor',
        targetDaily: 4500,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'Cheras',
        address: 'Cheras, Kuala Lumpur',
        targetDaily: 4000,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'Puchong',
        address: 'Puchong, Selangor',
        targetDaily: 3500,
        status: 'ACTIVE',
      },
    }),
  ])

  console.log('Created outlets:', outlets.map(o => o.name).join(', '))

  // Create owner user
  const ownerPassword = await hash('admin123', 12)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@jmbariani.com',
      password: ownerPassword,
      name: 'JM Owner',
      role: 'OWNER',
    },
  })

  console.log('Created owner:', owner.email)

  // Create manager for each outlet
  const managerPassword = await hash('manager123', 12)
  const managers = await Promise.all(
    outlets.map((outlet, idx) =>
      prisma.user.create({
        data: {
          email: `manager${idx + 1}@jmbariani.com`,
          password: managerPassword,
          name: `Manager ${outlet.name}`,
          role: 'MANAGER',
          outletId: outlet.id,
        },
      })
    )
  )

  console.log('Created managers:', managers.map(m => m.email).join(', '))

  // Create sample menu items
  const menuItems = [
    { name: 'Nasi Briyani Ayam', price: 15, cost: 6 },
    { name: 'Nasi Briyani Kambing', price: 18, cost: 8 },
    { name: 'Nasi Briyani Daging', price: 17, cost: 7.5 },
    { name: 'Roti Canai', price: 2.5, cost: 0.8 },
    { name: 'Teh Tarik', price: 3, cost: 0.5 },
  ]

  for (const outlet of outlets) {
    for (const item of menuItems) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          cost: item.cost,
          margin: ((item.price - item.cost) / item.price) * 100,
          status: 'ACTIVE',
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created menu items for all outlets')

  // Create sample inventory
  const inventoryItems = [
    { itemName: 'Rice (Basmati)', quantity: 50, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Chicken', quantity: 15, unit: 'kg', status: 'ORDER' },
    { itemName: 'Mutton', quantity: 8, unit: 'kg', status: 'ORDER' },
    { itemName: 'Beef', quantity: 12, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Cooking Oil', quantity: 25, unit: 'liter', status: 'OVERSTOCK' },
    { itemName: 'Spices Mix', quantity: 5, unit: 'kg', status: 'SUFFICIENT' },
  ]

  for (const outlet of outlets) {
    for (const item of inventoryItems) {
      await prisma.inventory.create({
        data: {
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          status: item.status as any,
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created inventory for all outlets')

  // Create sample staff
  const staffRoles = ['Chef', 'Cashier', 'Waiter', 'Kitchen Helper']
  for (const outlet of outlets) {
    for (let i = 0; i < 7; i++) {
      await prisma.staff.create({
        data: {
          name: `Staff ${i + 1}`,
          role: staffRoles[i % staffRoles.length],
          shift: ['MORNING', 'EVENING', 'FULL'][i % 3] as any,
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created staff for all outlets')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
