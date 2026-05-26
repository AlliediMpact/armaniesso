import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { lowStockAlertTemplate } from '@/lib/email-templates';
import { sendEmail } from '@/lib/mailer';

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
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

    const { threshold } = await req.json().catch(() => ({ threshold: 10 }));

    const db = admin.firestore();
    const snapshot = await db
      .collection('products')
      .where('stock', '>=', 0)
      .where('stock', '<', threshold || 10)
      .orderBy('stock', 'asc')
      .get();

    const products = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0) {
      return NextResponse.json({ error: 'No admin emails configured' }, { status: 400 });
    }

    // Send one email per admin (simple fan-out)
    for (const email of adminEmails) {
      for (const product of products) {
        try {
          const tpl = lowStockAlertTemplate({ name: product.name, sku: product.sku, available: product.stock, threshold: product.reorderLevel || threshold });
          await sendEmail(email, tpl.subject, tpl.text);
        } catch (err) {
          console.error('Failed to send low-stock email to', email, err);
        }
      }
    }

    return NextResponse.json({ success: true, count: products.length });
  } catch (error: any) {
    console.error('Notify low stock error:', error);
    return NextResponse.json({ error: 'Failed to notify low stock' }, { status: 500 });
  }
}
