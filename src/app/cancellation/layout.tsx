import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description: 'Order cancellation protocols, eligibility windows, and refund procedures for SuperSnake acquisitions.',
  alternates: {
    canonical: 'https://supersnake.in/cancellation',
  },
  openGraph: {
    title: 'Cancellation Policy | SUPERSNAKE',
    description: 'Order cancellation protocols and eligibility windows.',
    url: 'https://supersnake.in/cancellation',
    siteName: 'SUPERSNAKE',
  },
};

export default function CancellationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
