import nodemailer from 'nodemailer';

type EftEmailInput = {
  to: string;
  customerName?: string;
  orderId: string;
  total: number | string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
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

export async function sendEftInstructionsEmail(input: EftEmailInput) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured; EFT email skipped.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const greeting = input.customerName ? `Hi ${input.customerName},` : 'Hi,';
  const text = [
    greeting,
    '',
    `Thank you for your order (${input.orderId}).`,
    `Please transfer R${input.total} using the details below:`,
    `Bank: ${input.bankDetails.bankName}`,
    `Account Name: ${input.bankDetails.accountName}`,
    `Account Number: ${input.bankDetails.accountNumber}`,
    `Branch Code: ${input.bankDetails.branchCode}`,
    `Reference: ${input.orderId}`,
    '',
    'Please reply with proof of payment once complete.',
  ].join('\n');

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
