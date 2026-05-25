import { NextRequest, NextResponse } from 'next/server';
import { readOrders } from '@/lib/order-store';
import { verifyBearerToken } from '@/lib/firebase-admin';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.email) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email;

  const orders = (await readOrders())
    .filter((order) =>
      String(order.customer?.email || '').toLowerCase() === email.toLowerCase()
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return withNoStore(NextResponse.json({ orders }));
}
