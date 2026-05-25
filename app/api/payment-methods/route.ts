import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payment-methods
 * Retrieve available payment methods and their details
 */
export async function GET(request: NextRequest) {
  const paymentMethods = {
    paystack: {
      name: 'PayStack',
      description: 'Credit/Debit card payment',
      enabled: !!process.env.PAYSTACK_SECRET_KEY,
      icon: 'credit-card',
    },
    eft: {
      name: 'EFT Transfer',
      description: 'Direct bank transfer',
      enabled: true,
      accounts: [
        {
          id: 'nedbank',
          bankName: 'Nedbank',
          accountName: 'Armani Esso',
          accountNumber: '1337348694',
          accountType: 'Cheque Account',
        },
        {
          id: 'capitec',
          bankName: 'Capitec',
          accountName: 'Armani Esso',
          accountNumber: '1711564468',
          accountType: 'Savings Account',
          linkedCellphone: '081 734 2324',
        },
      ],
      icon: 'bank',
    },
  };

  // Set cache control headers
  const response = NextResponse.json(paymentMethods);
  response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  return response;
}
