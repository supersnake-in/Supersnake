import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth-context';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { BrandReveal } from '@/components/brand/BrandReveal';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { AuthHashNotice } from '@/components/auth/AuthHashNotice';

import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://supersnake.in'),
  title: {
    default: 'SUPERSNAKE | Wear Your Instinct | Premium Heavyweight T-Shirts',
    template: '%s | SUPERSNAKE',
  },
  description:
    'SUPERSNAKE.IN — An elite fashion house crafting monolithic heavyweight T-shirts. Cut from 280–300 GSM Supima® and French Terry cotton. Designed around the everyday. Built around you.',
  keywords: [
    'SuperSnake',
    'Premium T-Shirts India',
    'Heavyweight T-Shirts',
    '280 GSM T-Shirt',
    'Oversized T-Shirts Men',
    'Luxury T-Shirts Women',
    'Supima Cotton T-Shirt',
    'Streetwear India',
    'Monolithic T-Shirt',
  ],
  authors: [{ name: 'SuperSnake Design Atelier', url: 'https://supersnake.in' }],
  creator: 'SuperSnake',
  publisher: 'SuperSnake',
  alternates: {
    canonical: 'https://supersnake.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'SUPERSNAKE | Wear Your Instinct',
    description: 'Monolithic luxury T-shirts. Engineered for presence. Cut from 280–300 GSM combed Supima® cotton.',
    url: 'https://supersnake.in',
    siteName: 'SUPERSNAKE',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 1200,
        alt: 'SUPERSNAKE Official Brand Identity',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUPERSNAKE | Wear Your Instinct',
    description: 'Monolithic luxury T-shirts. Engineered for presence.',
    site: '@supersnake_in',
    creator: '@supersnake_in',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'SuperSnake',
  alternateName: ['SUPERSNAKE', 'SuperSnake Apparels', 'SuperSnake India'],
  url: 'https://supersnake.in',
  logo: 'https://supersnake.in/logo.png',
  image: 'https://supersnake.in/logo.png',
  description: 'Elite luxury fashion house crafting monolithic heavyweight T-shirts. Cut from 280–300 GSM Supima® and French Terry cotton.',
  email: 'support@supersnake.in',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
  sameAs: [
    'https://www.instagram.com/supersnake.in',
    'https://x.com/supersnake_in',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SUPERSNAKE',
  url: 'https://supersnake.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://supersnake.in/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-black">
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className="bg-black text-white antialiased selection:bg-snake-green selection:text-black">
        <StoreProvider>
          <AuthProvider>
            <SmoothScroll>
              <BrandReveal />
              <CustomCursor />
              <Header />
              <main className="min-h-screen relative bg-black">{children}</main>
              <CartDrawer />
              <SearchOverlay />
              <QuickViewModal />
              <AuthHashNotice />
              <Footer />
            </SmoothScroll>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
