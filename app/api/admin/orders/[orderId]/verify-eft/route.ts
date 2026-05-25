import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/order-store';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { sendPaymentReceivedEmail } from '@/lib/mailer';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function getAllowedAdmins() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminToken(decoded: { email?: string; claims?: Record<string, unknown> } | null) {
  if (!decoded) return false;
  const claims = decoded.claims || {};
  return (
    claims.admin === true ||
    claims.role === 'admin' ||
    (Array.isArray(claims.roles) && (claims.roles as unknown[]).includes('admin'))
  );
}

/**
 * POST /api/admin/orders/[orderId]/verify-eft
 * Verify and mark an EFT payment as received
 * Used when payment is manually confirmed via bank statement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const decoded = await verifyBearerToken(request.headers.get('authorization'));
  if (!decoded) {
    return withNoStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const email = decoded.email || '';
  const admins = getAllowedAdmins();
  if (!isAdminToken(decoded) && !admins.has(email.toLowerCase())) {
    return withNoStore(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  }

  try {
    const order = await getOrderById(params.orderId);
    if (!order) {
      return withNoStore(NextResponse.json({ error: 'Order not found' }, { status: 404 }));
    }

    // Only EFT orders can be verified
    if (order.payment?.method !== 'eft' && !order.reference) {
      return withNoStore(
        NextResponse.json(
          { error: 'Order is not an EFT payment' },
          { status: 400 }
        )
      );
    }

    const body = await request.json();
    const { bankReference, notes } = body;

    if (!bankReference) {
      return withNoStore(
        NextResponse.json(
          { error: 'Bank reference is required' },
          { status: 400 }
        )
      );
    }

    // Update order status to paid
    const updated = await updateOrderStatus(
      { orderId: params.orderId },
      'paid',
      {
        processor: 'eft-verification',
        actor: email,
        verifiedBy: email,
        bankReference,
        verificationTime: new Date().toISOString(),
        note: notes || 'EFT payment verified by admin',
      }
    );

    if (!updated) {
      return withNoStore(
        NextResponse.json(
          { error: 'Failed to verify payment' },
          { status: 500 }
        )
      );
    }

    // Send payment confirmation email
    try {
      if (updated.customer?.email) {
        await sendPaymentReceivedEmail({
          to: updated.customer.email,
          customerName: updated.customer.name,
          orderId: updated.orderId,
          reference: bankReference,
          total: typeof updated.total === 'number' ? updated.total : parseFloat(String(updated.total) || '0'),
        });
      }
    } catch (emailErr) {
      console.error('Failed to send EFT verification email:', emailErr);
      // Don't fail the request if email fails
    }

    console.log(`EFT payment verified for order ${params.orderId} by ${email}`);

    return withNoStore(
      NextResponse.json({
        order: updated,
        message: 'EFT payment verified successfully',
      })
    );
  } catch (error) {
    console.error('EFT verification error:', error);
    return withNoStore(
      NextResponse.json(
        { error: 'Failed to verify EFT payment' },
        { status: 500 }
      )
    );
  }
}
