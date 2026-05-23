import type { Metadata } from 'next';
import { StoreCheckoutPage } from '@/components/store/StoreCheckoutPage';

export const metadata: Metadata = {
  title: 'Checkout - Armani Esso Store',
  description: 'Complete your purchase securely.',
};

export default function CheckoutPage() {
  return <StoreCheckoutPage />;
}
