import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)

    // Get sales with relations
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: twoWeeksAgo } },
      include: { outlet: { select: { name: true } }, menuItem: { select: { name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Heatmap: day of week x hour
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const heatmap: Record<string, Record<number, number>> = {}
    days.forEach(d => { heatmap[d] = {}; for (let h = 7; h <= 23; h++) heatmap[d][h] = 0 })
    sales.forEach(s => {
      const d = new Date(s.createdAt)
      const day = days[d.getDay()]
      const hour = d.getHours()
      if (heatmap[day]?.[hour] !== undefined) heatmap[day][hour] += s.total
    })
    let maxHeat = 0
    Object.values(heatmap).forEach(h => Object.values(h).forEach(v => { if (v > maxHeat) maxHeat = v }))

    // Week comparison
    const thisWeek = sales.filter(s => new Date(s.createdAt) >= weekAgo)
    const lastWeek = sales.filter(s => new Date(s.createdAt) >= twoWeeksAgo && new Date(s.createdAt) < weekAgo)
    const weekComparison = days.map((day, idx) => ({
      day,
      thisWeek: thisWeek.filter(s => new Date(s.createdAt).getDay() === idx).reduce((sum, s) => sum + s.total, 0),
      lastWeek: lastWeek.filter(s => new Date(s.createdAt).getDay() === idx).reduce((sum, s) => sum + s.total, 0),
    }))

    // Top items by revenue
    const itemRevenue: Record<string, { revenue: number; count: number }> = {}
    sales.forEach(s => {
      const name = s.menuItem?.name || 'Unknown'
      if (!itemRevenue[name]) itemRevenue[name] = { revenue: 0, count: 0 }
      itemRevenue[name].revenue += s.total
      itemRevenue[name].count += s.quantity
    })
    const topItems = Object.entries(itemRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([name, data], idx) => ({ rank: idx + 1, name, ...data }))

    // Outlet comparison
    const outletData: Record<string, { revenue: number; orders: number }> = {}
    sales.forEach(s => {
      const name = s.outlet?.name || 'Unknown'
      if (!outletData[name]) outletData[name] = { revenue: 0, orders: 0 }
      outletData[name].revenue += s.total
      outletData[name].orders += 1
    })
    const outletComparison = Object.entries(outletData).map(([name, d]) => ({ name, ...d, avgOrder: d.orders > 0 ? d.revenue / d.orders : 0 }))

    return NextResponse.json({
      heatmap, maxHeat, weekComparison, topItems, outletComparison,
      thisWeekRevenue: thisWeek.reduce((s, r) => s + r.total, 0),
      lastWeekRevenue: lastWeek.reduce((s, r) => s + r.total, 0),
      totalOrders: sales.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
