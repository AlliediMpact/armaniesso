import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Returns revenue summary for a date range (start/end ISO)
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
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(req.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    const db = admin.firestore();
    let query = db.collection('orders').where('status', '!=', 'cancelled');

    if (start) query = query.where('createdAt', '>=', start);
    if (end) query = query.where('createdAt', '<=', end);

    const snapshot = await query.get();
    const orders = snapshot.docs.map((d) => d.data() as any);

    const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return NextResponse.json({ success: true, revenue, count: orders.length });
  } catch (err: any) {
    console.error('Revenue error:', err);
    return NextResponse.json({ error: 'Failed to compute revenue' }, { status: 500 });
  }
}
