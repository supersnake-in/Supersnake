import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SuperSnake — First Drop Coming Soon | Official Pre-Launch',
  description:
    'The First Drop from SuperSnake is almost here. Reserve your exclusive pieces from our inaugural collection before the official public release.',
  openGraph: {
    title: 'SuperSnake — First Drop Coming Soon',
    description: 'Pre-book exclusive monolithic luxury heavyweight T-shirts.',
    images: ['/hero2.png'],
  },
};

export default function PreLaunchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
