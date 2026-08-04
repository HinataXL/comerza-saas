import React from 'react';
import { ShieldCheck, FileText, TriangleAlert, CheckCircle2, Clock } from 'lucide-react';
import './dashboard.css';

interface GatewaysAndAlertsProps {
  activeGateways: { qpaypro: boolean; recurrente: boolean };
  fel: { certificadas: number; pendientes: number; error: number; lastSync: string };
  inventoryAlerts: { item: string; stock: number }[];
}

export default function GatewaysAndAlerts({ activeGateways, fel, inventoryAlerts }: GatewaysAndAlertsProps) {
  return (
    <div className="middle-grid">
      <div className="card">
        <div className="flex-between card-header">
          <h3 className="card-title">Pasarelas activas</h3>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver todas</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { name: 'QPayPro', color: '#1e40af', active: activeGateways?.qpaypro, logo: '/qpaypro.png' },
            { name: 'Recurrente', color: '#2563eb', active: activeGateways?.recurrente, logo: '/recurrente.svg' }
          ].map(gw => (
            <div key={gw.name} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: gw.active ? 1 : 0.6 }}>
              <img src={gw.logo} alt={gw.name} style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: gw.active ? 'none' : 'grayscale(100%)' }} />
              <span style={{ fontWeight: 700, color: gw.active ? gw.color : '#9ca3af', fontSize: '0.875rem' }}>{gw.name}</span>
              <div className="flex-row">
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: gw.active ? 'var(--success)' : '#9ca3af' }}></div>
                <span className="text-xs text-secondary">{gw.active ? 'Activa' : 'Inactiva'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>



      <div className="card">
        <div className="flex-between card-header">
          <h3 className="card-title">Alertas de inventario</h3>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver inventario</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {inventoryAlerts.map(alert => (
            <div key={alert.item} className="flex-row" style={{ fontSize: '0.875rem' }}>
              <TriangleAlert size={16} className="text-warning" />
              <span>{alert.item} - <span className="text-secondary">{alert.stock} unidades</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
