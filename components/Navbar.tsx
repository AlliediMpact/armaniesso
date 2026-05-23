'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Store', href: '/store' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <img src="/logo.png" alt="Armani Esso logo" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
              <span className="sr-only">Armani Esso</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white hover:text-orange transition-colors duration-300 font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="px-6 py-2 bg-orange text-dark-bg rounded-lg hover:bg-orange-light transition-all duration-300 font-semibold"
            >
              Get Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className="text-orange hover:text-orange-light transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-dark-card border-t border-dark-border"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-white hover:text-orange transition-colors py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block w-full px-4 py-2 bg-orange text-dark-bg rounded-lg text-center hover:bg-orange-light transition-all font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Get Quote
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};
