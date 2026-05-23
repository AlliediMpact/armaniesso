const { readFileSync } = require('fs');
const path = require('path');
const { saveOrder, markOrderPaid, readOrders } = require('../lib/orders');

async function simulateInitAndWebhook() {
  console.log('Simulating PayStack init + webhook...');

  // Simulate init response (test-mode)
  const reference = `test_ref_${Date.now()}`;
  const order = saveOrder({ reference, customer: { email: 'test@example.com' }, items: [{ id: 'p1', name: 'Sample' }], total: 99.98 });
  console.log('Saved pending order:', order.orderId, 'reference:', reference);

  // Simulate Paystack webhook payload
  const fakePayload = {
    event: 'charge.success',
    data: {
      reference,
      status: 'success',
      amount: Math.round(99.98 * 100),
    },
  };

  // Directly mark order paid using helper to simulate webhook handling
  const updated = markOrderPaid({ reference }, { processor: 'paystack', data: fakePayload.data });
  if (updated) {
    console.log('Order updated to paid:', updated.orderId);
  } else {
    console.error('Failed to update order');
  }

  console.log('\nCurrent orders file:');
  const orders = readOrders();
  console.log(JSON.stringify(orders, null, 2));
}

simulateInitAndWebhook().catch((e) => console.error(e));
