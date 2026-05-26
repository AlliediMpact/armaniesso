'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { downloadInvoiceAsPDF, getTrackingURL } from '@/lib/invoice-utils';
import useOrderRealtime from '@/lib/use-order-realtime';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, RotateCcw, Download, ExternalLink } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  sku?: string;
};

type StatusHistory = {
  status: string;
  at: string;
  actor?: string;
  note?: string;
};

type Order = {
  orderId: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: { method: string; trackingNumber?: string; carrier?: string; cost: number };
  total: number;
  customer: { name?: string; email?: string };
  payment: string;
  reference?: string;
  statusHistory?: StatusHistory[];
};

export default function AccountOrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderConfirm, setReorderConfirm] = useState(false);
  const [reorderPreview, setReorderPreview] = useState<any[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  // Redirect unauthenticated users to /auth
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }
  }, [loading, user, router]);

  // Use polling hook to keep order up-to-date for the customer
  const { order: realtimeOrder, fetching: realtimeFetching, error: realtimeError } = useOrderRealtime(params.orderId);

  useEffect(() => {
    if (realtimeOrder) setOrder(realtimeOrder);
    if (realtimeError) setError(realtimeError);
    setFetching(realtimeFetching);
  }, [realtimeOrder, realtimeFetching, realtimeError]);

  const handleReorder = async () => {
    // This function is now replaced by a confirm flow. Keep for backwards compatibility.
    return;
  };

  const fetchReorderPreview = async () => {
    if (!order || !user) return;
    setPreviewLoading(true);
    setReorderPreview(null);
    setReorderConfirm(false);
    try {
      const token = await user.getIdToken().catch(() => '');
      const res = await fetch(`/api/account/orders/${params.orderId}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to get reorder preview');
      setReorderPreview(data.items || []);
      setReorderConfirm(true);
    } catch (err: any) {
      setToastMessage(`${err?.message || 'Failed to prepare reorder'}`);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  const proceedReorder = async () => {
    if (!reorderPreview || !user) return;
    try {
      setReordering(true);
      let itemCount = 0;
      const unavailable: string[] = [];
      const priceChanges: string[] = [];

      for (const item of reorderPreview) {
        if (!item.available) {
          unavailable.push(item.name || item.id);
          continue;
        }

        if (item.priceChanged) {
          priceChanges.push(item.name || item.id);
        }

        const qty = item.requestedQty || 1;
        addToCart(
          {
            id: item.id,
            name: item.name,
            price: item.currentPrice,
            description: item.description || '',
            category: item.category || ('displays' as const),
            image: item.image || '',
            printSize: item.printSize || '1m x 1m',
            sku: item.sku || undefined,
          },
          qty
        );
        itemCount += qty;
      }

      let message = `✓ Added ${itemCount} item(s) to your cart.`;
      if (unavailable.length > 0) {
        message += ` ${unavailable.length} item(s) unavailable and were skipped.`;
      }
      if (priceChanges.length > 0) {
        message += ` ${priceChanges.length} item(s) had price changes.`;
      }

      setToastMessage(message);
      setToastType('success');
      setToastVisible(true);
      setReorderConfirm(false);
      setReorderPreview(null);

      setTimeout(() => {
        router.push('/store/checkout');
      }, 1200);
    } catch (err: any) {
      setToastMessage(`${err?.message || 'Failed to reorder'}`);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setReordering(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;

    const invoiceData = {
      orderId: order.orderId,
      orderDate: order.createdAt,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
      },
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: {
        method: order.shipping.method,
        cost: order.shipping.cost,
      },
      total: order.total,
      paymentMethod: order.payment,
      reference: order.reference,
      status: order.status,
    };

    downloadInvoiceAsPDF(invoiceData);
  };

  const trackingURL = order?.shipping?.trackingNumber
    ? getTrackingURL(order.shipping.carrier || '', order.shipping.trackingNumber)
    : null;


  if (!user || loading) {
    return <div className="min-h-screen bg-gradient-dark pt-28 pb-20" />;
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center text-gray-400">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">
            {error}
          </div>
          <Link href="/account" className="inline-flex items-center gap-2 text-orange hover:text-orange-light">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-gray-400 mb-4">Order not found</div>
          <Link href="/account" className="inline-flex items-center gap-2 text-orange hover:text-orange-light">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    paid: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    shipped: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-200 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-200 border-red-500/30',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
  };

  const StatusIcon = statusIcons[order.status] || Package;

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center gap-2 text-orange hover:text-orange-light mb-4">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Order {order.orderId}</h1>
              <p className="text-gray-400">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA')}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                statusColors[order.status] || statusColors.pending
              }`}
            >
              <StatusIcon size={16} />
              <span className="capitalize font-semibold">{order.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange hover:bg-orange-light text-dark font-semibold rounded-lg transition-colors"
            >
              <Download size={16} />
              Download Invoice
            </button>
            <button
              onClick={fetchReorderPreview}
              disabled={reordering || previewLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card border border-orange text-orange hover:bg-orange/10 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} />
              {previewLoading ? 'Checking...' : reordering ? 'Processing...' : 'Reorder Items'}
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 pb-3 border-b border-dark-border last:border-0">
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  {item.variantName && <p className="text-sm text-gray-400">{item.variantName}</p>}
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-orange">R{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pricing */}
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>R{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (15%)</span>
                <span>R{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping ({order.shipping.method})</span>
                <span>R{order.shipping.cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-dark-border pt-2 mt-2 flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-orange">R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="space-y-6">
            {/* Shipping */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-orange" />
                <h3 className="font-bold text-white">Shipping</h3>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-gray-500">Method:</span> <span className="capitalize">{order.shipping.method}</span>
              </p>
              {order.shipping.trackingNumber && (
                <>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-gray-500">Tracking:</span> {order.shipping.trackingNumber}
                  </p>
                  {trackingURL && trackingURL !== 'N/A' && (
                    <a
                      href={trackingURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-orange hover:text-orange-light font-semibold"
                    >
                      Track Package
                      <ExternalLink size={12} />
                    </a>
                  )}
                </>
              )}
              {order.shipping.carrier && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Carrier:</span> {order.shipping.carrier}
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-orange" />
                <h3 className="font-bold text-white">Payment</h3>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-gray-500">Method:</span> <span className="capitalize">{order.payment}</span>
              </p>
              {order.reference && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Reference:</span> {order.reference}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.statusHistory.map((entry, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-orange mt-1" />
                    {index < order.statusHistory!.length - 1 && (
                      <div className="absolute top-3 left-1.5 w-0.5 h-12 bg-dark-border" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white capitalize">{entry.status}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(entry.at).toLocaleString('en-ZA')}
                    </p>
                    {entry.note && <p className="text-sm text-gray-300 mt-1">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reorder confirmation: summarize availability and price changes */}
      {
        (() => {
          const items = reorderPreview || [];
          const total = items.length;
          const availableCount = items.filter((i: any) => i.available).length;
          const unavailableCount = total - availableCount;
          const priceChangedCount = items.filter((i: any) => i.priceChanged).length;
          const message = items.length === 0
            ? 'Add all items from this order to your cart?'
            : `This will add ${availableCount} item(s) to your cart. ${unavailableCount} unavailable. ${priceChangedCount} item(s) had price changes.`;

          return (
            <ConfirmDialog
              isOpen={reorderConfirm}
              title="Confirm Reorder"
              message={message}
              confirmText="Add to cart"
              cancelText="Cancel"
              isLoading={reordering}
              onConfirm={proceedReorder}
              onCancel={() => { setReorderConfirm(false); setReorderPreview(null); }}
            />
          );
        })()
      }

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      </div>
  );
}
