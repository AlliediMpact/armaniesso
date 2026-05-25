import { NextRequest, NextResponse } from 'next/server';
import { readOrders, saveOrder } from '@/lib/order-store';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { addStatusHistory, addPaymentEvent } from '@/lib/order-types-enhanced';
import { sendPaymentReceivedEmail } from '@/lib/mailer';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function isAdminToken(decoded: { email?: string; claims?: Record<string, unknown> } | null) {
  if (!decoded) return false;
  const claims = decoded.claims || {};
  return (
    claims.admin === true ||
    claims.role === 'admin' ||
    (Array.isArray(claims.roles) && (claims.roles as unknown[]).includes('admin'))
  );
}

/**
 * POST /api/admin/orders/verify-payment
 * Admin endpoint to manually verify EFT payment
 * 
 * Request body:
 * {
 *   orderId: string;
 *   eftReference: string; // Bank statement reference
 *   amount: number; // Amount received
 *   bankAccount?: string; // Which account received it (Nedbank, Capitec)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const body = await request.json();
    const { orderId, eftReference, amount, bankAccount } = body;

    if (!orderId || !eftReference || !amount) {
      return withNoStore(
        NextResponse.json(
          { error: 'Missing required fields: orderId, eftReference, amount' },
          { status: 400 }
        )
      );
    }

    const orders = await readOrders();
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);

    if (orderIndex === -1) {
      return withNoStore(
        NextResponse.json({ error: 'Order not found' }, { status: 404 })
      );
    }

    let order = orders[orderIndex];
    const admin = decoded.email || 'system';
    const now = new Date().toISOString();

    // Verify payment amount matches
    const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
    if (Math.abs(orderTotal - amount) > 0.01) {
      return withNoStore(
        NextResponse.json(
          {
            error: 'Amount mismatch',
            expected: orderTotal,
            received: amount,
          },
          { status: 400 }
        )
      );
    }

    // Add payment event
    if (!Array.isArray(order.paymentEvents)) {
      order.paymentEvents = [];
    }
    order.paymentEvents.push({
      type: 'verified',
      at: now,
      payload: {
        processor: 'eft',
        reference: `EFT-${eftReference}${bankAccount ? ` (${bankAccount})` : ''}`,
        amount,
        notes: `Manual EFT verification by ${admin}`,
      },
    });

    // Update status to paid
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'paid',
      at: now,
      actor: admin,
      note: `Payment verified: EFT ${eftReference} received R${amount}`,
    });
    order.status = 'paid';
    order.updatedAt = now;

    orders[orderIndex] = order;
    await saveOrder(order);

    // Send payment confirmation email
    try {
      if (order.customer?.email) {
        await sendPaymentReceivedEmail({
          to: order.customer.email,
          customerName: order.customer.name,
          orderId: order.orderId,
          reference: eftReference,
          total: order.total,
        });
      }
    } catch (emailErr) {
      console.error('Failed sending payment confirmation email:', emailErr);
    }

    return withNoStore(
      NextResponse.json({
        message: 'Payment verified successfully',
        order,
      })
    );
  } catch (error) {
    console.error('EFT verification error:', error);
    return withNoStore(
      NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      )
    );
  }
}
