import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy - Armani Esso',
  description: 'Shipping methods, costs, and delivery expectations for Armani Esso orders.',
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Shipping Policy</h1>

        <p className="text-gray-300 mb-4">We deliver across South Africa using reputable courier partners. Shipping
        costs and delivery estimates are shown at checkout and depend on your chosen method and delivery address.</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Available shipping methods</h2>
          <p className="text-gray-300">Typical options include standard and express courier services. Pickup may be
          available for select orders; availability and pricing are shown at checkout prior to payment.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Delivery estimates</h2>
          <p className="text-gray-300">Estimated delivery times are provided at checkout. Standard delivery
          typically takes 3–7 business days while express is usually 1–3 business days depending on
          destination and carrier capacity. These are estimates and not guaranteed.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Tracking and missing parcels</h2>
          <p className="text-gray-300">When an order ships we will provide a tracking number where available. If you
          believe your parcel is lost or delayed, contact us at <a href="mailto:info@armaniesso.co.za" className="text-orange">info@armaniesso.co.za</a>
          quoting your order number and tracking reference. We will investigate with the carrier.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Risk and title</h2>
          <p className="text-gray-300">Risk in the goods passes to you on delivery to the carrier. Ownership of goods
          passes to you once payment has been received in full by Armani Esso.</p>
        </section>

        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
