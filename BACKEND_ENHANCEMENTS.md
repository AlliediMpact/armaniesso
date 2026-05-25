# Backend Architecture & Implementation Guide

## Overview

This document outlines the comprehensive backend improvements made to the Armani Esso e-commerce platform, addressing enterprise-scale requirements for order management, payment processing, inventory tracking, and customer profiles.

---

## Key Improvements Implemented

### 1. **Enhanced Product Management** (`lib/products-enhanced.ts`)

**What's New:**
- Product variants with individual pricing (e.g., sizes, finishes, materials)
- SKU (Stock Keeping Unit) system for inventory tracking
- Structured product categories with availability tracking
- Helper functions for variant lookups and pricing

**Why It Matters:**
- Enables offering different sizes/colors/finishes without duplicating products
- SKU system allows integration with warehouse management later
- Stock level tracking (even if unlimited now, structure is ready)

**Usage:**
```typescript
import { getProduct, isVariantAvailable, getVariantPrice } from '@/lib/products-enhanced';

const product = getProduct('product-001');
const available = isVariantAvailable('product-001', 'var-001-silk');
const price = getVariantPrice('product-001', 'var-001-gloss');
```

---

### 2. **Order Management Enhancements** (`lib/order-types-enhanced.ts`)

**What's New:**
- `OrderStatus`: pending → paid → processing → shipped → delivered (or cancelled/refunded)
- `OrderStatusHistory`: Full audit trail of status changes with timestamps and admin notes
- `PaymentEvent`: Payment lifecycle tracking (initiated, pending, completed, verified, refunded)
- `ShippingInfo`: Tracking numbers, carriers, delivery dates
- `CustomerProfile`: Linked to orders for repeat customer recognition
- Helper functions: `createOrder()`, `addStatusHistory()`, `addPaymentEvent()`, `updateShippingInfo()`

**Why It Matters:**
- Complete order visibility and traceability for admins
- Payment reconciliation workflow for manual EFT verification
- Shipping integration ready for courier APIs
- Customer history enables personalized experiences

**Usage:**
```typescript
import { createOrder, addStatusHistory, addPaymentEvent } from '@/lib/order-types-enhanced';

// Create order
const order = createOrder({
  customer: {...},
  items: [...],
  total: 1299.00,
  paymentMethod: 'paystack'
});

// Update status (e.g., after verification)
let updated = addStatusHistory(order, 'paid', 'admin@example.com', 'EFT verified');
updated = addStatusHistory(updated, 'processing', 'admin@example.com', 'Item picked');
```

---

### 3. **Order Management APIs**

#### **PATCH /api/account/orders/[orderId]** (Admin Only)
Update order status, shipping info, or add notes.

**Request:**
```json
{
  "status": "shipped",
  "statusNotes": "Item dispatched via Fastway",
  "shipping": {
    "method": "courier",
    "carrier": "Fastway",
    "trackingNumber": "FW123456789",
    "estimatedDelivery": "2026-05-28"
  }
}
```

**Response:**
```json
{
  "orderId": "ARE-1234567890",
  "status": "shipped",
  "statusHistory": [
    { "status": "pending", "changedAt": "...", "changedBy": "system" },
    { "status": "paid", "changedAt": "...", "changedBy": "admin@..." },
    { "status": "shipped", "changedAt": "...", "changedBy": "admin@..." }
  ]
}
```

#### **DELETE /api/account/orders/[orderId]** (Admin Only)
Cancel order or initiate refund.

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response:**
```json
{
  "message": "Order refunded",
  "order": { /* updated order with refund payment event */ }
}
```

**Rules:**
- Pending/Processing → Cancelled
- Paid/Shipped/Delivered → Refunded + payment event logged

---

### 4. **Payment Verification & Reconciliation**

#### **POST /api/admin/orders/verify-payment** (Admin Only)
Manually verify EFT payments received via bank transfer.

**Request:**
```json
{
  "orderId": "ARE-1234567890",
  "eftReference": "REF123456",
  "amount": 1299.00,
  "bankAccount": "Nedbank"
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "order": {
    "status": "paid",
    "paymentEvents": [
      { "type": "verified", "reference": "EFT-REF123456 (Nedbank)", ... }
    ]
  }
}
```

**Validation:**
- Verifies amount matches order total (within 0.01 tolerance)
- Prevents duplicate verification
- Sends payment confirmation email to customer
- Logs admin action for audit trail

---

### 5. **Server-Side Cart Persistence** (`/api/account/cart`)

**Endpoints:**
- `GET /api/account/cart` - Retrieve saved cart
- `POST /api/account/cart` - Save/update cart  
- `DELETE /api/account/cart` - Clear cart

**Benefits:**
- Cross-device cart recovery
- 30-day expiration (auto-cleanup)
- Reduces abandoned carts
- Works alongside localStorage (hybrid approach)

**Usage Example:**
```javascript
// Save cart on logout
await fetch('/api/account/cart', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${idToken}` },
  body: JSON.stringify({ items: cartItems })
});

