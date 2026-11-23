import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import SiteContent from '@/models/SiteContent';

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://satkhir-ghor.vercel.app').replace(/\/$/, '');

  // 1. Static Standard Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Product Routes from MongoDB
  let productRoutes = [];
  try {
    await connectToDatabase();
    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('slug updatedAt createdAt')
      .lean();

    if (Array.isArray(products)) {
      productRoutes = products
        .filter((p) => p.slug)
        .map((product) => ({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updatedAt || product.createdAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.85,
        }));
    }
  } catch (error) {
    console.warn('Sitemap: Failed to load products from DB', error.message);
  }

  // 3. Dynamic Category Routes from MongoDB
  let categoryRoutes = [];
  try {
    await connectToDatabase();
    const catDoc = await SiteContent.findOne({ key: 'categories' }).lean();
    const cats = Array.isArray(catDoc?.data) ? catDoc.data : [];
    categoryRoutes = cats
      .filter((c) => c && (c.slug || c.id) && c.slug !== 'all' && c.id !== 'all')
      .map((cat) => ({
        url: `${baseUrl}/shop?cat=${encodeURIComponent(cat.slug || cat.id)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
  } catch (error) {
    console.warn('Sitemap: Failed to load categories from DB', error.message);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
