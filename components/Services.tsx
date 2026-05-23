'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  FileText,
  Layout,
  Palette,
  Zap,
  Trophy,
} from 'lucide-react';
import { Card } from './ui/Card';

const services = [
  {
    title: 'Business Cards',
    description: 'Premium business cards that leave a lasting impression with your clients.',
    icon: FileText,
  },
  {
    title: 'Flyers & Posters',
    description: 'Eye-catching promotional materials designed to capture attention and drive results.',
    icon: Printer,
  },
  {
    title: 'Banners & Large Format',
    description: 'Custom large-format printing for events, retail, and brand visibility.',
    icon: Layout,
  },
  {
    title: 'Branding & Design',
    description: 'Complete branding solutions including logo design and brand identity packages.',
    icon: Palette,
  },
  {
    title: 'Custom Printing',
    description: 'Bespoke printing solutions tailored to your specific business needs.',
    icon: Zap,
  },
  {
    title: 'Quality Assurance',
    description: 'Every project undergoes rigorous quality checks to ensure perfection.',
    icon: Trophy,
  },
];

export const Services: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section
      id="services"
      className="py-20 bg-dark-bg border-t border-dark-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Our <span className="gradient-orange">Premium Services</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive printing and branding solutions designed to elevate your
            business and make a lasting impact.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card hoverable>
                  <div className="flex flex-col h-full">
                    <div className="mb-4 p-3 bg-orange/10 rounded-lg w-fit">
                      <Icon className="text-orange" size={28} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 flex-grow">{service.description}</p>
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
