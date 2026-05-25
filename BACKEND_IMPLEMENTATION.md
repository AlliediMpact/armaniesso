# Armani Esso - Backend Architecture & Implementation Guide

## Overview

This document outlines the comprehensive backend improvements implemented for the Armani Esso e-commerce platform, addressing gaps in the store workflow, payment processing, order management, and admin operations.

## 1. Banking Details (EFT Payment Processing)

### Configured Accounts

**Primary Account (Nedbank)**
- Bank: Nedbank
- Account Name: Armani Esso
- Account Number: 1337348694
- Account Type: Cheque Account

**Secondary Account (Capitec)**
- Bank: Capitec
- Account Name: Armani Esso
- Account Number: 1711564468
- Account Type: Savings Account
- Linked Cellphone: 081 734 2324

### EFT Order Flow

1. **Customer initiates EFT payment** via checkout form
2. **Backend validates** cart total server-side (prevents tampering)
3. **Order is created** with status `pending` and payment method `eft`
4. **Confirmation email sent** with both bank account options and payment instructions
5. **Admin verifies payment** via manual bank reconciliation
6. **Admin marks order as `paid`** using `/api/admin/orders/[orderId]/verify-eft` endpoint
7. **Payment confirmation email sent** to customer automatically

## 2. Inventory Management

### Stock Model

While the system supports unlimited stock (no hard limits), the architecture supports future inventory tracking:

```typescript
// Stock representation (for future use)
{
  quantity: -1,  // -1 = unlimited
  lowStockThreshold: 10,
  status: 'in_stock' | 'low_stock' | 'out_of_stock',
  lastRestocked: Date
}
```

### Implementation Details

- **Current**: All products have unlimited stock (no validation)
- **Future**: Can implement stock levels via `lib/inventory.ts`
- **Stock validation** happens at order creation (will be enforced later)
- **Low-stock alerts** for admin dashboard (configurable per product)

## 3. Order Management System

### Order Model

```typescript
interface Order {
  orderId: string;                      // ARE-{timestamp}
  reference?: string;                   // PayStack reference (null for EFT)
  customer: OrderCustomer;              // Name, email, phone, address
  items: OrderItem[];                   // Products in order
  total: number;                        // Total price in Rands
  status: OrderStatus;                  // pending | paid | processing | shipped | delivered | cancelled | refunded
  paymentMethod: PaymentMethod;         // 'paystack' | 'eft'
  
  // Audit trail
  statusHistory: StatusHistoryEntry[];  // All status transitions with timestamps
  paymentEvents: PaymentEvent[];        // All payment-related events
  
  // Fulfillment tracking
  shippingMethod?: ShippingMethod;      // Carrier, tracking number, estimated delivery
  eftVerification?: EFTVerification;    // EFT payment verification details
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;                       // Admin notes
}
```

### Order Status Transitions

```
pending → [paid, cancelled]
paid → [processing, cancelled, refunded]
processing → [shipped, cancelled]
shipped → [delivered, cancelled]
delivered → [refunded]  // Only after delivery
cancelled → (terminal)
refunded → (terminal)
```

### Payment Events Tracking

Every payment-related event is logged:

```typescript
{
  event: 'charge.success' | 'charge.failed' | 'eft_verified' | 'refund_initiated',
  timestamp: Date,
  data: any,           // Event details
  processor: string    // 'paystack' | 'eft' | 'admin'
}
```

## 4. Payment Processing

### PayStack Integration

**Endpoint**: `POST /api/paystack`

```json
{
  "email": "customer@example.com",
  "amount": 5000,        // in kobo (50 Rands)
  "phone": "+27123456789",
  "metadata": {
    "items": [...],      // Cart items
    "customer_name": "John Doe"
  }
}
```

**Features**:
- ✅ Rate limited (20 requests/minute per client)
- ✅ Server-side amount validation (prevents client tampering)
- ✅ Pre-creates order before redirecting to PayStack
- ✅ Webhook signature verification (HMAC SHA512)
- ✅ Dual idempotency (Firestore + local JSON fallback)

### EFT Integration

**Endpoint**: `POST /api/eft-order`

```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+27123456789",
    "address": "123 Main St",
    "city": "Johannesburg",
    "zipcode": "2000"
  },
  "items": [...],
  "total": 500
}
```

**Features**:
- ✅ Rate limited (15 requests/minute per client)
- ✅ Server-side total validation
- ✅ Creates order with `pending` status
- ✅ Sends instructions email with both bank account options
- ⏳ Manual admin verification required (`/verify-eft` endpoint)

### Webhook Processing

**Endpoint**: `POST /api/paystack/webhook`

**Webhook events handled**:
- `charge.success` → Order marked as `paid`
- `charge.completed` → Order marked as `paid`
- `charge.failed` → Order marked as `failed` (future: cancel & refund)
- `charge.abandoned` → Order marked as `cancelled` (future)

