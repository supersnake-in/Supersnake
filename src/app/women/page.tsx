import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Women’s Luxury T-Shirts | SUPERSNAKE',
  description: 'Engineered boxy crop hems and fluid Supima-silk blends for women.',
};

export default function WomenPage() {
  return (
    <ShopCatalog
      initialGender="women"
      pageTitle="WOMEN’S T-SHIRTS"
      pageSubtitle="Engineered boxy crop hems, fluid Supima-silk blends, and architectural geometry."
    />
  );
}
