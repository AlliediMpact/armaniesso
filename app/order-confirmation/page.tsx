'use client';

import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function OrderConfirmationPage() {
  useEffect(() => {
    (async () => {
      try {
        const flag = localStorage.getItem('signOutAfterPurchase');
        if (!flag) return;
        // Attempt revoke + sign out
        const client = await import('@/lib/firebase-client');
        const firebaseAuth = client.firebaseAuth;
        if (firebaseAuth && firebaseAuth.currentUser) {
          const { getIdToken, signOut } = await import('firebase/auth');
          const token = await getIdToken(firebaseAuth.currentUser, true).catch(() => null);
          if (token) {
            await fetch('/api/auth/revoke', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null);
          }
          await signOut(firebaseAuth).catch(() => null);
        }
        localStorage.removeItem('signOutAfterPurchase');
      } catch (_e) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-20 flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase. Your order has been successfully submitted.
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-xl p-8 mb-8">
          <p className="text-gray-400 mb-4">
            We've sent a confirmation email with your order details and payment instructions.
          </p>
          <p className="text-orange font-bold mb-4">
            Please check your inbox for the next steps.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Order details have been sent to your email</p>
            <p>• For PayStack payments, you'll be redirected to complete payment</p>
            <p>• For EFT transfers, bank details are included in the confirmation email</p>
            <p>• Your order will be processed once payment is received</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/store"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange text-dark-bg rounded-lg font-bold hover:bg-orange-light transition-all"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-orange text-orange rounded-lg font-bold hover:bg-orange/10 transition-all"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-gray-400 text-sm mt-8">
          Questions? Contact us at{' '}
          <a href="mailto:info@armaniesso.co.za" className="text-orange hover:text-orange-light">
            info@armaniesso.co.za
          </a>{' '}
          or{' '}
          <a
            href="https://wa.me/27615436379"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange hover:text-orange-light"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
