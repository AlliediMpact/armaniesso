import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Armani Esso',
  description: 'How Armani Esso uses cookies and similar technologies on the website.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Cookie Policy</h1>

        <p className="text-gray-300 mb-4">Our website uses cookies and similar technologies to provide a
        better user experience, save preferences, and collect analytics. This page explains the types of cookies
        used and how you can manage them.</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Essential cookies</h2>
          <p className="text-gray-300">These cookies are necessary for the site to function. They support features
          like your shopping cart, session authentication, and secure checkout. Disabling these cookies may
          prevent the site from working correctly.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Analytics and performance cookies</h2>
          <p className="text-gray-300">We use anonymous analytics cookies to understand how visitors use the site
          so we can improve layout, content and performance. These cookies do not identify you personally.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Advertising and third-party cookies</h2>
          <p className="text-gray-300">Third-party services (for example analytics or social widgets) may set
          cookies when you interact with those features. We do not control third-party cookie behaviour; check the
          relevant provider's policies for details.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Managing and disabling cookies</h2>
          <p className="text-gray-300">You can control cookies through your browser settings or use privacy
          extensions. Disabling non-essential cookies may affect some features (e.g., remembering your cart).</p>
        </section>

        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
