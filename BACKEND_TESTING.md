# Backend Testing Guide - Armani Esso

## Quick Start Testing

### Prerequisites
- Admin email configured in `.env.local`
- PayStack test keys active
- Firebase Emulator running (optional for local dev)
- Postman or curl for API testing

---

## 1. Payment Processing Tests

### 1.1 PayStack Payment Initialization

**Request**:
```bash
curl -X POST http://localhost:3000/api/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 50000,
    "phone": "+27123456789",
    "metadata": {
      "items": [
        {
          "id": "1",
          "name": "Business Cards A5",
          "price": 500,
          "quantity": 100
        }
      ],
      "customer_name": "Test Customer"
    }
  }'
```

**Expected Response** (201):
```json
{
  "status": true,
  "message": "Authorization URL created",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "PAYSTACK-REF-123456"
}
```

**Test Cases**:
- ✅ Valid request → 200 with authorizationUrl
- ✅ Missing email → 400 "Invalid request parameters"
- ✅ Amount mismatch (client vs server) → 400 "Amount mismatch"
- ✅ Rate limit exceeded (21+ requests in 60s) → 429 "Too many requests"

### 1.2 PayStack Webhook Verification

**Request**:
```bash
curl -X POST http://localhost:3000/api/paystack/webhook \
  -H "x-paystack-signature: {HMAC_SIGNATURE}" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.success",
    "data": {
      "id": 123456789,
      "reference": "PAYSTACK-REF-123456",
      "amount": 50000,
      "status": "success"
    }
  }'
```

**Test Cases**:
- ✅ Valid signature, new event → 200 with order marked as paid
- ✅ Invalid signature → 400
- ✅ Duplicate event (same reference) → 200 (idempotent)
- ✅ Failed charge event → 200 with order marked as failed

**Verify**:
```bash
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

## 2. EFT Payment Tests

### 2.1 Create EFT Order

**Request**:
```bash
curl -X POST http://localhost:3000/api/eft-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+27123456789",
      "address": "123 Main Street",
      "city": "Johannesburg",
      "zipcode": "2000"
    },
    "items": [
      {
        "id": "1",
        "name": "Branded Mugs",
        "price": 150,
        "quantity": 50
      }
    ],
    "total": 7500
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Order created successfully",
  "orderId": "ARE-1716613800000",
  "bankDetails": {
    "bankName": "Nedbank",
    "accountName": "Armani Esso",
    "accountNumber": "1337348694",
    "accountType": "Cheque Account"
  },
  "instructions": "Please transfer R7500.00 to the account details above. Reference your order ID: ARE-1716613800000"
}
```

**Test Cases**:
- ✅ Valid request → 200 with orderId
- ✅ Missing customer data → 400
- ✅ Server total validation (client vs server) → Uses server total
- ✅ Rate limit exceeded (16+ requests in 60s) → 429
- ✅ Email sent successfully → Check customer inbox

### 2.2 Verify EFT Payment

**Request**:
```bash
curl -X POST http://localhost:3000/api/admin/orders/ARE-1716613800000/verify-eft \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "bankReference": "FT123456789",
    "notes": "Payment confirmed in bank statement"
  }'
```

**Expected Response** (200):
```json
{
  "order": {
    "orderId": "ARE-1716613800000",
    "status": "paid",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-05-25T10:30:00Z",
        "actor": "system"
      },
      {
        "status": "paid",
        "timestamp": "2024-05-25T10:35:00Z",
        "actor": "admin@example.com",
        "note": "EFT payment verified by admin"
      }
    ]
  },
  "message": "EFT payment verified successfully"
}
```

**Test Cases**:
- ✅ Valid verification → Order marked as paid
- ✅ Missing bank reference → 400
- ✅ Non-EFT order → 400
- ✅ Unauthorized (no token) → 401
- ✅ Non-admin user → 403

---

## 3. Order Management Tests

### 3.1 List Orders with Filters

**Request**:
```bash
# List all paid orders for a specific email
curl -X GET "http://localhost:3000/api/admin/orders?status=paid&email=john@example.com&page=1&limit=20" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Test Cases**:
- ✅ No filters → Returns all orders, sorted by recent
- ✅ Filter by status → Only returns orders with that status
- ✅ Filter by email → Only returns customer's orders
- ✅ Pagination → Returns correct page slice
- ✅ Search term → Finds order by ID, email, or name
- ✅ Sort by oldest → Returns ascending by createdAt
- ✅ Invalid page (0 or negative) → 400

### 3.2 Get Order Details

