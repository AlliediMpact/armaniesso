/**
 * JSON-LD Schema markup for SEO and rich snippets
 */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Armani Esso',
  image: 'https://armaniesso.co.za/logo.png',
  description: 'Premium printing and branding solutions for businesses across South Africa',
  url: 'https://armaniesso.co.za',
  telephone: '+27615436379',
  email: 'support@armaniesso.co.za',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZA',
    addressLocality: 'South Africa',
  },
  sameAs: [
    'https://wa.me/27615436379',
  ],
  priceRange: '$$',
  serviceArea: {
    '@type': 'Country',
    name: 'South Africa',
  },
  areaServed: 'ZA',
};

export const businessServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Armani Esso - Printing & Branding',
  description: 'Premium printing and branding solutions including business cards, flyers, banners, and branded items',
  url: 'https://armaniesso.co.za',
  telephone: '+27615436379',
  image: 'https://armaniesso.co.za/logo.png',
  serviceType: ['Printing', 'Graphic Design', 'Branding'],
  areaServed: 'South Africa',
  brand: {
    '@type': 'Brand',
    name: 'Armani Esso',
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What printing services do you offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer business cards, flyers, banners, lanyards, flags, and custom branded items. All products are print-ready and available for quick order.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you provide design services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we provide artwork cleanup and layout support to help prepare your branding assets for clean production.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly can you deliver?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer quick responses on weekdays and multiple shipping methods including Fastway, DHL, pickup, and international delivery.',
      },
    },
  ],
};
