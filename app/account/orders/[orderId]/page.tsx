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
  items: Array<{ id: string; name: string; quantity?: number; price?: number }>;
  customer?: { name?: string; email?: string };
};

export default function AccountOrderDetailPage({ params }: { params: { orderId: string } }) {
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let active = true;
    const run = async () => {
      try {
        setError('');
        const token = await user.getIdToken().catch(() => '');
        const res = await fetch(`/api/account/orders/${params.orderId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed loading order');
        if (active) setOrder(data.order || null);
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed loading order');
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [user, params.orderId]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading order...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20 px-6">
        <p className="text-gray-300 mb-4">Sign in to view this order.</p>
        <Link href={`/auth?next=/account/orders/${params.orderId}`} className="text-orange">
          Sign in
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20 px-6">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/account" className="text-orange">Back to account</Link>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/account" className="text-orange text-sm">← Back to account</Link>
          <h1 className="text-3xl font-bold mt-2">Order {order.orderId}</h1>
          <p className="text-gray-400 mt-1">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-5">
          <p className="text-gray-400 text-sm">Status</p>
          <p className={`font-semibold mt-1 ${order.status === 'paid' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange'}`}>
            {order.status}
          </p>
          <p className="text-white text-xl font-semibold mt-3">Total: R{Number(order.total).toFixed(2)}</p>
          {order.reference ? <p className="text-gray-400 mt-1">Reference: {order.reference}</p> : null}
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-border font-semibold">Items</div>
          <div className="divide-y divide-dark-border">
            {order.items?.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="px-5 py-4 flex items-center justify-between gap-4">
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
