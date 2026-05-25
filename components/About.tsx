'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe } from 'lucide-react';
import { Card } from './ui/Card';

const stats = [
  {
    title: 'Print-ready',
    description: 'Artwork checked before production',
    icon: Users,
  },
  {
    title: 'Brand-led',
    description: 'Design support and consistent colour handling',
    icon: Award,
  },
  {
    title: 'South Africa',
    description: 'Orders supported for local businesses and events',
    icon: Globe,
  },
];

export const About: React.FC = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section
      id="about"
      className="py-20 bg-gradient-dark border-t border-dark-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
                About <span className="gradient-orange">Armani Esso</span>
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Armani Esso helps South African businesses look organised and ready with
                print that is practical, polished, and easy to order.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                We work with everyday business materials such as cards, flyers, banners,
                lanyards, flags, and branded accessories so your team can stay visible.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Every job is guided by the same standard: clean artwork, honest communication,
                and a final product that looks ready to hand out.
              </p>
            </div>

            {/* Key Values */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 rounded-full bg-gradient-to-b from-navy to-orange" />
                <div>
                  <h4 className="font-bold text-white mb-1">Our Mission</h4>
                  <p className="text-gray-400">
                    To make professional print support simple, reliable, and easy to launch with.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 rounded-full bg-gradient-to-b from-navy to-orange" />
                <div>
                  <h4 className="font-bold text-white mb-1">Our Vision</h4>
                  <p className="text-gray-400">
                    To be a trusted print partner for small businesses, events, and growing brands.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card hoverable className="flex items-start gap-4">
                    <div className="p-3 rounded-lg flex-shrink-0 border border-navy/20 bg-navy/10">
                      <Icon className="text-orange" size={32} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold gradient-orange">
                        {stat.title}
                      </p>
                      <p className="text-gray-400 mt-1">{stat.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Trust Badge */}
            <motion.div
              variants={itemVariants}
              className="bg-dark-card border border-navy/30 rounded-xl p-6 mt-8"
            >
              <p className="text-center text-gray-300">
                <span className="text-navy-light font-bold">✓ Local South African Support</span>
                <br />
                Based in South Africa, serving businesses nationwide with direct communication and quick responses.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
