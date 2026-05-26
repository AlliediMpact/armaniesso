import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { refundIssuedTemplate } from '@/lib/email-templates';

/**
 * POST /api/admin/orders/[orderId]/refund
 * Issue a refund for an order or partial items
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const body = await req.json();
    const { amount, reason, itemIds } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount required' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Refund reason required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const orderRef = db.collection('orders').doc(params.orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderSnap.data() as any;

    // Validate refund amount doesn't exceed order total
    if (amount > order.total) {
      return NextResponse.json(
        { error: `Refund amount exceeds order total (R${order.total.toFixed(2)})` },
        { status: 400 }
      );
    }

    // Create refund record
    const refundRecord = {
      refundId: `REF-${Date.now()}`,
      amount,
      reason,
      itemIds: itemIds || [], // If partial refund
      issuedAt: new Date().toISOString(),
      issuedBy: decodedToken.uid,
      status: 'pending', // pending -> processing -> completed
    };

    // Update order with refund
    await orderRef.update({
      refunds: admin.firestore.FieldValue.arrayUnion(refundRecord),
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: decodedToken.uid,
      status: 'refunded',
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status: 'refunded',
        at: new Date().toISOString(),
        actor: decodedToken.uid,
        note: `Refund issued: ${reason} (R${amount.toFixed(2)})`,
      }),
    });

    // Send refund email
    if (order.customer?.email) {
      try {
        const template = refundIssuedTemplate(order);
        await sendEmail(
          order.customer.email,
          template.subject,
          template.text
        );
      } catch (err) {
        console.error('Email send error:', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Refund issued successfully',
        refund: refundRecord,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to issue refund' },
      { status: 500 }
    );
  }
}
