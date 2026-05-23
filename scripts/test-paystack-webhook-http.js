const crypto = require('crypto');

async function main() {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error('Missing PAYSTACK_SECRET_KEY in environment.');
    process.exit(1);
  }

  // 1) Initialize a payment to ensure pending order exists.
  const initRes = await fetch(`${baseUrl}/api/paystack`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      amount: 5000,
      phone: '+27123456789',
      metadata: {
        items: [{ id: 'p1', name: 'Sample Product', quantity: 1, price: 50 }],
      },
    }),
  });
  const initData = await initRes.json();
  if (!initData.reference) {
    console.error('Failed to initialize payment:', initData);
    process.exit(1);
  }

  // 2) Simulate signed Paystack webhook.
  const payload = {
    event: 'charge.success',
    data: {
      reference: initData.reference,
      status: 'success',
      amount: 5000,
    },
  };
  const raw = JSON.stringify(payload);
  const signature = crypto.createHmac('sha512', secret).update(raw).digest('hex');

  const webhookRes = await fetch(`${baseUrl}/api/paystack/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-paystack-signature': signature,
    },
    body: raw,
  });

  const webhookData = await webhookRes.json();
  console.log('Init reference:', initData.reference);
  console.log('Webhook status:', webhookRes.status);
  console.log('Webhook response:', webhookData);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
