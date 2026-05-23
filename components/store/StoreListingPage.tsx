'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ShoppingCart } from 'lucide-react';
import { products, categories, Product } from '@/lib/products';
import { StoreProductCard } from '../StoreProductCard';
import { useCart } from '@/lib/cart-context';

export const StoreListingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToCart } = useCart();

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Show toast notification (optional)
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-20">
      {/* Header */}
      <section className="bg-gradient-dark border-b border-dark-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Premium Printing <span className="gradient-orange">Products</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              High-quality printing and branding solutions for all your needs.
              Custom designs, fast turnaround, affordable prices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Store Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-1"
          >
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-orange" />
                <h3 className="text-lg font-bold">Categories</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === null
                      ? 'bg-orange text-dark-bg font-semibold'
                      : 'text-gray-300 hover:text-orange'
                  }`}
                >
                  All Products ({products.length})
                </button>

                {categories.map((category) => {
                  const count = products.filter(
                    (p) => p.category === category.id
                  ).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-orange text-dark-bg font-semibold'
                          : 'text-gray-300 hover:text-orange'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-8 pt-6 border-t border-dark-border">
                <p className="text-sm text-gray-400 mb-3">Showing:</p>
                <p className="text-2xl font-bold text-orange">
                  {filteredProducts.length}
                </p>
                <p className="text-sm text-gray-400">products</p>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-3"
          >
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">
                  No products found in this category.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
