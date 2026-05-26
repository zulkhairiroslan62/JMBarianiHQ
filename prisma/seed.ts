import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with real JM Bariani House data...')

  // Create main outlet (Subang Jaya HQ)
  const mainOutlet = await prisma.outlet.create({
    data: {
      name: 'Subang Jaya (HQ)',
      address: '21 & 23, Jalan SS 18/6, Ss18, 47500 Subang Jaya, Selangor',
      targetDaily: 8000,
      status: 'ACTIVE',
    },
  })

  console.log('Created main outlet:', mainOutlet.name)

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

  // Create manager for main outlet
  const managerPassword = await hash('manager123', 12)
  const manager = await prisma.user.create({
    data: {
      email: 'manager@jmbarianihouse.com',
      password: managerPassword,
      name: 'Manager Subang',
      role: 'MANAGER',
      outletId: mainOutlet.id,
    },
  })

  console.log('Created manager:', manager.email)

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

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        price: item.price,
        cost: item.cost,
        margin: ((item.price - item.cost) / item.price) * 100,
        category: item.category,
        status: 'ACTIVE',
        outletId: mainOutlet.id,
      },
    })
  }

  console.log('Created', menuItems.length, 'menu items')

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

  for (const item of inventoryItems) {
    await prisma.inventory.create({
      data: {
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        outletId: mainOutlet.id,
      },
    })
  }

  console.log('Created inventory items')

  // Create staff for main outlet
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

  for (let i = 0; i < 10; i++) {
    await prisma.staff.create({
      data: {
        name: staffNames[i],
        role: staffRoles[i % staffRoles.length],
        shift: ['MORNING', 'EVENING', 'FULL'][i % 3],
        outletId: mainOutlet.id,
      },
    })
  }

  console.log('Created staff members')

  console.log('Seeding completed with real JM Bariani House data!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
