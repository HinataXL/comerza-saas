import type { Metadata } from 'next';
import SuperAdminClientLayout from './SuperAdminClientLayout';

export const metadata: Metadata = {
  title: 'Superadmin',
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
