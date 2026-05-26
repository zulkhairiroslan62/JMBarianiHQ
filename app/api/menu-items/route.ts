import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const items = await prisma.menuItem.findMany({
      select: { id: true, name: true, price: true, category: true, recipe: { select: { id: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ items })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
