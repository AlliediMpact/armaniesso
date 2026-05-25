import nodemailer from 'nodemailer';
import {
  contactConfirmationTemplate,
  adminContactNotificationTemplate,
  orderConfirmationTemplate,
  paymentReceivedTemplate,
  orderProcessingTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderCancelledTemplate,
  refundIssuedTemplate,
  eftInstructionsTemplate,
  lowStockAlertTemplate,
  abandonedCartReminderTemplate,
} from '@/lib/email-templates';
import { Order } from '@/lib/order-types-enhanced';

type EftEmailInput = {
  to: string;
  customerName?: string;
  orderId: string;
  total: number | string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType?: string;
    linkedCellphone?: string;
  };
};

type PaidEmailInput = {
  to: string;
  customerName?: string;
  orderId: string;
  reference?: string;
  total?: number | string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function fromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@armaniesso.local';
}

// ============================================================================
// LEGACY FUNCTIONS (Kept for backward compatibility)
// ============================================================================

export async function sendEftInstructionsEmail(input: EftEmailInput) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured; EFT email skipped.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const greeting = input.customerName ? `Hi ${input.customerName},` : 'Hi,';
  const accountTypeLine = input.bankDetails.accountType ? `Account Type: ${input.bankDetails.accountType}` : '';
  const cellphoneLine = input.bankDetails.linkedCellphone ? `Linked Cellphone: ${input.bankDetails.linkedCellphone}` : '';
  
  const text = [
    greeting,
    '',
    `Thank you for your order (${input.orderId}).`,
    `Please transfer R${input.total} using the details below:`,
    `Bank: ${input.bankDetails.bankName}`,
    `Account Name: ${input.bankDetails.accountName}`,
    `Account Number: ${input.bankDetails.accountNumber}`,
    accountTypeLine,
    cellphoneLine,
    `Reference: ${input.orderId}`,
    '',
    'Please reply with proof of payment once complete.',
  ]
    .filter(Boolean)
    .join('\n');

  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: `Armani Esso EFT Instructions - ${input.orderId}`,
    text,
  });

  return { sent: true };
}

export async function sendPaymentReceivedEmail(input: PaidEmailInput) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured; payment email skipped.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const greeting = input.customerName ? `Hi ${input.customerName},` : 'Hi,';
  const text = [
    greeting,
    '',
    `We have received your payment for order ${input.orderId}.`,
    input.reference ? `Payment reference: ${input.reference}` : '',
    input.total ? `Amount received: R${input.total}` : '',
    '',
    'Thank you for choosing Armani Esso. We will process your order shortly.',
  ]
    .filter(Boolean)
    .join('\n');

  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: `Payment Received - ${input.orderId}`,
    text,
  });

  return { sent: true };
}

// ============================================================================
// NEW EMAIL FUNCTIONS (Template-based)
// ============================================================================

async function sendEmail(to: string, subject: string, text: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured; email skipped.', { to, subject });
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to,
      subject,
      text,
    });
    return { sent: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { sent: false, reason: 'send_failed' };
  }
}

export async function sendOrderConfirmationEmail(order: Order) {
  const template = orderConfirmationTemplate(order);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendOrderProcessingEmail(order: Order) {
  const template = orderProcessingTemplate(order);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendOrderShippedEmail(order: Order) {
  const template = orderShippedTemplate(order);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendOrderDeliveredEmail(order: Order) {
  const template = orderDeliveredTemplate(order);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendOrderCancelledEmail(order: Order, reason?: string) {
  const template = orderCancelledTemplate(order, reason);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendRefundIssuedEmail(order: Order) {
  const template = refundIssuedTemplate(order);
  return sendEmail(order.customer.email, template.subject, template.text);
}

export async function sendContactConfirmationEmail(contact: { to?: string; name: string; email?: string }) {
  if (!contact.to && !contact.email) return { sent: false, reason: 'no_email' };
  
  const template = contactConfirmationTemplate({
    name: contact.name,
    email: contact.email,
    message: '',
  });
  
  return sendEmail(contact.to || contact.email || '', template.subject, template.text);
}

export async function sendAdminContactNotificationEmail(contact: {
  name: string;
  phone: string;
  email?: string;
  message: string;
  receivedAt: string;
}) {
  const adminEmail = 'support@armaniesso.co.za';
  const template = adminContactNotificationTemplate(contact);
  return sendEmail(adminEmail, template.subject, template.text);
}

export async function sendLowStockAlert(product: { name: string; sku?: string; available: number; threshold: number }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return { sent: false, reason: 'no_admin_email' };

  const template = lowStockAlertTemplate(product);
  return sendEmail(adminEmail, template.subject, template.text);
}

export async function sendAbandonedCartReminder(customer: {
  email: string;
  name: string;
  cartItems: Array<{ name: string; price: number; quantity: number }>;
  cartTotal: number;
}) {
  const template = abandonedCartReminderTemplate({
    name: customer.name,
    cartItems: customer.cartItems,
    cartTotal: customer.cartTotal,
  });
  
  return sendEmail(customer.email, template.subject, template.text);
}
