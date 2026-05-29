'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Preloader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide preloader when page is fully loaded
    const handleLoad = () => {
      setIsLoading(false);
    };

    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-gradient-dark"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.1),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_40%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange to-orange-light flex items-center justify-center">
            <span className="text-xl font-bold text-dark-bg">✓</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Armani Esso</h2>
            <p className="text-xs text-gray-400 tracking-wide">Premium Printing & Branding</p>
          </div>
        </motion.div>

        {/* Animated Loader */}
        <div className="relative w-16 h-16 mt-4">
          {/* Outer spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange border-r-orange"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />

          {/* Middle pulsing ring */}
          <motion.div
            className="absolute inset-2 rounded-full border border-orange/40"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange rounded-full -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-sm text-gray-400 mt-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading...
        </motion.p>

        {/* Progress Bar */}
        <div className="w-32 h-1 rounded-full bg-dark-card overflow-hidden mt-4">
          <motion.div
            className="h-full bg-gradient-to-r from-orange to-orange-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '90%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
