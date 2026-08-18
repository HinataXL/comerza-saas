'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

function ReservationConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  const [status, setStatus] = useState<'loading' | 'success' | 'cancelled' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando tu solicitud...');

  useEffect(() => {
    if (!token || !action) {
      setStatus('error');
      setMessage('Enlace inválido o incompleto.');
      return;
    }

    const processAction = async () => {
      try {
        const res = await fetch(`/api/public/reservations/action?token=${token}&action=${action}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        const data = await res.json();

        if (res.ok) {
          if (action === 'CONFIRMED') {
            setStatus('success');
            setMessage('¡Tu reservación ha sido confirmada exitosamente!');
          } else {
            setStatus('cancelled');
            setMessage('Tu reservación ha sido cancelada exitosamente.');
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Ocurrió un error al procesar tu solicitud.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Error de conexión con el servidor. Por favor intenta de nuevo.');
      }
    };

    processAction();
  }, [token, action]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        textAlign: 'center', 
        padding: '3rem 2rem' 
      }}>
        
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
           <img src="/logo.png" alt="Comerza" style={{ height: '40px' }} />
        </div>

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', color: '#334155', margin: 0 }}>Procesando...</h2>
            <p style={{ color: '#64748b', margin: 0 }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '50%' }}>
              <CheckCircle size={48} color="#15803d" />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#15803d', margin: '0.5rem 0 0 0' }}>¡Confirmada!</h2>
            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0 }}>{message}</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem' }}>Ya puedes cerrar esta ventana de forma segura.</p>
          </div>
        )}

        {status === 'cancelled' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '50%' }}>
              <XCircle size={48} color="#b91c1c" />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#b91c1c', margin: '0.5rem 0 0 0' }}>Cancelada</h2>
            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0 }}>{message}</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem' }}>Ya puedes cerrar esta ventana de forma segura.</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '50%' }}>
              <AlertCircle size={48} color="#d97706" />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#d97706', margin: '0.5rem 0 0 0' }}>Aviso</h2>
            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0 }}>{message}</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem' }}>Si crees que esto es un error, por favor contacta al comercio.</p>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function ReservationConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ReservationConfirmContent />
    </Suspense>
  );
}
