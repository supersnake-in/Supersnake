import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Enter your SuperSnake order number to view real-time courier tracking milestones and delivery status.',
  alternates: {
    canonical: 'https://supersnake.in/track-order',
  },
  openGraph: {
    title: 'Track Your Order | SUPERSNAKE',
    description: 'Track your SuperSnake order in real-time.',
    url: 'https://supersnake.in/track-order',
    siteName: 'SUPERSNAKE',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
