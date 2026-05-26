import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { supplier, invoiceNumber, date, items, total, confidence, imageBase64, outletId } = body

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        supplier,
        invoiceNumber: invoiceNumber || null,
        rawImageUrl: imageBase64 || '',
        ocrData: JSON.stringify({ supplier, invoiceNumber, date, items, total, confidence }),
        confidence: confidence || 0,
        status: 'APPROVED',
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 0,
            unit: item.unit || 'pcs',
            price: item.price || 0,
            subtotal: item.subtotal || 0,
          })),
        },
      },
    })

    // Try to match and update inventory if outletId is provided
    if (outletId) {
      for (const item of items) {
        const inventoryItem = await prisma.inventory.findFirst({
          where: {
            outletId,
            itemName: { contains: item.name },
          },
        })
        if (inventoryItem) {
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity + (item.quantity || 0) },
          })
        }
      }
    }

    // Create a purchase order for this invoice
    await prisma.purchaseOrder.create({
      data: {
        supplierName: supplier,
        total: total || 0,
        status: 'APPROVED',
        notes: `Auto-created from invoice #${invoiceNumber || invoice.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      itemsCreated: items.length,
    })
  } catch (error: any) {
    console.error('Invoice save error:', error)
    return NextResponse.json(
      { error: 'Failed to save invoice', details: error.message },
      { status: 500 }
    )
  }
}
