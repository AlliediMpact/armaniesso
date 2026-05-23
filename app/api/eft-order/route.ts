import { NextRequest, NextResponse } from 'next/server';

interface EFTOrderRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipcode: string;
  };
  items: any[];
  total: number;
}

/**
 * POST /api/eft-order
 * Create an EFT payment order
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: EFTOrderRequest = await request.json();

    // Validate required fields
    if (!body.customer || !body.items || !body.total) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    // Create order record (in production, save to database)
    const orderId = `ARE-${Date.now()}`;

    // EFT Bank Details (placeholder - update with actual details)
    const bankDetails = {
      bankName: 'Armani Esso Finance',
      accountName: 'Armani Esso Trading',
      accountNumber: 'XXXX XXXX XXXX XXXX', // Will be provided by user
      branchCode: 'XXXXX',
    };

    // Log order (in production, save to database)
    console.log('New EFT Order:', {
      orderId,
      customer: body.customer,
      total: body.total,
      itemsCount: body.items.length,
      timestamp: new Date().toISOString(),
    });

    // Send confirmation email (in production, integrate with email service)
    // await sendOrderConfirmationEmail({
    //   to: body.customer.email,
    //   orderId,
    //   bankDetails,
    //   total: body.total,
    // });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId,
      bankDetails,
      instructions: `Please transfer R${body.total} to the account details above. Reference your order ID: ${orderId}`,
    });
  } catch (error) {
    console.error('EFT Order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
