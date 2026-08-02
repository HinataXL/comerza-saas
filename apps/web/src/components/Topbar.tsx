'use client';
import { useEffect, useState } from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import Link from 'next/link';
import './Topbar.css';

export default function Topbar() {
  const [userName, setUserName] = useState('Carlos Méndez');
  const [userRole, setUserRole] = useState('Administrador');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.name) {
            setUserName(data.user.name);
          }
          if (data.user?.role) {
            setUserRole(data.user.role === 'ADMIN' ? 'Administrador' : data.user.role === 'SELLER' ? 'Vendedor' : data.user.role);
          }
          if (data.user?.impersonatedBy) {
            setIsImpersonating(true);
            setTenantName(data.tenant?.name || 'este comercio');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  const handleReturnToSuperadmin = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        window.location.href = '/superadmin';
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isImpersonating && (
        <div style={{ background: '#fef08a', padding: '0.75rem', textAlign: 'center', color: '#854d0e', fontWeight: 600, fontSize: '0.875rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #fde047' }}>
          <span>🛡️ Modo Dios Activo: Estás navegando como Administrador en {tenantName}.</span>
          <button onClick={handleReturnToSuperadmin} style={{ background: '#854d0e', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
            Volver a Superadmin
          </button>
        </div>
      )}
      <header className="topbar">
        <div>
          <h1 className="topbar-title">Dashboard</h1>
          <p className="topbar-subtitle">Resumen general del negocio</p>
        </div>

      <div className="topbar-actions">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar clientes, facturas, productos..." 
            className="search-input"
          />
        </div>

        <button className="icon-btn relative">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <Link href="/dashboard/ventas" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          Nueva venta
        </Link>

        <div className="user-profile">
          <div className="avatar">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`} alt="User" />
          </div>
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p className="user-role">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
