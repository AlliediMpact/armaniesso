'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe } from 'lucide-react';
import { Card } from './ui/Card';

const stats = [
  {
    title: '1000+',
    description: 'Satisfied Clients',
    icon: Users,
  },
  {
    title: '5000+',
    description: 'Projects Completed',
    icon: Award,
  },
  {
    title: '8 Years',
    description: 'Industry Experience',
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
                Founded with a passion for excellence, Armani Esso has been
                delivering premium printing and branding solutions across South
                Africa. We believe that exceptional quality and professional
                service should be accessible to every business, regardless of size.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Our commitment to innovation, reliability, and customer
                satisfaction has made us the preferred choice for businesses
                seeking to elevate their brand presence through premium print
                materials.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Every project we undertake reflects our dedication to turning your
                vision into reality with meticulous attention to detail and
                craftsmanship.
              </p>
            </div>

            {/* Key Values */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 bg-gradient-orange rounded-full" />
                <div>
                  <h4 className="font-bold text-white mb-1">Our Mission</h4>
                  <p className="text-gray-400">
                    To empower businesses with exceptional branding and printing
                    solutions that drive growth and leave lasting impressions.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 bg-gradient-orange rounded-full" />
                <div>
                  <h4 className="font-bold text-white mb-1">Our Vision</h4>
                  <p className="text-gray-400">
                    To be the leading trusted partner for premium branding and
                    printing services in South Africa.
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
                    <div className="p-3 bg-orange/10 rounded-lg flex-shrink-0">
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
              className="bg-dark-card border border-orange/30 rounded-xl p-6 mt-8"
            >
              <p className="text-center text-gray-300">
                <span className="text-orange font-bold">✓ Certified</span>
                <br />
                Professional Printing Services Since 2016
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
