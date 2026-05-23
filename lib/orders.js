const fs = require('fs');
const path = require('path');

const ORDERS_PATH = path.resolve(process.cwd(), 'data', 'orders.json');

function ensureDataDir() {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, '[]', 'utf-8');
}

function readOrders() {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function saveOrders(orders) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

function saveOrder(order) {
  const orders = readOrders();
  const newOrder = {
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

function markOrderPaid(match, payment) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => (match.reference && o.reference === match.reference) || (match.orderId && o.orderId === match.orderId));
  if (idx === -1) return null;
  orders[idx].status = 'paid';
  orders[idx].payment = payment;
  saveOrders(orders);
  return orders[idx];
}

function updateOrderStatus(match, status, payment) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => (match.reference && o.reference === match.reference) || (match.orderId && o.orderId === match.orderId));
  if (idx === -1) return null;
  orders[idx].status = status;
  if (payment) orders[idx].payment = payment;
  saveOrders(orders);
  return orders[idx];
}

module.exports = { readOrders, saveOrders, saveOrder, markOrderPaid, updateOrderStatus };
