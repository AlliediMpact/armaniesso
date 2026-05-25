import fs from 'fs/promises';
import path from 'path';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

const ORDERS_PATH = path.resolve(process.cwd(), 'data', 'orders.json');
const ORDER_COLLECTION = 'orders';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type Order = {
  orderId: string;
  reference?: string;
  customer?: any;
  items: any[];
  total: number | string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  statusHistory?: Array<{
    status: OrderStatus;
    at: string;
    actor?: string;
    note?: string;
  }>;
  paymentEvents?: Array<{
    type: string;
    at: string;
    payload?: any;
  }>;
  payment?: any;
  shipping?: {
    method?: string;
    cost?: number;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  fulfillment?: {
    processedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  notes?: string;
  // Audit fields
  createdBy?: string;
  lastModifiedBy?: string;
};

function firestoreEnabled(): boolean {
  const flag = (process.env.FIREBASE_USE_FIRESTORE_ORDERS || '').toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off') return false;
  return true;
}

function strictFirestoreProduction(): boolean {
  return firestoreEnabled() && process.env.NODE_ENV === 'production';
}

function getDbOrNull() {
  if (!firestoreEnabled()) return null;
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (_err) {
    return null;
  }
}

async function ensureLocalStore() {
  const dir = path.dirname(ORDERS_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(ORDERS_PATH);
  } catch (_err) {
    await fs.writeFile(ORDERS_PATH, '[]', 'utf-8');
  }
}

function normalizeOrder(input: any): Order {
  const createdAt = String(input.createdAt || new Date().toISOString());
  const updatedAt = String(input.updatedAt || createdAt);
  const status = (input.status as OrderStatus) || 'pending';
  const statusHistory = Array.isArray(input.statusHistory)
    ? input.statusHistory
    : [
        {
          status,
          at: createdAt,
          actor: 'system',
          note: 'Order created',
        },
      ];

  return {
    orderId: String(input.orderId || `ARE-${Date.now()}`),
    reference: input.reference || undefined,
    customer: input.customer || undefined,
    items: Array.isArray(input.items) ? input.items : [],
    total: input.total ?? 0,
    status,
    createdAt,
    updatedAt,
    statusHistory,
    paymentEvents: Array.isArray(input.paymentEvents) ? input.paymentEvents : [],
    payment: input.payment || null,
  };
}

async function readOrdersLocal(): Promise<Order[]> {
  await ensureLocalStore();
  try {
    const raw = await fs.readFile(ORDERS_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeOrder);
  } catch (_err) {
    return [];
  }
}

async function saveOrdersLocal(orders: Order[]): Promise<void> {
  await ensureLocalStore();
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

async function readOrdersFirestore(): Promise<Order[] | null> {
  const db = getDbOrNull();
  if (!db) return null;

  try {
    const snap = await db.collection(ORDER_COLLECTION).get();
    return snap.docs.map((d) => normalizeOrder(d.data()));
  } catch (_err) {
    return null;
  }
}

export async function readOrders(): Promise<Order[]> {
  const firestoreOrders = await readOrdersFirestore();
  if (strictFirestoreProduction()) {
    return (firestoreOrders || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const orders = firestoreOrders ?? (await readOrdersLocal());
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveOrder(order: Partial<Order>): Promise<Order> {
  const newOrder = normalizeOrder({
    orderId: order.orderId || `ARE-${Date.now()}`,
    reference: order.reference,
    customer: order.customer,
    items: order.items || [],
    total: order.total || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      {
        status: 'pending',
        at: new Date().toISOString(),
        actor: 'system',
        note: 'Order created',
      },
    ],
    paymentEvents: [],
    payment: order.payment || null,
  });

  const db = getDbOrNull();
  if (db) {
    try {
      await db.collection(ORDER_COLLECTION).doc(newOrder.orderId).set(newOrder);
      return newOrder;
    } catch (_err) {
      if (strictFirestoreProduction()) {
        throw new Error('Failed to save order in Firestore');
      }
    }
  } else if (strictFirestoreProduction()) {
    throw new Error('Firestore is not available for order writes');
  }

  const orders = await readOrdersLocal();
  orders.push(newOrder);
  await saveOrdersLocal(orders);
  return newOrder;
}

async function findByMatch(match: { orderId?: string; reference?: string }): Promise<{ order: Order; source: 'firestore' | 'local' } | null> {
  const db = getDbOrNull();
  if (db) {
    try {
      if (match.orderId) {
        const doc = await db.collection(ORDER_COLLECTION).doc(match.orderId).get();
        if (doc.exists) {
          return { order: normalizeOrder(doc.data()), source: 'firestore' };
        }
      }

      if (match.reference) {
        const snap = await db
          .collection(ORDER_COLLECTION)
          .where('reference', '==', match.reference)
          .limit(1)
          .get();
        if (!snap.empty) {
          return { order: normalizeOrder(snap.docs[0].data()), source: 'firestore' };
        }
      }
    } catch (_err) {
      if (strictFirestoreProduction()) {
        return null;
      }
    }
  } else if (strictFirestoreProduction()) {
    return null;
  }

  const local = await readOrdersLocal();
  const found = local.find(
    (o) =>
      (match.reference && o.reference === match.reference) ||
      (match.orderId && o.orderId === match.orderId)
  );
  if (!found) return null;
  return { order: normalizeOrder(found), source: 'local' };
}

export async function updateOrderStatus(
  match: { orderId?: string; reference?: string },
  status: OrderStatus,
  payment?: any
): Promise<Order | null> {
  const found = await findByMatch(match);
  if (!found) return null;

  const updated: Order = {
    ...found.order,
    status,
    updatedAt: new Date().toISOString(),
    statusHistory: [
      ...(found.order.statusHistory || []),
      {
        status,
        at: new Date().toISOString(),
        actor: payment?.manualStatusUpdateBy || 'system',
        note: payment?.note,
      },
    ],
    paymentEvents: payment ? [...(found.order.paymentEvents || []), { type: 'status-change', at: new Date().toISOString(), payload: payment }] : found.order.paymentEvents || [],
    payment: payment ?? found.order.payment ?? null,
  };

  const db = getDbOrNull();
  if (found.source === 'firestore' && db) {
    try {
      await db.collection(ORDER_COLLECTION).doc(updated.orderId).set(updated, { merge: true });
      return updated;
    } catch (_err) {
      if (strictFirestoreProduction()) {
        throw new Error('Failed to update order in Firestore');
      }
    }
  } else if (strictFirestoreProduction()) {
    throw new Error('Firestore is not available for order updates');
  }

  const orders = await readOrdersLocal();
  const idx = orders.findIndex((o) => o.orderId === updated.orderId);
  if (idx === -1) return null;
  orders[idx] = updated;
  await saveOrdersLocal(orders);
  return updated;
}

export async function markOrderPaid(match: { orderId?: string; reference?: string }, payment: any): Promise<Order | null> {
  const updated = await updateOrderStatus(match, 'paid', payment);
  if (!updated) return null;
  updated.paymentEvents = [
    ...(updated.paymentEvents || []),
    { type: 'payment-received', at: new Date().toISOString(), payload: payment },
  ];
  return updateOrderStatus(match, 'paid', {
    ...payment,
    paymentEvents: updated.paymentEvents,
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const found = await findByMatch({ orderId });
  return found?.order || null;
}

export default {
  readOrders,
  saveOrder,
  updateOrderStatus,
  getOrderById,
  markOrderPaid,
};
