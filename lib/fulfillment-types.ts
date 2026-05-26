/**
 * Phase 3 - Order Fulfillment, Refunds, and Admin Tools
 * Type definitions for fulfillment workflows and admin operations
 */

export type FulfillmentAction = 'inventory_checked' | 'packed' | 'shipped' | 'delivered';

export interface FulfillmentStep {
  action: FulfillmentAction;
  completedAt: string;
  completedBy: string; // User/Admin UID
  note?: string;
}

export interface RefundRecord {
  refundId: string;
  amount: number;
  reason: string;
  itemIds?: string[]; // For partial refunds
  issuedAt: string;
  issuedBy: string; // Admin UID
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface OrderFulfillment {
  inventory_checked?: FulfillmentStep;
  packed?: FulfillmentStep;
  shipped?: FulfillmentStep;
  delivered?: FulfillmentStep;
}

export interface AdminOrderQuery {
  email?: string;
  phone?: string;
  status?: string;
  limit?: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  reorderLevel: number;
}

export interface OrderSummary {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}
