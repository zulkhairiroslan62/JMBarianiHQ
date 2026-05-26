import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { invoiceId, reason } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    // Find invoice with items
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status !== 'APPROVED' && invoice.status !== 'PAID') {
      return NextResponse.json({
        error: `Invoice status is '${invoice.status}', cannot revoke. Only APPROVED or PAID invoices can be revoked.`,
      }, { status: 400 })
    }

    const isPaid = invoice.status === 'PAID'
    const reversalItems: any[] = []

    // Revert inventory changes: subtract invoice item quantities
    if (invoice.outletId) {
      for (const item of invoice.items) {
        const inventoryItem = await prisma.inventory.findFirst({
          where: {
            outletId: invoice.outletId,
            itemName: { contains: item.name },
          },
        })

        if (inventoryItem) {
          const newQty = Math.max(0, inventoryItem.quantity - item.quantity)
          await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: newQty },
          })
          reversalItems.push({
            itemName: inventoryItem.itemName,
            action: 'reverted',
            oldQty: inventoryItem.quantity,
            newQty,
          })
        }
      }
    }

    // Cancel related purchase orders
    const pos = await prisma.purchaseOrder.findMany({
      where: {
        supplierName: { contains: invoice.supplier },
        status: 'APPROVED',
        notes: { contains: invoice.invoiceNumber || invoice.id.substring(0, 8) },
      },
    })

    for (const po of pos) {
      await prisma.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'CANCELLED', notes: `${po.notes || ''} | CANCELLED: ${reason || 'Manual revoke'}` },
      })
    }

    // Update invoice status back to PENDING with revoke info
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedNote: reason || `Revoked by ${session.user.email}${isPaid ? ' (was PAID)' : ''}`,
      },
    })

    return NextResponse.json({
      success: true,
      invoiceId,
      newStatus: 'REVOKED',
      inventoryRollback: reversalItems,
      posCancelled: pos.length,
    })
  } catch (error: any) {
    console.error('Invoice revoke error:', error)
    return NextResponse.json(
      { error: 'Failed to revoke invoice', details: error.message },
      { status: 500 }
    )
  }
}
