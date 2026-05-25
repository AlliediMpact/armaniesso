import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, readOrders, saveOrder } from '@/lib/order-store';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { addPaymentEvent, addStatusHistory } from '@/lib/order-types-enhanced';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.email) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email;

  const order = await getOrderById(params.orderId);
  if (!order) {
    return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
  }

  if (String(order.customer?.email || '').toLowerCase() !== email.toLowerCase()) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  return withNoStore(NextResponse.json({ order }));
}

/**
 * PATCH /api/account/orders/[orderId]
 * Admin endpoint to update order status, shipping info, etc.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const { orderId } = params;
    const body = await request.json();

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

    // Update status
    if (body.status) {
      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: body.status,
        at: now,
        actor: admin,
        note: body.statusNotes,
      });
      order.status = body.status;
      order.updatedAt = now;
    }

    // Update shipping info
    if (body.shipping) {
      order.shipping = body.shipping;
      order.updatedAt = now;
    }

    // Add payment event (e.g., manual verification for EFT)
    if (body.paymentEvent) {
      if (!Array.isArray(order.paymentEvents)) {
        order.paymentEvents = [];
      }
      order.paymentEvents.push({
        type: body.paymentEvent.type,
        at: now,
        payload: {
          processor: body.paymentEvent.processor,
          reference: body.paymentEvent.reference,
          notes: body.paymentEvent.notes,
        },
      });
      order.updatedAt = now;
    }

    // Add notes
    if (body.notes !== undefined) {
      order.notes = body.notes;
      order.updatedAt = now;
    }

    orders[orderIndex] = order;
    await saveOrder(order);

    return withNoStore(NextResponse.json(order));
  } catch (error) {
    console.error('Order update error:', error);
    return withNoStore(
      NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    );
  }
}

/**
 * DELETE /api/account/orders/[orderId]
 * Admin endpoint to cancel order (refund if already paid)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const { orderId } = params;
    const body = await request.json().catch(() => ({}));

    const orders = await readOrders();
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);

    if (orderIndex === -1) {
      return withNoStore(
        NextResponse.json({ error: 'Order not found' }, { status: 404 })
      );
    }

    let order = orders[orderIndex];
    const admin = decoded.email || 'system';

    // Determine new status based on current status
    let newStatus = 'cancelled';
    let notes = body.reason || 'Order cancelled by admin';

    if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
      newStatus = 'refunded';
      notes = `Refund initiated: ${notes}`;

      // Add refund payment event
      order = addPaymentEvent(order as any, {
        type: 'refunded',
        processor: 'manual',
        amount: typeof order.total === 'number' ? order.total : parseFloat(String(order.total)),
        notes: `Full refund (${notes})`,
      });
    }

    order = addStatusHistory(order as any, newStatus as any, admin, notes);
    orders[orderIndex] = order;
    await saveOrder(order);

    return withNoStore(NextResponse.json({
      message: `Order ${newStatus}`,
      order,
    }));
  } catch (error) {
    console.error('Order cancellation error:', error);
    return withNoStore(
      NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      )
    );
  }
}
