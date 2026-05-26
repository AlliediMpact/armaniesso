import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { getInventorySummary, getLowStockItems } from '@/lib/inventory-service';

export const dynamic = 'force-dynamic';

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
 * GET /api/admin/inventory
 * Get inventory summary (all products)
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const url = new URL(request.url);
    const showLowStock = url.searchParams.get('lowStockOnly') === 'true';
    const threshold = parseInt(url.searchParams.get('threshold') || '10');

    let items;
    if (showLowStock) {
      items = await getLowStockItems(threshold);
    } else {
      items = await getInventorySummary();
    }

    return withNoStore(
      NextResponse.json({
        items,
        count: items.length,
        threshold: showLowStock ? threshold : undefined,
      })
    );
  } catch (error) {
    console.error('Inventory listing error:', error);
    return withNoStore(
      NextResponse.json(
        { error: 'Failed to get inventory' },
        { status: 500 }
      )
    );
  }
}
