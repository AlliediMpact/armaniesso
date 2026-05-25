/**
 * Enhanced product management with variants and inventory support
 * Even with unlimited stock, we structure for future inventory management
 */

export type ProductVariant = {
  id: string;
  name: string; // e.g., "A4 - White"
  sku: string; // Stock Keeping Unit for inventory tracking
  price: number;
  stock: number; // Set to -1 for unlimited stock
};

export type ProductCategory = 'displays' | 'stationery' | 'branding' | 'gifts' | 'custom';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  image: string;
  basePrice: number; // Fallback if no variants
  originalPrice?: number;
  variants?: ProductVariant[];
  stock: number; // -1 for unlimited
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get a product by ID
 */
export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * Get all available products
 */
export function getAvailableProducts(): Product[] {
  return products.filter((p) => p.isAvailable && p.stock !== 0);
}

/**
 * Check if a product variant is available
 */
export function isVariantAvailable(productId: string, variantId?: string): boolean {
  const product = getProduct(productId);
  if (!product) return false;
  
  if (product.stock === -1) return true; // Unlimited stock
  if (product.stock > 0) return true;
  
  if (variantId && product.variants) {
    const variant = product.variants.find((v) => v.id === variantId);
    return variant ? variant.stock === -1 || variant.stock > 0 : false;
  }
  
  return false;
}

/**
 * Get variant price or base price
 */
export function getVariantPrice(productId: string, variantId?: string): number | null {
  const product = getProduct(productId);
  if (!product) return null;
  
  if (variantId && product.variants) {
    const variant = product.variants.find((v) => v.id === variantId);
    return variant?.price ?? null;
  }
  
  return product.basePrice;
}

/**
 * Product catalog with unlimited stock (-1)
 * SKUs format: [CATEGORY]-[PRODUCT]-[VARIANT]
 */
const products: Product[] = [
  // Displays
  {
    id: 'product-001',
    name: 'A4 Business Cards',
    description: 'Premium 300gsm white business cards with full-colour print and matte finish',
    category: 'displays',
    image: '/images/business-cards.jpg',
    basePrice: 199.00,
    originalPrice: 249.00,
    stock: -1, // Unlimited
    isAvailable: true,
    variants: [
      { id: 'var-001-white', name: 'White Matte', sku: 'DISP-BC-WHT', price: 199.00, stock: -1 },
      { id: 'var-001-gloss', name: 'Gloss Finish', sku: 'DISP-BC-GLS', price: 229.00, stock: -1 },
      { id: 'var-001-silk', name: 'Silk Touch', sku: 'DISP-BC-SLK', price: 249.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-002',
    name: 'Roller Banners (800x2000mm)',
    description: 'High-quality roller banners with premium fabric and sturdy base',
    category: 'displays',
    image: '/images/roller-banners.jpg',
    basePrice: 499.00,
    originalPrice: 599.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-002-standard', name: 'Standard', sku: 'DISP-RB-STD', price: 499.00, stock: -1 },
      { id: 'var-002-premium', name: 'Premium Material', sku: 'DISP-RB-PRM', price: 599.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-003',
    name: 'Trade Show Pop-up Stands (2x2m)',
    description: 'Professional pop-up stands with aluminum frame and custom graphics',
    category: 'displays',
    image: '/images/popup-stands.jpg',
    basePrice: 1299.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-003-basic', name: 'Basic Frame', sku: 'DISP-PU-BSC', price: 1299.00, stock: -1 },
      { id: 'var-003-deluxe', name: 'Deluxe with Lighting', sku: 'DISP-PU-DLX', price: 1799.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Stationery
  {
    id: 'product-004',
    name: 'Letterheads (A4)',
    description: 'Premium 120gsm letterheads with custom branding',
    category: 'stationery',
    image: '/images/letterheads.jpg',
    basePrice: 89.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-004-white', name: 'White', sku: 'STAT-LH-WHT', price: 89.00, stock: -1 },
      { id: 'var-004-cream', name: 'Cream', sku: 'STAT-LH-CRM', price: 99.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-005',
    name: 'Envelopes (DL)',
    description: 'Branded DL envelopes with window or full print',
    category: 'stationery',
    image: '/images/envelopes.jpg',
    basePrice: 79.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-005-window', name: 'With Window', sku: 'STAT-ENV-WIN', price: 79.00, stock: -1 },
      { id: 'var-005-fullprint', name: 'Full Print', sku: 'STAT-ENV-FUL', price: 99.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-006',
    name: 'Notepads (A5)',
    description: '100-page notepads with branded covers',
    category: 'stationery',
    image: '/images/notepads.jpg',
    basePrice: 49.00,
    stock: -1,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Branding
  {
    id: 'product-007',
    name: 'Corporate Polo Shirts',
    description: 'Premium branded polo shirts with embroidery',
    category: 'branding',
    image: '/images/polo-shirts.jpg',
    basePrice: 199.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-007-s', name: 'Small', sku: 'BRAND-POLO-S', price: 199.00, stock: -1 },
      { id: 'var-007-m', name: 'Medium', sku: 'BRAND-POLO-M', price: 199.00, stock: -1 },
      { id: 'var-007-l', name: 'Large', sku: 'BRAND-POLO-L', price: 199.00, stock: -1 },
      { id: 'var-007-xl', name: 'X-Large', sku: 'BRAND-POLO-XL', price: 199.00, stock: -1 },
      { id: 'var-007-xxl', name: '2X-Large', sku: 'BRAND-POLO-XXL', price: 219.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-008',
    name: 'Custom Branded Mugs',
    description: '350ml ceramic mugs with full-colour wrap print',
    category: 'branding',
    image: '/images/mugs.jpg',
    basePrice: 69.00,
    stock: -1,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-009',
    name: 'Branded Lanyards',
    description: 'Polyester lanyards with custom print and safety breaks',
    category: 'branding',
    image: '/images/lanyards.jpg',
    basePrice: 29.00,
    stock: -1,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-010',
    name: 'USB Flash Drives (Branded)',
    description: 'Custom-branded USB drives with laser engraving (16GB)',
    category: 'branding',
    image: '/images/usb-drives.jpg',
    basePrice: 149.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-010-16gb', name: '16GB', sku: 'BRAND-USB-16G', price: 149.00, stock: -1 },
      { id: 'var-010-32gb', name: '32GB', sku: 'BRAND-USB-32G', price: 179.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Gifts
  {
    id: 'product-011',
    name: 'Premium Gift Boxes',
    description: 'Custom-designed rigid setup boxes for premium packaging',
    category: 'gifts',
    image: '/images/gift-boxes.jpg',
    basePrice: 89.00,
    stock: -1,
    isAvailable: true,
    variants: [
      { id: 'var-011-small', name: 'Small (200x150x80)', sku: 'GIFT-BOX-SML', price: 89.00, stock: -1 },
      { id: 'var-011-medium', name: 'Medium (300x200x100)', sku: 'GIFT-BOX-MED', price: 119.00, stock: -1 },
      { id: 'var-011-large', name: 'Large (400x300x120)', sku: 'GIFT-BOX-LRG', price: 149.00, stock: -1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-012',
    name: 'Branded Notebooks',
    description: 'A5 hardcover notebooks with embossed logo',
    category: 'gifts',
    image: '/images/notebooks.jpg',
    basePrice: 79.00,
    stock: -1,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'product-013',
    name: 'Executive Pen Sets',
    description: 'Premium ballpoint pens in custom gift sets',
    category: 'gifts',
    image: '/images/pen-sets.jpg',
    basePrice: 129.00,
    stock: -1,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default products;