**Idempotency**:
1. HMAC signature verification
2. Event ID stored in Firestore `webhookEvents` collection
3. If Firestore unavailable, fallback to local JSON file
4. Duplicate events are silently ignored (idempotent response)

## 5. Admin Order Management

### Get All Orders with Filtering

**Endpoint**: `GET /api/admin/orders`

**Query Parameters**:
```
?page=1&limit=20&status=paid&search=john&sort=recent
```

**Features**:
- ✅ Pagination (limit max 100)
- ✅ Filter by status (`pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`)
- ✅ Search by email, customer name, or order ID
- ✅ Sorting options: `recent` (default), `oldest`, `status`
- ✅ Statistics: total, pending, paid, processing, shipped, delivered, cancelled, refunded, totalRevenue

**Response**:
```json
{
  "orders": [...],
  "stats": {
    "total": 150,
    "pending": 25,
    "paid": 100,
    "processing": 15,
    "shipped": 8,
    "delivered": 2,
    "cancelled": 0,
    "refunded": 0,
    "totalRevenue": 45000
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "totalOrders": 150
  }
}
```

### Get Order Details

**Endpoint**: `GET /api/admin/orders/[orderId]`

Returns full order including status history and payment events.

### Update Order

**Endpoint**: `PATCH /api/admin/orders/[orderId]`

```json
{
  "status": "processing",
  "notes": "Ready to ship",
  "shippingMethod": {
    "provider": "JDE",
    "cost": 150,
    "trackingNumber": "JDE123456789"
  }
}
```

**Features**:
- ✅ Status transition validation (prevents invalid transitions)
- ✅ Shipping method tracking
- ✅ Admin notes
- ✅ Automatic status history entry with admin name & timestamp

### Cancel Order

**Endpoint**: `DELETE /api/admin/orders/[orderId]`

```json
{
  "reason": "Customer requested cancellation"
}
```

