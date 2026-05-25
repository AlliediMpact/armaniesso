import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { checkRateLimit, getRequestClientId } from '@/lib/rate-limit';

/**
 * GET /api/products/[id]
 * Get single product details (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const clientId = getRequestClientId(request.headers);
    const rate = checkRateLimit(`products-detail:${clientId}`, 200, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const app = getFirebaseAdminApp();

    // If Firestore unavailable, try local products
    if (!app) {
      const { products } = await import('@/lib/products');
      const product = products.find((p) => p.id === params.id);

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const response = NextResponse.json(product);
      response.headers.set('Cache-Control', 'public, max-age=600');
      return response;
    }

    const db = getFirestore(app);
    const doc = await db.collection('products').doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = doc.data();

    // Check availability
    if (!product?.isAvailable) {
      return NextResponse.json({ error: 'Product not available' }, { status: 404 });
    }

    const response = NextResponse.json(product);
    response.headers.set('Cache-Control', 'public, max-age=600');
    return response;
  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}
