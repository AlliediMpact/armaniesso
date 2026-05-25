'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, DollarSign, Users } from 'lucide-react';
import { Card } from './ui/Card';

const reasons = [
  {
    title: 'Clean Print Quality',
    description:
      'We pay attention to stock, finish, and file setup so the printed result looks sharp.',
    icon: CheckCircle2,
  },
  {
    title: 'Fast Turnaround',
    description:
      'Quick delivery without skipping the checks that keep your order looking professional.',
    icon: Zap,
  },
  {
    title: 'Practical Pricing',
    description:
      'Clear pricing that helps small businesses plan orders without guesswork.',
    icon: DollarSign,
  },
  {
    title: 'Professional Support',
    description:
      'You get direct help on artwork, product choice, and the next best step for your job.',
    icon: Users,
  },
];

export const WhyChooseUs: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="py-20 bg-gradient-dark border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Why Choose <span className="gradient-orange">Armani Esso?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We help businesses move from idea to print with fewer back-and-forth revisions and a cleaner final result.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card hoverable className="text-center">
                  <div className="flex flex-col items-center h-full">
                    <div className="mb-4 rounded-full border border-navy/20 bg-navy/10 p-3">
                      <Icon className="text-orange" size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-400">{reason.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
