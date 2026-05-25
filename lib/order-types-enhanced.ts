/**
 * Enhanced order management with fulfillment tracking, customer profiles, and audit logging
 */

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  sku?: string;
};

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'paystack' | 'eft' | 'bank_transfer' | 'manual';
export type ShippingMethod = 'pickup' | 'delivery' | 'courier';

export type OrderStatusHistory = {
  status: OrderStatus;
  at: string;
  actor?: string; // User ID or 'system'
  note?: string;
};

export type PaymentEvent = {
  type: string;
  at: string;
  payload?: {
    id?: string;
    processor?: string; // 'paystack', 'eft', 'manual'
    reference?: string; // Paystack reference or EFT confirmation
    amount?: number;
    notes?: string;
  };
};

export type ShippingInfo = {
  method: ShippingMethod;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  cost: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipcode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  orderId: string;
  reference?: string; // Paystack reference
  customerId?: string; // Link to customer profile
  customer: CustomerProfile;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shipping?: ShippingInfo;
  statusHistory: OrderStatusHistory[];
  paymentEvents: PaymentEvent[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Audit fields
  createdBy?: string;
  lastModifiedBy?: string;
};

/**
 * Create a new order record
 */
export function createOrder(data: {
  customer: CustomerProfile;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  shippingCost?: number;
  tax?: number;
}): Order {
  const now = new Date().toISOString();
  const orderId = `ARE-${Date.now()}`;

  return {
    orderId,
    reference: data.reference,
    customer: data.customer,
    items: data.items,
    subtotal: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    shippingCost: data.shippingCost || 0,
    tax: data.tax || 0,
    total: data.total,
    status: 'pending',
    paymentMethod: data.paymentMethod,
    statusHistory: [
      {
        status: 'pending',
        at: now,
        actor: 'system',
        note: 'Order created',
      },
    ],
    paymentEvents: [
      {
        type: 'initiated',
        at: now,
        payload: {
          id: `evt-${Date.now()}`,
          processor: data.paymentMethod,
          notes: `Order initiated via ${data.paymentMethod}`,
        },
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a status history entry (works with any order-like object)
 */
export function addStatusHistory(
  order: any,
  newStatus: OrderStatus,
  changedBy: string = 'system',
  notes?: string
): any {
  const now = new Date().toISOString();
  return {
    ...order,
    status: newStatus,
    statusHistory: [
      ...(order.statusHistory || []),
      {
        status: newStatus,
        at: now,
        actor: changedBy,
        note: notes,
      },
    ],
    updatedAt: now,
    lastModifiedBy: changedBy,
  };
}

/**
 * Add a payment event (works with any order-like object)
 */
export function addPaymentEvent(
  order: any,
  event: {
    type: string;
    processor?: string;
    reference?: string;
    amount?: number;
    notes?: string;
  }
): any {
  const now = new Date().toISOString();
  return {
    ...order,
    paymentEvents: [
      ...(order.paymentEvents || []),
      {
        type: event.type,
        at: now,
        payload: {
          id: `evt-${Date.now()}`,
          processor: event.processor,
          reference: event.reference,
          amount: event.amount,
          notes: event.notes,
        },
      },
    ],
    updatedAt: now,
  };
}

/**
 * Update shipping info (works with any order-like object)
 */
export function updateShippingInfo(
  order: any,
  shipping: ShippingInfo,
  changedBy: string = 'system'
): any {
  const now = new Date().toISOString();
  return {
    ...order,
    shipping,
    updatedAt: now,
    lastModifiedBy: changedBy,
  };
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(items: OrderItem[], shippingCost: number = 0, tax: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    shippingCost,
    tax,
    total: subtotal + shippingCost + tax,
  };
}
