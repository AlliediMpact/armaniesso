'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import Link from 'next/link';

export const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen pt-20 bg-gradient-dark flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2 text-orange">
                <Sparkles size={20} />
                <span className="text-sm font-semibold tracking-wider uppercase">
                  Premium Quality Solutions
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
                Premium Printing &{' '}
                <span className="gradient-orange">Branding Solutions</span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed">
                Helping businesses in South Africa stand out with high-quality
                print and branding services. From business cards to large-format
                printing, we deliver excellence every time.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  Get a Quote
                </Button>
              </Link>
              <a href="https://wa.me/27615436379" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </Button>
              </a>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              variants={itemVariants}
              className="pt-4 flex items-center gap-4 text-sm text-gray-400"
            >
              <div>
                <p className="font-semibold text-white">1000+ Happy Clients</p>
                <p>Trusted by businesses across South Africa</p>
              </div>
            </motion.div>
          </div>

          {/* Visual Element */}
          <motion.div
            variants={itemVariants}
            className="relative hidden md:block"
          >
            <div className="relative w-full aspect-square">
              {/* Animated Background */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-3xl"
              />

              {/* Premium Card */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-dark-card border border-orange/30 rounded-2xl p-8 w-80 h-80 flex items-center justify-center shadow-premium">
                  <div className="text-center">
                    <div className="text-6xl font-bold gradient-orange mb-4">
                      ✓
                    </div>
                    <p className="text-xl font-display font-bold text-white">
                      Armani Esso
                    </p>
                    <p className="text-orange mt-2">Quality Guaranteed</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
