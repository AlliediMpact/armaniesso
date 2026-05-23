'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/lib/products';
import Link from 'next/link';
import { Button } from './ui/Button';

interface StoreProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover-glow hover:border-orange/50 group"
    >
      {/* Product Image */}
      <div className="relative h-48 bg-dark-bg overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-navy/20 to-orange/10 flex items-center justify-center">
          <div className="text-white text-center">
            <svg
              className="w-16 h-16 mx-auto mb-2 text-orange"
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
            <p className="text-sm text-gray-400">Product Image</p>
          </div>
        </div>

        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-3 right-3 bg-orange text-dark-bg px-3 py-1 rounded-full text-xs font-bold">
            Sale
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-2">
          <p className="text-xs text-orange font-semibold uppercase tracking-wider">
            {product.category.replace('_', ' ')}
          </p>
          <h3 className="text-lg font-bold font-display text-white mt-1">
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Print Size */}
        <p className="text-xs text-gray-500 mb-4">
          📐 {product.printSize}
        </p>

        {/* Price */}
        <div className="mb-4 flex items-end gap-2">
          <span className="text-2xl font-bold text-orange">R{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              R{product.originalPrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 px-4 py-2 bg-orange text-dark-bg rounded-lg hover:bg-orange-light transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Add
          </button>
          <Link
            href={`/store/${product.id}`}
            className="flex-1 px-4 py-2 border border-orange text-orange rounded-lg hover:bg-orange/10 transition-all duration-300 font-semibold text-sm"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
