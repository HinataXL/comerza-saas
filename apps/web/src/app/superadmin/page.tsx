'use client';
import { useEffect, useState } from 'react';
import { Store, Users, DollarSign, FileText, TrendingUp, LayoutDashboard } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import '../../components/dashboard/dashboard.css'; // Para reutilizar algunos estilos genéricos

interface TopTenant {
  id: string;
  name: string;
  volume: number;
}

interface VolumeHistory {
  name: string;
  amount: number;
}

interface Metrics {
  totalTenants: number;
  totalUsers: number;
  totalVolume: number;
  totalInvoices: number;
  volumeHistory: VolumeHistory[];
  topTenants: TopTenant[];
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/superadmin/metrics', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching metrics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
        <p>Cargando métricas maestras...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px' }}>
          <LayoutDashboard size={24} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Panel Global de Métricas</h1>
          <p style={{ color: '#64748b', margin: 0, marginTop: '0.25rem' }}>Visión general del estado de todos los comercios</p>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Comercios Activos</p>
            <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '8px' }}><Store size={18} color="#16a34a" /></div>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{metrics?.totalTenants || 0}</h2>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Usuarios Totales</p>
            <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}><Users size={18} color="#2563eb" /></div>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{metrics?.totalUsers || 0}</h2>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Volumen Transaccionado</p>
            <div style={{ background: '#fdf4ff', padding: '0.5rem', borderRadius: '8px' }}><DollarSign size={18} color="#c026d3" /></div>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Q {metrics?.totalVolume.toFixed(2) || '0.00'}</h2>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Facturas Emitidas</p>
            <div style={{ background: '#fffbeb', padding: '0.5rem', borderRadius: '8px' }}><FileText size={18} color="#d97706" /></div>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{metrics?.totalInvoices || 0}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Gráfico */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#3b82f6" /> 
            Crecimiento de Volumen (6 Meses)
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.volumeHistory || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `Q${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`Q ${Number(value).toFixed(2)}`, 'Volumen']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {
                    (metrics?.volumeHistory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (metrics?.volumeHistory?.length || 1) - 1 ? '#3b82f6' : '#cbd5e1'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Comercios */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Top Comercios</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(!metrics?.topTenants || metrics.topTenants.length === 0) ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No hay datos suficientes.</p>
            ) : (
              metrics.topTenants.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? '#fef08a' : i === 1 ? '#e2e8f0' : i === 2 ? '#ffedd5' : '#f1f5f9', color: i === 0 ? '#a16207' : i === 1 ? '#475569' : i === 2 ? '#c2410c' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, marginTop: '2px' }}>Q {t.volume.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
