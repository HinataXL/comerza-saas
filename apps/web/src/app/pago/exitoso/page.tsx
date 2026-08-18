'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const saleId = searchParams.get('saleId');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255,255,255,0.5)',
        textAlign: 'center',
        animation: 'slideUp 0.5s ease-out'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: '#10b981', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
        }}>
          <CheckCircle2 size={40} color="white" />
        </div>
        
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          color: '#0f172a', 
          marginBottom: '1rem',
          letterSpacing: '-0.025em'
        }}>
          ¡Pago Exitoso!
        </h1>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '1.125rem', 
          lineHeight: '1.6',
          marginBottom: '2rem' 
        }}>
          Tu transacción ha sido procesada y aprobada correctamente. Hemos enviado el comprobante a tu correo electrónico.
        </p>

        {saleId && (
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <FileText size={18} color="#64748b" />
            <span style={{ color: '#475569', fontSize: '0.875rem' }}>
              Referencia: <strong style={{ color: '#0f172a' }}>{saleId.substring(0, 8).toUpperCase()}</strong>
            </span>
          </div>
        )}

        <button 
          onClick={() => window.close()}
          style={{
            background: '#0f172a',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Cerrar esta ventana
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <PagoExitosoContent />
    </Suspense>
  );
}
