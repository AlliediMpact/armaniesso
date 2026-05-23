const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

async function simulatePaystack(body) {
  // Basic validation
  if (!body.email || !body.amount || body.amount < 100) {
    return { status: false, error: 'Invalid request parameters' };
  }

  // If no secret key, return the mocked response the route uses
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      status: true,
      message: 'Authorization URL created',
      authorizationUrl: `https://checkout.paystack.com/test_auth_123456?ref=${body.email}`,
      reference: `test_ref_${Date.now()}`,
    };
  }

  // If a real key is present (rare in local tests), attempt to initialize via PayStack
  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        amount: body.amount,
        metadata: body.metadata,
      }),
    });
    return await res.json();
  } catch (err) {
    return { status: false, error: String(err) };
  }
}

async function simulateEFT(body) {
  if (!body.customer || !body.items || !body.total) {
    return { success: false, error: 'Invalid request parameters' };
  }

  const orderId = `ARE-${Date.now()}`;
  const bankDetails = {
    bankName: 'Armani Esso Finance',
    accountName: 'Armani Esso Trading',
    accountNumber: 'XXXX XXXX XXXX XXXX',
    branchCode: 'XXXXX',
  };

  return {
    success: true,
    message: 'Order created successfully',
    orderId,
    bankDetails,
    instructions: `Please transfer R${body.total} to the account details above. Reference your order ID: ${orderId}`,
  };
}

(async function runTests() {
  console.log('Running checkout simulation tests...');

  const sampleItems = [
    { id: 'p1', name: 'Sample Print', price: 49.99, quantity: 2 },
  ];

  console.log('\n1) Testing PayStack initialization (test-mode)');
  const paystackRes = await simulatePaystack({
    email: 'test@example.com',
    amount: Math.round(49.99 * 100) * 2, // in kobo/cents
    phone: '+27123456789',
    metadata: { items: sampleItems },
  });
  console.log('PayStack response:');
  console.log(JSON.stringify(paystackRes, null, 2));

  console.log('\n2) Testing EFT order creation');
  const eftRes = await simulateEFT({
    customer: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+27123456789',
      address: '123 Test St',
      city: 'Cape Town',
      zipcode: '8000',
    },
    items: sampleItems,
    total: (49.99 * 2).toFixed(2),
  });
  console.log('EFT response:');
  console.log(JSON.stringify(eftRes, null, 2));

  console.log('\nAll tests complete.');
})();
