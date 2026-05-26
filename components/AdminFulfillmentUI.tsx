'use client';

import { useState } from 'react';
import { Search, AlertCircle, Check, Loader, RotateCw } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Toast } from './ui/Toast';

interface AdminOrder {
  id: string;
  orderId: string;
  customer: { name: string; email: string; phone?: string };
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

interface FulfillmentStep {
  key: 'inventory_checked' | 'packed' | 'shipped' | 'delivered';
  label: string;
  description: string;
}

const FULFILLMENT_STEPS: FulfillmentStep[] = [
  { key: 'inventory_checked', label: 'Check Inventory', description: 'Verified stock available' },
  { key: 'packed', label: 'Packed', description: 'Items packed for shipment' },
  { key: 'shipped', label: 'Shipped', description: 'Order dispatched' },
  { key: 'delivered', label: 'Delivered', description: 'Order received by customer' },
];

export default function AdminFulfillmentUI() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [fulfillmentConfirm, setFulfillmentConfirm] = useState<{ orderId: string; action: string } | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('auth_token') || '';

      const url = new URL(`${window.location.origin}/api/admin/orders`);
      if (searchType === 'email') {
        url.searchParams.set('email', searchQuery);
      } else {
        url.searchParams.set('phone', searchQuery);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Search failed');

      setOrders(data.orders || []);
      if (!data.orders || data.orders.length === 0) {
        setToastMessage('No orders found');
        setToastType('info');
        setToastVisible(true);
      } else {
        setToastMessage(`Found ${data.orders.length} order(s)`);
        setToastType('success');
        setToastVisible(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Search failed');
      setToastMessage(err?.message || 'Search failed');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillmentUpdate = async (orderId: string, action: string, note: string) => {
    try {
      const token = localStorage.getItem('auth_token') || '';

      const res = await fetch(`/api/admin/orders/${orderId}/fulfillment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, note }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');

      // Refresh order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: action === 'delivered' ? 'delivered' : 'processing',
        });
      }

      setToastMessage(`✓ Order marked as ${action.replace(/_/g, ' ')}`);
      setToastType('success');
      setToastVisible(true);
      setFulfillmentConfirm(null);
    } catch (err: any) {
      setToastMessage(`Error: ${err?.message}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason.trim()) {
      setToastMessage('Please fill all refund fields');
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

    if (amount > selectedOrder.total) {
      setToastMessage(`Refund amount cannot exceed order total (R${selectedOrder.total.toFixed(2)})`);
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

    try {
      setRefundLoading(true);
      const token = localStorage.getItem('auth_token') || '';

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Refund failed');

      setToastMessage('✓ Refund issued successfully');
      setToastType('success');
      setToastVisible(true);
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedOrder({ ...selectedOrder, status: 'refunded' });
    } catch (err: any) {
      setToastMessage(`Refund error: ${err?.message}`);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">Customer Lookup</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'email' | 'phone')}
              className="px-4 py-2 bg-dark border border-dark-border rounded text-white"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`Search by ${searchType}...`}
              className="flex-1 px-4 py-2 bg-dark border border-dark-border rounded text-white placeholder-gray-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-orange hover:bg-orange-light text-dark font-semibold rounded transition-colors disabled:opacity-50"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded p-3 text-red-200 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">{orders.length} order(s) found</p>
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id
                      ? 'bg-orange/20 border border-orange'
                      : 'bg-dark border border-dark-border hover:border-orange'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{order.orderId}</p>
                      <p className="text-sm text-gray-400">{order.customer.email}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item(s) • R{order.total.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                        order.status === 'delivered'
                          ? 'bg-green-500/20 text-green-200'
                          : order.status === 'shipped'
                            ? 'bg-purple-500/20 text-purple-200'
                            : 'bg-blue-500/20 text-blue-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details & Fulfillment */}
      {selectedOrder && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Order ID:</span>{' '}
                <span className="text-white font-semibold">{selectedOrder.orderId}</span>
              </p>
              <p>
                <span className="text-gray-500">Customer:</span>{' '}
                <span className="text-white">{selectedOrder.customer.name}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="text-white">{selectedOrder.customer.email}</span>
              </p>
              {selectedOrder.customer.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{' '}
                  <span className="text-white">{selectedOrder.customer.phone}</span>
                </p>
              )}
              <p>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="text-orange font-semibold">R{selectedOrder.total.toFixed(2)}</span>
              </p>
              <p>
                <span className="text-gray-500">Date:</span>{' '}
                <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Fulfillment & Actions */}
          <div className="space-y-6">
            {/* Fulfillment Steps */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Fulfillment Progress</h3>
              <div className="space-y-2">
                {FULFILLMENT_STEPS.map((step, idx) => (
                  <button
                    key={step.key}
                    onClick={() => setFulfillmentConfirm({ orderId: selectedOrder.id, action: step.key })}
                    className="w-full p-3 rounded border border-dark-border hover:border-orange transition-colors text-left bg-dark/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-orange flex items-center justify-center">
                        <Check size={14} className="text-orange" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{step.label}</p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Refund Section */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Issue Refund</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount (R)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`0.00 (max: R${selectedOrder.total.toFixed(2)})`}
                    max={selectedOrder.total}
                    step="0.01"
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded text-white placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Reason</label>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="e.g., Customer request, wrong item..."
                    className="w-full px-3 py-2 bg-dark border border-dark-border rounded text-white placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={() => {
                    if (refundAmount && refundReason.trim()) {
                      setRefundDialogOpen(true);
                    } else {
                      setToastMessage('Please fill all refund fields');
                      setToastType('error');
                      setToastVisible(true);
                    }
                  }}
                  disabled={refundLoading}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                >
                  {refundLoading ? 'Processing...' : 'Issue Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!fulfillmentConfirm}
        title="Confirm Fulfillment Update"
        message={`Mark this order as ${fulfillmentConfirm?.action.replace(/_/g, ' ')}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        isLoading={loading}
        onConfirm={() => {
          if (fulfillmentConfirm) {
            handleFulfillmentUpdate(fulfillmentConfirm.orderId, fulfillmentConfirm.action, '');
          }
        }}
        onCancel={() => setFulfillmentConfirm(null)}
      />

      {/* Refund Confirmation Dialog */}
      <ConfirmDialog
        isOpen={refundDialogOpen}
        title="Confirm Refund"
        message={`Issue a refund of R${parseFloat(refundAmount || '0').toFixed(2)} for reason: "${refundReason}"?`}
        confirmText="Issue Refund"
        cancelText="Cancel"
        isDangerous
        isLoading={refundLoading}
        onConfirm={handleRefund}
        onCancel={() => {
          setRefundDialogOpen(false);
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
