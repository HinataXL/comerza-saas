import React from 'react';

interface RecentTablesProps {
  transactions: { date: string; client: string; method: string; amount: string; status: string }[];
  invoices: { no: string; client: string; total: string; status: string; date: string }[];
}

export default function RecentTables({ transactions, invoices }: RecentTablesProps) {
  return (
    <div className="tables-grid">
      <div className="card" style={{ padding: '1.25rem 0' }}>
        <div className="flex-between card-header" style={{ padding: '0 1.25rem' }}>
          <h3 className="card-title">Últimas transacciones</h3>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver todas</a>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.25rem' }}>Fecha</th>
              <th>Cliente</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>{tx.date}</td>
                <td style={{ fontWeight: 500 }}>{tx.client}</td>
                <td className="text-secondary">{tx.method}</td>
                <td style={{ fontWeight: 600 }}>{tx.amount}</td>
                <td>
                  <span className={`badge ${tx.status === 'Aprobado' ? 'badge-success' : tx.status === 'Rechazado' ? 'badge-error' : 'badge-warning'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1.25rem 0' }}>
        <div className="flex-between card-header" style={{ padding: '0 1.25rem' }}>
          <h3 className="card-title">Facturas / cobros recientes</h3>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver todas</a>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.25rem' }}>No. factura</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>{inv.no}</td>
                <td style={{ fontWeight: 500 }}>{inv.client}</td>
                <td style={{ fontWeight: 600 }}>{inv.total}</td>
                <td>
                  <span className={`badge ${inv.status === 'Pagada' ? 'badge-success' : inv.status === 'Vencida' ? 'badge-error' : 'badge-warning'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="text-secondary">{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
