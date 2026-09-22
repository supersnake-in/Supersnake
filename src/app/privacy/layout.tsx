import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SuperSnake collects, protects, and handles personal data and privacy in accordance with Indian information technology laws.',
  alternates: {
    canonical: 'https://supersnake.in/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | SUPERSNAKE',
    description: 'How SuperSnake protects and handles personal data.',
    url: 'https://supersnake.in/privacy',
    siteName: 'SUPERSNAKE',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
