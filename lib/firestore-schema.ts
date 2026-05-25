/**
 * Firestore Database Schema for Armani Esso
 * 
 * This file documents the structure of collections and documents in Firestore.
 * All data is stored in Firestore as the single source of truth.
 */

/**
 * Collection: orders
 * Document ID: orderId (e.g., "ARE-1234567890")
 * 
 * {
 *   orderId: string;
 *   reference?: string; // PayStack reference
 *   customer?: {
 *     name: string;
 *     email: string;
 *     phone: string;
 *     address: string;
 *     city: string;
 *     zipcode: string;
 *   };
 *   items: Array<{
 *     id: string;
 *     name: string;
 *     price: number;
 *     quantity: number;
 *     variant?: { id: string; value: string };
 *     customization?: string;
 *   }>;
 *   total: number;
 *   status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
 *   createdAt: Timestamp;
 *   updatedAt: Timestamp;
 *   statusHistory?: Array<{
 *     status: OrderStatus;
 *     at: Timestamp;
 *     actor?: string;
 *     note?: string;
 *   }>;
 *   paymentEvents?: Array<{
 *     type: string;
 *     at: Timestamp;
 *     payload?: any;
 *   }>;
 *   payment?: {
 *     method: 'paystack' | 'eft';
 *     reference: string;
 *     amount: number;
 *   };
 *   shipping?: {
 *     method?: string;
 *     cost?: number;
 *     trackingNumber?: string;
 *     carrier?: string;
 *     estimatedDelivery?: string;
 *   };
 *   fulfillment?: {
 *     processedAt?: Timestamp;
 *     shippedAt?: Timestamp;
 *     deliveredAt?: Timestamp;
 *     notes?: string;
 *   };
 *   notes?: string;
 * }
 * 
 * Recommended Indices:
 * - status + createdAt (for filtering and sorting)
 * - customer.email + createdAt (for customer orders)
 * - reference (for PayStack reference lookup)
 */

/**
 * Collection: userCarts
 * Document ID: uid (Firebase Auth UID)
 * 
 * {
 *   userId: string;
 *   items: Array<CartItem>;
 *   updatedAt: Timestamp;
 *   expiresAt: Timestamp; // 30 days from update
 * }
 * 
 * CartItem: Same as order item structure
 * 
 * Recommended Indices:
 * - expiresAt (for cleanup queries)
 */

/**
 * Collection: webhookEvents
 * Document ID: eventId (PayStack webhook ID)
 * 
 * {
 *   event: string;
 *   receivedAt: Timestamp;
 *   payload: any;
 * }
 * 
 * Purpose: Idempotency - prevent processing duplicate webhooks
 * Recommended Indices:
 * - receivedAt (for cleanup queries)
 */

/**
 * Collection: userSessionRevocations
 * Document ID: uid (Firebase Auth UID)
 * 
 * {
 *   revokedAt: Timestamp;
 * }
 * 
 * Purpose: Track revoked sessions for token invalidation
 */

/**
 * Collection: userProfiles (future)
 * Document ID: uid (Firebase Auth UID)
 * 
 * {
 *   userId: string;
 *   email: string;
 *   name?: string;
 *   phone?: string;
 *   addresses: Array<{
 *     type: 'billing' | 'shipping';
 *     street: string;
 *     city: string;
 *     zipcode: string;
 *     default?: boolean;
 *   }>;
 *   createdAt: Timestamp;
 *   updatedAt: Timestamp;
 * }
 */

export const FIRESTORE_COLLECTIONS = {
  ORDERS: 'orders',
  USER_CARTS: 'userCarts',
  WEBHOOK_EVENTS: 'webhookEvents',
  USER_SESSION_REVOCATIONS: 'userSessionRevocations',
  USER_PROFILES: 'userProfiles',
};
