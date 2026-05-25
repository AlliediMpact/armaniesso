import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { ProductSchema, validateRequest, errorResponse } from '@/lib/validation-schemas';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

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
 * GET /api/admin/products
 * List all products (pagination, filtering)
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(
        NextResponse.json(
          { error: 'Database unavailable' },
          { status: 503 }
        )
      );
    }

    const db = getFirestore(app);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();

    let query: any = db.collection('products');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc: any) => doc.data());

    if (search) {
      products = products.filter(
        (p: any) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    const total = products.length;
    const start = (page - 1) * limit;
    const paginatedProducts = products.slice(start, start + limit);

    return withNoStore(
      NextResponse.json({
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error('Product listing error:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to list products' }, { status: 500 })
    );
  }
}

/**
 * POST /api/admin/products
 * Create new product
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const body = await request.json();
    const validation = validateRequest(ProductSchema, body);

    if (!validation.valid) {
      return withNoStore(
        NextResponse.json(errorResponse(validation.errors), { status: 400 })
      );
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(
        NextResponse.json(
          { error: 'Database unavailable' },
          { status: 503 }
        )
      );
    }

    const db = getFirestore(app);
    const productId = validation.data.id || `prod-${Date.now()}`;
    const now = new Date().toISOString();

    const product = {
      id: productId,
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('products').doc(productId).set(product);

    return withNoStore(
      NextResponse.json(product, { status: 201 })
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    );
  }
}
