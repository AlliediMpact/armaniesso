'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type Order = {
  orderId: string;
  reference?: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
  items: Array<{ id: string; name: string; quantity?: number }>;
};

type Profile = {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
};

export default function AccountDashboardPage() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;

    let active = true;
    const run = async () => {
      setFetching(true);
      setError('');
      try {
        const token = await user.getIdToken().catch(() => '');
        const res = await fetch('/api/account/orders', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed loading orders');
        if (active) setOrders(data.orders || []);

        const profileRes = await fetch('/api/account/profile', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(profileData?.error || 'Failed loading profile');
        if (active) {
          setProfile(profileData.profile || null);
          setProfileForm({
            fullName: profileData.profile?.fullName || '',
            phone: profileData.profile?.phone || '',
          });
        }
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed loading orders');
      } finally {
        if (active) setFetching(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setError('');
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed saving profile');
      setProfile(data.profile || null);
    } catch (err: any) {
      setError(err?.message || 'Failed saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-orange/40 bg-orange/10 p-6 text-orange-light">
            Firebase Auth is not configured yet. Add `NEXT_PUBLIC_FIREBASE_*` keys in `.env.local`.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading account...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
            <p className="text-gray-400 mb-6">Sign in to track your orders and invoices.</p>
            <Link
              href="/auth?next=/account"
              className="inline-flex items-center rounded-lg bg-orange text-dark-bg font-semibold px-5 py-3"
            >
              Sign in to continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Client Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome {user.email}. Track your orders below.</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Phone number"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">Email: {profile?.email || user.email}</div>
          <button
            onClick={() => void saveProfile()}
            disabled={savingProfile}
            className="mt-4 rounded-lg bg-orange text-dark-bg px-4 py-2 font-semibold disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Paid</p>
            <p className="text-2xl font-bold text-green-400">
              {orders.filter((o) => o.status === 'paid').length}
            </p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-orange">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-border">
            <h2 className="text-xl font-semibold">Your Orders</h2>
          </div>

          {fetching ? (
            <div className="p-5 text-gray-400">Loading orders...</div>
          ) : error ? (
            <div className="p-5 text-red-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-5 text-gray-400">
              No orders yet. <Link href="/store" className="text-orange">Start shopping</Link>.
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {orders.map((order) => (
                <div key={order.orderId} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold">{order.orderId}</p>
                      <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">R{Number(order.total).toFixed(2)}</p>
                      <p className={`text-sm ${order.status === 'paid' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange'}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {order.items?.length || 0} item(s)
                    {order.reference ? ` | Ref: ${order.reference}` : ''}
                  </p>
                  <Link
                    href={`/account/orders/${order.orderId}`}
                    className="inline-block mt-3 text-sm text-orange hover:text-orange-light"
                  >
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
