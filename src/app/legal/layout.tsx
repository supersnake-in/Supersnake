import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal & Regulatory Compliance',
  description: 'Legal notices, business entity information, and regulatory disclosures for SuperSnake.',
  alternates: {
    canonical: 'https://supersnake.in/legal',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
