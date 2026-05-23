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

export const whatsappLink = 'https://wa.me/27615436379';
export const businessName = 'Armani Esso';
export const businessPhone = '+27 61 543 6379';
