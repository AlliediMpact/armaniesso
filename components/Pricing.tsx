'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingCart, Star } from 'lucide-react';
import { Card } from './ui/Card';
import Link from 'next/link';
import { products, type Product } from '@/lib/products';
import { formatZar } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

const trendingProductIds = [
  '100-double-sided-business-cards-350gsm',
  '100-a5-flyers',
  'executive-pull-up-banner',
  '100-custom-lanyards',
  '1-x-1m-flags',
  'custom-key-holders',
] as const;

const trendingProducts: Product[] = trendingProductIds
  .map((productId) => products.find((product) => product.id === productId))
  .filter((product): product is Product => Boolean(product));

export const Pricing: React.FC = () => {
  const { addToCart } = useCart();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section
      id="special"
      className="py-20 bg-dark-bg border-t border-dark-border relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="relative text-center mb-14"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy/30 bg-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-navy-light">
            <Sparkles size={14} />
            Our Special
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Featured products our customers order most often
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Six proven print products from the store, presented as the products people actually need for meetings, events, and brand rollouts.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(0,1fr)] mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-dark-border bg-dark-card/80 p-6 md:p-8 shadow-premium"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-gray-500 mb-3">What people buy</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              A focused product block for the items clients ask for first when they are getting ready to launch or restock.
            </h3>
            <p className="text-gray-400 leading-7 mb-6">
              This block keeps the homepage practical. It uses real products, real prices, and a direct path into the store so customers can act quickly.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="rounded-2xl border border-dark-border bg-dark-bg/60 px-4 py-3">Business cards</div>
              <div className="rounded-2xl border border-dark-border bg-dark-bg/60 px-4 py-3">Flyers and banners</div>
              <div className="rounded-2xl border border-dark-border bg-dark-bg/60 px-4 py-3">Lanyards and flags</div>
              <div className="rounded-2xl border border-dark-border bg-dark-bg/60 px-4 py-3">Display and signage</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="rounded-3xl border border-dark-border bg-dark-card/80 p-6 md:p-8 shadow-premium flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gray-500 mb-3">Need the full catalog?</p>
              <h3 className="text-2xl font-bold text-white mb-3">Browse the store for the complete product range.</h3>
              <p className="text-gray-400 leading-7">
                This homepage block is the curated highlight; the store still holds the full shopping experience, filters, and checkout.
              </p>
            </div>
            <Link
              href="/store"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-orange px-6 py-4 text-lg font-semibold text-orange transition-all duration-300 hover:bg-orange hover:text-dark-bg hover:border-orange-light whitespace-nowrap"
            >
              Open Store
            </Link>
          </motion.div>
        </div>

        {/* Trending Products */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className={index === 1 ? 'md:scale-[1.02]' : ''}
            >
              <Card
                hoverable
                className="overflow-hidden border-dark-border bg-dark-card/90 p-0"
              >
                <div className="relative h-52 bg-dark-bg overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-navy/25 bg-navy/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-navy-light">
                    <Star size={12} />
                    Trending
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-300">
                    <span className="rounded-full bg-dark-bg/70 px-3 py-1 backdrop-blur-sm">{product.printSize}</span>
                    <span className="rounded-full bg-orange/90 px-3 py-1 font-semibold text-dark-bg">{formatZar(product.price)}</span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-navy-light mb-2">
                      Featured Pick
                    </p>
                    <h3 className="text-2xl font-bold font-display text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-gray-400 line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-dark-border bg-dark-bg/70 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Price</p>
                      <p className="text-2xl font-bold text-orange">{formatZar(product.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Category</p>
                      <p className="text-sm text-white">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={(e) => {
                        try {
                          addToCart(product, 1);
                        } catch (err) {
                          console.error('Failed to add to cart:', err);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-dark-bg transition hover:bg-orange-light disabled:opacity-50"
                    >
                      <ShoppingCart size={16} />
                      Add to cart
                    </button>
                    <Link
                      href={`/store/${product.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-dark-border px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-orange hover:text-orange"
                      onClick={(e) => {
                        if (!product.id) {
                          e.preventDefault();
                          console.error('Product ID missing');
                        }
                      }}
                    >
                      View product
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 rounded-3xl border border-navy/20 bg-gradient-to-r from-navy/10 via-dark-bg/95 to-dark-card/90 p-6 text-sm text-gray-300">
          Each product is print-ready and available for quick order. Add items directly to your cart or explore our full store for more options and custom packages.
        </div>
      </div>
    </section>
  );
};