**Request**:
```bash
curl -X GET http://localhost:3000/api/admin/orders/ARE-1716613800000 \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Expected Response** (200):
```json
{
  "order": {
    "orderId": "ARE-1716613800000",
    "status": "paid",
    "customer": { ... },
    "items": [ ... ],
    "total": 7500,
    "statusHistory": [ ... ],
    "paymentEvents": [ ... ],
    "createdAt": "2024-05-25T10:30:00Z"
  }
}
```

**Test Cases**:
- ✅ Valid order ID → Returns full order
- ✅ Invalid order ID → 404
- ✅ Unauthorized → 401

### 3.3 Update Order Status

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/admin/orders/ARE-1716613800000 \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "shipping": {
      "method": "JDE",
      "cost": 150,
      "trackingNumber": "JDE123456789",
      "estimatedDelivery": "2024-05-30T00:00:00Z"
    },
    "notes": "Order being prepared for shipment"
  }'
```

**Test Cases**:
- ✅ Valid transition (paid → processing) → Success
- ✅ Invalid transition (delivered → processing) → 400 with valid states
- ✅ Missing required fields → Still updates what's provided
- ✅ Unauthorized → 401

### 3.4 Cancel Order

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/admin/orders/ARE-1716613800000 \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

**Expected Response** (200):
```json
{
  "order": {
    "orderId": "ARE-1716613800000",
    "status": "cancelled",
    "statusHistory": [
      { "status": "pending", ... },
      { "status": "paid", ... },
      { "status": "cancelled", "updatedBy": "admin@example.com", "note": "..." }
    ]
  },
  "message": "Order cancelled"
}
```

**Test Cases**:
- ✅ Cancel pending order → Success
- ✅ Cancel delivered order → 400
- ✅ Cancel already cancelled order → 400

---

## 4. Cart Persistence Tests

### 4.1 Save Cart

**Request**:
```bash
curl -X POST http://localhost:3000/api/account/cart \
  -H "Authorization: Bearer {USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "1",
        "name": "Business Cards A5",
        "price": 500,
        "quantity": 2,
        "category": "stationery"
      }
    ]
  }'
```

**Expected Response** (200):
```json
{
  "cart": {
    "userId": "firebase-uid",
    "email": "user@example.com",
    "items": [...],
    "total": 1000,
    "expiresAt": "2024-06-25T10:30:00Z",
    "createdAt": "2024-05-25T10:30:00Z"
  }
}
```

**Test Cases**:
- ✅ Valid items → Cart saved to Firestore
- ✅ Unauthorized → 401
- ✅ Empty items array → Saves with total 0

### 4.2 Retrieve Cart

**Request**:
```bash
curl -X GET http://localhost:3000/api/account/cart \
  -H "Authorization: Bearer {USER_TOKEN}"
```

**Test Cases**:
- ✅ Valid user → Returns saved cart
- ✅ No saved cart → Returns null
- ✅ Expired cart (> 30 days old) → Deletes and returns null
- ✅ Unauthorized → 401

### 4.3 Clear Cart

**Request**:
```bash
curl -X DELETE http://localhost:3000/api/account/cart \
  -H "Authorization: Bearer {USER_TOKEN}"
```

**Test Cases**:
- ✅ Valid user → Cart deleted
- ✅ Non-existent cart → Still succeeds (idempotent)
- ✅ Unauthorized → 401

---

## 5. Server-Side Validation Tests

### 5.1 Amount Tampering Prevention

**Test**: Modify client amount vs server calculation

**Request**:
```bash
# Client sends 40000 kobo (400 Rands) but items total 50000 kobo (500 Rands)
curl -X POST http://localhost:3000/api/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attacker@example.com",
    "amount": 40000,
    "phone": "+27123456789",
    "metadata": {
      "items": [
        {
          "id": "1",
          "name": "Item",
          "price": 500,
          "quantity": 100  # 500 * 100 = 50000 kobo
        }
      ]
    }
  }'
```

**Expected Response** (400):
```json
{
  "error": "Amount mismatch"
}
```

---

## 6. Rate Limiting Tests

### 6.1 Exceed PayStack Rate Limit

**Test**: Make 21 requests in 60 seconds

```bash
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/paystack \
    -H "Content-Type: application/json" \
    -d '{...}' &
done
wait
```

**Expected**: 20th request succeeds, 21st returns 429

### 6.2 Exceed EFT Rate Limit

**Test**: Make 16 requests in 60 seconds

**Expected**: 15th request succeeds, 16th returns 429

---

## 7. Webhook Idempotency Tests

### 7.1 Duplicate Event Handling

**Test**: Send same webhook event twice

```bash
# First request
curl -X POST http://localhost:3000/api/paystack/webhook \
  -H "x-paystack-signature: {SIGNATURE}" \
  -d '{"event": "charge.success", "data": {"reference": "REF123", "id": 999}}'
# Response: 200

# Second request (identical)
curl -X POST http://localhost:3000/api/paystack/webhook \
  -H "x-paystack-signature: {SIGNATURE}" \
  -d '{"event": "charge.success", "data": {"reference": "REF123", "id": 999}}'
# Response: 200 (order NOT marked paid twice)
```

