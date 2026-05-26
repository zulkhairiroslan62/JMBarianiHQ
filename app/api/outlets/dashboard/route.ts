import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)
    const tomorrowStart = new Date(todayStart.getTime() + 86400000)
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const hourAgo = new Date(now.getTime() - 3600000)

    const outlets = await prisma.outlet.findMany({
      include: { _count: { select: { menuItems: true, staff: true } } },
      orderBy: { name: 'asc' },
    })

    // Overall totals for health score baseline
    let highestRevenue = 0
    let totalStaffAcrossOutlets = 0
    let totalInventoryAcrossOutlets = 0

    const outData = await Promise.all(outlets.map(async (outlet) => {
      // Today's sales
      const todaySales = await prisma.sale.findMany({
        where: { outletId: outlet.id, createdAt: { gte: todayStart, lt: tomorrowStart } },
      })
      const todayRevenue = todaySales.reduce((s, r) => s + r.total, 0)
      const todayOrders = todaySales.length

      // Yesterday
      const yesterdaySales = await prisma.sale.findMany({
        where: { outletId: outlet.id, createdAt: { gte: yesterdayStart, lt: todayStart } },
      })
      const yesterdayRevenue = yesterdaySales.reduce((s, r) => s + r.total, 0)
      const growth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0

      // Inventory
      const inventoryCount = await prisma.inventory.count({ where: { outletId: outlet.id } })
      const lowStockItems = await prisma.inventory.findMany({
        where: { outletId: outlet.id, quantity: { lte: 10 } },
        select: { itemName: true, quantity: true, unit: true },
        take: 3,
      })

      // Staff count
      const staffCount = await prisma.staff.count({ where: { outletId: outlet.id } })

      // 7-day sales sparkline
      const weekSales = await prisma.sale.findMany({
        where: { outletId: outlet.id, createdAt: { gte: weekAgo } },
        orderBy: { createdAt: 'asc' },
      })
      const sparkline: number[] = []
      for (let i = 6; i >= 0; i--) {
        const day = new Date(todayStart.getTime() - i * 86400000)
        const nextDay = new Date(day.getTime() + 86400000)
        const daySales = weekSales.filter(s => new Date(s.createdAt) >= day && new Date(s.createdAt) < nextDay)
        sparkline.push(daySales.reduce((s, r) => s + r.total, 0))
      }

      // Track for health score
      if (todayRevenue > highestRevenue) highestRevenue = todayRevenue
      totalStaffAcrossOutlets += staffCount
      totalInventoryAcrossOutlets += inventoryCount

      const dailyTarget = 7500
      const targetPct = dailyTarget > 0 ? Math.min(Math.round((todayRevenue / dailyTarget) * 100), 100) : 0

      // Health score (0-100): revenue (35%), inventory (25%), staff (20%), orders (20%)
      const revScore = dailyTarget > 0 ? Math.min(Math.round((todayRevenue / dailyTarget) * 35), 35) : 0
      const invScore = inventoryCount >= 12 ? 25 : Math.round((inventoryCount / 12) * 25)
      const staffScore = staffCount >= 8 ? 20 : Math.round((staffCount / 8) * 20)
      const ordScore = todayOrders >= 50 ? 20 : Math.round((todayOrders / 50) * 20)
      const healthScore = Math.min(revScore + invScore + staffScore + ordScore, 100)

      return {
        id: outlet.id, name: outlet.name, address: outlet.name + ', Selangor', status: 'ACTIVE',
        todayRevenue, yesterdayRevenue, growth: parseFloat(growth.toFixed(1)),
        dailyTarget, targetPct, todayOrders, menuItems: outlet._count.menuItems,
        inventory: inventoryCount, staff: staffCount,
        healthScore, sparkline,
        lowStockItems: lowStockItems.map(i => ({ name: i.itemName, qty: i.quantity, unit: i.unit })),
        tag: healthScore >= 80 ? '🔥 Best Seller Today' : healthScore >= 60 ? '⚡ Consistent Performer' : '📉 Needs Attention',
        tagColor: healthScore >= 80 ? 'amber' : healthScore >= 60 ? 'blue' : 'red',
        image: `https://images.unsplash.com/photo-${['1517248135467-4c7edcad34c4', '1552566626-52f8b828add9', '1559339352-56f7d7e8f8b8', '1466978913427-d18b5d3d2e8d'][outlets.indexOf(outlet) % 4]}?q=80&w=400&auto=format&fit=crop`,
      }
    }))

    // Sort by health score for ranking
    const sorted = [...outData].sort((a, b) => b.healthScore - a.healthScore)
    const totalRevenue = outData.reduce((s, o) => s + o.todayRevenue, 0)
    const totalOrders = outData.reduce((s, o) => s + o.todayOrders, 0)
    const bestOutlet = sorted[0]
    const worstOutlet = sorted[sorted.length - 1]
    const fastestGrowth = [...outData].sort((a, b) => b.growth - a.growth)[0]

    // Smart alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = []
    outData.forEach(o => {
      if (o.healthScore < 50) alerts.push({ type: 'critical', message: `${o.name} health score critical (${o.healthScore}/100)` })
      if (o.growth < -10) alerts.push({ type: 'warning', message: `${o.name} revenue dropped ${Math.abs(o.growth)}%` })
      o.lowStockItems.forEach(i => alerts.push({ type: 'warning', message: `${i.name} low at ${o.name} (${i.qty} ${i.unit})` }))
    })
    if (fastestGrowth && fastestGrowth.growth > 10) alerts.push({ type: 'info', message: `${fastestGrowth.name} exceeded target (+${fastestGrowth.growth}%)` })
    if (alerts.length === 0) alerts.push({ type: 'info', message: '🎉 All outlets performing well today' })

    // Activity feed (recent orders)
    const recentOrders = await prisma.sale.findMany({
      where: { createdAt: { gte: hourAgo } },
      include: { outlet: { select: { name: true } }, menuItem: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    const activity = recentOrders.map(o => ({
      time: new Date(o.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      outlet: o.outlet?.name || 'Unknown',
      item: o.menuItem?.name || 'Order',
      amount: o.total,
    }))

    return NextResponse.json({
      outlets: outData,
      overview: { totalRevenue, totalOrders, bestOutlet: bestOutlet?.name || '-', worstOutlet: worstOutlet?.name || '-', fastestGrowth: fastestGrowth?.name || '-', alerts: alerts.length },
      alerts,
      activity,
      ranking: sorted.map((o, i) => ({ rank: i + 1, name: o.name, score: o.healthScore })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
