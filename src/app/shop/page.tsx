import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Premium T-Shirts | SUPERSNAKE',
  description: 'Explore the complete SuperSnake collection of 240–300 GSM luxury heavyweight T-shirts.',
};

export default function ShopPage() {
  return (
    <ShopCatalog
      initialGender="all"
      pageTitle="SHOP T-SHIRTS"
      pageSubtitle="The hero product. Engineered from 240–300 GSM long-staple cotton."
    />
  );
}
