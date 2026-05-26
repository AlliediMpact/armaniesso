import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { sendEmail } from '@/lib/mailer';
import { orderShippedTemplate, orderDeliveredTemplate } from '@/lib/email-templates';

/**
 * POST /api/admin/orders/[orderId]/fulfillment
 * Update order fulfillment status (inventory_checked, packed, shipped, delivered)
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
    const { action, note } = body;

    if (!action || !['inventory_checked', 'packed', 'shipped', 'delivered'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: inventory_checked, packed, shipped, or delivered' },
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

    // Add to fulfillment history
    const fulfillmentUpdate = {
      action,
      completedAt: new Date().toISOString(),
      completedBy: decodedToken.uid,
      note: note || '',
    };

    // Update order document
    await orderRef.update({
      [`fulfillment.${action}`]: fulfillmentUpdate,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: decodedToken.uid,
    });

    // If shipped, update order status and send email
    if (action === 'shipped') {
      await orderRef.update({
        status: 'shipped',
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'shipped',
          at: new Date().toISOString(),
          actor: decodedToken.uid,
          note: note || 'Order has been shipped',
        }),
      });

      // Send shipped email
      if (order.customer?.email) {
        try {
          const template = orderShippedTemplate(order);
          await sendEmail(
            order.customer.email,
            template.subject,
            template.text
          );
        } catch (err) {
          console.error('Email send error:', err);
        }
      }
    }

    // If delivered, update status
    if (action === 'delivered') {
      await orderRef.update({
        status: 'delivered',
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'delivered',
          at: new Date().toISOString(),
          actor: decodedToken.uid,
          note: note || 'Order has been delivered',
        }),
      });

      // Send delivered email
      if (order.customer?.email) {
        try {
          const template = orderDeliveredTemplate(order);
          await sendEmail(
            order.customer.email,
            template.subject,
            template.text
          );
        } catch (err) {
          console.error('Email send error:', err);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Order fulfillment updated: ${action}`,
        fulfillment: fulfillmentUpdate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fulfillment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update fulfillment' },
      { status: 500 }
    );
  }
}
