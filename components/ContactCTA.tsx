'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui/Button';
import Link from 'next/link';

export const ContactCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-dark border-t border-dark-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Ready to place your next print order?
            </h2>
            <p className="text-xl text-gray-400">
              Send us the details, and we will help you choose the right product,
              size, and finish before you pay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href="/contact" size="lg" variant="primary">
              Request a Quote
            </Button>
            <Button href="https://wa.me/27615436379" size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={20} />
              Open WhatsApp
            </Button>
          </div>

          <p className="text-gray-400">
            Quick response during business hours | Monday to Friday, 9AM to 6PM SAST
          </p>
        </motion.div>
      </div>
    </section>
  );
};
