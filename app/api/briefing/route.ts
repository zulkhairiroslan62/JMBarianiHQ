import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch real data
    const [totalSales, todaySales, topItems, lowStock, outletSales, recentSales] = await Promise.all([
      prisma.sale.aggregate({ _sum: { total: true }, _count: true }),
      prisma.sale.findMany({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } }, take: 100 }),
      prisma.sale.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
      prisma.inventory.findMany({ where: { OR: [{ status: 'ORDER' }, { status: 'OUT_OF_STOCK' }] }, take: 10 }),
      prisma.sale.groupBy({ by: ['outletId'], _sum: { total: true }, _count: true }),
      prisma.sale.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { outlet: { select: { name: true } } } }),
    ])

    // Build data summary for AI
    const dataSummary = JSON.stringify({
      period: 'last 24 hours',
      totalRevenue: todaySales.reduce((s, r) => s + r.total, 0),
      todayTransactions: todaySales.length,
      allTimeRevenue: totalSales._sum.total || 0,
      allTimeTransactions: totalSales._count,
      lowStockItems: lowStock.map(i => ({ item: i.itemName, qty: i.quantity, unit: i.unit })),
      recentSales: recentSales.slice(0, 5).map(s => ({
        outlet: s.outlet?.name || 'Unknown',
        total: s.total,
        time: s.createdAt,
      })),
    })

    // Call Claude for briefing
    let briefing = ''
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `You are an AI restaurant analyst for JM Bariani House. Based on this real data, write a BRIEF executive briefing (under 200 words) in Malaysian English (natural, not formal). Include:
1. Today's performance summary
2. Key alerts (low stock, etc.)
3. Top selling items insight
4. Actionable recommendation

Data: ${dataSummary}`,
          }],
        }),
      })
      const data = await res.json()
      briefing = data.content?.[0]?.text || 'Briefing unavailable'
    } catch {
      briefing = '⚠️ AI briefing service unavailable. Check your Claude API key.'
    }

    return NextResponse.json({
      briefing,
      stats: {
        todayRevenue: todaySales.reduce((s, r) => s + r.total, 0),
        todayTransactions: todaySales.length,
        allTimeRevenue: totalSales._sum.total || 0,
        lowStockCount: lowStock.length,
        topPerformer: outletSales.sort((a, b) => (b._sum.total || 0) - (a._sum.total || 0))[0] || null,
      },
      lowStock,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
