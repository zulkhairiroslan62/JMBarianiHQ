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

    const outlets = await prisma.outlet.findMany({
      include: { _count: { select: { menuItems: true, staff: true, sales: true } } },
      orderBy: { name: 'asc' },
    })

    const data = await Promise.all(outlets.map(async (outlet) => {
      // Today's sales
      const todaySales = await prisma.sale.findMany({
        where: { outletId: outlet.id, createdAt: { gte: todayStart, lt: tomorrowStart } },
      })
      const todayRevenue = todaySales.reduce((s, r) => s + r.total, 0)
      const todayOrders = todaySales.length

      // Yesterday's sales
      const yesterdaySales = await prisma.sale.findMany({
        where: { outletId: outlet.id, createdAt: { gte: yesterdayStart, lt: todayStart } },
      })
      const yesterdayRevenue = yesterdaySales.reduce((s, r) => s + r.total, 0)

      // Growth percentage
      const growth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0

      // Inventory count
      const inventoryCount = await prisma.inventory.count({ where: { outletId: outlet.id } })

      // Daily target (store in outlet field or use default)
      const dailyTarget = (outlet as any).dailyTarget || 7500

      // Performance tag
      const allOutletsRevenue = await Promise.all(
        outlets.map(async (o) => {
          const s = await prisma.sale.aggregate({
            where: { outletId: o.id, createdAt: { gte: todayStart, lt: tomorrowStart } },
            _sum: { total: true },
          })
          return { id: o.id, revenue: s._sum.total || 0 }
        })
      )
      const maxRevenue = Math.max(...allOutletsRevenue.map(r => r.revenue))
      const isBestSeller = allOutletsRevenue.find(r => r.id === outlet.id)?.revenue === maxRevenue && maxRevenue > 0

      let tag = ''
      let tagColor = ''
      if (isBestSeller) { tag = '🔥 Best Seller Today'; tagColor = 'amber' }
      else if (growth > 5) { tag = '⚡ Rising Star'; tagColor = 'blue' }
      else if (growth >= -5) { tag = '⚡ Consistent Performer'; tagColor = 'blue' }
      else { tag = '📉 Needs Attention'; tagColor = 'red' }

      return {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address || outlet.name + ', Selangor',
        status: 'ACTIVE',
        todayRevenue,
        yesterdayRevenue,
        growth: parseFloat(growth.toFixed(1)),
        dailyTarget,
        targetPct: dailyTarget > 0 ? Math.min(Math.round((todayRevenue / dailyTarget) * 100), 100) : 0,
        todayOrders,
        menuItems: outlet._count.menuItems,
        inventory: inventoryCount,
        staff: outlet._count.staff,
        tag,
        tagColor,
        image: `https://images.unsplash.com/photo-${['1517248135467-4c7edcad34c4', '1552566626-52f8b828add9', '1559339352-56f7d7e8f8b8', '1466978913427-d18b5d3d2e8d'][outlets.indexOf(outlet) % 4]}?q=80&w=400&auto=format&fit=crop`,
      }
    }))

    // Overall stats
    const totalRevenue = data.reduce((s, o) => s + o.todayRevenue, 0)
    const totalOrders = data.reduce((s, o) => s + o.todayOrders, 0)
    const topOutlet = [...data].sort((a, b) => b.todayRevenue - a.todayRevenue)[0]
    const alerts = data.filter(o => o.growth < -5).length

    return NextResponse.json({ outlets: data, overview: { totalRevenue, totalOrders, topOutlet, alerts } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