**Verification**:
```bash
# Check order - should have only ONE payment event for this webhook
curl -X GET http://localhost:3000/api/admin/orders/ARE-... \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
# paymentEvents array should have only 1 charge.success entry for REF123
```

---

## 8. Authentication & Authorization Tests

### 8.1 Missing Token

**Request**:
```bash
curl -X GET http://localhost:3000/api/admin/orders
```

**Expected Response** (401):
```json
{
  "error": "Unauthorized"
}
```

### 8.2 Invalid Token

**Request**:
```bash
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response** (401):
```json
{
  "error": "Unauthorized"
}
```

### 8.3 Non-Admin User Token

**Request**:
```bash
# Valid token but user not in admin emails
curl -X GET http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer {USER_TOKEN}"
```

**Expected Response** (403):
```json
{
  "error": "Forbidden"
}
```

---

## 9. Integration Test Scenario

### Complete Order Flow: PayStack

1. **Checkout**: Customer adds items to cart
2. **Initialize PayStack**: POST `/api/paystack`
3. **Verify in admin**: GET `/api/admin/orders?status=pending`
4. **Webhook received**: PayStack sends charge.success
5. **Verify payment**: GET `/api/admin/orders/{orderId}` (status should be "paid")
6. **Update status**: PATCH `/api/admin/orders/{orderId}` (set to "processing")
7. **Add shipping**: PATCH `/api/admin/orders/{orderId}` (set tracking number)
8. **Mark shipped**: PATCH `/api/admin/orders/{orderId}` (set to "shipped")
9. **Customer receives**: Email with tracking information

### Complete Order Flow: EFT

1. **Checkout**: Customer selects EFT option
2. **Create EFT order**: POST `/api/eft-order`
3. **Customer receives**: Email with bank details
4. **Admin verification**: Admin checks bank statement, finds payment
5. **Verify payment**: POST `/api/admin/orders/{orderId}/verify-eft`
6. **Confirmation sent**: Email automatically sent to customer
7. **Admin updates status**: PATCH (status to "processing")
8. **Order fulfillment**: Same as PayStack flow

---

## 10. Data Validation Tests

### 10.1 Invalid Email

**Request**:
```bash
curl -X POST http://localhost:3000/api/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    ...
  }'
```

**Expected**: 400 (email validation should fail)

### 10.2 Invalid Amount

**Request**:
```bash
curl -X POST http://localhost:3000/api/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "email": "valid@example.com",
    "amount": 50,  # Less than minimum (100 kobo)
    ...
  }'
```

**Expected**: 400

---

## 11. Performance Tests

### 11.1 Large Order List

**Test**: Retrieve 1000 orders with pagination

```bash
curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=100" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Expected**: Response < 2 seconds

### 11.2 Complex Filtering

**Test**: Filter, search, and sort simultaneously

```bash
curl -X GET "http://localhost:3000/api/admin/orders?status=paid&search=john&sort=oldest&page=1&limit=50" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Expected**: Response < 3 seconds

---

## Debugging Tools

### Firebase Firestore Emulator
```bash
firebase emulators:start
```

### Inspect Firestore Collections
```bash
firebase firestore:describe orders
```

### View Webhook Events Log
```bash
# SSH into server or check local data/webhook-events.json
cat data/webhook-events.json
```

### Monitor Email Sending
```bash
# Check SMTP logs or test email account
# Ethereal test: https://ethereal.email
```

---

## Cleanup & Reset

### Clear All Orders (Development Only)
```bash
firebase firestore:delete orders --recursive
rm data/orders.json
```

### Clear Webhook Events
```bash
rm data/webhook-events.json
firebase firestore:delete webhookEvents --recursive
```

### Reset Rate Limiter
```bash
# Restart server or clear in-memory rate limit map
# (Rate limiter resets on process restart)
```

---

## Known Limitations & Workarounds

1. **Local JSON fallback**: In production without Firestore, orders will be lost on server restart
   - **Workaround**: Always enable Firebase Admin SDK

2. **No real inventory**: Stock is unlimited by design
   - **Workaround**: Use external inventory management system

3. **Manual EFT verification**: No automated reconciliation
   - **Workaround**: Integrate bank API in Phase 2

4. **No customer profiles**: All data stored in orders
   - **Workaround**: Create customers from order data manually (Phase 2)

---

## Support

For issues or questions about specific endpoints, check:
- `BACKEND_IMPLEMENTATION.md` - Full API documentation
- `lib/order-store.ts` - Order persistence logic
- `app/api/*/route.ts` - Endpoint implementations
