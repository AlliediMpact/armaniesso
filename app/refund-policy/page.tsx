import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Armani Esso',
  description: 'Our refund and returns policy for products and services purchased from Armani Esso.',
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Refund &amp; Returns Policy</h1>

        <p className="text-gray-300 mb-4">Armani Esso wants you to be satisfied with your order. This policy sets out
        how we handle requests for refunds, replacements and returns.</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">When we will offer a refund or replacement</h2>
          <p className="text-gray-300">We will consider refunds or replacements when:
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>Items are faulty or materially not as described;</li>
            <li>Goods are damaged in transit (provide photos and packaging details);</li>
            <li>We supplied the wrong product.</li>
          </ul>
          <p className="text-gray-300 mt-2">Custom printed items are generally non-returnable unless there is a
          clear manufacturing fault attributable to us.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">How to request a refund or replacement</h2>
          <p className="text-gray-300">Email <a href="mailto:info@armaniesso.co.za" className="text-orange">info@armaniesso.co.za</a>
          with your order ID, a description of the issue, and clear photos where applicable. We aim to respond
          within 3 business days with instructions.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Return shipping and costs</h2>
          <p className="text-gray-300">If the return is due to our error (faulty or incorrect item) we will cover
          reasonable return shipping costs. For change-of-mind returns, you are responsible for return
          shipping and any associated costs unless otherwise agreed.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Refund timeline</h2>
          <p className="text-gray-300">Once a refund is approved we will process it to the original payment method
          within 5–10 business days. The time until funds appear in your account depends on your bank or
          payment provider.</p>
        </section>

        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
