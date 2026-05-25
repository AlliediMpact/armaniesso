import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/firebase-admin';
import { checkInventoryAvailability, getInventorySummary, getLowStockItems } from '@/lib/inventory-service';
import { validateRequest, CheckoutValidationSchema, errorResponse } from '@/lib/validation-schemas';

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

/**
 * POST /api/store/validate-cart
 * Validate that all items in cart are available
 * Public endpoint (customer-facing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateRequest(
      CheckoutValidationSchema.omit({
        customerEmail: true,
        customerPhone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingZipcode: true,
      }),
      { items: body.items }
    );

    if (!validation.valid) {
      return NextResponse.json(errorResponse(validation.errors), { status: 400 });
    }

    const conflicts: any[] = [];

    for (const item of validation.data.items) {
      const result = await checkInventoryAvailability(
        item.id,
        item.quantity,
        item.variantId
      );

      if (!result.available) {
        conflicts.push({
          productId: item.id,
          variantId: item.variantId,
          requestedQuantity: item.quantity,
          availableQuantity: result.availableQuantity,
          message: result.message,
        });
      }
    }

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Some items are out of stock',
          conflicts,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'All items are in stock',
    });
  } catch (error) {
    console.error('Checkout validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
