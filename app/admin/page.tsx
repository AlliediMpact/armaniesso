'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, ShieldOff, Users } from 'lucide-react';

type Order = {
  orderId: string;
  reference?: string;
  status: 'pending' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
  customer?: { name?: string; email?: string };
};

type AdminUser = {
  uid: string;
  email: string;
  displayName?: string;
  customClaims?: Record<string, unknown>;
  createdAt?: string;
};

type Stats = {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
};

export default function AdminDashboardPage() {
  const { user, loading, isAdmin, isConfigured } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, paid: 0, cancelled: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [userError, setUserError] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [promotingUid, setPromotingUid] = useState<string | null>(null);
  const [demotingUid, setDemotingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user || !isAdmin) return;
    setLoadingUsers(true);
    setUserError('');
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch('/api/admin/users', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed loading users');
      setUsers(data.users || []);
    } catch (err: any) {
      setUserError(err?.message || 'Failed loading users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const promoteUser = async (uid: string) => {
    if (!user || !isAdmin) return;
    setPromotingUid(uid);
    setUserError('');
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ uid }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to promote user');
      await fetchUsers();
    } catch (err: any) {
      setUserError(err?.message || 'Failed to promote user');
    } finally {
      setPromotingUid(null);
    }
  };

  const demoteUser = async (uid: string) => {
    if (!user || !isAdmin || user.uid === uid) {
      setUserError('Cannot demote yourself');
      return;
    }
    setDemotingUid(uid);
    setUserError('');
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to demote user');
      await fetchUsers();
    } catch (err: any) {
      setUserError(err?.message || 'Failed to demote user');
    } finally {
      setDemotingUid(null);
    }
  };

  const refreshOrders = async () => {
    if (!user || !isAdmin) return;
    const token = await user.getIdToken().catch(() => '');
    const res = await fetch('/api/admin/orders', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed loading admin data');
    setOrders(data.orders || []);
    setStats(data.stats || { total: 0, pending: 0, paid: 0, cancelled: 0 });
  };

  const quickSetStatus = async (orderId: string, status: 'pending' | 'paid' | 'cancelled') => {
    if (!user || !isAdmin) return;
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Status update failed');
      await refreshOrders();
    } catch (err: any) {
      setError(err?.message || 'Status update failed');
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    let active = true;
    const run = async () => {
      setFetching(true);
      setError('');
      try {
        const token = await user.getIdToken().catch(() => '');
        const res = await fetch('/api/admin/orders', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed loading admin data');

        if (active) {
          setOrders(data.orders || []);
          setStats(data.stats || { total: 0, pending: 0, paid: 0, cancelled: 0 });
        }
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed loading admin data');
      } finally {
        if (active) setFetching(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-orange/40 bg-orange/10 p-6 text-orange-light">
            Firebase Auth is not configured yet.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-dark pt-28 px-6">Loading admin...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 mb-6">Sign in with an admin account.</p>
            <Link
              href="/auth?next=/admin"
              className="inline-flex items-center rounded-lg bg-orange text-dark-bg font-semibold px-5 py-3"
            >
              Sign in as admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
            This account is not authorized for admin access.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Manage orders, payments, and operations.</p>
          </div>
          <span className="text-sm text-gray-400">{user.email}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Paid</p>
            <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-orange">{stats.pending}</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-sm text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between cursor-pointer hover:bg-dark-bg/50" onClick={() => { setShowUserManagement(!showUserManagement); if (!showUserManagement && users.length === 0) fetchUsers(); }}>
            <div className="flex items-center gap-3">
              <Users size={20} className="text-orange" />
              <h2 className="text-xl font-semibold text-white">User Management</h2>
            </div>
            <span className="text-sm text-gray-400">{users.length} users</span>
          </div>

          {showUserManagement && (
            <>
              {userError && (
                <div className="m-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {userError}
                </div>
              )}
              {loadingUsers ? (
                <div className="p-5 text-gray-400">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-5 text-gray-400">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-bg/60 text-gray-300 border-t border-dark-border">
                      <tr>
                        <th className="text-left px-5 py-3">Email</th>
                        <th className="text-left px-5 py-3">Name</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Created</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {users.map((u) => {
                        const isAdmin = u.customClaims?.admin === true;
                        return (
                          <tr key={u.uid}>
                            <td className="px-5 py-3 text-white font-mono text-xs">{u.email}</td>
                            <td className="px-5 py-3 text-gray-200">{u.displayName || '-'}</td>
                            <td className="px-5 py-3">
                              {isAdmin ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange/20 text-orange text-xs font-semibold">
                                  <ShieldCheck size={14} />
                                  Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-600/30 text-gray-300 text-xs">
                                  <ShieldOff size={14} />
                                  Customer
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {isAdmin ? (
                                  <button
                                    onClick={() => demoteUser(u.uid)}
                                    disabled={demotingUid === u.uid || user.uid === u.uid}
                                    className="text-xs px-3 py-1 rounded bg-red-600/80 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {demotingUid === u.uid ? 'Removing...' : 'Remove Admin'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => promoteUser(u.uid)}
                                    disabled={promotingUid === u.uid}
                                    className="text-xs px-3 py-1 rounded bg-orange text-dark-bg font-semibold hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {promotingUid === u.uid ? 'Promoting...' : 'Make Admin'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/store" className="text-sm text-orange hover:text-orange-light">
              Open storefront
            </Link>
          </div>

          {fetching ? (
            <div className="p-5 text-gray-400">Loading orders...</div>
          ) : error ? (
            <div className="p-5 text-red-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-5 text-gray-400">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-dark-bg/60 text-gray-300">
                  <tr>
                    <th className="text-left px-5 py-3">Order</th>
                    <th className="text-left px-5 py-3">Customer</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Created</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-5 py-3 text-white">
                        {order.orderId}
                        {order.reference ? <div className="text-xs text-gray-400">{order.reference}</div> : null}
                      </td>
                      <td className="px-5 py-3 text-gray-200">{order.customer?.email || 'Unknown'}</td>
                      <td className={`px-5 py-3 ${order.status === 'paid' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange'}`}>
                        {order.status}
                      </td>
                      <td className="px-5 py-3 text-gray-200">R{Number(order.total).toFixed(2)}</td>
                      <td className="px-5 py-3 text-gray-400">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/admin/orders/${order.orderId}`} className="text-xs text-orange hover:text-orange-light">
                            View
                          </Link>
                          <button onClick={() => quickSetStatus(order.orderId, 'pending')} className="text-xs px-2 py-1 rounded border border-orange text-orange">
                            Pending
                          </button>
                          <button onClick={() => quickSetStatus(order.orderId, 'paid')} className="text-xs px-2 py-1 rounded bg-green-600 text-white">
                            Paid
                          </button>
                          <button onClick={() => quickSetStatus(order.orderId, 'cancelled')} className="text-xs px-2 py-1 rounded bg-red-600 text-white">
                            Cancel
                          </button>
                        </div>
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
