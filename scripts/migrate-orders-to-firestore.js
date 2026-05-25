const fs = require('fs/promises');
const path = require('path');
const { initializeApp, cert, applicationDefault, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const ORDERS_PATH = path.resolve(process.cwd(), 'data', 'orders.json');
const COLLECTION = 'orders';

function normalizeOrder(input) {
  const createdAt = String(input.createdAt || new Date().toISOString());
  const updatedAt = String(input.updatedAt || createdAt);
  const status = input.status || 'pending';
  return {
    orderId: String(input.orderId || `ARE-${Date.now()}`),
    reference: input.reference || null,
    customer: input.customer || null,
    items: Array.isArray(input.items) ? input.items : [],
    total: input.total ?? 0,
    status,
    createdAt,
    updatedAt,
    statusHistory: Array.isArray(input.statusHistory)
      ? input.statusHistory
      : [{ status, at: createdAt, actor: 'system', note: 'Imported order' }],
    paymentEvents: Array.isArray(input.paymentEvents) ? input.paymentEvents : [],
    payment: input.payment || null,
    migratedAt: FieldValue.serverTimestamp(),
  };
}

function initAdmin() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return initializeApp({ credential: applicationDefault(), projectId });
}

async function main() {
  if ((process.env.FIREBASE_USE_FIRESTORE_ORDERS || '').toLowerCase() === 'false') {
    console.log('FIREBASE_USE_FIRESTORE_ORDERS=false, migration skipped.');
    return;
  }

  const raw = await fs.readFile(ORDERS_PATH, 'utf-8').catch(() => '[]');
  const parsed = JSON.parse(raw || '[]');
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.log('No local orders found to migrate.');
    return;
  }

  const app = initAdmin();
  const db = getFirestore(app);
  const batch = db.batch();

  for (const item of parsed) {
    const order = normalizeOrder(item);
    const ref = db.collection(COLLECTION).doc(order.orderId);
    batch.set(ref, order, { merge: true });
  }

  await batch.commit();
  console.log(`Migrated ${parsed.length} order(s) to Firestore collection '${COLLECTION}'.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
