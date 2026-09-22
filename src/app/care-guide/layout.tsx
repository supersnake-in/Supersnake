import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Care & Preservation Guide',
  description: 'Care instructions to preserve fabric weight, 280–300 GSM cotton structure, zero-sag collar geometry, and dye longevity.',
  alternates: {
    canonical: 'https://supersnake.in/care-guide',
  },
  openGraph: {
    title: 'Care & Preservation Guide | SUPERSNAKE',
    description: 'Care instructions to preserve fabric weight, cotton structure, and collar geometry.',
    url: 'https://supersnake.in/care-guide',
    siteName: 'SUPERSNAKE',
  },
};

export default function CareGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
