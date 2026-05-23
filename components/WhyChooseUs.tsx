'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, DollarSign, Users } from 'lucide-react';
import { Card } from './ui/Card';

const reasons = [
  {
    title: 'High Quality',
    description:
      'Premium materials and expert craftsmanship ensure exceptional results every time.',
    icon: CheckCircle2,
  },
  {
    title: 'Fast Turnaround',
    description:
      'Quick delivery without compromising on quality. We meet your deadlines consistently.',
    icon: Zap,
  },
  {
    title: 'Affordable Pricing',
    description:
      'Competitive rates that offer exceptional value for your investment.',
    icon: DollarSign,
  },
  {
    title: 'Professional Service',
    description:
      'Dedicated team committed to understanding and exceeding your expectations.',
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
            We're committed to delivering excellence in every project.
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
                    <div className="mb-4 p-3 bg-orange/10 rounded-full">
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
