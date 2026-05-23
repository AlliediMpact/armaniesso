import type { Metadata } from 'next';
import { StoreProductDetailPage } from '@/components/store/StoreProductDetailPage';

export const metadata: Metadata = {
  title: 'Product Details - Armani Esso Store',
  description: 'View product details and add to cart.',
};

export default function ProductPage() {
  return <StoreProductDetailPage />;
}
