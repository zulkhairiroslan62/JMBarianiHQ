import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's sales with menu items
    const todaySales = await prisma.sale.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        menuItem: true,
        outlet: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate total revenue
    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)
    const totalOrders = todaySales.length

    // Calculate hourly sales for peak hours heatmap
    const hourlySales: { [key: number]: number } = {}
    for (let i = 0; i < 24; i++) {
      hourlySales[i] = 0
    }

    todaySales.forEach(sale => {
      const hour = sale.date.getHours()
      hourlySales[hour] += sale.total
    })

    // Convert to array format for chart
    const peakHoursData = Object.entries(hourlySales).map(([hour, revenue]) => ({
      hour: parseInt(hour),
      hourLabel: `${hour.padStart(2, '0')}:00`,
      revenue,
      orders: todaySales.filter(s => s.date.getHours() === parseInt(hour)).length,
    }))

    // Calculate best-selling items
    const itemSales: { [key: string]: { name: string; quantity: number; revenue: number; category: string } } = {}

    todaySales.forEach(sale => {
      const itemId = sale.menuItemId
      if (!itemSales[itemId]) {
        itemSales[itemId] = {
          name: sale.menuItem.name,
          quantity: 0,
          revenue: 0,
          category: sale.menuItem.category,
        }
      }
      itemSales[itemId].quantity += sale.quantity
      itemSales[itemId].revenue += sale.total
    })

    // Sort by quantity and get top 10
    const bestSelling = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Get latest 5 sales for live feed
    const latestSales = todaySales.slice(0, 5).map(sale => ({
      id: sale.id,
      time: sale.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      item: sale.menuItem.name,
      outlet: sale.outlet.name,
      quantity: sale.quantity,
      amount: sale.total,
    }))

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      peakHoursData,
      bestSelling,
      latestSales,
      lastUpdated: now.toISOString(),
    })
  } catch (error) {
    console.error('Real-time dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time data' },
      { status: 500 }
    )
  }
}
