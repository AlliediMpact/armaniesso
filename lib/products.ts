// Product catalog for Armani Esso store
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'printing' | 'merchandise' | 'badges';
  image: string;
  printSize: string;
  isOnSale?: boolean;
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'A4 Screen Printing',
    description: 'High-quality A4 screen printing on t-shirts and merchandise. Perfect for custom designs and branding.',
    price: 45,
    originalPrice: undefined,
    category: 'printing',
    image: 'https://via.placeholder.com/300x300?text=A4+Screen+Printing',
    printSize: 'A4',
  },
  {
    id: 'p2',
    name: 'A4 Back & Front Embroidery',
    description: 'Premium embroidery printing on both front and back. Ideal for professional and premium branding.',
    price: 85,
    originalPrice: 90,
    category: 'printing',
    image: 'https://via.placeholder.com/300x300?text=Embroidery+Printing',
    printSize: 'A4 Front & Back',
    isOnSale: true,
  },
  {
    id: 'p3',
    name: 'Personalized Mugs',
    description: 'Custom printed mugs with your design. Great for corporate gifts and personal use.',
    price: 45,
    originalPrice: 50,
    category: 'merchandise',
    image: 'https://via.placeholder.com/300x300?text=Personalized+Mugs',
    printSize: 'Standard',
    isOnSale: true,
  },
  {
    id: 'p4',
    name: 'Name Badges',
    description: 'Professional name badges for events, conferences, and offices.',
    price: 35,
    category: 'badges',
    image: 'https://via.placeholder.com/300x300?text=Name+Badges',
    printSize: 'Standard Badge',
  },
  {
    id: 'p5',
    name: 'Custom Phone Cases',
    description: 'Durable phone cases with custom printing. Available for all major phone models.',
    price: 65,
    originalPrice: 90,
    category: 'merchandise',
    image: 'https://via.placeholder.com/300x300?text=Phone+Cases',
    printSize: 'Phone Size',
    isOnSale: true,
  },
  {
    id: 'p6',
    name: 'Custom T-Shirts',
    description: 'Premium quality t-shirts with full-color digital printing. Available in multiple sizes and colors.',
    price: 120,
    category: 'printing',
    image: 'https://via.placeholder.com/300x300?text=Custom+T-Shirts',
    printSize: 'Full Size',
  },
  {
    id: 'p7',
    name: 'Branded Hoodies',
    description: 'Custom printed hoodies perfect for team uniforms, events, or brand promotion.',
    price: 180,
    category: 'merchandise',
    image: 'https://via.placeholder.com/300x300?text=Branded+Hoodies',
    printSize: 'Full Size',
  },
  {
    id: 'p8',
    name: 'Custom Badges & Buttons',
    description: 'Small, medium, or large custom badges. Perfect for events and promotions.',
    price: 25,
    category: 'badges',
    image: 'https://via.placeholder.com/300x300?text=Badges+Buttons',
    printSize: 'Various Sizes',
  },
];

export const categories = [
  { id: 'printing', name: 'Screen Printing' },
  { id: 'merchandise', name: 'Merchandise' },
  { id: 'badges', name: 'Badges & Buttons' },
];
