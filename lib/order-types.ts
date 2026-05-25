/**
 * Enhanced Order Type Definitions
 * Supports both PayStack and EFT payment workflows
 */

export interface OrderAddress {
  address: string;
  city: string;
  zipcode: string;
}

export interface OrderCustomer extends OrderAddress {
  name: string;
  email: string;
  phone: string;
  userId?: string; // Firebase UID if authenticated
}

export interface OrderItem {
  id: string; // Product ID
  name: string;
  category: string;
  price: number; // Per unit, in Rands
  quantity: number;
  variant?: {
    name: string; // e.g., "Size"
    value: string; // e.g., "A5"
  };
  total: number; // price * quantity
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  notes?: string;
  updatedBy?: string; // Email or "system"
}

export interface PaymentEvent {
  event: string; // e.g., "charge.success", "charge.failed"
  timestamp: Date;
  data?: any; // Webhook payload
  processor: string; // e.g., "paystack"
}

export interface EFTVerification {
  status: 'pending' | 'confirmed' | 'disputed';
  reference?: string; // Bank reference number
  verifiedAt?: Date;
  verifiedBy?: string; // Email of admin who verified
}

export interface ShippingMethod {
  provider: string; // e.g., "JDE", "Pickup"
  cost: number; // In Rands
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippedAt?: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'paystack' | 'eft';

export interface Order {
  orderId: string; // "ARE-{timestamp}"
  reference?: string; // PayStack reference (null for EFT)
  customer: OrderCustomer;
  items: OrderItem[];
  total: number; // Total price in Rands
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  
  // History and events
  statusHistory: StatusHistoryEntry[];
  paymentEvents: PaymentEvent[];
  
  // Payment-specific
  eftVerification?: EFTVerification;
  
  // Shipping (future)
  shippingMethod?: ShippingMethod;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string; // Internal admin notes
}

/**
 * Order Update Request
 * Used for PATCH /api/admin/orders/{orderId}
 */
export interface OrderUpdateRequest {
  status?: OrderStatus;
  notes?: string;
  shippingMethod?: ShippingMethod;
  eftVerification?: EFTVerification;
}

/**
 * Order Query Filters
 * Used for admin dashboard filtering
 */
export interface OrderQueryFilters {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  email?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'total';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
