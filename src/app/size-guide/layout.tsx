import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Architectural Size & Fit Guide',
  description: 'Precision pit-to-pit chest, body length, shoulder width, and sleeve measurements for all SuperSnake boxy and oversized cuts.',
  alternates: {
    canonical: 'https://supersnake.in/size-guide',
  },
  openGraph: {
    title: 'Architectural Size & Fit Guide | SUPERSNAKE',
    description: 'Precision pit-to-pit chest, body length, shoulder width, and sleeve measurements for all SuperSnake cuts.',
    url: 'https://supersnake.in/size-guide',
    siteName: 'SUPERSNAKE',
  },
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
