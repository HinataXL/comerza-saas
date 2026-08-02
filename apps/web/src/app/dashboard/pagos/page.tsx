'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Banknote, Landmark, Clock, CheckCircle, XCircle } from 'lucide-react';
import './pagos.css';

interface Sale {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentLink?: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
  };
}

export default function PagosPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Todos');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch('/api/sales', { credentials: 'include' });
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSales(data);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [router]);

  const filteredSales = activeTab === 'Todos' 
    ? sales 
    : sales.filter(s => {
        if (activeTab === 'Efectivo') return s.paymentMethod === 'Efectivo';
        if (activeTab === 'Transferencia') return s.paymentMethod === 'Transferencia';
        if (activeTab === 'En línea') return s.paymentMethod === 'Link de pago' || s.paymentMethod === 'Tarjeta';
        return true;
      });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle size={14}/> Pagado</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={14}/> Pendiente</span>;
      case 'FAILED':
        return <span className="badge badge-error"><XCircle size={14}/> Fallido</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === 'Efectivo') return <Banknote size={16} />;
    if (method === 'Transferencia') return <Landmark size={16} />;
    return <CreditCard size={16} />;
  };

  // Stats calculation
  const totalEfectivo = sales.filter(s => s.paymentMethod === 'Efectivo').reduce((acc, curr) => acc + curr.total, 0);
  const totalTransferencia = sales.filter(s => s.paymentMethod === 'Transferencia').reduce((acc, curr) => acc + curr.total, 0);
  const totalEnLinea = sales.filter(s => s.paymentMethod === 'Link de pago' || s.paymentMethod === 'Tarjeta').reduce((acc, curr) => acc + curr.total, 0);

  if (isLoading) {
    return <div className="flex-center" style={{ height: '50vh' }}><p className="text-secondary">Cargando pagos...</p></div>;
  }

  return (
    <div className="pagos-container fade-in">
      <div className="pagos-header">
        <div>
          <h1 className="pagos-title">Registro de Pagos</h1>
          <p className="text-secondary text-sm">Gestiona y desglosa todos los pagos recibidos</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('Efectivo')}>
          <div className="stat-icon-wrapper cash">
            <Banknote size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total en Efectivo</p>
            <p className="stat-value">Q{totalEfectivo.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('Transferencia')}>
          <div className="stat-icon-wrapper transfer">
            <Landmark size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total en Transferencias</p>
            <p className="stat-value">Q{totalTransferencia.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('En línea')}>
          <div className="stat-icon-wrapper online">
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Pagos en Línea</p>
            <p className="stat-value">Q{totalEnLinea.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="tabs-container">
          {['Todos', 'Efectivo', 'Transferencia', 'En línea'].map(tab => (
            <button 
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Estado</th>
                <th className="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
                    No hay pagos registrados para este método.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="table-row">
                    <td className="font-medium text-xs">#{sale.id.slice(0, 8)}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{sale.customer?.name || 'C/F'}</span>
                      </div>
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td>
                      <span className="method-badge">
                        {getPaymentMethodIcon(sale.paymentMethod || '')}
                        {sale.paymentMethod || 'Desconocido'}
                      </span>
                    </td>
                    <td>{getStatusBadge(sale.status)}</td>
                    <td className="text-right font-medium">Q{sale.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
