import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/account',
          '/account/',
          '/checkout',
          '/checkout/',
          '/order-confirmation',
          '/order-confirmation/',
          '/auth',
          '/auth/',
          '/api',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://supersnake.in/sitemap.xml',
    host: 'https://supersnake.in',
  };
}
