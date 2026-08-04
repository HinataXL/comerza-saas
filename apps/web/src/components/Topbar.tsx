'use client';
import { useEffect, useState } from 'react';
import { Search, Bell, Plus, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import './Topbar.css';

export default function Topbar() {
  const [userName, setUserName] = useState('Carlos Méndez');
  const [userRole, setUserRole] = useState('Administrador');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [tenantName, setTenantName] = useState('');
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchMe();
    fetchNotifications();

    // SSE Connection for real-time notifications
    const eventSource = new EventSource('/api/notifications/stream', { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        setNotifications(prev => [newNotification, ...prev]);
      } catch (err) {
        console.error('Error parsing real-time notification:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    // Refresh notifications every 5 minutes as a fallback
    const interval = setInterval(fetchNotifications, 300000);

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const handleDismissNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

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

        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn relative" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Notificaciones</h3>
              </div>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} style={{ 
                      padding: '1rem', 
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      backgroundColor: notif.type === 'WARNING' ? '#fefce8' : notif.type === 'SUCCESS' ? '#f0fdf4' : 'white'
                    }}>
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        {notif.type === 'INFO' && <Info size={16} color="#3b82f6" />}
                        {notif.type === 'WARNING' && <AlertTriangle size={16} color="#eab308" />}
                        {notif.type === 'SUCCESS' && <CheckCircle2 size={16} color="#22c55e" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{notif.title}</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDismissNotification(notif.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#94a3b8', 
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                        title="Marcar como leída"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
