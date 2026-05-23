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

    // Validate required fields
    if (!body.email || !body.amount || body.amount < 100) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Initialize PayStack transaction
    // For testing, we're using test mode
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || 'test_key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          amount: body.amount,
          metadata: body.metadata,
        }),
      }
    );

    const data = await paystackResponse.json();

    // If using test keys, return mock response
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({
        status: true,
        message: 'Authorization URL created',
        authorizationUrl: `https://checkout.paystack.com/test_auth_123456?ref=${body.email}`,
        reference: `test_ref_${Date.now()}`,
      });
    }

    if (data.status) {
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
