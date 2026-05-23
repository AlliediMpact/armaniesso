'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Starter',
    price: 'R1,499',
    description: 'Perfect for small businesses just starting out',
    features: [
      'Business Cards (500)',
      'Basic Branding',
      '3-day Turnaround',
      'Email Support',
      'Digital File Provided',
    ],
    highlighted: false,
  },
  {
    name: 'Business',
    price: 'R3,999',
    description: 'Ideal for growing businesses with multiple needs',
    features: [
      'Business Cards (1000)',
      'Flyers & Posters',
      'Banners (up to 2m)',
      'Custom Design Included',
      '2-day Turnaround',
      'Priority Support',
      'Unlimited Revisions',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'Custom',
    description: 'Enterprise solutions for large-scale campaigns',
    features: [
      'Everything in Business',
      'Large Format Printing',
      'Complete Branding Package',
      'Dedicated Account Manager',
      'Rush Orders Available',
      '24/7 Support',
      'Quarterly Strategy Review',
    ],
    highlighted: false,
  },
];

export const Pricing: React.FC = () => {
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
      id="pricing"
      className="py-20 bg-dark-bg border-t border-dark-border"
    >
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
            Simple, <span className="gradient-orange">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. All plans include
            premium quality and professional service.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={plan.highlighted ? 'md:scale-105' : ''}
            >
              <Card
                hoverable={!plan.highlighted}
                className={
                  plan.highlighted
                    ? 'border-gold bg-gradient-to-b from-gold/10 to-dark-card shadow-premium'
                    : ''
                }
              >
                <div className="flex flex-col h-full">
                  {plan.highlighted && (
                    <div className="mb-4 inline-flex items-center justify-center px-3 py-1 bg-gold text-dark-bg rounded-full text-xs font-bold w-fit">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold font-display mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <p className="text-4xl font-bold gradient-orange">
                      {plan.price}
                    </p>
                    {plan.price !== 'Custom' && (
                      <p className="text-gray-400 text-sm mt-1">One-time project</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <CheckCircle
                          size={20}
                          className="text-orange flex-shrink-0 mt-0.5"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact" className="w-full">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.price === 'Custom' ? 'Get Quote' : 'Choose Plan'}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
