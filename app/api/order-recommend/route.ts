import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { outletId: true },
    })

    if (!user?.outletId) {
      return NextResponse.json({ error: 'No outlet assigned' }, { status: 400 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [sales, inventory, recentOrders] = await Promise.all([
      prisma.sale.findMany({
        where: {
          outletId: user.outletId,
          date: { gte: sevenDaysAgo },
        },
        include: { menuItem: { select: { name: true, category: true } } },
      }),
      prisma.inventory.findMany({
        where: { outletId: user.outletId },
        orderBy: { quantity: 'asc' },
      }),
      prisma.stockOrder.findMany({
        where: {
          outletId: user.outletId,
          createdAt: { gte: sevenDaysAgo },
          status: { not: 'CANCELLED' },
        },
      }),
    ])

    const salesSummary = sales.reduce(
      (acc, s) => {
        const name = s.menuItem.name
        if (!acc[name]) acc[name] = { name, category: s.menuItem.category ?? '', quantity: 0, revenue: 0 }
        acc[name].quantity += s.quantity
        acc[name].revenue += s.total
        return acc
      },
      {} as Record<string, { name: string; category: string; quantity: number; revenue: number }>,
    )

    const salesData = Object.values(salesSummary).sort((a, b) => b.quantity - a.quantity)

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const prompt = `You are an inventory-ordering AI for a restaurant chain.

7-DAY SALES (${sales.length} transactions):
${salesData.map((s) => `- ${s.name} (${s.category}): sold ${s.quantity} units, RM${s.revenue.toFixed(2)}`).join('\n')}

CURRENT INVENTORY (${inventory.length} items):
${inventory
  .map(
    (i) =>
      `- ${i.itemName}: ${i.quantity} ${i.unit} (status: ${i.status})${
        i.shelfLife ? `, expires: ${i.shelfLife.toISOString().split('T')[0]}` : ''
      }`,
  )
  .join('\n')}

RECENT ORDERS (${recentOrders.length} pending/recent):
${recentOrders
  .map((o) => `- Order #${o.id.slice(0, 8)}: ${o.quantityOrdered} units, status: ${o.status}`)
  .join('\n')}

Based on this data, recommend what to reorder. For each recommendation, include:
1. Item name
2. Recommended quantity to order
3. Priority (HIGH / MEDIUM / LOW)
4. Justification (1 sentence)

Respond ONLY with a valid JSON array. No markdown, no extra text. Format:
[{"item":"...", "quantity":0, "priority":"...", "reason":"..."}]`

    const msg = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    })

    const content =
      msg.content.find((c) => c.type === 'text')?.text ?? '[]'
    const recommendations = JSON.parse(content)

    return NextResponse.json({
      outletId: user.outletId,
      period: { start: sevenDaysAgo.toISOString(), end: new Date().toISOString() },
      summary: {
        totalSales: sales.length,
        totalRevenue: sales.reduce((a, s) => a + s.total, 0),
        inventoryCount: inventory.length,
        lowStockItems: inventory.filter((i) => i.status === 'LOW').length,
      },
      recommendations,
    })
  } catch (error) {
    console.error('Order recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 },
    )
  }
}
