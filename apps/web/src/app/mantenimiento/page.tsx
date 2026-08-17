import React from 'react';
import Image from 'next/image';

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
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px'
      }}>
        
        {/* Logo de Comerza */}
        <div style={{ position: 'relative', width: '250px', height: '100px', marginBottom: '16px' }}>
          <Image
            src="/logo.png"
            alt="Comerza Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* 
          AQUÍ SE INSERTARÁ EL VIDEO MP4 CUANDO LO SUBAS.
          Si subes el archivo a la carpeta 'public' como 'mantenimiento.mp4', 
          descomenta el bloque de abajo y elimina el icono de la llave inglesa.
        */}
        {/* 
        <video 
          src="/mantenimiento.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={{ width: '150px', borderRadius: '8px' }} 
        /> 
        */}

        {/* Icono de Mantenimiento temporal (mientras subes el video) */}
        <div style={{
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          padding: '24px',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>

        {/* Textos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>
            Estamos en Mantenimiento
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#64748b', lineHeight: '1.5' }}>
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
          marginTop: '16px'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#2563eb',
            width: '30%',
            borderRadius: '8px'
          }}></div>
        </div>

      </div>
    </div>
  );
}
