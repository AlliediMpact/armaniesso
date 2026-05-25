import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/order-store';
import { verifyBearerToken } from '@/lib/firebase-admin';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function getAllowedAdmins() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
  );
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
  if (!decoded) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email || '';

  const admins = getAllowedAdmins();
  if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  const order = await getOrderById(params.orderId);
  if (!order) {
    return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
  }

  return withNoStore(NextResponse.json({ order }));
}

/**
 * PATCH /api/admin/orders/[orderId]
 * Update order status, shipping info, fulfillment details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email || '';
  const admins = getAllowedAdmins();
  if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  try {
    const order = await getOrderById(params.orderId);
    if (!order) {
      return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
    }

    const body = await request.json();
    const { status, shipping, fulfillment, notes } = body;

    // Only allow status updates to valid states
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    // Update status if provided
    if (status && status !== order.status) {
      const updated = await updateOrderStatus(
        { orderId: params.orderId },
        status,
        {
          processor: 'admin',
          actor: email,
          note: notes,
        }
      );

      if (!updated) {
        return withNoStore(NextResponse.json({ error: 'Failed to update order' }, { status: 500 }));
      }

      // Apply shipping and fulfillment updates
      if (shipping || fulfillment) {
        updated.shipping = { ...updated.shipping, ...shipping };
        updated.fulfillment = { ...updated.fulfillment, ...fulfillment };
        updated.updatedAt = new Date().toISOString();
      }

      return withNoStore(NextResponse.json({ order: updated }));
    }

    // If only shipping/fulfillment updates, apply directly
    if (shipping || fulfillment) {
      order.shipping = { ...order.shipping, ...shipping };
      order.fulfillment = { ...order.fulfillment, ...fulfillment };
      order.updatedAt = new Date().toISOString();

      const updated = await updateOrderStatus(
        { orderId: params.orderId },
        order.status,
        {
          processor: 'admin',
          actor: email,
          note: 'Shipping/fulfillment details updated',
        }
      );

      if (!updated) {
        return withNoStore(NextResponse.json({ error: 'Failed to update order' }, { status: 500 }));
      }

      updated.shipping = order.shipping;
      updated.fulfillment = order.fulfillment;

      return withNoStore(NextResponse.json({ order: updated }));
    }

    return withNoStore(NextResponse.json({ order }));
  } catch (error) {
    console.error('Admin order update error:', error);
    return withNoStore(NextResponse.json({ error: 'Failed to update order' }, { status: 500 }));
  }
}

/**
 * DELETE /api/admin/orders/[orderId]
 * Cancel an order (soft delete - mark as cancelled)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email || '';
  const admins = getAllowedAdmins();
  if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  try {
    const order = await getOrderById(params.orderId);
    if (!order) {
      return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
    }

    // Only allow cancellation of pending and paid orders
    if (!['pending', 'paid', 'processing'].includes(order.status)) {
      return withNoStore(
        NextResponse.json(
          { error: `Cannot cancel order with status: ${order.status}` },
          { status: 400 }
        )
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reason = 'No reason provided' } = body;

    const updated = await updateOrderStatus(
      { orderId: params.orderId },
      'cancelled',
      {
        processor: 'admin',
        actor: email,
        note: `Order cancelled by admin. Reason: ${reason}`,
      }
    );

    if (!updated) {
      return withNoStore(NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 }));
    }

    return withNoStore(NextResponse.json({ message: 'Order cancelled', order: updated }));
  } catch (error) {
    console.error('Admin order cancellation error:', error);
    return withNoStore(NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 }));
  }
}
