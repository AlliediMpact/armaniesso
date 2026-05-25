import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus, readOrders } from '@/lib/order-store';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { sendPaymentReceivedEmail } from '@/lib/mailer';

// Paystack sends an HMAC SHA512 signature in the 'x-paystack-signature' header
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const signature = request.headers.get('x-paystack-signature') || '';
    const raw = await request.text();

    if (!secret || !signature) {
      console.warn('Webhook received without secret or signature');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    if (hash !== signature) {
      console.warn('Invalid Paystack webhook signature');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const payload = JSON.parse(raw);
    const event = payload.event;
    const data = payload.data;

    // Idempotency: attempt to record the webhook event in Firestore to avoid replay
    const eventId = payload.id || `${event}-${(data && (data.reference || data.id)) || Date.now()}`;
    try {
      const app = getFirebaseAdminApp();
      if (app) {
        const db = (await import('firebase-admin/firestore')).getFirestore(app);
        const doc = await db.collection('webhookEvents').doc(String(eventId)).get();
        if (doc.exists) {
          console.log('Duplicate webhook event, skipping', eventId);
          return NextResponse.json({ ok: true });
        }
        await db.collection('webhookEvents').doc(String(eventId)).set({ event, receivedAt: new Date(), payload });
      }
    } catch (e) {
      // If Firestore is not available, persist event locally to avoid replay.
      try {
        const fs = await import('fs/promises');
        const path = (await import('path')).resolve(process.cwd(), 'data', 'webhook-events.json');
        let list = [];
        try {
          const raw = await fs.readFile(path, 'utf-8').catch(() => '[]');
          list = JSON.parse(raw || '[]');
        } catch (_e) {
          list = [];
        }
        if (list.includes(eventId)) {
          console.log('Duplicate local webhook event, skipping', eventId);
          return NextResponse.json({ ok: true });
        }
        list.push(eventId);
        await fs.mkdir((await import('path')).dirname(path), { recursive: true }).catch(() => null);
        await fs.writeFile(path, JSON.stringify(list, null, 2), 'utf-8').catch(() => null);
      } catch (_err) {
        // continue
      }
    }

    // Handle successful charge events
    if (event === 'charge.success' || event === 'charge.completed') {
      const reference = data.reference || data.id;

      // idempotency: if order is already paid, skip re-processing
      const orders = await readOrders();
      const existing = orders.find((o) => o.reference === reference || o.orderId === reference);
      if (existing && existing.status === 'paid') {
        console.log('Webhook received for already-paid order', reference);
        return NextResponse.json({ ok: true });
      }

      const updated = await updateOrderStatus({ reference }, 'paid', { processor: 'paystack', data });
      if (updated) {
        console.log('Order marked paid for reference', reference);
        try {
          if (updated.customer?.email) {
            await sendPaymentReceivedEmail({
              to: updated.customer.email,
              customerName: updated.customer.name,
              orderId: updated.orderId,
              reference,
              total: updated.total,
            });
          }
        } catch (emailErr) {
          console.error('Failed sending payment confirmation email:', emailErr);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // Handle failed/abandoned events explicitly
    if (event === 'charge.failed' || event === 'charge.abandoned') {
      const reference = data.reference || data.id;
      await updateOrderStatus({ reference }, 'cancelled', { processor: 'paystack', data });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Paystack webhook error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
