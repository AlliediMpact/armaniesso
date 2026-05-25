import { NextRequest, NextResponse } from 'next/server';
import { readOrders } from '@/lib/order-store';
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

export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email || '';

  const admins = getAllowedAdmins();
  if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  // Get query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search')?.toLowerCase();
  const sort = url.searchParams.get('sort') || 'recent'; // recent, oldest, status

  if (page < 1 || limit < 1 || limit > 100) {
    return withNoStore(
      NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    );
  }

  let orders = await readOrders();

  // Filter by status
  if (status) {
    orders = orders.filter((o) => o.status === status);
  }

  // Search by email, order ID, or customer name
  if (search) {
    orders = orders.filter((o) => {
      const email = String(o.customer?.email || '').toLowerCase();
      const name = String(o.customer?.name || '').toLowerCase();
      const orderId = String(o.orderId || '').toLowerCase();
      return email.includes(search) || name.includes(search) || orderId.includes(search);
    });
  }

  // Sort
  if (sort === 'oldest') {
    orders = orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } else if (sort === 'status') {
    orders = orders.sort((a, b) => a.status.localeCompare(b.status));
  }
  // Default sort by recent (already sorted in readOrders)

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
  };

  // Paginate
  const skip = (page - 1) * limit;
  const paginatedOrders = orders.slice(skip, skip + limit);

  const totalPages = Math.ceil(orders.length / limit);

  return withNoStore(
    NextResponse.json({
      orders: paginatedOrders,
      stats,
      pagination: {
        page,
        limit,
        totalPages,
        totalOrders: orders.length,
      },
    })
  );
}
