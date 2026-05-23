import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Pricing } from '@/components/Pricing';
import { About } from '@/components/About';
import { ContactCTA } from '@/components/ContactCTA';

export const metadata: Metadata = {
  title: 'Armani Esso - Premium Printing & Branding Solutions',
  description:
    'Professional printing and branding services for businesses across South Africa. Get premium quality business cards, flyers, banners, and custom printing.',
};

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <Pricing />
      <About />
      <ContactCTA />
    </>
  );
}
