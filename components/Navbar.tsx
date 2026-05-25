'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Phone, Sun, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { ShoppingCartWidget } from '@/components/ShoppingCartWidget';
import { ClientOnly } from '@/components/ClientOnly';
import { useTheme } from '@/components/ThemeProvider';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const { user, isAdmin, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const updateActive = () => {
      // Check hash first
      if (window.location.hash) {
        setCurrentHash(window.location.hash);
        return;
      }

      // If no hash, check scroll position to determine active section
      if (pathname === '/') {
        const sections = ['#services', '#special'];
        let activeSection = '';

        for (const section of sections) {
          const element = document.querySelector(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
              activeSection = section;
            }
          }
        }

        setCurrentHash(activeSection);
      }
    };

    updateActive();
    window.addEventListener('hashchange', updateActive);
    window.addEventListener('scroll', updateActive);

    return () => {
      window.removeEventListener('hashchange', updateActive);
      window.removeEventListener('scroll', updateActive);
    };
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/#services' },
    { label: 'Our Special', href: '/#special' },
    { label: 'Store', href: '/store' },
    { label: 'My Account', href: '/account' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !currentHash;
    }

    if (href.startsWith('/#')) {
      return pathname === '/' && currentHash === href.slice(1);
    }

    return pathname === href;
  };

  const navLinkClassName = (href: string) => {
    const active = isActive(href);

    return [
      'relative rounded-full px-3 py-2 text-sm font-medium transition-all duration-300',
      active
        ? 'border border-navy/30 bg-navy/10 text-orange shadow-sm after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-navy after:to-orange after:content-[""]'
        : 'text-white hover:text-orange',
    ].join(' ');
  };

  const mobileLinkClassName = (href: string) => {
    const active = isActive(href);

    return [
      'block rounded-xl px-3 py-2 font-medium transition-colors',
      active ? 'bg-navy/10 text-orange border border-navy/20' : 'text-white hover:text-orange',
    ].join(' ');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-dark-border">
      <div className="border-b border-dark-border/70 bg-gradient-to-r from-navy/15 via-dark-card/90 to-dark-bg/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-2 text-[11px] uppercase tracking-[0.35em] text-gray-300">
            <div className="flex items-center gap-3 text-gray-400">
              <span className="hidden sm:inline">Available for direct WhatsApp orders</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://wa.me/27615436379"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dark-border bg-dark-bg/70 text-gray-200 transition hover:border-navy/40 hover:text-white"
                aria-label="Open WhatsApp"
                title="Open WhatsApp"
              >
                <Phone size={12} className="text-navy-light" />
              </a>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dark-border bg-dark-card text-orange transition hover:border-orange hover:bg-orange/10"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <ClientOnly>
                <ShoppingCartWidget placement="header" />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <img src="/logo.png" alt="Armani Esso logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              <span className="sr-only">Armani Esso</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={navLinkClassName(item.href)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                onClick={(e) => {
                  if (item.href.startsWith('/#')) {
                    e.preventDefault();
                    const section = item.href.slice(1); // Remove leading /
                    const element = document.querySelector(section);
                    if (element) {
                      window.location.hash = section;
                      element.scrollIntoView({ behavior: 'smooth' });
                      setCurrentHash(section);
                    }
                  }
                  setIsOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={navLinkClassName('/admin')}
                aria-current={pathname === '/admin' ? 'page' : undefined}
              >
                Admin
              </Link>
            )}
            {user ? (
              <button
                onClick={() => void signOutUser()}
                className="ml-2 rounded-full border border-orange px-5 py-2 text-sm font-semibold text-orange transition hover:bg-orange/10"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth"
                className="ml-2 rounded-full bg-orange px-5 py-2 text-sm font-semibold text-dark-bg transition hover:bg-orange-light"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/contact"
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-light hover:text-white"
            >
              Get Quote
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleMenu}
              className="text-orange hover:text-orange-light transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-dark-card border-t border-dark-border shadow-premium"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={mobileLinkClassName(item.href)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={(e) => {
                    if (item.href.startsWith('/#')) {
                      e.preventDefault();
                      const section = item.href.slice(1); // Remove leading /
                      const element = document.querySelector(section);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        setCurrentHash(section.slice(1));
                      }
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={mobileLinkClassName('/admin')}
                  aria-current={pathname === '/admin' ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
              )}
              {user ? (
                <button
                  className="block w-full rounded-xl border border-orange px-4 py-3 text-center font-semibold text-orange transition hover:bg-orange/10"
                  onClick={async () => {
                    await signOutUser();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block w-full rounded-xl border border-orange px-4 py-3 text-center font-semibold text-orange transition hover:bg-orange/10"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/contact"
                className="block w-full rounded-xl bg-navy px-4 py-3 text-center font-semibold text-white transition hover:bg-navy-light"
                onClick={() => setIsOpen(false)}
              >
                Get Quote
              </Link>
              <div className="pt-3">
                <ClientOnly>
                  <ShoppingCartWidget placement="header" />
                </ClientOnly>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};
