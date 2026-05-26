import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API endpoint to receive AcePOS sales data
// POST /api/acepos/sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    if (!body.outlet_id || !body.sales || !Array.isArray(body.sales)) {
      return NextResponse.json(
        { error: 'Invalid request format. Required: outlet_id, sales[]' },
        { status: 400 }
      )
    }

    // Verify outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: body.outlet_id },
    })

    if (!outlet) {
      return NextResponse.json(
        { error: 'Outlet not found' },
        { status: 404 }
      )
    }

    // Process each sale transaction
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const sale of body.sales) {
      try {
        // Find menu item by name (case-insensitive)
        const menuItem = await prisma.menuItem.findFirst({
          where: {
            outletId: body.outlet_id,
            name: {
              contains: sale.item_name,
            },
          },
        })

        if (!menuItem) {
          results.failed++
          results.errors.push(`Menu item not found: ${sale.item_name}`)
          continue
        }

        // Create sale record
        await prisma.sale.create({
          data: {
            outletId: body.outlet_id,
            menuItemId: menuItem.id,
            quantity: parseInt(sale.quantity) || 1,
            total: parseFloat(sale.total) || 0,
            date: sale.timestamp ? new Date(sale.timestamp) : new Date(),
          },
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to process sale: ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      outlet: outlet.name,
      results,
    })
  } catch (error) {
    console.error('AcePOS sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const outletId = searchParams.get('outlet_id')

    if (!outletId) {
      return NextResponse.json(
        { error: 'outlet_id parameter required' },
        { status: 400 }
      )
    }

    // Get today's sales count
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySales = await prisma.sale.count({
      where: {
        outletId,
        date: {
          gte: today,
        },
      },
    })

    const todayRevenue = await prisma.sale.aggregate({
      where: {
        outletId,
        date: {
          gte: today,
        },
      },
      _sum: {
        total: true,
      },
    })

    return NextResponse.json({
      outlet_id: outletId,
      today_sales_count: todaySales,
      today_revenue: todayRevenue._sum.total || 0,
      last_sync: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AcePOS status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
