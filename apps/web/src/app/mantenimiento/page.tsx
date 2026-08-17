import React from 'react';

export const metadata = {
  title: 'Mantenimiento - Comerza',
  description: 'Estamos realizando mejoras en nuestra plataforma.',
};

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '40px 30px',
        borderRadius: '24px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '32px'
      }}>
        
        {/* Título de Comerza */}
        <h1 style={{ 
          margin: 0, 
          fontSize: '40px', 
          fontWeight: '900', 
          color: '#2563eb', 
          letterSpacing: '-1px' 
        }}>
          Comerza
        </h1>

        {/* Video Animado */}
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
          <video
            src="/mantenimiento.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{ 
              width: '100%', 
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        {/* Textos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 10px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.5px' }}>
            Estamos en Mantenimiento
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>
            Pronto regresaremos con nuevas funciones y mejoras para ofrecerte la mejor experiencia. ¡Gracias por tu paciencia!
          </p>
        </div>

        {/* Barra decorativa */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          overflow: 'hidden',
          marginTop: '8px'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#2563eb',
            width: '40%',
            borderRadius: '8px'
          }}></div>
        </div>

      </div>
    </div>
  );
}
