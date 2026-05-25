/**
 * Utility function to combine class names
 * Simple implementation without external dependencies
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ');
}

export function formatZar(value: number): string {
  const wholeRand = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `R${wholeRand},00`;
}

export const whatsappLink = 'https://wa.me/27615436379';
export const businessName = 'Armani Esso';
export const businessPhone = '+27 61 543 6379';

/**
 * Compute total (in Rands) for an array of cart items.
 * Items may include `id`, `quantity`, and/or `price` fields.
 * If an item `id` matches the product catalog, the catalog price is used.
 */
import { products } from './products';

export function calculateCartTotal(items: any[] | undefined): number {
  if (!items || !Array.isArray(items)) return 0;
  let total = 0;
  for (const it of items) {
    const qty = Number(it.quantity || 1);
    let unit = 0;
    if (it.id) {
      const p = products.find((x) => x.id === it.id);
      if (p) unit = p.price;
    }
    // fallback to provided price if catalog lookup failed
    if (!unit && typeof it.price === 'number') unit = it.price;
    total += unit * qty;
  }
  return total;
}
