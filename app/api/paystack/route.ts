import { NextRequest, NextResponse } from 'next/server';
import { calculateCartTotal } from '@/lib/utils';
import { saveOrder } from '@/lib/order-store';
import { checkRateLimit, getRequestClientId } from '@/lib/rate-limit';

interface PayStackRequest {
  email: string;
  amount: number; // in kobo (smallest currency unit)
  phone: string;
  metadata: any;
}

/**
 * POST /api/paystack
 * Initialize PayStack payment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientId = getRequestClientId(request.headers);
    const rate = checkRateLimit(`paystack-init:${clientId}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body: PayStackRequest = await request.json();
    const callbackUrl =
      process.env.PAYSTACK_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-confirmation`;

    // Validate required fields
    if (!body.email || !body.amount || body.amount < 100) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Compute server-side total from metadata items (in Rands)
    const items = body.metadata?.items || [];
    const serverTotal = calculateCartTotal(items);
    const serverAmountKobo = Math.round(serverTotal * 100);

    // Validate that the requested amount matches server-side total.
    if (body.amount !== serverAmountKobo) {
      console.warn('Client amount mismatch', { client: body.amount, server: serverAmountKobo });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // If no secret exists, use local mock mode and skip external API call.
    if (!process.env.PAYSTACK_SECRET_KEY) {
      const reference = `test_ref_${Date.now()}`;
      await saveOrder({
        reference,
        customer: { email: body.email, phone: body.phone },
        items,
        total: serverTotal,
      });

      return NextResponse.json({
        status: true,
        message: 'Authorization URL created',
        authorizationUrl: `https://checkout.paystack.com/test_auth_123456?ref=${body.email}`,
        reference,
      });
    }

    // Initialize PayStack transaction
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          amount: body.amount,
          metadata: body.metadata,
          callback_url: callbackUrl,
        }),
      }
    );

    const data = await paystackResponse.json();

    if (data.status) {
      await saveOrder({
        reference: data.data.reference,
        customer: { email: body.email, phone: body.phone },
        items,
        total: serverTotal,
      });

      return NextResponse.json({
        status: true,
        message: data.message,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
      });
    } else {
      return NextResponse.json(
        {
          error: data.message || 'Failed to initialize payment',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PayStack error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment initialization' },
      { status: 500 }
    );
  }
}
