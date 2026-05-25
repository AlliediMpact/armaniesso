'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/#services' },
    { label: 'Our Special', href: '/#special' },
    { label: 'Contact', href: '/contact' },
  ];

  const contactInfo = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+27 61 543 6379',
      href: 'https://wa.me/27615436379',
      external: true,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+27 61 543 6379',
      href: 'tel:+27615436379',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@armaniesso.co.za',
      href: 'mailto:info@armaniesso.co.za',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'South Africa',
      href: '#',
    },
  ];

  return (
    <footer className="bg-dark-bg border-t border-dark-border">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 md:grid-cols-4">
          {/* Mobile: Quick Links (Row 1) and Contact (Row 2) layout */}
          {/* Desktop: 4-column layout */}
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/logo.png"
                alt="Armani Esso logo"
                className="w-16 h-16 object-contain"
              />
              <span className="sr-only">Armani Esso</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium printing and branding solutions for businesses across South
              Africa. Quality, reliability, and excellence in every project.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold mb-6">Get In Touch</h4>
            <div className="space-y-4">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                const LinkComponent = info.href.startsWith('#')
                  ? 'span'
                  : Link;

                return (
                  <div key={info.label} className="flex items-start gap-3">
                    <Icon className="text-orange flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">{info.label}</p>
                      {info.href.startsWith('#') ? (
                        <p className="text-white font-medium">{info.value}</p>
                      ) : (
                        <LinkComponent
                          href={info.href}
                          {...(info.external && {
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          })}
                          className="text-orange hover:text-orange-light transition-colors font-medium"
                        >
                          {info.value}
                        </LinkComponent>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-border my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p>&copy; {currentYear} Armani Esso. All rights reserved. Premium Printing & Branding Solutions.</p>
            <p className="mt-2 text-xs text-gray-500">
              Proudly developed by{' '}
              <Link
                href="https://www.alliedimpact.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-light hover:text-navy transition-colors font-semibold"
              >
                Allied iMpact
              </Link>
            </p>
          </div>

          <div className="flex gap-6">
            <Link
              href="https://wa.me/27615436379"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={24} />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Scroll Button */}
      <div className="bg-dark-card border-t border-dark-border">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-4 text-orange hover:text-orange-light transition-colors font-medium text-sm"
        >
          ↑ Back to Top
        </button>
      </div>
    </footer>
  );
};
