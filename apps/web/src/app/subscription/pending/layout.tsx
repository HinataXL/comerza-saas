import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suscripción Pendiente',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
