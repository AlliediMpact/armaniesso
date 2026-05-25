'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const StoreCheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'eft'>(
    'paystack'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipcode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signOutAfter, setSignOutAfter] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.zipcode
    ) {
      setError('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handlePayStackPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      // Initialize PayStack payment
      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: getTotalPrice() * 100, // Convert to kobo
          phone: formData.phone,
          metadata: {
            customer_name: formData.name,
            address: formData.address,
            city: formData.city,
            zipcode: formData.zipcode,
            items: items,
          },
        }),
      });

      const data = await response.json();

      if (data.authorizationUrl) {
        // Persist user's sign-out choice for post-payment callback handling
        if (signOutAfter) {
          try {
            localStorage.setItem('signOutAfterPurchase', '1');
          } catch (_e) {}
        }
        // Redirect to PayStack payment page
        window.location.href = data.authorizationUrl;
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEFTPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      // Create EFT order
      const response = await fetch('/api/eft-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: items,
          total: getTotalPrice(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        clearCart();

        // If user opted to sign out after purchase, attempt to revoke and sign out.
        if (signOutAfter) {
          try {
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
              // Sign out locally
              await signOut(firebaseAuth).catch(() => null);
            }
          } catch (_e) {
            // best-effort; continue
          }
        }

        setTimeout(() => {
          router.push('/order-confirmation');
        }, 3000);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Cart is Empty</h1>
          <Link
            href="/store"
            className="inline-block px-6 py-2 bg-orange text-dark-bg rounded-lg hover:bg-orange-light transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-dark pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Order Submitted!
          </h1>
          <p className="text-gray-300 mb-6">
            Your order has been submitted. We'll send you payment details via
            email shortly.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting in 3 seconds...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/store"
          className="flex items-center gap-2 text-orange hover:text-orange-light mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Store
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm pb-4 border-b border-dark-border"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="font-bold">R{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span>R{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-orange pt-4 border-t border-dark-border">
                  <span>Total</span>
                  <span>R{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-dark-card border border-dark-border rounded-xl p-8"
            >
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <h2 className="text-2xl font-bold mb-6">Billing Information</h2>

              {/* Form Fields */}
              <div className="space-y-4 mb-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                  <input
                    type="text"
                    name="zipcode"
                    placeholder="Zip Code"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    className="bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              <div className="space-y-3 mb-8">
                {/* PayStack Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'paystack'
                      ? 'border-orange bg-orange/5'
                      : 'border-dark-border hover:border-orange/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as 'paystack' | 'eft')
                    }
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-white">PayStack</p>
                    <p className="text-sm text-gray-400">
                      Instant payment with card, bank transfer, or mobile money
                    </p>
                  </div>
                </label>

                {/* EFT Option */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'eft'
                      ? 'border-orange bg-orange/5'
                      : 'border-dark-border hover:border-orange/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="eft"
                    checked={paymentMethod === 'eft'}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as 'paystack' | 'eft')
                    }
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-white">EFT Transfer</p>
                    <p className="text-sm text-gray-400">
                      Bank transfer - we'll send you bank details after order
                    </p>
                  </div>
                </label>
              </div>

              {/* Sign-out option */}
              <div className="mt-4 mb-6 flex items-center gap-3">
                <input
                  id="signOutAfter"
                  type="checkbox"
                  checked={signOutAfter}
                  onChange={(e) => setSignOutAfter(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="signOutAfter" className="text-sm text-gray-300">
                  Sign out of my account after this purchase
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={
                  paymentMethod === 'paystack'
                    ? handlePayStackPayment
                    : handleEFTPayment
                }
                disabled={isProcessing}
                className="w-full bg-orange text-dark-bg py-4 rounded-lg font-bold text-lg hover:bg-orange-light transition-all disabled:opacity-50"
              >
                {isProcessing
                  ? 'Processing...'
                  : `Complete Order - R${getTotalPrice().toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Your payment information is secure and encrypted.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
