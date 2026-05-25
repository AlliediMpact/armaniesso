# Firestore Database Schema

## Collections

### `/orders`
Main order collection for all transactions (Paystack + EFT).

```
orderId (doc id): "ARE-{timestamp}"
├── reference: string (PayStack reference, null for EFT)
├── customer: {
│   ├── name: string
│   ├── email: string
│   ├── phone: string
│   ├── address: string
│   ├── city: string
│   ├── zipcode: string
│   └── userId: string (optional, if authenticated)
├── items: [{
│   ├── id: string (product id)
│   ├── name: string
│   ├── category: string
│   ├── price: number (in Rands)
│   ├── quantity: number
│   ├── variant?: {
│   │   ├── name: string (e.g., "Size")
│   │   └── value: string (e.g., "A5")
│   └── total: number (price * quantity)
├── total: number (total price in Rands)
├── status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
├── paymentMethod: "paystack" | "eft"
├── statusHistory: [{
│   ├── status: string
│   ├── timestamp: Date
│   ├── notes: string (optional)
│   └── updatedBy: string (email or "system")
├── paymentEvents: [{
│   ├── event: string (e.g., "charge.success")
│   ├── timestamp: Date
│   ├── data: object (webhook payload)
│   └── processor: string (e.g., "paystack")
├── eftVerification?: {
│   ├── status: "pending" | "confirmed" | "disputed"
│   ├── reference: string (bank reference)
│   ├── verifiedAt: Date
│   └── verifiedBy: string (email)
├── shippingMethod?: {
│   ├── provider: string (e.g., "JDE")
│   ├── cost: number
│   ├── trackingNumber?: string
│   ├── estimatedDelivery?: Date
│   └── shippedAt?: Date
├── createdAt: Date
├── updatedAt: Date
└── notes: string (internal admin notes)
```

### `/webhookEvents`
Deduplication and audit trail for webhook events.

```
eventId (doc id): "{event}-{reference}"
├── event: string
├── receivedAt: Date
└── payload: object
```

### `/userSessionRevocations`
Token revocation markers for session management.

```
uid (doc id): "{firebase-uid}"
├── revokedAt: Date
└── reason: string (optional)
```

### `/customers` (New)
Persistent customer profiles for repeat customers.

```
customerId (doc id): "{firebase-uid}"
├── email: string
├── name: string
├── phone: string
├── addresses: [{
│   ├── id: string
│   ├── type: "billing" | "shipping" | "other"
│   ├── address: string
│   ├── city: string
│   ├── zipcode: string
│   ├── isDefault: boolean
│   └── createdAt: Date
├── preferredPaymentMethod: "paystack" | "eft"
├── totalOrders: number
├── totalSpent: number
├── createdAt: Date
└── updatedAt: Date
```

### `/products` (Future - Currently hardcoded)
Product catalog (when moving from static to dynamic).

```
productId (doc id): "{auto-generated}"
├── name: string
├── description: string
├── category: string
├── price: number (in Rands)
├── originalPrice: number (optional, for discounts)
├── image: string (URL)
├── variants?: [{
│   ├── id: string (e.g., "size", "color")
│   ├── name: string
│   ├── options: string[]
│   └── priceAdjustment?: number
├── stock: {
│   ├── quantity: number (unlimited = -1)
│   ├── lowStockThreshold: number
│   ├── status: "in_stock" | "low_stock" | "out_of_stock"
│   └── lastRestocked: Date
├── createdAt: Date
└── updatedAt: Date
```

### `/carts` (New)
Server-side cart persistence for recovery.

```
cartId (doc id): "{firebase-uid}-{sessionId}"
├── userId: string (firebase uid)
├── email: string
├── items: [{
│   ├── id: string
│   ├── name: string
│   ├── price: number
│   ├── quantity: number
│   └── variant?: { name, value }
├── total: number
├── expiresAt: Date (30 days from now)
├── createdAt: Date
└── updatedAt: Date
```

### `/auditLog` (New)
Comprehensive audit trail for all important operations.

```
logId (doc id): "{auto-generated-uuid}"
├── action: string (e.g., "order.status.updated", "product.created")
├── entityType: string (e.g., "order", "product")
├── entityId: string
├── oldValue: object
├── newValue: object
├── performedBy: string (email or "system")
├── timestamp: Date
└── metadata: object (ip, userAgent, etc.)
```

## Indexes Required

1. **orders** collection:
   - `customer.email` + `createdAt` (for customer order history)
   - `status` + `createdAt` (for admin dashboard filtering)
   - `paymentMethod` + `createdAt`

2. **customers** collection:
   - `email` (unique, for user lookup)

3. **carts** collection:
   - `userId` + `expiresAt` (for cleanup)

4. **auditLog** collection:
   - `action` + `timestamp` (for audit searching)
   - `entityId` + `timestamp`

## Migration Path

1. Keep existing `/orders` structure (backwards compatible)
2. Add new fields gradually
3. Deprecate local JSON files → Firestore-only
4. Add `/customers`, `/products`, `/carts`, `/auditLog` as needed
