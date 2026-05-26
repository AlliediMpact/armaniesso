'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { BarChart3, Package, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type AnalyticsOverview = {
  metrics: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
    repeatCustomers: number;
    lowStockCount: number;
  };
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
};

export default function AdminAnalytics() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await user.getIdToken().catch(() => '');
        const res = await fetch('/api/admin/analytics/overview', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || 'Failed to load analytics');
        setData(payload);
      } catch (err: any) {
        setError(err?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Analytics Overview</h3>
          <p className="text-sm text-gray-400">Revenue, repeat customers, and product trends</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-3 py-1 text-orange text-xs font-semibold">
          <BarChart3 size={14} />
          Live dashboard
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading analytics...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
      ) : data ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={<TrendingUp size={16} />} label="Revenue" value={`R${data.metrics.revenue.toFixed(2)}`} />
            <StatCard icon={<Package size={16} />} label="Orders" value={data.metrics.orderCount.toString()} />
            <StatCard icon={<BarChart3 size={16} />} label="Avg. Order" value={`R${data.metrics.averageOrderValue.toFixed(2)}`} />
            <StatCard icon={<Users size={16} />} label="Repeat Customers" value={data.metrics.repeatCustomers.toString()} />
            <StatCard icon={<Package size={16} />} label="Low Stock" value={data.metrics.lowStockCount.toString()} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-dark-border bg-dark/40 p-5">
              <h4 className="mb-4 font-semibold text-white">Top Products</h4>
              <div className="space-y-3">
                {data.topProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">No product activity yet.</p>
                ) : (
                  data.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between gap-4 rounded-lg border border-dark-border px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {index + 1}. {product.name}
                        </p>
                        <p className="text-xs text-gray-400">R{product.revenue.toFixed(2)} revenue</p>
                      </div>
                      <span className="text-sm font-semibold text-orange">{product.quantity} sold</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark/40 p-5">
              <h4 className="mb-4 font-semibold text-white">Monthly Revenue</h4>
              <div className="space-y-3">
                {data.monthlyRevenue.length === 0 ? (
                  <p className="text-sm text-gray-400">No revenue history yet.</p>
                ) : (
                  data.monthlyRevenue.map((month) => (
                    <div key={month.month} className="flex items-center justify-between gap-4 rounded-lg border border-dark-border px-4 py-3">
                      <span className="text-gray-300">{month.month}</span>
                      <span className="font-semibold text-white">R{month.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-dark-border bg-dark/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
        <span className="text-orange">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="break-words text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
