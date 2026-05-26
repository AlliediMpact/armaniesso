import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function isAdminClaims(decoded: any) {
  if (!decoded) return false;
  const claims = decoded.claims || {};
  return decoded.admin === true || claims.admin === true || claims.role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!isAdminClaims(decodedToken)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = admin.firestore();
    const ordersSnapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

    const completedOrders = orders.filter((order) => order.status !== 'cancelled');
    const revenue = completedOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    const customerMap = new Map<string, number>();
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const monthlyRevenueMap = new Map<string, number>();

    for (const order of completedOrders) {
      const customerEmail = (order.customer?.email || order.email || '').toLowerCase();
      if (customerEmail) {
        customerMap.set(customerEmail, (customerMap.get(customerEmail) || 0) + 1);
      }

      const monthKey = new Date(order.createdAt).toISOString().slice(0, 7);
      monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + (Number(order.total) || 0));

      for (const item of order.items || []) {
        const current = productMap.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
        current.quantity += Number(item.quantity) || 0;
        current.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
        productMap.set(item.id, current);
      }
    }

    const topProducts = Array.from(productMap.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const repeatCustomers = Array.from(customerMap.values()).filter((count) => count > 1).length;
    const averageOrderValue = completedOrders.length > 0 ? revenue / completedOrders.length : 0;
    const lowStockCount = await db.collection('products').where('stock', '<', 10).get().then((snap) => snap.size).catch(() => 0);

    return NextResponse.json({
      success: true,
      metrics: {
        revenue,
        orderCount: completedOrders.length,
        averageOrderValue,
        repeatCustomers,
        lowStockCount,
      },
      topProducts,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ error: 'Failed to load analytics overview' }, { status: 500 });
  }
}
