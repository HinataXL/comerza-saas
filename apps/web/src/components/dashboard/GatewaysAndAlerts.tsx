import React from 'react';
import { ShieldCheck, FileText, TriangleAlert, CheckCircle2, Clock } from 'lucide-react';
import './dashboard.css';

interface GatewaysAndAlertsProps {
  fel: { certificadas: number; pendientes: number; error: number; lastSync: string };
  inventoryAlerts: { item: string; stock: number }[];
}

export default function GatewaysAndAlerts({ fel, inventoryAlerts }: GatewaysAndAlertsProps) {
  return (
    <div className="middle-grid">
      <div className="card">
        <div className="flex-between card-header">
          <h3 className="card-title">Pasarelas activas</h3>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver todas</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { name: 'QPayPro', color: '#1e40af' },
            { name: 'BAC', color: '#dc2626' },
            { name: 'NeoNet', color: '#4f46e5' },
            { name: 'Manual', color: '#4b5563' }
          ].map(gw => (
            <div key={gw.name} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: gw.color }}>{gw.name}</span>
              <div className="flex-row">
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                <span className="text-xs text-secondary">Activo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex-between card-header">
          <h3 className="card-title">Estado FEL</h3>
          <span className="badge badge-success"><CheckCircle2 size={12} /> Certificador conectado</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="text-secondary text-xs mb-1">Certificadas</p>
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <span className="text-success" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fel.certificadas}</span>
              <FileText size={16} className="text-secondary" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-secondary text-xs mb-1">Pendientes</p>
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <span className="text-warning" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fel.pendientes}</span>
              <Clock size={16} className="text-secondary" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-secondary text-xs mb-1">Error</p>
            <div className="flex-center" style={{ gap: '0.5rem' }}>
              <span className="text-error" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fel.error}</span>
              <TriangleAlert size={16} className="text-secondary" />
            </div>
          </div>
        </div>
        <div className="flex-between">
          <span className="text-xs text-secondary">Última sincronización: {fel.lastSync}</span>
          <a href="#" className="text-primary text-xs font-medium" style={{ textDecoration: 'none' }}>Ver detalle</a>
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
