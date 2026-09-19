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

export const metadata: Metadata = {
  title: 'SUPERSNAKE | Wear Your Instinct | Premium Heavyweight T-Shirts',
  description:
    'SUPERSNAKE.IN — An elite fashion house crafting monolithic heavyweight T-shirts. Cut from 280–300 GSM Supima® and French Terry cotton. Designed around the everyday. Built around you.',
  metadataBase: new URL('https://supersnake.in'),
  keywords: [
    'SuperSnake',
    'Premium T-Shirts India',
    'Heavyweight T-Shirts',
    '280 GSM T-Shirt',
    'Oversized T-Shirts Men',
    'Luxury T-Shirts Women',
    'Supima Cotton T-Shirt',
  ],
  authors: [{ name: 'SuperSnake Design Atelier' }],
  openGraph: {
    title: 'SUPERSNAKE | Wear Your Instinct',
    description: 'Monolithic luxury T-shirts. Engineered for presence.',
    url: 'https://supersnake.in',
    siteName: 'SUPERSNAKE',
    images: [
      {
        url: '/supersnake logonobg.png',
        width: 800,
        height: 1200,
        alt: 'SUPERSNAKE Official Brand Identity',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/supersnake logonobg.png',
    apple: '/supersnake logonobg.png',
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
      <body className="bg-black text-white antialiased selection:bg-snake-green selection:text-black">
        <StoreProvider>
          <AuthProvider>
            <SmoothScroll>
              <BrandReveal />
              <CustomCursor />
              <Header />
              <main className="min-h-screen relative">{children}</main>
              <CartDrawer />
              <SearchOverlay />
              <QuickViewModal />
              <Footer />
            </SmoothScroll>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
