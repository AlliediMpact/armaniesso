import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/inventory/low-stock
 * Get products with low stock (below threshold)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = admin.firestore();
    const threshold = parseInt(new URL(req.url).searchParams.get('threshold') || '10', 10);

    // Get products with stock below threshold
    const snapshot = await db
      .collection('products')
      .where('stock', '>=', 0)
      .where('stock', '<', threshold)
      .orderBy('stock', 'asc')
      .limit(20)
      .get();

    const lowStockProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      sku: doc.data().sku,
      stock: doc.data().stock,
      reorderLevel: doc.data().reorderLevel || threshold,
    }));

    return NextResponse.json(
      {
        success: true,
        products: lowStockProducts,
        count: lowStockProducts.length,
        threshold,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Low stock lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to get low stock items' },
      { status: 500 }
    );
  }
}
