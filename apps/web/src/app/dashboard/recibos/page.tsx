'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Printer, Search, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Sale {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
  };
}

export default function RecibosPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data: Sale[] = await res.json();
        // Solo mostramos recibos para ventas completadas o que se pueden documentar
        setSales(data.filter(s => s.status === 'COMPLETED' || s.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [router]);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex-center" style={{ height: '50vh' }}><p className="text-secondary">Cargando transacciones...</p></div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Recibos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Genera comprobantes no contables para tus ventas y cobros.</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o referencia..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-hover)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}>Recibo / Ref</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}>Fecha</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}>Cliente</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)' }}>Total</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <p>No se encontraron transacciones para generar recibos.</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} style={{ transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} />
                        </div>
                        #{sale.id.slice(0, 8)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                      {sale.customer?.name || 'Consumidor Final'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle', fontWeight: 500 }}>
                      Q{sale.total.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', verticalAlign: 'middle', textAlign: 'right' }}>
                      <Link 
                        href={`/dashboard/recibos/${sale.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        <Printer size={16} />
                        Generar Recibo
                      </Link>
                    </td>
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
