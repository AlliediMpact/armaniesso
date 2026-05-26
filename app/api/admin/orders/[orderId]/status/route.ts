import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, type OrderStatus } from '@/lib/order-store';
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

function isValidStatus(status: string): status is OrderStatus {
  return (
    status === 'pending' ||
    status === 'paid' ||
    status === 'processing' ||
    status === 'shipped' ||
    status === 'delivered' ||
    status === 'cancelled' ||
    status === 'refunded'
  );
}

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

  const body = await request.json().catch(() => ({}));
  const status = String(body?.status || '');

  if (!isValidStatus(status)) {
    return withNoStore(NextResponse.json({ error: 'Invalid status' }, { status: 400 }));
  }

  const updated = await updateOrderStatus({ orderId: params.orderId }, status, {
    ...(body?.payment || {}),
    manualStatusUpdateBy: email,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
  }

  return withNoStore(NextResponse.json({ order: updated }));
}
