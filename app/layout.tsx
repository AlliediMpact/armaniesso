import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Preloader } from '@/components/Preloader';
import { organizationSchema, businessServiceSchema, faqSchema } from '@/lib/schema-markup';
import './globals.css';

export const metadata: Metadata = {
  title: 'Armani Esso - Premium Printing & Branding Solutions',
  description:
    'Professional printing and branding services for businesses across South Africa. Business cards, flyers, banners, and custom printing solutions.',
  keywords:
    'printing, branding, business cards, flyers, banners, south africa, custom printing, branded items, lanyards, flags',
  authors: [{ name: 'Armani Esso' }],
  metadataBase: new URL('https://armaniesso.co.za'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googlee17563fd056422ea',
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://armaniesso.co.za',
    siteName: 'Armani Esso',
    title: 'Armani Esso - Premium Printing & Branding Solutions',
    description:
      'Professional printing and branding services for businesses across South Africa. Quality printing, design, and branding solutions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Armani Esso - Premium Printing & Branding',
      },
    ],
  },
  alternates: {
    canonical: 'https://armaniesso.co.za',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='armaniesso-theme';var stored=window.localStorage.getItem(key);var theme=stored==='light'||stored==='dark'?stored:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;}catch(error){}})();`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.svg" />
        
        {/* JSON-LD Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessServiceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="bg-dark-bg text-white transition-colors duration-300">
        <Preloader />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="pt-[5.5rem]">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
