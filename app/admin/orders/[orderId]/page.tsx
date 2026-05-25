'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

type Order = {
  orderId: string;
  reference?: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
  customer?: { name?: string; email?: string; phone?: string };
  items: Array<{ id: string; name: string; quantity?: number; price?: number }>;
};

export default function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  const { user, loading, isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOrder = async () => {
    if (!user) return;
    const token = await user.getIdToken().catch(() => '');
    const res = await fetch(`/api/admin/orders/${params.orderId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed loading order');
    setOrder(data.order || null);
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadOrder().catch((err: any) => setError(err?.message || 'Failed loading order'));
  }, [user, isAdmin, params.orderId]);

  const setStatus = async (status: 'pending' | 'paid' | 'cancelled') => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/orders/${params.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed updating status');
      setOrder(data.order || null);
    } catch (err: any) {
      setError(err?.message || 'Failed updating status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20 px-6">
        <p className="text-red-300 mb-4">Unauthorized</p>
        <Link href="/admin" className="text-orange">Back to admin</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20 px-6">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/admin" className="text-orange">Back to admin</Link>
      </div>
    );
  }

  if (!order) return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading order...</div>;

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Link href="/admin" className="text-orange text-sm">← Back to admin</Link>
            <h1 className="text-3xl font-bold mt-2">Order {order.orderId}</h1>
            <p className="text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <button disabled={saving} onClick={() => setStatus('pending')} className="px-3 py-2 text-sm rounded border border-orange text-orange disabled:opacity-50">Pending</button>
            <button disabled={saving} onClick={() => setStatus('paid')} className="px-3 py-2 text-sm rounded bg-green-600 text-white disabled:opacity-50">Paid</button>
            <button disabled={saving} onClick={() => setStatus('cancelled')} className="px-3 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50">Cancelled</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <p className="text-gray-400 text-sm">Customer</p>
            <p className="text-white mt-1">{order.customer?.name || 'N/A'}</p>
            <p className="text-gray-300 mt-1">{order.customer?.email || 'N/A'}</p>
            <p className="text-gray-400 mt-1">{order.customer?.phone || ''}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <p className="text-gray-400 text-sm">Payment</p>
            <p className={`font-semibold mt-1 ${order.status === 'paid' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange'}`}>
              {order.status}
            </p>
            <p className="text-white text-xl font-semibold mt-3">R{Number(order.total).toFixed(2)}</p>
            {order.reference ? <p className="text-gray-400 mt-1">Ref: {order.reference}</p> : null}
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-border font-semibold">Items</div>
          <div className="divide-y divide-dark-border">
            {order.items?.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
                </div>
                <p className="text-gray-300">{item.price ? `R${Number(item.price).toFixed(2)}` : '-'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
