import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/order-store';
import { calculateCartTotal } from '@/lib/utils';
import { sendEftInstructionsEmail } from '@/lib/mailer';
import { checkRateLimit, getRequestClientId } from '@/lib/rate-limit';

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
    const clientId = getRequestClientId(request.headers);
    const rate = checkRateLimit(`eft-order:${clientId}`, 15, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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

    // Compute server-side total from items to prevent client tampering
    const serverTotal = calculateCartTotal(body.items);
    if (Number(body.total) && Number(body.total) !== serverTotal) {
      console.warn('EFT order total mismatch; using server-calculated total', {
        client: body.total,
        server: serverTotal,
      });
    }

    // EFT Bank Details
    const accounts = [
      {
        bankName: 'Nedbank',
        accountName: 'Armani Esso',
        accountNumber: '1337348694',
        accountType: 'Cheque Account',
      },
      {
        bankName: 'Capitec',
        accountName: 'Armani Esso',
        accountNumber: '1711564468',
        accountType: 'Savings Account',
        linkedCellphone: '081 734 2324',
      },
    ];
    const bankDetails = accounts[0]; // Default to Nedbank, allow selection in future

    // Log order (in production, save to database)
    console.log('New EFT Order:', {
      orderId,
      customer: body.customer,
      total: body.total,
      itemsCount: body.items.length,
      timestamp: new Date().toISOString(),
    });

    // Persist order and fail fast if persistence fails in strict production mode.
    await saveOrder({ orderId, customer: body.customer, items: body.items, total: serverTotal });

    // Send EFT instructions email if SMTP is configured.
    try {
      await sendEftInstructionsEmail({
        to: body.customer.email,
        customerName: body.customer.name,
        orderId,
        total: serverTotal,
        bankDetails,
      });
    } catch (err) {
      console.error('Failed sending EFT instructions email:', err);
    }

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
