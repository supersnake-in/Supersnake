import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bestselling Heavyweight T-Shirts',
  description: 'The definitive icons of the SuperSnake catalog. Tested, proven, and endlessly worn heavyweight silhouettes.',
  alternates: {
    canonical: 'https://supersnake.in/bestsellers',
  },
  openGraph: {
    title: 'Bestselling Heavyweight T-Shirts | SUPERSNAKE',
    description: 'The definitive icons of the SuperSnake catalog.',
    url: 'https://supersnake.in/bestsellers',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bestselling Heavyweight T-Shirts | SUPERSNAKE',
    description: 'The definitive icons of the SuperSnake catalog.',
  },
};

export default function BestsellersPage() {
  return (
    <ShopCatalog
      initialIsBestseller={true}
      pageTitle="BESTSELLERS"
      pageSubtitle="The ones they keep coming back for. Tested, proven, and endlessly worn."
    />
  );
}
