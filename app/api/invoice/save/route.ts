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

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { invoiceId, action, paidAmount, paymentMethod } = body

    if (!invoiceId || !action) {
      return NextResponse.json({ error: 'invoiceId and action required' }, { status: 400 })
    }

    if (action === 'markPaid') {
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      if (invoice.status !== 'APPROVED') {
        return NextResponse.json({ error: `Cannot mark ${invoice.status} invoice as paid` }, { status: 400 })
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAmount: paidAmount || 0,
          paymentMethod: paymentMethod || 'CASH',
          paidAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, newStatus: 'PAID' })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
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
    if (!session.user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 401 })
    }

    const body = await request.json()
    const { supplier, invoiceNumber, date, items, total, confidence, imageBase64, outletId } = body

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // DUPLICATE DETECTION: check if same invoiceNumber + supplier already approved
    if (invoiceNumber && invoiceNumber.trim()) {
      const existing = await prisma.invoice.findFirst({
        where: {
          invoiceNumber: invoiceNumber.trim(),
          supplier: { equals: supplier,  },
          status: { in: ['APPROVED', 'PAID'] },
        },
      })
      if (existing) {
        return NextResponse.json({
          error: 'duplicate',
          message: `Invoice #${invoiceNumber} from ${supplier} was already approved on ${new Date(existing.createdAt).toLocaleDateString('en-GB')}`,
          existingId: existing.id,
        }, { status: 409 })
      }
    }

    // Lookup user to get outlet
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const effOutletId = outletId || user?.outletId || null

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        supplier,
        invoiceNumber: invoiceNumber?.trim() || null,
        rawImageUrl: imageBase64 || '',
        ocrData: JSON.stringify({ supplier, invoiceNumber, date, items, total, confidence }),
        confidence: confidence || 0,
        status: 'APPROVED',
        outletId: effOutletId,
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

    // AUTO-CREATE inventory items + update quantities
    const inventoryResults: any[] = []
    for (const item of items) {
      const itemName = item.name.trim()
      const qty = item.quantity || 0
      const unit = item.unit || 'pcs'

      // Try to find matching inventory item
      let inventoryItem: any = null
      if (effOutletId) {
        inventoryItem = await prisma.inventory.findFirst({
          where: {
            outletId: effOutletId,
            itemName: { contains: itemName },
          },
        })

        // Try broader match - check if inventory name contains invoice item name
        if (!inventoryItem) {
          const allItems = await prisma.inventory.findMany({
            where: { outletId: effOutletId },
            select: { id: true, itemName: true, quantity: true, unit: true },
          })
          const matched = allItems.find((inv: any) =>
            itemName.toLowerCase().includes(inv.itemName.toLowerCase()) ||
            inv.itemName.toLowerCase().includes(itemName.toLowerCase())
          )
          if (matched) inventoryItem = matched
        }

        if (inventoryItem) {
          // UPDATE existing inventory
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity + qty },
          })
          inventoryResults.push({
            itemName: inventoryItem.itemName,
            action: 'updated',
            oldQty: inventoryItem.quantity,
            newQty: inventoryItem.quantity + qty,
          })
        } else {
          // CREATE new inventory item
          const created = await prisma.inventory.create({
            data: {
              itemName,
              quantity: qty,
              unit,
              outletId: effOutletId,
              status: qty > 0 ? 'SUFFICIENT' : 'OUT_OF_STOCK',
            },
          })
          inventoryResults.push({
            itemName: created.itemName,
            action: 'created',
            qty,
          })
        }
      }
    }

    // Create purchase order for this invoice
    const po = await prisma.purchaseOrder.create({
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
      duplicateCheck: invoiceNumber ? 'verified' : 'skipped',
      inventory: inventoryResults,
      poCreated: po.id,
    })
  } catch (error: any) {
    console.error('Invoice save error:', error)
    return NextResponse.json(
      { error: 'Failed to save invoice', details: error.message },
      { status: 500 }
    )
  }
}
