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
  billingAddress?: string;
  billingCity?: string;
  billingZipcode?: string;
};

export default function AccountDashboardPage() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ 
    fullName: '', 
    phone: '',
    billingAddress: '',
    billingCity: '',
    billingZipcode: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
            billingAddress: profileData.profile?.billingAddress || '',
            billingCity: profileData.profile?.billingCity || '',
            billingZipcode: profileData.profile?.billingZipcode || '',
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
    setSuccessMessage('');
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
      setSuccessMessage('✓ Your profile has been saved successfully. You won\'t be asked for this information on your next purchase.');
      setTimeout(() => setSuccessMessage(''), 5000);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Client Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome {user.email}. Manage your profile and track your orders.</p>
        </div>

        {/* Profile Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Profile & Billing Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Phone number"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Billing Address</label>
              <input
                type="text"
                value={profileForm.billingAddress}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, billingAddress: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">City</label>
              <input
                type="text"
                value={profileForm.billingCity}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, billingCity: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Postal Code</label>
              <input
                type="text"
                value={profileForm.billingZipcode}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, billingZipcode: e.target.value }))}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="Postal code"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">Email: {profile?.email || user.email}</div>

          {successMessage && (
            <div className="mt-4 rounded-lg bg-green-900/20 border border-green-500/30 p-3 text-sm text-green-400">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg bg-red-900/20 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={() => void saveProfile()}
            disabled={savingProfile}
            className="mt-6 rounded-lg bg-orange text-dark-bg px-6 py-2 font-semibold disabled:opacity-50 hover:bg-orange/90"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
          <p className="text-xs text-gray-500 mt-2">Your information will be auto-filled on checkout after saving</p>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Paid Orders</p>
            <p className="text-2xl font-bold text-green-400">{orders.filter((o) => o.status === 'paid').length}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{orders.filter((o) => o.status === 'pending').length}</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-400">No orders yet. <Link href="/store" className="text-orange hover:underline">Shop now</Link></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-dark-border">
                  <tr>
                    <th className="text-left py-3 text-gray-300">Order ID</th>
                    <th className="text-left py-3 text-gray-300">Date</th>
                    <th className="text-left py-3 text-gray-300">Items</th>
                    <th className="text-left py-3 text-gray-300">Total</th>
                    <th className="text-left py-3 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-dark-border hover:bg-dark-bg/50">
                      <td className="py-3">
                        <Link href={`/account/orders/${order.orderId}`} className="text-orange hover:underline">
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-400">{order.items.length} item(s)</td>
                      <td className="py-3 font-semibold">R{order.total.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'paid'
                              ? 'bg-green-900/30 text-green-400'
                              : order.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
