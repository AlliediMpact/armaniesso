import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Armani Esso - Premium Printing & Branding',
  description:
    'Get in touch with Armani Esso for your printing and branding needs. Contact us via email, phone, or WhatsApp.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-dark py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Get In <span className="gradient-orange">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear about it. Send us a message
            and our team will respond within 2 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="md:col-span-1 space-y-6">
            {/* WhatsApp */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange/10 rounded-lg">
                  <MessageCircle className="text-orange" size={24} />
                </div>
                <h3 className="text-lg font-bold">WhatsApp</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Chat with us instantly on WhatsApp for quick responses.
              </p>
              <a
                href="https://wa.me/27615436379"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-orange text-dark-bg rounded-lg font-semibold hover:bg-orange-light transition-all duration-300 text-sm"
              >
                Open WhatsApp
              </a>
            </div>

            {/* Email */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange/10 rounded-lg">
                  <svg
                    className="text-orange"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="M22 6L12 13 2 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Email</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Send us detailed information about your project.
              </p>
              <a
                href="mailto:info@armaniesso.co.za"
                className="inline-block px-4 py-2 bg-dark-bg border border-orange/50 text-orange rounded-lg font-semibold hover:bg-orange/10 transition-all duration-300 text-sm"
              >
                Send Email
              </a>
            </div>

            {/* Phone */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange/10 rounded-lg">
                  <svg
                    className="text-orange"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Phone</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Call us during business hours (9AM - 6PM SAST).
              </p>
              <a
                href="tel:+27615436379"
                className="inline-block px-4 py-2 bg-dark-bg border border-orange/50 text-orange rounded-lg font-semibold hover:bg-orange/10 transition-all duration-300 text-sm"
              >
                +27 61 543 6379
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold font-display mb-8">
            Frequently Asked <span className="gradient-orange">Questions</span>
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                What's your typical response time?
              </h3>
              <p className="text-gray-400">
                We aim to respond to all inquiries within 2 hours during business
                hours (Monday - Friday, 9AM - 6PM SAST). WhatsApp messages often
                receive faster responses.
              </p>
            </div>

            <div className="border-t border-dark-border pt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Do you offer rush orders?
              </h3>
              <p className="text-gray-400">
                Yes! We offer rush services on selected products. Contact us with
                your timeline, and we'll provide you with options and pricing.
              </p>
            </div>

            <div className="border-t border-dark-border pt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept bank transfers, credit cards, and digital payment methods.
                A 50% deposit is required to secure your project.
              </p>
            </div>

            <div className="border-t border-dark-border pt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Can I request revisions?
              </h3>
              <p className="text-gray-400">
                Absolutely! All our plans include revisions. The number depends on
                your chosen package. We're committed to ensuring you're 100%
                satisfied with the final product.
              </p>
            </div>

            <div className="border-t border-dark-border pt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Do you provide design services?
              </h3>
              <p className="text-gray-400">
                Yes! Our Business and Premium packages include professional design
                services. We can work from your brief or help you develop a concept
                from scratch.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-orange hover:text-orange-light transition-colors duration-300 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
