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
              Ready to Transform Your Brand?
            </h2>
            <p className="text-xl text-gray-400">
              Let's work together to create something extraordinary. Get in touch
              with our team today for a personalized consultation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" variant="primary">
                Get Your Free Quote
              </Button>
            </Link>
            <a href="https://wa.me/27615436379" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <MessageCircle size={20} />
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          <p className="text-gray-400">
            Response time: 2 hours during business hours | Available: Monday -
            Friday, 9AM - 6PM SAST
          </p>
        </motion.div>
      </div>
    </section>
  );
};
