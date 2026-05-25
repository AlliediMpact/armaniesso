'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, ScanLine, BadgeCheck, Boxes, Sparkles as SparkleIcon } from 'lucide-react';
import { Button } from './ui/Button';

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

  const reelFrames = [
    {
      title: 'Business cards',
      subtitle: 'Premium cards for meetings, launches, and everyday introductions',
    },
    {
      title: 'Event visibility',
      subtitle: 'Pull-up banners, flags, and display pieces for events and activations',
    },
    {
      title: 'Branded details',
      subtitle: 'Lanyards, key holders, and small-format essentials that keep you visible',
    },
  ];

  return (
    <section className="relative min-h-screen pt-8 md:pt-10 bg-gradient-dark flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-orange">
                <Sparkles size={20} />
                <span className="text-sm font-semibold tracking-wider uppercase">
                  Print and branding for businesses that need to launch well
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
                Print, brand, and deliver with{' '}
                <span className="gradient-orange">confidence</span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed">
                From business cards and flyers to banners, lanyards, flags, and key holders,
                Armani Esso helps your brand look polished from quote request to final delivery.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Button href="/contact" size="lg" variant="primary">
                Request a Quote
              </Button>
              <Button href="https://wa.me/27615436379" size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} />
                Open WhatsApp
              </Button>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              variants={itemVariants}
              className="pt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400"
            >
              <div className="rounded-full border border-dark-border bg-dark-card/80 px-4 py-2 text-gray-300">
                Quick responses on weekdays
              </div>
              <div className="rounded-full border border-navy/20 bg-navy/10 px-4 py-2 text-navy-light">
                Artwork help before production starts
              </div>
              <div>
                <p className="font-semibold text-white">Ready for everyday business orders</p>
                <p>Practical support for launches, events, and repeat print runs</p>
              </div>
            </motion.div>
          </div>

          {/* Visual Element */}
          <motion.div
            variants={itemVariants}
            className="relative hidden md:block"
          >
            <div className="relative mx-auto w-full max-w-xl aspect-[4/5]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#121212] via-[#0f1117] to-[#050505] shadow-premium overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_28%)]" />

                <motion.div
                  animate={{ x: ['-30%', '130%'] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
                />

                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.45em] text-orange">Featured products</p>
                      <h3 className="mt-2 text-2xl font-bold text-white">Most requested print categories</h3>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-gray-300">
                      <BadgeCheck size={14} className="text-orange" />
                      Print-ready
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/25 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />

                    <motion.div
                      animate={{ y: [0, -24, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 grid grid-cols-1 gap-4 p-4 pr-24"
                    >
                      {reelFrames.map((frame, index) => (
                        <div
                          key={frame.title}
                          className={`rounded-2xl border ${index === 1 ? 'border-navy/30 bg-navy/10' : 'border-orange/15 bg-dark-bg/55'} p-4 backdrop-blur-md`}
                        >
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
                            <ScanLine size={12} className={index === 1 ? 'text-navy-light' : 'text-orange'} />
                            {frame.title}
                          </div>
                          <h4 className="text-lg font-bold text-white">{frame.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-gray-300">{frame.subtitle}</p>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 right-4 rounded-2xl border border-white/10 bg-dark-card/90 px-3 py-2 shadow-premium max-w-[120px]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange/15 text-orange flex-shrink-0">
                          <SparkleIcon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 leading-none">Support</p>
                          <p className="text-xs font-semibold text-white leading-tight truncate">Guided delivery</p>
                        </div>
                      </div>
                    </motion.div>
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
