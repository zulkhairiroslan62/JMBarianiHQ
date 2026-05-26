import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const menuItemId = searchParams.get('menuItemId')

    if (menuItemId) {
      const recipe = await prisma.recipe.findUnique({
        where: { menuItemId },
        include: { menuItem: true, ingredients: true },
      })
      return NextResponse.json({ recipe })
    }

    const recipes = await prisma.recipe.findMany({
      include: {
        menuItem: { select: { name: true, price: true, category: true } },
        ingredients: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate cost & margin for each
    const enriched = recipes.map(r => {
      const totalCost = r.ingredients.reduce((sum, i) => sum + (i.costPerUnit || 0) * i.quantity, 0)
      const price = r.menuItem?.price || 0
      return {
        ...r,
        costPrice: totalCost,
        profitMargin: price > 0 ? ((price - totalCost) / price * 100).toFixed(1) : '0',
      }
    })

    return NextResponse.json({ recipes: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { menuItemId, name, servings, prepTime, instructions, ingredients } = body

    if (!menuItemId || !name) {
      return NextResponse.json({ error: 'menuItemId and name required' }, { status: 400 })
    }

    // Calculate total cost from ingredients
    const totalCost = (ingredients || []).reduce((sum: number, i: any) =>
      sum + (parseFloat(i.costPerUnit) || 0) * (parseFloat(i.quantity) || 0), 0)

    const recipe = await prisma.recipe.create({
      data: {
        menuItemId,
        name,
        servings: parseFloat(servings) || 1,
        prepTime: prepTime ? parseInt(prepTime) : null,
        instructions,
        costPrice: totalCost || null,
        ingredients: {
          create: (ingredients || []).map((i: any) => ({
            ingredientName: i.ingredientName,
            quantity: parseFloat(i.quantity) || 0,
            unit: i.unit || 'g',
            costPerUnit: parseFloat(i.costPerUnit) || null,
            notes: i.notes,
          })),
        },
      },
      include: { ingredients: true, menuItem: { select: { name: true, price: true } } },
    })

    return NextResponse.json({ success: true, recipe })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
