'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, CreditCard, Download, RotateCcw, Save } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';

type Order = {
  orderId: string;
  reference?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  createdAt: string;
  customer?: { name?: string; email?: string; phone?: string };
  items: Array<{ id: string; name: string; quantity?: number; price?: number }>;
  shipping?: { method?: string; carrier?: string; trackingNumber?: string; cost?: number };
  fulfillment?: Record<string, unknown>;
  statusHistory?: Array<{ status: string; at: string; actor?: string; note?: string }>;
};

export default function AdminOrderDetailPage({ params }: { params: { orderId: string } }) {
  const { user, loading, isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [shippingTrackingNumber, setShippingTrackingNumber] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [fulfillmentNote, setFulfillmentNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundSaving, setRefundSaving] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<string | null>(null);
  const [refundConfirm, setRefundConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

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
    setShippingCarrier(data.order?.shipping?.carrier || '');
    setShippingTrackingNumber(data.order?.shipping?.trackingNumber || '');
    setShippingMethod(data.order?.shipping?.method || '');
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadOrder().catch((err: any) => setError(err?.message || 'Failed loading order'));
  }, [user, isAdmin, params.orderId]);

  const setStatus = async (
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  ) => {
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
      setToastMessage(`✓ Order status updated to ${status}`);
      setToastType('success');
      setToastVisible(true);
    } catch (err: any) {
      setError(err?.message || 'Failed updating status');
      setToastMessage(err?.message || 'Failed updating status');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setSaving(false);
      setStatusConfirm(null);
    }
  };

  const updateOrderDetails = async (payload: Record<string, unknown>, successMessage = 'Order updated') => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed updating order');
      setOrder(data.order || null);
      if (payload.shipping) {
        setShippingCarrier((payload.shipping as { carrier?: string }).carrier || '');
        setShippingTrackingNumber((payload.shipping as { trackingNumber?: string }).trackingNumber || '');
        setShippingMethod((payload.shipping as { method?: string }).method || '');
      }
      if (payload.notes) {
        setError('');
      }
      return successMessage;
    } catch (err: any) {
      setError(err?.message || 'Failed updating order');
      return '';
    } finally {
      setSaving(false);
    }
  };

  const updateFulfillment = async (action: 'inventory_checked' | 'packed' | 'shipped' | 'delivered') => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/orders/${params.orderId}/fulfillment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, note: fulfillmentNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed updating fulfillment');
      await loadOrder();
      setFulfillmentNote('');
      setToastMessage(`✓ Fulfillment step recorded: ${action}`);
      setToastType('success');
      setToastVisible(true);
    } catch (err: any) {
      setError(err?.message || 'Failed updating fulfillment');
      setToastMessage(err?.message || 'Failed updating fulfillment');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const issueRefund = async () => {
    if (!order || !user) return;
    if (!refundAmount || !refundReason.trim()) {
      setToastMessage('Refund amount and reason are required');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      setToastMessage('Please enter a valid refund amount');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    if (amount > (order?.total || 0)) {
      setToastMessage(`Refund amount cannot exceed order total (R${(order?.total || 0).toFixed(2)})`);
      setToastType('error');
      setToastVisible(true);
      return;
    }

    if (refundReason.trim().length < 3) {
      setToastMessage('Please provide a valid refund reason (at least 3 characters)');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setRefundSaving(true);
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/admin/orders/${params.orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: Number(refundAmount), reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed issuing refund');
      await loadOrder();
      setRefundAmount('');
      setRefundReason('');
      setToastMessage('✓ Refund issued successfully');
      setToastType('success');
      setToastVisible(true);
      setRefundConfirm(false);
    } catch (err: any) {
      setError(err?.message || 'Failed issuing refund');
      setToastMessage(err?.message || 'Failed issuing refund');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setRefundSaving(false);
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

  const canTrack = Boolean(order.shipping?.trackingNumber);

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Link href="/admin" className="text-orange text-sm">← Back to admin</Link>
            <h1 className="text-3xl font-bold mt-2">Order {order.orderId}</h1>
            <p className="text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button disabled={saving} onClick={() => setStatusConfirm('pending')} className="px-3 py-2 text-sm rounded border border-orange text-orange disabled:opacity-50 hover:bg-orange/10">Pending</button>
            <button disabled={saving} onClick={() => setStatusConfirm('paid')} className="px-3 py-2 text-sm rounded bg-green-600 text-white disabled:opacity-50 hover:bg-green-700">Paid</button>
            <button disabled={saving} onClick={() => setStatusConfirm('processing')} className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700">Processing</button>
            <button disabled={saving} onClick={() => setStatusConfirm('shipped')} className="px-3 py-2 text-sm rounded bg-purple-600 text-white disabled:opacity-50 hover:bg-purple-700">Shipped</button>
            <button disabled={saving} onClick={() => setStatusConfirm('delivered')} className="px-3 py-2 text-sm rounded bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700">Delivered</button>
            <button disabled={saving} onClick={() => setStatusConfirm('cancelled')} className="px-3 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50 hover:bg-red-700">Cancelled</button>
            <button disabled={saving} onClick={() => setStatusConfirm('refunded')} className="px-3 py-2 text-sm rounded bg-rose-700 text-white disabled:opacity-50 hover:bg-rose-800">Refunded</button>
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
            <p className={`font-semibold mt-1 ${order.status === 'paid' ? 'text-green-400' : order.status === 'cancelled' ? 'text-red-400' : order.status === 'refunded' ? 'text-rose-400' : 'text-orange'}`}>
              {order.status}
            </p>
            <p className="text-white text-xl font-semibold mt-3">R{Number(order.total).toFixed(2)}</p>
            {order.reference ? <p className="text-gray-400 mt-1">Ref: {order.reference}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 mb-5">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={16} className="text-orange" />
              <h2 className="font-semibold text-white">Shipping</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-gray-400">Method</span>
                <input value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="delivery" />
              </label>
              <label className="block">
                <span className="text-xs text-gray-400">Carrier</span>
                <input value={shippingCarrier} onChange={(e) => setShippingCarrier(e.target.value)} className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="Fastway / DHL" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-gray-400">Tracking Number</span>
                <input value={shippingTrackingNumber} onChange={(e) => setShippingTrackingNumber(e.target.value)} className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="Tracking code" />
              </label>
            </div>
            <button
              disabled={saving}
              onClick={() => updateOrderDetails({ shipping: { method: shippingMethod, carrier: shippingCarrier, trackingNumber: shippingTrackingNumber } }, 'Shipping updated')}
              className="mt-4 inline-flex items-center gap-2 rounded bg-orange px-4 py-2 font-semibold text-dark disabled:opacity-50"
            >
              <Save size={16} />
              Save Shipping
            </button>
            {canTrack && (
              <p className="mt-3 text-sm text-gray-400">
                Current tracking: <span className="text-white">{order.shipping?.trackingNumber}</span>
                {order.shipping?.carrier ? <span className="ml-2 text-gray-300">({order.shipping.carrier})</span> : null}
              </p>
            )}
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-orange" />
              <h2 className="font-semibold text-white">Refund</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-gray-400">Amount</span>
                <input value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="0.00" />
              </label>
              <label className="block">
                <span className="text-xs text-gray-400">Reason</span>
                <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="Customer request" />
              </label>
            </div>
            <button
              disabled={refundSaving}
              onClick={() => {
                if (refundAmount && refundReason.trim()) {
                  setRefundConfirm(true);
                } else {
                  setToastMessage('Please fill in amount and reason');
                  setToastType('error');
                  setToastVisible(true);
                }
              }}
              className="mt-4 inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50 hover:bg-red-700"
            >
              <RotateCcw size={16} />
              {refundSaving ? 'Processing...' : 'Issue Refund'}
            </button>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-orange" />
            <h2 className="font-semibold text-white">Fulfillment Workflow</h2>
          </div>
          <label className="block mb-3">
            <span className="text-xs text-gray-400">Internal note</span>
            <input value={fulfillmentNote} onChange={(e) => setFulfillmentNote(e.target.value)} className="mt-1 w-full rounded border border-dark-border bg-dark px-3 py-2 text-white" placeholder="Packing note or courier instruction" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => updateFulfillment('inventory_checked')} className="px-3 py-2 text-sm rounded border border-orange text-orange disabled:opacity-50">Inventory Checked</button>
            <button disabled={saving} onClick={() => updateFulfillment('packed')} className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">Packed</button>
            <button disabled={saving} onClick={() => updateFulfillment('shipped')} className="px-3 py-2 text-sm rounded bg-purple-600 text-white disabled:opacity-50">Mark Shipped</button>
            <button disabled={saving} onClick={() => updateFulfillment('delivered')} className="px-3 py-2 text-sm rounded bg-emerald-600 text-white disabled:opacity-50">Mark Delivered</button>
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

        {order.statusHistory?.length ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-orange" />
              <h2 className="font-semibold text-white">Status Timeline</h2>
            </div>
            <div className="space-y-3">
              {order.statusHistory.map((entry, index) => (
                <div key={`${entry.status}-${index}`} className="flex gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-orange" />
                  <div>
                    <p className="text-white capitalize">{entry.status}</p>
                    <p className="text-sm text-gray-400">{new Date(entry.at).toLocaleString()}</p>
                    {entry.note ? <p className="text-sm text-gray-300">{entry.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={!!statusConfirm}
        title="Change Order Status"
        message={`Change order status to "${statusConfirm}"?`}
        confirmText="Confirm"
        cancelText="Cancel"
        isDangerous={statusConfirm === 'cancelled' || statusConfirm === 'refunded'}
        isLoading={saving}
        onConfirm={() => {
          if (statusConfirm) {
            setStatus(statusConfirm as any);
          }
        }}
        onCancel={() => setStatusConfirm(null)}
      />

      <ConfirmDialog
        isOpen={refundConfirm}
        title="Confirm Refund"
        message={`Issue a refund of R${parseFloat(refundAmount || '0').toFixed(2)} for reason: \"${refundReason}\"?`}
        confirmText="Issue Refund"
        cancelText="Cancel"
        isDangerous
        isLoading={refundSaving}
        onConfirm={issueRefund}
        onCancel={() => setRefundConfirm(false)}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
