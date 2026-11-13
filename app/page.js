import HeroBanner from '@/components/home/HeroBanner';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
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

      {/* Real Trust Points: Why Choose Us */}
      <WhyChooseUs />

      {/* জেনেরিক টেমপ্লেট কাস্টমার রিভিউ সেকশনটি আসল ক্রেতার রিভিউ যুক্ত না হওয়া পর্যন্ত সাময়িকভাবে হাইড রাখা হলো */}
    </div>
  );
}
