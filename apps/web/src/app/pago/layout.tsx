import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprobante de Pago',
};

export default function PagoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
