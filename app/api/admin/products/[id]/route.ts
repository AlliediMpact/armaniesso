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
 * GET /api/admin/products/[id]
 * Get single product
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const doc = await db.collection('products').doc(params.id).get();

    if (!doc.exists) {
      return withNoStore(
        NextResponse.json({ error: 'Product not found' }, { status: 404 })
      );
    }

    return withNoStore(NextResponse.json(doc.data()));
  } catch (error) {
    console.error('Product get error:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to get product' }, { status: 500 })
    );
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyBearerToken(request.headers.get('authorization'));
    if (!decoded || !isAdminToken(decoded)) {
      return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }

    const body = await request.json();
    const validation = validateRequest(ProductSchema.partial(), body);

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
    const docRef = db.collection('products').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return withNoStore(
        NextResponse.json({ error: 'Product not found' }, { status: 404 })
      );
    }

    await docRef.update({
      ...validation.data,
      updatedAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    return withNoStore(NextResponse.json(updated.data()));
  } catch (error) {
    console.error('Product update error:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const docRef = db.collection('products').doc(params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return withNoStore(
        NextResponse.json({ error: 'Product not found' }, { status: 404 })
      );
    }

    await docRef.delete();

    return withNoStore(
      NextResponse.json({
        message: 'Product deleted successfully',
        id: params.id,
      })
    );
  } catch (error) {
    console.error('Product deletion error:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    );
  }
}
