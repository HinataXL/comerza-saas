'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KpiCard from '@/components/dashboard/KpiCard';
import Charts from '@/components/dashboard/Charts';
import GatewaysAndAlerts from '@/components/dashboard/GatewaysAndAlerts';
import RecentTables from '@/components/dashboard/RecentTables';
import { BarChart, AlertCircle, FileText, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          credentials: 'include'
        });
        
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Error fetching data');
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: 'calc(100vh - 70px)' }}>
        <p className="text-secondary">Cargando dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-center" style={{ height: 'calc(100vh - 70px)' }}>
        <p className="text-error">{error || 'No se pudo cargar la información'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard 
          title="Ventas del mes" 
          value={`Q ${data.kpis.ventasDelMes.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          trend={data.kpis.ventasDelMes.trend} 
          isPositive={data.kpis.ventasDelMes.isPositive} 
          subtitle="vs. mes anterior"
          icon={BarChart}
          iconColor="#2563eb"
          iconBg="#eff6ff"
        />
        <KpiCard 
          title="Cobros pendientes" 
          value={`Q ${data.kpis.cobrosPendientes.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          trend={data.kpis.cobrosPendientes.trend} 
          isPositive={data.kpis.cobrosPendientes.isPositive} 
          subtitle=""
          icon={AlertCircle}
          iconColor="#f59e0b"
          iconBg="#fef3c7"
        />

        <KpiCard 
          title="Transacciones aprobadas" 
          value={data.kpis.transaccionesAprobadas.value} 
          trend={data.kpis.transaccionesAprobadas.trend} 
          isPositive={data.kpis.transaccionesAprobadas.isPositive} 
          subtitle="vs. mes anterior"
          icon={ShieldCheck}
          iconColor="#8b5cf6"
          iconBg="#ede9fe"
        />
      </div>

      <Charts lineData={data.charts.lineData} pieData={data.charts.pieData} />
      
      <GatewaysAndAlerts activeGateways={data.gatewaysAndFel.activeGateways} fel={data.gatewaysAndFel.fel} inventoryAlerts={data.gatewaysAndFel.inventoryAlerts} />
      
      <RecentTables transactions={data.tables.transactions} invoices={data.tables.invoices} />
    </div>
  );
}
