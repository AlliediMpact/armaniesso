'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, LayoutGrid, ListOrdered, SlidersHorizontal } from 'lucide-react';
import { products, categories, Product } from '@/lib/products';
import { StoreProductCard } from '../StoreProductCard';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';

export const StoreListingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { addToCart } = useCart();
  const productsPerPage = 16;

  const filteredProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products,
    [selectedCategory]
  );

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortOrder) {
      case 'price-asc':
        return sorted.sort((left, right) => left.price - right.price);
      case 'price-desc':
        return sorted.sort((left, right) => right.price - left.price);
      case 'name-asc':
        return sorted.sort((left, right) => left.name.localeCompare(right.name));
      case 'name-desc':
        return sorted.sort((left, right) => right.name.localeCompare(left.name));
      default:
        return sorted;
    }
  }, [filteredProducts, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / productsPerPage));
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOrder]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const updateCategory = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const pageStart = sortedProducts.length === 0 ? 0 : startIndex + 1;
  const pageEnd = Math.min(startIndex + productsPerPage, sortedProducts.length);

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-20">
      <div className="border-b border-dark-border/80 bg-dark-bg/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="transition hover:text-orange">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-300">Shop</span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-orange">
                  Store
                </p>
                <h1 className="mt-2 text-4xl font-bold font-display text-white md:text-5xl">
                  Shop
                </h1>
                <p className="mt-3 max-w-2xl text-base text-gray-400">
                  Browse branded printing products, apparel, and display items with a layout styled after the live Etoo Printers shop.
                </p>
              </div>

              <div className="rounded-2xl border border-dark-border bg-dark-card/80 px-5 py-4 text-sm text-gray-300">
                Showing <span className="font-semibold text-orange">{pageStart}–{pageEnd}</span> of{' '}
                <span className="font-semibold text-white">{sortedProducts.length}</span> results
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-dark-border bg-dark-card/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <SlidersHorizontal size={18} className="text-orange" />
            <span>Sort and switch between grid or list view.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-dark-border bg-dark-bg px-4 py-3 text-sm text-gray-300">
              <ListOrdered size={16} className="text-orange" />
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                className="bg-transparent text-gray-200 outline-none"
                aria-label="Sort products"
              >
                <option value="default">Default sorting</option>
                <option value="price-asc">Sort by price: low to high</option>
                <option value="price-desc">Sort by price: high to low</option>
                <option value="name-asc">Sort by name: A to Z</option>
                <option value="name-desc">Sort by name: Z to A</option>
              </select>
            </label>

            <div className="inline-flex overflow-hidden rounded-xl border border-dark-border bg-dark-bg">
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-orange text-dark-bg'
                    : 'text-gray-300 hover:text-orange'
                }`}
              >
                <LayoutGrid size={16} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 border-l border-dark-border px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-orange text-dark-bg'
                    : 'text-gray-300 hover:text-orange'
                }`}
              >
                <ListOrdered size={16} />
                List
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="mb-6 flex items-center gap-2">
                <Filter size={18} className="text-orange" />
                <h2 className="text-lg font-bold text-white">Categories</h2>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => updateCategory(null)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    selectedCategory === null
                      ? 'bg-orange text-dark-bg'
                      : 'border border-dark-border text-gray-300 hover:border-orange hover:text-orange'
                  }`}
                >
                  All Products ({products.length})
                </button>

                {categories.map((category) => {
                  const count = products.filter((product) => product.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => updateCategory(category.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedCategory === category.id
                          ? 'bg-orange text-dark-bg'
                          : 'border border-dark-border text-gray-300 hover:border-orange hover:text-orange'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-xl border border-dark-border bg-dark-bg/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Results</p>
                <p className="mt-2 text-2xl font-bold text-orange">
                  {pageStart}–{pageEnd}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  of {sortedProducts.length} products
                </p>
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-dark-border bg-dark-card p-10 text-center">
                <p className="text-xl text-gray-400">No products found in this category.</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'list' ? 'space-y-5' : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'}>
                  {visibleProducts.map((product) => (
                    <StoreProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {sortedProducts.length > productsPerPage && (
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-border px-4 py-2 text-sm text-gray-300 transition hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                            page === currentPage
                              ? 'bg-orange text-dark-bg'
                              : 'border border-dark-border text-gray-300 hover:border-orange hover:text-orange'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-border px-4 py-2 text-sm text-gray-300 transition hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};
