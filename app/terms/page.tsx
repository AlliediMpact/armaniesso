import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Armani Esso',
  description: 'Terms and conditions for using Armani Esso services and website.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Terms &amp; Conditions</h1>

        <p className="text-gray-300 mb-4">
          These Terms &amp; Conditions (&quot;Terms&quot;) set out the rules for using the Armani Esso website
          and ordering products from armaniesso.co.za. By using the site or placing an order you agree to these
          Terms. Please read them carefully and contact us at <a href="mailto:info@armaniesso.co.za" className="text-orange">info@armaniesso.co.za</a>
          if you have any questions.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Ordering and Acceptance</h2>
          <p className="text-gray-300">Placing an order on the website constitutes an offer to purchase. We will
          confirm acceptance of your order by e-mail. If we are unable to accept an order (for example because
          an item is out of stock or pricing was incorrect), we will notify you and not process your order.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Pricing and Payment</h2>
          <p className="text-gray-300">All prices are shown in South African Rand (ZAR) and include VAT where applicable.
          We accept payment via PayStack and EFT. For EFT payments we provide bank details and your order will
          remain pending until payment is cleared. We reserve the right to correct pricing errors prior to
          accepting an order.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Production &amp; Delivery</h2>
          <p className="text-gray-300">Production lead times depend on the product and order size and are noted during
          checkout. Delivery times are estimates only. We are not liable for delays caused by third-party carriers
          or circumstances beyond our control (force majeure).</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Cancellation and Returns</h2>
          <p className="text-gray-300">If you need to cancel an order, contact us immediately. Orders that are already
          in production may not be cancellable. Custom or bespoke printed items are non-returnable unless faulty.
          See our <a href="/refund-policy" className="text-orange">Refund Policy</a> for full details on returns and refunds.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Intellectual Property</h2>
          <p className="text-gray-300">All content on this site (text, images, logos, layouts) is owned by Armani Esso or licensed
          to us. You may not reproduce, redistribute or create derivative works without our prior written permission.
          For artwork you provide, you warrant you have the right to use and reproduce the material and that it
          does not infringe third-party rights.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Limitation of Liability</h2>
          <p className="text-gray-300">To the maximum extent permitted by law, Armani Esso's liability for any claim
          arising from goods supplied or services provided is limited to the purchase price paid for the relevant order.
          We are not liable for indirect, special or consequential loss.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Governing Law</h2>
          <p className="text-gray-300">These Terms are governed by the laws of the Republic of South Africa. Any dispute
          will be resolved in the South African courts unless otherwise agreed in writing.</p>
        </section>

        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
