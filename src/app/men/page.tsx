import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Men’s Premium Heavyweight T-Shirts | SUPERSNAKE',
  description: 'Heavyweight boxy and oversized cuts for men. Built from 260–300 GSM Supima® and French Terry.',
};

export default function MenPage() {
  return (
    <ShopCatalog
      initialGender="men"
      pageTitle="MEN’S T-SHIRTS"
      pageSubtitle="Monolithic proportions, dropped shoulders, and uncompromising heavyweight drape."
    />
  );
}
