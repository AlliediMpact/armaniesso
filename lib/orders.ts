import fs from 'fs';
import path from 'path';

const ORDERS_PATH = path.resolve(process.cwd(), 'data', 'orders.json');

function ensureDataDir() {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, '[]', 'utf-8');
}

export type Order = {
  orderId: string;
  reference?: string;
  customer?: any;
  items: any[];
  total: number | string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  payment?: any;
};

export function readOrders(): Order[] {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

export function saveOrder(order: Partial<Order>): Order {
  const orders = readOrders();
  const newOrder: Order = {
    orderId: order.orderId || `ARE-${Date.now()}`,
    reference: order.reference,
    customer: order.customer,
    items: order.items || [],
    total: order.total || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    payment: order.payment || null,
  };
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function markOrderPaid(match: { orderId?: string; reference?: string }, payment: any) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => (match.reference && o.reference === match.reference) || (match.orderId && o.orderId === match.orderId));
  if (idx === -1) return null;
  orders[idx].status = 'paid';
  orders[idx].payment = payment;
  saveOrders(orders);
  return orders[idx];
}

export function updateOrderStatus(
  match: { orderId?: string; reference?: string },
  status: 'pending' | 'paid' | 'cancelled',
  payment?: any
) {
  const orders = readOrders();
  const idx = orders.findIndex(
    (o) =>
      (match.reference && o.reference === match.reference) ||
      (match.orderId && o.orderId === match.orderId)
  );
  if (idx === -1) return null;
  orders[idx].status = status;
  if (payment) orders[idx].payment = payment;
  saveOrders(orders);
  return orders[idx];
}

export default { readOrders, saveOrder, markOrderPaid, updateOrderStatus };
