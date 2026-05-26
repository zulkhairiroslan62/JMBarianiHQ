import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const inventory = await prisma.inventory.findMany({
      include: {
        outlet: { select: { name: true } },
        stockOrders: { take: 3, orderBy: { createdAt: 'desc' }, select: { quantityOrdered: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const wasteLogs = await prisma.wasteLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { inventory: { select: { itemName: true } }, outlet: { select: { name: true } } },
    })

    return NextResponse.json({ inventory, wasteLogs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
