/**
 * Email templates for all transactional emails
 * Includes order confirmations, status updates, payment notifications, etc.
 */

import { Order } from '@/lib/order-types-enhanced';

export type EmailTemplate = {
  subject: string;
  text: string;
  html?: string;
};

/**
 * Order Confirmation Email
 */
export function orderConfirmationTemplate(order: Order): EmailTemplate {
  const itemsList = order.items
    .map((item) => `- ${item.name} (Qty: ${item.quantity}) - R${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  return {
    subject: `Order Confirmation - ${order.orderId}`,
    text: `
Hi ${order.customer.name},

Thank you for your order! We've received your order and are processing it.

Order ID: ${order.orderId}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}

Items:
${itemsList}

Subtotal: R${order.subtotal.toFixed(2)}
${order.shippingCost > 0 ? `Shipping: R${order.shippingCost.toFixed(2)}\n` : ''}${order.tax ? `Tax: R${order.tax.toFixed(2)}\n` : ''}
Total: R${order.total.toFixed(2)}

Payment Method: ${order.paymentMethod === 'eft' ? 'EFT Transfer' : 'PayStack'}

You will receive a confirmation email once your payment is verified.

Thank you for choosing Armani Esso!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Payment Received Email
 */
export function paymentReceivedTemplate(order: Order): EmailTemplate {
  return {
    subject: `Payment Received - Order ${order.orderId}`,
    text: `
Hi ${order.customer.name},

We have received and verified your payment for order ${order.orderId}.

Amount: R${order.total.toFixed(2)}
Reference: ${order.reference || 'N/A'}
Received At: ${new Date().toLocaleDateString()}

Your order is now being processed and will be shipped shortly.

Thank you for your business!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Order Processing Email
 */
export function orderProcessingTemplate(order: Order): EmailTemplate {
  return {
    subject: `Order Processing - ${order.orderId}`,
    text: `
Hi ${order.customer.name},

Good news! Your order ${order.orderId} is now being prepared for shipment.

Items are being picked and packed. You will receive a shipping notification with tracking information soon.

Order Total: R${order.total.toFixed(2)}

Thank you for your patience!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Order Shipped Email
 */
export function orderShippedTemplate(order: Order): EmailTemplate {
  const trackingInfo = order.shipping?.trackingNumber
    ? `\n\nTracking Number: ${order.shipping.trackingNumber}\nCarrier: ${order.shipping.carrier || 'N/A'}\nEstimated Delivery: ${order.shipping.estimatedDelivery || 'N/A'}`
    : '';

  return {
    subject: `Your Order ${order.orderId} Has Shipped!`,
    text: `
Hi ${order.customer.name},

Great news! Your order ${order.orderId} has been shipped!${trackingInfo}

Shipping Address:
${order.customer.address}
${order.customer.city}, ${order.customer.zipcode}

You can track your shipment using the tracking number above.

Thank you for your business!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Order Delivered Email
 */
export function orderDeliveredTemplate(order: Order): EmailTemplate {
  return {
    subject: `Order Delivered - ${order.orderId}`,
    text: `
Hi ${order.customer.name},

Your order ${order.orderId} has been delivered!

If you have any issues with your order, please contact us at:
Phone: +27 61 543 6379
Email: support@armaniesso.com

Thank you for choosing Armani Esso. We appreciate your business!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Order Cancelled Email
 */
export function orderCancelledTemplate(order: Order, reason?: string): EmailTemplate {
  return {
    subject: `Order Cancelled - ${order.orderId}`,
    text: `
Hi ${order.customer.name},

Your order ${order.orderId} has been cancelled.

${reason ? `Reason: ${reason}\n` : ''}
Order Total: R${order.total.toFixed(2)}

${order.status === 'refunded' ? 'A refund will be processed to your original payment method within 5-7 business days.' : ''}

If you have any questions, please contact us at:
Phone: +27 61 543 6379
Email: support@armaniesso.com

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Refund Issued Email
 */
export function refundIssuedTemplate(order: Order): EmailTemplate {
  return {
    subject: `Refund Processed - Order ${order.orderId}`,
    text: `
Hi ${order.customer.name},

We have processed a refund for order ${order.orderId}.

Refund Amount: R${order.total.toFixed(2)}
Refund Method: Original payment method
Expected in Account: 5-7 business days

If you don't see the refund within this timeframe, please contact us at:
Phone: +27 61 543 6379
Email: support@armaniesso.com

Thank you for your understanding.

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * EFT Payment Instructions Email
 */
export function eftInstructionsTemplate(order: Order): EmailTemplate {
  const accounts = [
    {
      bankName: 'Nedbank',
      accountName: 'Armani Esso',
      accountNumber: '1337348694',
      accountType: 'Cheque Account',
    },
    {
      bankName: 'Capitec',
      accountName: 'Armani Esso',
      accountNumber: '1711564468',
      accountType: 'Savings Account',
      linkedCell: '081 734 2324',
    },
  ];

  const accountDetails = accounts
    .map(
      (acc) =>
        `${acc.bankName} (${acc.accountType})\nAccount Name: ${acc.accountName}\nAccount Number: ${acc.accountNumber}${
          acc.linkedCell ? `\nLinked Cellphone: ${acc.linkedCell}` : ''
        }`
    )
    .join('\n\n');

  return {
    subject: `EFT Payment Instructions - ${order.orderId}`,
    text: `
Hi ${order.customer.name},

Thank you for your order! Please transfer R${order.total.toFixed(2)} to one of our accounts below:

${accountDetails}

Please use the following reference: ${order.orderId}

Once we receive your payment, your order will be processed immediately.

Thank you for choosing Armani Esso!

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Contact Form Confirmation Email
 */
export function contactConfirmationTemplate(contact: {
  name: string;
  email?: string;
  message: string;
}): EmailTemplate {
  return {
    subject: 'We Received Your Message',
    text: `
Hi ${contact.name},

Thank you for contacting Armani Esso. We have received your message and will get back to you as soon as possible.

Our team will review your inquiry and respond within 24 hours.

Best regards,
Armani Esso Team
    `.trim(),
  };
}

/**
 * Admin Contact Form Notification
 */
export function adminContactNotificationTemplate(contact: {
  name: string;
  phone: string;
  email?: string;
  message: string;
  receivedAt: string;
}): EmailTemplate {
  return {
    subject: `New Contact Form Submission - ${contact.name}`,
    text: `
New inquiry received:

Name: ${contact.name}
Phone: ${contact.phone}
Email: ${contact.email || 'Not provided'}
Received: ${new Date(contact.receivedAt).toLocaleString()}

Message:
${contact.message}

---
Please respond to this inquiry within 24 hours.
    `.trim(),
  };
}

/**
 * Low Stock Alert Email (Admin)
 */
export function lowStockAlertTemplate(product: { name: string; sku?: string; available: number; threshold: number }): EmailTemplate {
  return {
    subject: `Low Stock Alert - ${product.name}`,
    text: `
ALERT: Product running low on stock

Product: ${product.name}
${product.sku ? `SKU: ${product.sku}\n` : ''}Current Stock: ${product.available} units
Threshold: ${product.threshold} units

Please reorder soon to avoid stockouts.

Log in to your admin dashboard to manage inventory.

Best regards,
Armani Esso System
    `.trim(),
  };
}

/**
 * Abandoned Cart Reminder Email
 */
export function abandonedCartReminderTemplate(customer: {
  name: string;
  cartItems: Array<{ name: string; price: number; quantity: number }>;
  cartTotal: number;
}): EmailTemplate {
  const itemsList = customer.cartItems
    .map((item) => `- ${item.name} (Qty: ${item.quantity}) - R${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  return {
    subject: 'Complete Your Purchase at Armani Esso',
    text: `
Hi ${customer.name},

You have items in your shopping cart that you haven't purchased yet!

Items:
${itemsList}

Total: R${customer.cartTotal.toFixed(2)}

Click here to complete your purchase: [LINK]

This offer expires in 7 days. Don't miss out!

Best regards,
Armani Esso Team
    `.trim(),
  };
}
