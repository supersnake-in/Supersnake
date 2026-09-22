import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Official shipping policy, express logistics partners, 4–7 business days delivery timelines, and order tracking terms for SuperSnake.',
  alternates: {
    canonical: 'https://supersnake.in/shipping',
  },
  openGraph: {
    title: 'Shipping & Delivery Policy | SUPERSNAKE',
    description: 'Official shipping policy, delivery timelines, and order tracking terms.',
    url: 'https://supersnake.in/shipping',
    siteName: 'SUPERSNAKE',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
