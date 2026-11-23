import HeroBanner from '@/components/home/HeroBanner';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import SpecialBanner from '@/components/home/SpecialBanner';
import { connectToDatabase } from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import Product from '@/models/Product';

export const revalidate = 60;

async function getCategories() {
  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: 'categories' }).lean();
    if (doc && Array.isArray(doc.data)) {
      return JSON.parse(JSON.stringify(doc.data));
    }
  } catch (e) {
    console.warn('Failed to load categories for homepage:', e.message);
  }
  return [];
}

async function getCategoryCounts() {
  try {
    await connectToDatabase();
    const counts = await Product.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const map = {};
    counts.forEach((c) => {
      if (c._id) map[c._id] = c.count;
    });
    return map;
  } catch (e) {
    return {};
  }
}

export default async function HomePage() {
  const [initialCategories, initialCategoryCounts] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <HeroBanner />

      {/* Category Icons Grid */}
      <CategorySection
        initialCategories={initialCategories}
        initialCategoryCounts={initialCategoryCounts}
      />

      {/* Featured Products */}
      <FeaturedProducts initialCategories={initialCategories} />

      {/* Organic Heritage Special Banner */}
      <SpecialBanner />

      {/* Real Trust Points: Why Choose Us */}
      <WhyChooseUs />

      {/* জেনেরিক টেমপ্লেট কাস্টমার রিভিউ সেকশনটি আসল ক্রেতার রিভিউ যুক্ত না হওয়া পর্যন্ত সাময়িকভাবে হাইড রাখা হলো */}
    </div>
  );
}
