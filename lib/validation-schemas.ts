/**
 * Centralized Zod validation schemas for all API endpoints
 * Ensures consistency and better error handling across the application
 */

import { z } from 'zod';

// ============================================================================
// CONTACT FORM
// ============================================================================

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Invalid phone number').max(20),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().default(-1), // -1 for unlimited
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(5000),
  category: z.enum(['displays', 'stationery', 'branding', 'gifts', 'custom']),
  basePrice: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  image: z.string().url('Invalid image URL'),
  stock: z.number().int().default(-1),
  isAvailable: z.boolean().default(true),
  variants: z.array(ProductVariantSchema).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;

// ============================================================================
// ORDERS
// ============================================================================

export const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
  sku: z.string().optional(),
});

export const CheckoutValidationSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Cart must contain at least one item'),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingZipcode: z.string().min(3),
  shippingMethod: z.enum(['pickup', 'delivery', 'courier']).optional(),
});

export type CheckoutValidationInput = z.infer<typeof CheckoutValidationSchema>;

// ============================================================================
// PAYMENTS
// ============================================================================

export const PayStackInitSchema = z.object({
  email: z.string().email(),
  amount: z.number().int().positive('Amount must be in kobo'),
  phone: z.string().min(10),
  metadata: z.object({
    customer_name: z.string(),
    address: z.string(),
    city: z.string(),
    zipcode: z.string(),
    items: z.array(CartItemSchema),
  }),
});

export type PayStackInitInput = z.infer<typeof PayStackInitSchema>;

export const EFTOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    zipcode: z.string().min(3),
  }),
  items: z.array(CartItemSchema).min(1),
  total: z.number().positive(),
});

export type EFTOrderInput = z.infer<typeof EFTOrderSchema>;

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export const OrderUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  statusNotes: z.string().optional(),
  shipping: z.object({
    method: z.enum(['pickup', 'delivery', 'courier']),
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.string().optional(),
  }).optional(),
  paymentEvent: z.object({
    type: z.enum(['initiated', 'pending', 'completed', 'verified', 'refunded']),
    processor: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;

export const PaymentVerificationSchema = z.object({
  orderId: z.string(),
  eftReference: z.string().min(1),
  amount: z.number().positive(),
  bankAccount: z.string().optional(),
});

export type PaymentVerificationInput = z.infer<typeof PaymentVerificationSchema>;

// ============================================================================
// CUSTOMER
// ============================================================================

export const CustomerProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),
});

export type CustomerProfileInput = z.infer<typeof CustomerProfileSchema>;

// ============================================================================
// CART
// ============================================================================

export const CartSyncSchema = z.object({
  items: z.array(CartItemSchema),
});

export type CartSyncInput = z.infer<typeof CartSyncSchema>;

// ============================================================================
// HELPERS
// ============================================================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { valid: true; data: T } | { valid: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, errors: result.error.issues };
}

export function errorResponse(issues: z.ZodIssue[]) {
  return {
    error: 'Validation failed',
    issues: issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
