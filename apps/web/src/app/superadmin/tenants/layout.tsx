import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comercios',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
