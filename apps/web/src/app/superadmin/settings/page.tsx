'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, Server, Database, Activity, Clock, ShieldAlert } from 'lucide-react';

interface HealthData {
  status: string;
  uptime: number;
  dbStatus: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

interface GatewaysStatus {
  qpaypro: string;
  recurrente: string;
}

export default function SuperAdminSettingsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [gateways, setGateways] = useState<GatewaysStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, gatewaysRes] = await Promise.all([
          fetch('/api/superadmin/health', { credentials: 'include' }),
          fetch('/api/superadmin/gateways/status', { credentials: 'include' })
        ]);

        if (healthRes.ok) setHealth(await healthRes.json());
        if (gatewaysRes.ok) setGateways(await gatewaysRes.json());
      } catch (error) {
        console.error('Error fetching settings data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor(seconds % (3600 * 24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>Cargando métricas del sistema...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', animation: 'fadeIn 0.3s' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck color="#3b82f6" /> Salud del Sistema
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Monitoreo en tiempo real del servidor y pasarelas de pago.
        </p>
      </div>

      {/* System Health Section */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} /> Estado del Servidor
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
              <Server size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>API Status</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: health?.status === 'ok' ? '#10b981' : '#ef4444', marginRight: '0.5rem' }}></span>
                {health?.status === 'ok' ? 'Operativo' : 'Problemas'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Proceso principal respondiendo</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#10b981' }}>
              <Database size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Base de Datos</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: health?.dbStatus === 'ok' ? '#10b981' : '#ef4444', marginRight: '0.5rem' }}></span>
                {health?.dbStatus === 'ok' ? 'Conectada' : 'Error'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Latencia normal (SQLite local)</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Memoria RAM (Heap)</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                {health ? formatBytes(health.memory.heapUsed) : '0 MB'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>De {health ? formatBytes(health.memory.heapTotal) : '0 MB'} asignados</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: '#fdf4ff', borderRadius: '8px', color: '#d946ef' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Tiempo en Línea (Uptime)</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                {health ? formatUptime(health.uptime) : '0d 0h 0m'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Desde el último reinicio del servidor</p>
        </div>
      </div>
      
      {/* External Services Section */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} /> Pasarelas de Pago Externas
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: gateways?.qpaypro === 'ok' ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', color: gateways?.qpaypro === 'ok' ? '#10b981' : '#ef4444' }}>
              <Server size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>QPayPro</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gateways?.qpaypro === 'ok' ? '#10b981' : (gateways ? '#ef4444' : '#cbd5e1'), marginRight: '0.5rem' }}></span>
                {gateways ? (gateways.qpaypro === 'ok' ? 'En Línea' : 'Caído') : 'Verificando...'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>payments.qpaypro.com</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: gateways?.recurrente === 'ok' ? '#f0fdf4' : '#fef2f2', borderRadius: '8px', color: gateways?.recurrente === 'ok' ? '#10b981' : '#ef4444' }}>
              <Server size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Recurrente</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gateways?.recurrente === 'ok' ? '#10b981' : (gateways ? '#ef4444' : '#cbd5e1'), marginRight: '0.5rem' }}></span>
                {gateways ? (gateways.recurrente === 'ok' ? 'En Línea' : 'Caído') : 'Verificando...'}
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>app.recurrente.com</p>
        </div>
      </div>
    </div>
  );
}
