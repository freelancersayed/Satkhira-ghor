import HeroBanner from '@/components/home/HeroBanner';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

import SpecialBanner from '@/components/home/SpecialBanner';

// Enable ISR (Incremental Static Regeneration) for instant <30ms load time
export const revalidate = 30;

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroBanner />

      {/* Category Icons Grid */}
      <CategorySection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Organic Heritage Special Banner */}
      <SpecialBanner />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Customer Testimonials */}
      <Testimonials />
    </div>
  );
}
