import type { Metadata } from 'next';
import { StoreListingPage } from '@/components/store/StoreListingPage';

export const metadata: Metadata = {
  title: 'Store - Armani Esso',
  description: 'Browse and purchase our premium printing and branding products.',
};

export default function Store() {
  return <StoreListingPage />;
}
