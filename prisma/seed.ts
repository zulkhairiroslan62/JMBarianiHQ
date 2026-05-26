import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with real JM Bariani House data...')

  // Create all 4 real outlets
  const outlets = await Promise.all([
    prisma.outlet.create({
      data: {
        name: 'Subang Jaya (HQ)',
        address: 'No 29 & 31 Jalan SS18/6, Subang Jaya, Selangor, 47500',
        targetDaily: 8000,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'Setia Alam',
        address: 'Setia City Mall, LG-148, Level Lower Ground (Phase 2), Shah Alam, Selangor, 40170',
        targetDaily: 7000,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'Wangsa Walk',
        address: 'Wangsa Mall Walk, Lot G-02-A, Ground Floor, Kuala Lumpur, 53300',
        targetDaily: 6500,
        status: 'ACTIVE',
      },
    }),
    prisma.outlet.create({
      data: {
        name: 'IOI City Mall',
        address: 'LG-227, IOI City Mall 2, Putrajaya, Selangor, 62502',
        targetDaily: 7500,
        status: 'ACTIVE',
      },
    }),
  ])

  console.log('Created 4 outlets:', outlets.map(o => o.name).join(', '))

  // Create owner user
  const ownerPassword = await hash('admin123', 12)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@jmbarianihouse.com',
      password: ownerPassword,
      name: 'JM Owner',
      role: 'OWNER',
    },
  })

  console.log('Created owner:', owner.email)

  // Create managers for each outlet
  const managerPassword = await hash('manager123', 12)
  const managers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'manager.subang@jmbarianihouse.com',
        password: managerPassword,
        name: 'Manager Subang',
        role: 'MANAGER',
        outletId: outlets[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager.setia@jmbarianihouse.com',
        password: managerPassword,
        name: 'Manager Setia Alam',
        role: 'MANAGER',
        outletId: outlets[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager.wangsa@jmbarianihouse.com',
        password: managerPassword,
        name: 'Manager Wangsa',
        role: 'MANAGER',
        outletId: outlets[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager.ioi@jmbarianihouse.com',
        password: managerPassword,
        name: 'Manager IOI',
        role: 'MANAGER',
        outletId: outlets[3].id,
      },
    }),
  ])

  console.log('Created 4 managers')

  // Real menu items from JM Bariani House website
  const menuItems = [
    // Main Bariani Dishes
    { name: 'Nasi Bariani Plain', price: 8, cost: 3, category: 'Main' },
    { name: 'Nasi Bariani Ayam', price: 15, cost: 6, category: 'Main' },
    { name: 'Nasi Bariani Ayam Merah', price: 16, cost: 6.5, category: 'Main' },
    { name: 'Nasi Bariani Ayam Goreng Rempah', price: 16, cost: 6.5, category: 'Main' },
    { name: 'Nasi Bariani Ayam Panggang', price: 17, cost: 7, category: 'Main' },
    { name: 'Nasi Bariani Daging', price: 18, cost: 8, category: 'Main' },
    { name: 'Nasi Bariani Daging Masak Hitam', price: 19, cost: 8.5, category: 'Main' },
    { name: 'Nasi Bariani Kambing', price: 22, cost: 10, category: 'Main' },
    { name: 'Nasi Bariani Gam Ayam', price: 16, cost: 7, category: 'Main' },
    { name: 'Nasi Bariani Gam Daging', price: 19, cost: 8.5, category: 'Main' },
    { name: 'Nasi Bariani Gam Kambing', price: 23, cost: 10.5, category: 'Main' },
    
    // More Than Bariani
    { name: 'Nasi Lemak Ayam Goreng Berempah', price: 14, cost: 5.5, category: 'More Than Bariani' },
    { name: 'Ayam Masak Lemak Cili Api', price: 15, cost: 6, category: 'More Than Bariani' },
    { name: 'Mee Kari', price: 12, cost: 4.5, category: 'More Than Bariani' },
    { name: 'Mee Bandung', price: 12, cost: 4.5, category: 'More Than Bariani' },
    { name: 'Mee Rebus', price: 12, cost: 4.5, category: 'More Than Bariani' },
    { name: 'Asam Pedas Daging', price: 16, cost: 7, category: 'More Than Bariani' },
    
    // Appetizers
    { name: 'Spring Rolls', price: 8, cost: 2.5, category: 'Appetizer' },
    { name: 'Spicy Spring Rolls', price: 9, cost: 3, category: 'Appetizer' },
    { name: 'Chicken Wings', price: 12, cost: 4, category: 'Appetizer' },
    { name: 'Tauhu Bakar', price: 8, cost: 2.5, category: 'Appetizer' },
    { name: 'Cucur Ikan Bilis', price: 12, cost: 3.5, category: 'Appetizer' },
    { name: 'Popia Otak Otak', price: 14, cost: 4.5, category: 'Appetizer' },
    
    // Sides
    { name: 'Roti Pratha', price: 3, cost: 0.8, category: 'Side' },
    { name: 'Roti Bakar', price: 5, cost: 1.5, category: 'Side' },
    { name: 'Telur Separuh Masak', price: 3, cost: 0.8, category: 'Side' },
    { name: 'Gado-Gado', price: 8, cost: 2.5, category: 'Side' },
    
    // Drinks
    { name: 'Teh Tarik', price: 3.5, cost: 0.8, category: 'Beverage' },
    { name: 'Milo Ais', price: 4, cost: 1, category: 'Beverage' },
    { name: 'Limau Kasturi Asam Boi', price: 6.5, cost: 1.5, category: 'Beverage' },
    { name: 'Air Sirap', price: 3, cost: 0.6, category: 'Beverage' },
  ]

  // Create menu items for all outlets
  for (const outlet of outlets) {
    for (const item of menuItems) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          cost: item.cost,
          margin: ((item.price - item.cost) / item.price) * 100,
          category: item.category,
          status: 'ACTIVE',
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created', menuItems.length * outlets.length, 'menu items across all outlets')

  // Real inventory items for restaurant
  const inventoryItems = [
    { itemName: 'Rice (Basmati)', quantity: 100, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Chicken (Fresh)', quantity: 50, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Beef (Fresh)', quantity: 30, unit: 'kg', status: 'ORDER' },
    { itemName: 'Mutton (Imported)', quantity: 20, unit: 'kg', status: 'ORDER' },
    { itemName: 'Cooking Oil', quantity: 40, unit: 'liter', status: 'OVERSTOCK' },
    { itemName: 'Bariani Spice Mix', quantity: 15, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Coconut Milk', quantity: 25, unit: 'liter', status: 'SUFFICIENT' },
    { itemName: 'Chili Paste', quantity: 10, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Onions', quantity: 30, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Garlic', quantity: 15, unit: 'kg', status: 'SUFFICIENT' },
    { itemName: 'Eggs', quantity: 200, unit: 'pcs', status: 'SUFFICIENT' },
    { itemName: 'Vegetables (Mixed)', quantity: 40, unit: 'kg', status: 'SUFFICIENT' },
  ]

  // Create inventory for all outlets
  for (const outlet of outlets) {
    for (const item of inventoryItems) {
      await prisma.inventory.create({
        data: {
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          status: item.status,
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created inventory items for all outlets')

  // Create staff for all outlets
  const staffRoles = ['Head Chef', 'Sous Chef', 'Line Cook', 'Cashier', 'Waiter', 'Kitchen Helper', 'Cleaner']
  const staffNames = [
    'Ahmad bin Hassan',
    'Siti Nurhaliza',
    'Kumar Raj',
    'Lee Wei Ming',
    'Fatimah Zahra',
    'Raj Kumar Singh',
    'Wong Mei Ling',
    'Hassan Ibrahim',
    'Nurul Ain',
    'Tan Ah Kow',
  ]

  for (const outlet of outlets) {
    for (let i = 0; i < 10; i++) {
      await prisma.staff.create({
        data: {
          name: staffNames[i],
          role: staffRoles[i % staffRoles.length],
          shift: ['MORNING', 'EVENING', 'FULL'][i % 3],
          outletId: outlet.id,
        },
      })
    }
  }

  console.log('Created staff members for all outlets')

  console.log('Seeding completed with real JM Bariani House data!')
  console.log('Total: 4 outlets, 5 users, 124 menu items, 48 inventory items, 40 staff')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
