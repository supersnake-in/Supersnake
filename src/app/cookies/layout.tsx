import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Understand how SuperSnake utilizes necessary and functional cookies to ensure secure session states and checkout experiences.',
  alternates: {
    canonical: 'https://supersnake.in/cookies',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
