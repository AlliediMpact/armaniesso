import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { verifyBearerToken } from '@/lib/firebase-admin';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

/**
 * GET /api/account/cart
 * Retrieve user's server-side cart
 */
export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.uid) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(NextResponse.json({ cart: [] })); // Return empty cart if Firestore unavailable
    }

    const db = getFirestore(app);
    const doc = await db.collection('userCarts').doc(decoded.uid).get();

    if (!doc.exists) {
      return withNoStore(NextResponse.json({ cart: [] }));
    }

    const data = doc.data();
    return withNoStore(
      NextResponse.json({
        cart: data?.items || [],
        updatedAt: data?.updatedAt,
      })
    );
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return withNoStore(NextResponse.json({ cart: [] }));
  }
}

/**
 * POST /api/account/cart
 * Save or update user's cart
 */
export async function POST(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.uid) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
    }

    const app = getFirebaseAdminApp();
    if (!app) {
      return NextResponse.json(
        { error: 'Firestore not available' },
        { status: 503 }
      );
    }

    const db = getFirestore(app);
    const cartData = {
      userId: decoded.uid,
      items,
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    await db.collection('userCarts').doc(decoded.uid).set(cartData, { merge: true });

    return withNoStore(
      NextResponse.json({
        message: 'Cart saved',
        cart: items,
        updatedAt: cartData.updatedAt,
      })
    );
  } catch (error) {
    console.error('Error saving cart:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to save cart' }, { status: 500 })
    );
  }
}

/**
 * DELETE /api/account/cart
 * Clear user's cart
 */
export async function DELETE(request: NextRequest) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded?.uid) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  try {
    const app = getFirebaseAdminApp();
    if (!app) {
      return withNoStore(NextResponse.json({ message: 'Cart cleared (local only)' }));
    }

    const db = getFirestore(app);
    await db.collection('userCarts').doc(decoded.uid).delete();

    return withNoStore(NextResponse.json({ message: 'Cart cleared' }));
  } catch (error) {
    console.error('Error clearing cart:', error);
    return withNoStore(
      NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    );
  }
}
