'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import { Button } from '../ui/Button';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';

export const StoreProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
          <Link
            href="/store"
            className="inline-block px-6 py-2 bg-orange text-dark-bg rounded-lg hover:bg-orange-light transition-all"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/store"
          className="flex items-center gap-2 text-orange hover:text-orange-light transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Store
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12"
        >
          {/* Image */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-32 h-32 mx-auto mb-4 text-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400">{product.name}</p>
            </div>
          </div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category & Title */}
            <div>
              <p className="text-sm text-orange font-semibold uppercase tracking-wider mb-2">
                {product.category.replace('_', ' ')}
              </p>
              <h1 className="text-4xl font-bold font-display text-white mb-2">
                {product.name}
              </h1>
              {product.isOnSale && (
                <div className="inline-block bg-orange text-dark-bg px-4 py-1 rounded-full text-sm font-bold">
                  On Sale
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Specs */}
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Print Size</p>
              <p className="text-xl font-bold text-white">{product.printSize}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Price</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-orange">
                  R{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    R{product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm text-gray-400">Quantity</label>
              <div className="flex items-center gap-4 bg-dark-card border border-dark-border rounded-lg p-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-orange/20 rounded transition"
                >
                  −
                </button>
                <span className="text-lg font-bold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-orange/20 rounded transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-orange text-dark-bg hover:bg-orange-light'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={24} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={24} />
                  Add to Cart
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="pt-6 border-t border-dark-border space-y-3 text-sm text-gray-400">
              <p>✓ Fast delivery available</p>
              <p>✓ Professional quality guaranteed</p>
              <p>✓ Eco-friendly printing methods</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
