'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, 
  Store, 
  Users, 
  Settings,
  LogOut,
  ShieldCheck,
  Layers,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import '../../components/Sidebar.css';

const adminNavItems = [
  { name: 'Panel Global', href: '/superadmin', icon: Globe },
  { name: 'Comercios', href: '/superadmin/tenants', icon: Store },
  { name: 'Planes', href: '/superadmin/planes', icon: Layers },
  { name: 'Usuarios', href: '/superadmin/users', icon: Users },
  { name: 'Auditoría', href: '/superadmin/audit', icon: ShieldAlert },
  { name: 'Notificaciones', href: '/superadmin/notificaciones', icon: BellRing },
  { name: 'Ajustes Plataforma', href: '/superadmin/settings', icon: Settings },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* SuperAdmin Sidebar */}
      <aside className="sidebar" style={{ backgroundColor: '#0f172a' }}> {/* Darker blue for superadmin */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon" style={{ backgroundColor: '#3b82f6' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <h2 className="logo-text">Comerza SaaS</h2>
              <p className="logo-subtext">SuperAdmin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="store-selector" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <Globe size={20} className="store-icon" color="#94a3b8" />
            <div className="store-info">
              <p className="store-name" style={{ color: '#f1f5f9' }}>Plataforma Global</p>
              <p className="store-location" style={{ color: '#94a3b8' }}>Acceso Total</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.75rem', marginTop: '0.5rem', color: '#ef4444' }}
          >
            <LogOut size={20} className="nav-icon" color="#ef4444" />
            <span style={{ fontWeight: 500 }}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar" style={{ zIndex: 10 }}>
          <div>
            <h1 className="topbar-title" style={{ color: '#0f172a' }}>Centro de Control</h1>
            <p className="topbar-subtitle" style={{ color: '#64748b' }}>Administración de toda la plataforma Comerza</p>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
