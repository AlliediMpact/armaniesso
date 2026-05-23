import { NextRequest, NextResponse } from 'next/server';

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

    // If no secret exists, use local mock mode and skip external API call.
    if (!process.env.PAYSTACK_SECRET_KEY) {
      const reference = `test_ref_${Date.now()}`;
      try {
        const { saveOrder } = await import('@/lib/orders');
        saveOrder({
          reference,
          customer: { email: body.email, phone: body.phone },
          items: body.metadata?.items || [],
          total: body.amount / 100,
        });
      } catch (err) {
        console.error('Failed saving test paystack order:', err);
      }

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
      try {
        const { saveOrder } = await import('@/lib/orders');
        saveOrder({
          reference: data.data.reference,
          customer: { email: body.email, phone: body.phone },
          items: body.metadata?.items || [],
          total: body.amount / 100,
        });
      } catch (err) {
        console.error('Failed saving paystack order:', err);
      }

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
