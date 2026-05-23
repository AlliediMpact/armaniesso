import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { ShoppingCartWidget } from '@/components/ShoppingCartWidget';
import { ClientOnly } from '@/components/ClientOnly';
import './globals.css';

export const metadata: Metadata = {
  title: 'Armani Esso - Premium Printing & Branding Solutions',
  description:
    'Professional printing and branding services for businesses across South Africa. Business cards, flyers, banners, and custom printing solutions.',
  keywords:
    'printing, branding, business cards, flyers, banners, south africa, custom printing',
  authors: [{ name: 'Armani Esso' }],
  metadataBase: new URL('https://armaniesso.co.za'),
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://armaniesso.co.za',
    siteName: 'Armani Esso',
    title: 'Armani Esso - Premium Printing & Branding Solutions',
    description:
      'Professional printing and branding services for businesses across South Africa.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Armani Esso',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.svg" />
      </head>
      <body className="bg-dark-bg text-white">
        <CartProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <ClientOnly>
            <ShoppingCartWidget />
          </ClientOnly>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
