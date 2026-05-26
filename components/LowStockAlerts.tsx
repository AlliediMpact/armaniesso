'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import LowStockControls from './LowStockControls';

interface LowStockProduct {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  reorderLevel: number;
}

export default function LowStockAlerts() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || '';

        const res = await fetch('/api/admin/inventory/low-stock?threshold=10', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load low stock items');

        setProducts(data.products || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading inventory alerts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded p-3 text-red-200 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange" />
          <h3 className="text-lg font-bold text-white">Low Stock Alerts</h3>
        </div>
        <span className="text-sm font-semibold px-2 py-1 bg-orange/20 text-orange rounded">
          {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">✓ All products have healthy inventory levels</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {products.map((product) => {
            const stockPercentage = (product.stock / product.reorderLevel) * 100;
            const isOutOfStock = product.stock === 0;
            const isCritical = stockPercentage < 25;

            return (
              <div key={product.id} className="p-3 bg-dark/50 rounded border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      isOutOfStock
                        ? 'bg-red-500/30 text-red-200'
                        : isCritical
                          ? 'bg-orange/30 text-orange'
                          : 'bg-yellow-500/30 text-yellow-200'
                    }`}
                  >
                    {product.stock} units
                  </span>
                </div>
                <div className="w-full bg-dark rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock ? 'bg-red-500' : isCritical ? 'bg-orange' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Controls: manual notify */}
      <LowStockControls />
    </div>
  );
}
