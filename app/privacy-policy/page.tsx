import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Armani Esso',
  description: 'How Armani Esso collects, uses, and protects personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

        <p className="text-gray-300 mb-4">This Privacy Policy explains how Armani Esso collects, uses and protects
        personal information when you use our website or place orders. We respect your privacy and process
        personal data in accordance with applicable South African data protection laws.</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">What information we collect</h2>
          <p className="text-gray-300">When you place an order or register an account we collect information such as
          your name, email, phone number, delivery address, and order history. We may also collect payment
          references from our payment providers and anonymous analytics data about site usage.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">How we use personal data</h2>
          <p className="text-gray-300">We use personal data to process and deliver orders, communicate about your
          order status, handle returns and refunds, prevent fraud, and for accounting and legal obligations.
          We may also use aggregated analytics data to improve the website.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Sharing with third parties</h2>
          <p className="text-gray-300">We share personal data only with trusted service providers such as payment
          processors (e.g., PayStack), couriers, and our email provider to fulfil orders. We do not sell your data.
          Any third parties we use are required to protect your information.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Data retention and security</h2>
          <p className="text-gray-300">We retain personal data as long as necessary to fulfil the purposes
          above and to comply with legal obligations. We implement reasonable technical and organisational
          measures to protect personal data, but no system is completely secure.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Your rights</h2>
          <p className="text-gray-300">You may request access to, correction of, or deletion of your personal
          data by contacting us at <a href="mailto:info@armaniesso.co.za" className="text-orange">info@armaniesso.co.za</a>.
          We will respond to requests in line with applicable law.</p>
        </section>

        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