// Restore cart on login
const response = await fetch('/api/account/cart', {
  headers: { 'Authorization': `Bearer ${idToken}` }
});
const { items } = await response.json();
```

---

## EFT Banking Details

**Primary Account:**
- Bank: Nedbank
- Account Name: Armani Esso
- Account Number: 1337348694
- Account Type: Cheque Account

**Alternative Account:**
- Bank: Capitec
- Account Name: Armani Esso
- Account Number: 1711564468
- Account Type: Savings Account
- Linked Cellphone: 081 734 2324

Both accounts are displayed to customers during checkout and included in order confirmation emails.

---

## Data Flow Diagrams

### Order Creation → Payment → Fulfillment

```
Customer Checkout
    ↓
[PayStack API] or [EFT Instructions Email]
    ↓
Order Created (status: pending)
    ↓
[PayStack Webhook] or [Admin Manual Verification]
    ↓
Order Marked Paid (status: paid)
    ↓
[Admin Updates via PATCH]
    ↓
Status: processing → shipped → delivered
    ↓
Confirmation Emails Sent at Each Stage
```

### EFT Payment Flow

```
Customer Selects EFT
    ↓
Order Created (status: pending)
    ↓
Customer Receives Email with Bank Details
    ↓
Customer Transfers Amount
    ↓
Admin Receives Notification
    ↓
Admin Verifies in Dashboard via /api/admin/orders/verify-payment
    ↓
Order Status Updated to "paid"
    ↓
Fulfillment Workflow Begins
```

---

## Security Model

### Authentication
- All admin endpoints require valid Firebase ID token
- Admin check verifies custom claims: `admin === true` or `role === 'admin'` or `'admin' in roles[]`

### Authorization
- User can only view/update own orders (email match)
- Admin can view all orders, update any status
- Admin actions logged in `statusHistory` with email address

### Data Validation
- Server-side total validation prevents client-side tampering
- Amount verification on payment endpoints
- Required field validation on all POST/PATCH requests

---

## Testing Payment Flows

### Manual EFT Verification (Postman/curl)

```bash
curl -X POST http://localhost:3000/api/admin/orders/verify-payment \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ARE-1234567890",
    "eftReference": "EFT20260525001",
    "amount": 1299.00,
    "bankAccount": "Nedbank"
  }'
```

### Update Order Status (Postman/curl)

```bash
curl -X PATCH http://localhost:3000/api/account/orders/ARE-1234567890 \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "statusNotes": "Dispatched via Fastway",
    "shipping": {
      "method": "courier",
      "carrier": "Fastway",
      "trackingNumber": "FW123456789"
    }
  }'
```

### Cancel Order (Postman/curl)

```bash
curl -X DELETE http://localhost:3000/api/account/orders/ARE-1234567890 \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Out of stock"
  }'
```

---

## Future Enhancements

### Phase 2: Shipping Integration
- [ ] Courier API integration (Fastway, Aramex, etc.)
- [ ] Auto-generated shipping labels
- [ ] Real-time tracking updates

### Phase 3: Inventory Management
- [ ] Stock level management
- [ ] Low-stock alerts
- [ ] Backorder handling

### Phase 4: Admin Dashboard
- [ ] Real-time order management UI
- [ ] Payment reconciliation dashboard
- [ ] Customer analytics

### Phase 5: Advanced Features
- [ ] Subscription orders
- [ ] Bulk order management
- [ ] Customer wishlists
- [ ] Product recommendations

---

## Migration & Rollout

1. **Local Testing**: Verify all endpoints with test orders
2. **Staging**: Deploy to staging environment, test with mock payments
3. **Production**: Deploy with feature flags (if needed)
4. **Monitoring**: Set up alerts for failed orders, payment timeouts
5. **Support**: Train admins on new order management UI

---

## Support & Troubleshooting

### Issue: Order not found after creation
- Check Firestore connection
- Verify Firebase credentials in `.env.local`
- Check `data/orders.json` for local fallback

### Issue: EFT verification fails with "Amount mismatch"
- Verify exact order total (including tax/shipping if applicable)
- Check for rounding errors (tolerance is ±0.01)

### Issue: Payment email not sent
- Check SMTP configuration in `.env.local`
- Verify `sendPaymentReceivedEmail` function in `lib/mailer.ts`

---

## Architecture Files Reference

| File | Purpose |
|------|---------|
| `lib/products-enhanced.ts` | Product catalog with variants and SKUs |
| `lib/order-types-enhanced.ts` | Order type definitions and helpers |
| `app/api/account/orders/[orderId]/route.ts` | Order detail, update, cancel endpoints |
| `app/api/admin/orders/verify-payment/route.ts` | EFT payment verification endpoint |
| `app/api/account/cart/route.ts` | Server-side cart persistence |
| `app/api/eft-order/route.ts` | EFT order creation (updated with bank details) |
| `app/api/paystack/route.ts` | PayStack payment initialization |
| `app/api/paystack/webhook/route.ts` | PayStack payment webhook handler |

