'use client';

import { useState, useEffect } from 'react';
import { Download, Search, Filter, TrendingUp, CreditCard, Box, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';

interface Kpis {
  totalSalesAmount: number;
  salesCount: number;
  averageTicket: number;
}

interface Transaction {
  id: string;
  date: string;
  customerName: string;
  status: string;
  paymentMethod: string;
  total: number;
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface ReportData {
  kpis: Kpis;
  transactions: Transaction[];
  topProducts: TopProduct[];
}

export default function ReportesClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`/api/reports/sales?${queryParams.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar reportes');
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, statusFilter]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['ID', 'Fecha', 'Cliente', 'Método Pago', 'Estado', 'Total'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map(tx => [
        tx.id,
        new Date(tx.date).toLocaleDateString('es-ES'),
        `"${tx.customerName}"`,
        tx.paymentMethod,
        tx.status,
        tx.total
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Ventas', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
    doc.text(`Total Ingresos: Q ${data.kpis.totalSalesAmount.toFixed(2)}`, 14, 36);
    doc.text(`Total Transacciones: ${data.kpis.salesCount}`, 14, 42);
    
    let y = 55;
    doc.setFontSize(12);
    doc.text('ID Transacción', 14, y);
    doc.text('Fecha', 60, y);
    doc.text('Cliente', 90, y);
    doc.text('Total', 160, y);
    
    y += 5;
    doc.line(14, y, 195, y);
    y += 8;
    
    doc.setFontSize(10);
    data.transactions.forEach(tx => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(tx.id.substring(0, 8), 14, y);
      doc.text(new Date(tx.date).toLocaleDateString('es-ES'), 60, y);
      doc.text(tx.customerName.substring(0, 25), 90, y);
      doc.text(`Q ${tx.total.toFixed(2)}`, 160, y);
      y += 8;
    });

    doc.save(`reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredTransactions = data?.transactions.filter(tx => 
    tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Filters Bar */}
      <div className="card mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between">
          <div className="flex-row" style={{ gap: '1rem' }}>
            <div>
              <label className="form-label text-xs">Fecha Inicio</label>
              <input 
                type="date" 
                className="form-input" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label text-xs">Fecha Fin</label>
              <input 
                type="date" 
                className="form-input" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label text-xs">Estado</label>
              <select 
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos</option>
                <option value="COMPLETED">Aprobados</option>
                <option value="PENDING">Pendientes</option>
                <option value="FAILED">Rechazados</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('ALL'); }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
          
          <div className="flex-row">
            <button className="btn btn-outline" onClick={handleExportCSV} disabled={loading || !data}>
              <Download size={16} /> CSV
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} disabled={loading || !data}>
              <Download size={16} /> PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>
          <p className="text-secondary">Cargando reporte...</p>
        </div>
      ) : error ? (
        <div className="card text-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="kpi-grid">
            <div className="card">
              <div className="flex-between card-header">
                <span className="card-title">Ingresos Totales</span>
                <TrendingUp size={18} className="text-success" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                Q {data?.kpis.totalSalesAmount.toFixed(2)}
              </h2>
            </div>
            <div className="card">
              <div className="flex-between card-header">
                <span className="card-title">Transacciones</span>
                <CreditCard size={18} className="text-primary" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                {data?.kpis.salesCount}
              </h2>
            </div>
            <div className="card">
              <div className="flex-between card-header">
                <span className="card-title">Ticket Promedio</span>
                <Box size={18} className="text-warning" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                Q {data?.kpis.averageTicket.toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Table */}
            <div className="card">
              <div className="flex-between card-header">
                <h3 className="card-title">Detalle de Transacciones</h3>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente o ID..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Método</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions?.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontFamily: 'monospace' }}>{tx.id.substring(0, 8)}</td>
                        <td>{new Date(tx.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>{tx.customerName}</td>
                        <td>
                          <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td>{tx.paymentMethod}</td>
                        <td style={{ fontWeight: 500 }}>Q {tx.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {filteredTransactions?.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }} className="text-secondary">
                          No se encontraron transacciones.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="card">
              <h3 className="card-title card-header">Productos Más Vendidos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data?.topProducts.map((product, idx) => (
                  <div key={product.id} className="flex-between" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {idx + 1}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>{product.name}</p>
                        <p className="text-xs text-secondary">{product.quantity} unidades vendidas</p>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Q {product.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
                {data?.topProducts.length === 0 && (
                  <p className="text-secondary text-sm text-center py-4">No hay ventas en este periodo</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