**Features**:
- ✅ Only cancels pending, paid, or processing orders
- ✅ Cannot cancel delivered or refunded orders
- ✅ Creates status history entry
- ✅ Soft delete (marks as cancelled, doesn't remove data)

### Verify EFT Payment

**Endpoint**: `POST /api/admin/orders/[orderId]/verify-eft`

```json
{
  "bankReference": "EFT123456",
  "notes": "Payment received in bank statement dated 2024-05-25"
}
```

**Features**:
- ✅ Marks order as `paid`
- ✅ Stores bank reference for reconciliation
- ✅ Sends payment confirmation email to customer
- ✅ Creates status history entry

## 6. Server-Side Cart Persistence

### Cart Storage

**Endpoint**: `GET/POST/DELETE /api/account/cart`

**GET** - Retrieve user's saved cart:
```json
{
  "cart": {
    "userId": "firebase-uid",
    "email": "customer@example.com",
    "items": [...],
    "total": 5000,
    "expiresAt": "2024-06-25T10:30:00Z",
    "createdAt": "2024-05-25T10:30:00Z",
    "updatedAt": "2024-05-25T10:30:00Z"
  }
}
```

**POST** - Save/update cart:
```json
{
  "items": [
    {
      "id": "product-1",
      "name": "Business Cards A5",
      "price": 500,
      "quantity": 2,
      "category": "stationery"
    }
  ]
}
```

**DELETE** - Clear cart:
```json
{
  "message": "Cart cleared"
}
```

**Features**:
- ✅ Persistent across devices (requires login)
- ✅ 30-day expiration (automatic cleanup)
- ✅ Accessible only to authenticated users
- ✅ Server-side total calculation (prevents tampering)
- ✅ Cart recovery on page reload

## 7. Rate Limiting

### Configuration

Endpoint-based rate limiting:

```typescript
// PayStack payment initialization
checkRateLimit(`paystack-init:${clientId}`, 20, 60_000)  // 20 req/min

// EFT order creation
checkRateLimit(`eft-order:${clientId}`, 15, 60_000)     // 15 req/min

// Contact form (optional)
checkRateLimit(`contact:${clientId}`, 5, 60_000)        // 5 req/min
```

**Identification**:
- IP address (from `x-forwarded-for` header or socket)
- User agent (fingerprint)
- Combination for accurate rate limiting

**Response**:
```json
{
  "error": "Too many requests",
  "statusCode": 429
}
```

## 8. Firestore Collections

### `/orders`
Main order storage with full history and payment events.

### `/webhookEvents`
Webhook event deduplication (prevents replay attacks).

### `/userSessionRevocations`
Token revocation markers (Firebase Admin SDK integration).

### `/userCarts` (Future)
Server-side cart storage for authenticated users.

### `/customers` (Future)
Customer profile data, addresses, preferences.

### `/auditLog` (Future)
Comprehensive audit trail for compliance and debugging.

## 9. Data Persistence Strategy

### Dual-Layer Architecture

```
Priority 1: Firestore (Production)
  └─ Fallback: Local JSON file
```

**Flow**:
1. Try to read/write from Firestore
2. If Firestore fails in non-production, use local JSON
3. If Firestore fails in production, fail the request (strict mode)
4. Both layers sync automatically on successful writes

**Configuration**:
```env
FIREBASE_USE_FIRESTORE_ORDERS=true  # Enable Firestore (default)
NODE_ENV=production                  # Strict mode (fail-fast on Firestore errors)
```

## 10. Security Features

### Authentication
- ✅ Firebase JWT token verification
- ✅ Bearer token in `Authorization` header
- ✅ Session revocation via Firestore marker

### Authorization
- ✅ Role-based access control (admin claims)
- ✅ Admin emails whitelist (env config)
- ✅ Custom claims checking in Firebase

### Data Validation
- ✅ Server-side total validation (prevent amount tampering)
- ✅ Request body schema validation
- ✅ Input sanitization

### Webhook Security
- ✅ HMAC SHA512 signature verification (PayStack)
- ✅ Event ID deduplication
- ✅ Replay attack prevention

## 11. Email Notifications

### Payment Received (PayStack)
Sent automatically when webhook confirms payment:
```
To: customer@example.com
Subject: Payment Received - Order #ARE-{orderId}
Body: Confirmation of payment, order details, next steps
```

### EFT Instructions
Sent when EFT order is created:
```
To: customer@example.com
Subject: Bank Transfer Instructions - Order #ARE-{orderId}
Body: Bank account options, payment reference, amount due
```

### Payment Verified (EFT Manual)
Sent when admin verifies EFT payment:
```
To: customer@example.com
Subject: Payment Verified - Order #ARE-{orderId}
Body: Confirmation of EFT payment, processing begins
```

## 12. Future Enhancements

### Phase 2: Inventory Management
- [ ] Stock level tracking per product
- [ ] Variant support (sizes, colors, customization)
- [ ] Low-stock alerts in admin dashboard
- [ ] Automatic stock validation on order creation

### Phase 3: Shipping Integration
- [ ] JDE/Parcel Force integration
- [ ] Automated tracking updates
- [ ] Shipping cost calculation
- [ ] Delivery notifications

### Phase 4: Customer Profiles
- [ ] Customer profile creation
- [ ] Address book management
- [ ] Order history per customer
- [ ] Repeat customer discounts

### Phase 5: Product Management
- [ ] Dynamic product catalog (CRUD)
- [ ] Admin product editor
- [ ] Category management
- [ ] Variant configuration

### Phase 6: Analytics & Reporting
- [ ] Revenue dashboard
- [ ] Order trends
- [ ] Customer lifetime value
- [ ] Payment method breakdown

### Phase 7: Automation
- [ ] Abandoned cart emails (7 days)
- [ ] Order status auto-transitions
- [ ] Scheduled reports
- [ ] Bulk order operations

## 13. API Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/orders` | List orders with filters | Admin |
| GET | `/api/admin/orders/[id]` | Get order details | Admin |
| PATCH | `/api/admin/orders/[id]` | Update order (status, shipping) | Admin |
| DELETE | `/api/admin/orders/[id]` | Cancel order | Admin |
| POST | `/api/admin/orders/[id]/verify-eft` | Verify EFT payment | Admin |
| POST | `/api/paystack` | Initialize PayStack payment | Public |
| POST | `/api/paystack/webhook` | PayStack webhook handler | Signature |
| POST | `/api/eft-order` | Create EFT order | Public |
| GET | `/api/account/orders` | Get user's orders | User |
| GET | `/api/account/cart` | Get saved cart | User |
| POST | `/api/account/cart` | Save cart | User |
| DELETE | `/api/account/cart` | Clear cart | User |

## 14. Configuration Checklist

- [x] Banking details updated (Nedbank + Capitec)
- [x] Unlimited stock configuration (no validation)
- [x] Admin emails configured
- [x] PayStack keys configured
- [x] Firebase Admin SDK configured
- [x] SMTP configured for emails
- [x] Rate limiting configured
- [x] Firestore persistence enabled

## 15. Testing Checklist

- [ ] PayStack payment flow (init → webhook → confirmation)
- [ ] EFT order flow (create → verify → confirmation)
- [ ] Order cancellation (pending → cancelled)
- [ ] Status transitions (validation of invalid transitions)
- [ ] Admin filtering & search
- [ ] Cart persistence & recovery
- [ ] Rate limiting (verify 429 responses)
- [ ] Webhook idempotency (duplicate event handling)
- [ ] Server-side validation (amount tampering prevention)

## 16. Deployment Notes

1. **Environment Variables**: Ensure all `.env.local` variables are set
2. **Firebase Rules**: Deploy updated Firestore rules for collections
3. **Admin Emails**: Update `ADMIN_EMAILS` for your team
4. **Webhook URL**: Configure PayStack webhook to `{YOUR_DOMAIN}/api/paystack/webhook`
5. **SMTP**: Verify email credentials work in production
6. **Rate Limiting**: Adjust limits based on traffic patterns

## Support & Documentation

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/database/admin/start)
- [PayStack Integration Guide](https://paystack.com/docs/payments/accept-payments)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
