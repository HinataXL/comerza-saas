'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  CreditCard, 
  FileText, 
  Package, 
  Users, 
  BarChart2, 
  Blocks, 
  Settings,
  Store,
  LogOut,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import './Sidebar.css';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ventas', href: '/dashboard/ventas', icon: ShoppingCart },
  { name: 'Cobros', href: '/dashboard/cobros', icon: Wallet },
  { name: 'Pagos', href: '/dashboard/pagos', icon: CreditCard },
  { name: 'Recibos', href: '/dashboard/recibos', icon: FileText },
  { name: 'Catálogo', href: '/dashboard/products', icon: Package },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Reservaciones', href: '/dashboard/reservaciones', icon: Calendar },
  { name: 'Reportes', href: '/dashboard/reportes', icon: BarChart2 },
  { name: 'Integraciones', href: '/dashboard/integraciones', icon: Blocks },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [tenantName, setTenantName] = useState('Mi Comercio');
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.tenant?.name) {
            setTenantName(data.tenant.name);
          }
          if (data.tenant?.features) {
            setAllowedFeatures(data.tenant.features);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isSuperadmin) {
          window.location.href = '/superadmin';
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Filtrar items según las features activas del plan
  const visibleNavItems = navItems.filter(item => {
    if (item.name === 'Dashboard' || item.name === 'Reservaciones') return true; // Siempre visible
    return allowedFeatures.includes(item.name);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon"><ShoppingCart size={20} color="white" /></div>
          <div>
            <h2 className="logo-text">{tenantName}</h2>
            <p className="logo-subtext">Guatemala</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
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
        <div className="store-selector" style={{ marginBottom: '1rem' }}>
          <Store size={20} className="store-icon" />
          <div className="store-info">
            <p className="store-name">Tienda Principal</p>
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
  );
}
