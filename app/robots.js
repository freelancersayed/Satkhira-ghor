export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://satkhiraghor.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/products/',
          '/about-us',
          '/track-order',
          '/privacy',
          '/refund-policy',
          '/terms',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
          '/my-orders',
          '/login',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
