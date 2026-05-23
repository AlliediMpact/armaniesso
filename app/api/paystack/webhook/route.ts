import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus } from '@/lib/orders';
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

    // Handle successful charge events
    if (event === 'charge.success' || event === 'charge.completed') {
      const reference = data.reference || data.id;
      const updated = updateOrderStatus(
        { reference },
        'paid',
        { processor: 'paystack', data }
      );
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
      updateOrderStatus({ reference }, 'cancelled', { processor: 'paystack', data });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Paystack webhook error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
