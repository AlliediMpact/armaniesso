'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { categories, Product } from '@/lib/products';
import Link from 'next/link';
import { formatZar } from '@/lib/utils';

interface StoreProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  onAddToCart,
  viewMode = 'grid',
}) => {
  const categoryLabel = categories.find((category) => category.id === product.category)?.name ?? product.category;

  if (viewMode === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="group overflow-hidden rounded-2xl border border-dark-border bg-dark-card hover:border-orange/50 hover-glow"
      >
        <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
          <Link href={`/store/${product.id}`} className="relative min-h-[240px] bg-dark-bg">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.onerror = null;
                img.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-75" />
            {product.isOnSale && (
              <div className="absolute left-4 top-4 rounded-full bg-orange px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-dark-bg shadow-lg">
                Sale!
              </div>
            )}
          </Link>

          <div className="p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange">
              {categoryLabel}
            </p>

            <h3 className="mt-2 text-2xl font-bold font-display text-white">
              <Link href={`/store/${product.id}`} className="transition-colors hover:text-orange-light">
                {product.name}
              </Link>
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span>{product.printSize}</span>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>Premium print product</span>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 line-clamp-3">
              {product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-dark-border pt-5">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-orange">{formatZar(product.price)}</span>
                {product.originalPrice && (
                  <span className="pb-1 text-sm text-gray-400 line-through">
                    {formatZar(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onAddToCart(product)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-dark-bg transition hover:bg-orange-light"
                >
                  <ShoppingCart size={16} />
                  Add to cart
                </button>
                <Link
                  href={`/store/${product.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark-border px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-orange hover:text-orange"
                >
                  View product
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover-glow hover:border-orange/50 group"
    >
      {/* Product Image */}
      <div className="relative h-56 bg-dark-bg overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />

        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3 bg-orange text-dark-bg px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Sale
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-2">
          <p className="text-xs text-orange font-semibold uppercase tracking-wider">
            {categoryLabel}
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
          {product.printSize}
        </p>

        {/* Price */}
        <div className="mb-4 flex items-end gap-2">
          <span className="text-2xl font-bold text-orange">{formatZar(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatZar(product.originalPrice)}
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
