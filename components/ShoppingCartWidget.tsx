'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatZar } from '@/lib/utils';

type ShoppingCartWidgetProps = {
  placement?: 'floating' | 'header';
};

export const ShoppingCartWidget: React.FC<ShoppingCartWidgetProps> = ({ placement = 'floating' }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } =
    useCart();
  const [isOpen, setIsOpen] = useState(false);
  const isFloating = placement === 'floating';
  const isHeader = placement === 'header';

  if (isFloating && items.length === 0 && !isOpen) {
    return null;
  }

  return (
    <div className={isFloating ? 'fixed bottom-6 right-6 z-40' : 'relative z-40'}>
      {/* Cart Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className={
          isFloating
            ? 'w-14 h-14 bg-orange text-dark-bg rounded-full flex items-center justify-center shadow-premium hover:bg-orange-light transition-all'
            : 'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white transition hover:border-orange hover:text-orange'
        }
        aria-label={`Open cart with ${getTotalItems()} items`}
        title={`Open cart with ${getTotalItems()} items`}
      >
        <svg
          className={isHeader ? 'h-5 w-5' : 'w-6 h-6'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-navy text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {getTotalItems()}
          </span>
        )}
      </motion.button>

      {/* Cart Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={
            isFloating
              ? 'absolute bottom-20 right-0 w-80 bg-dark-card border border-dark-border rounded-xl shadow-premium p-4 max-h-96 overflow-y-auto'
              : 'absolute top-12 right-0 w-80 bg-dark-card border border-dark-border rounded-xl shadow-premium p-4 max-h-96 overflow-y-auto'
          }
        >
          <h3 className="text-lg font-bold text-white mb-4">Shopping Cart</h3>

          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              Your cart is empty
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-dark-bg rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">{formatZar(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-dark-border rounded">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-orange/20 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-orange/20 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:bg-red-500/20 rounded transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-dark-border pt-3 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-xl font-bold text-orange">
                    {formatZar(getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/store/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full bg-orange text-dark-bg rounded-lg py-2 font-semibold text-center hover:bg-orange-light transition-all block mb-2"
              >
                Checkout
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full border border-orange text-orange rounded-lg py-2 font-semibold hover:bg-orange/10 transition-all"
              >
                Continue Shopping
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};
