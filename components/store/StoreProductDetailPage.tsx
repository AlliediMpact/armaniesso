'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { categories, products } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { formatZar } from '@/lib/utils';

export const StoreProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const categoryLabel = product
    ? categories.find((category) => category.id === product.category)?.name ?? product.category
    : '';

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
          <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden min-h-[26rem] flex items-stretch justify-center">
            <div className="relative w-full">
              <img
                src={product.image}
                alt={product.name}
                className="h-full min-h-[26rem] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/70 via-transparent to-transparent" />
              {product.isOnSale && (
                <div className="absolute top-4 left-4 bg-orange text-dark-bg px-4 py-1 rounded-full text-sm font-bold">
                  Sale
                </div>
              )}
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
                {categoryLabel}
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
                <span className="text-4xl font-bold text-orange">{formatZar(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatZar(product.originalPrice)}
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
