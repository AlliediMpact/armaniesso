import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeApp as initializeServerApp } from 'firebase-admin/app';
import { getFirestore as getServerFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verify user owns this order by checking their email against order customer email
async function verifyOrderOwnership(orderId: string, userEmail: string): Promise<any> {
  try {
    // Initialize Firebase Admin if not already done
    let db;
    try {
      const apps = admin.apps;
      if (apps.length === 0) {
        throw new Error('Firebase Admin not initialized');
      }
      db = admin.firestore();
    } catch {
      return null;
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) return null;

    const order = orderSnap.data();
    if (order?.customer?.email !== userEmail) return null; // Unauthorized

    return { ...order, id: orderId };
  } catch (error) {
    console.error('Error verifying order ownership:', error);
    return null;
  }
}

/**
 * POST /api/account/orders/[orderId]/reorder
 * Add all items from a previous order back to cart
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);

    // Verify token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = decodedToken.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email unavailable' }, { status: 400 });
    }
    const orderId = params.orderId;

    // Verify user owns this order
    const order = await verifyOrderOwnership(orderId, userEmail);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    // Validate items exist and are available
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json(
        { error: 'Order has no items to reorder' },
        { status: 400 }
      );
    }

    // Return items that can be re-added to cart
    // Client will handle adding to cart and redirecting
    const reorderItems = order.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      description: item.description,
      category: item.category,
      image: item.image,
      printSize: item.printSize || '1m x 1m',
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Items ready for reorder',
        items: reorderItems,
        originalOrderId: orderId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to process reorder' },
      { status: 500 }
    );
  }
}
