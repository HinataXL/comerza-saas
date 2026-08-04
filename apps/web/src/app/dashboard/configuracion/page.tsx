'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Upload, Image as ImageIcon, Save, CheckCircle, FileText, ScrollText } from 'lucide-react';
import './configuracion.css';

export default function ConfiguracionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [receiptTemplate, setReceiptTemplate] = useState('CLASSIC');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/tenant/settings', { credentials: 'include' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setLogoUrl(data.logoUrl || '');
          setReceiptTemplate(data.receiptTemplate || 'CLASSIC');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await fetch('/api/tenant/upload-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logoUrl);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, receiptTemplate })
      });
      
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex-center" style={{ height: '50vh' }}><p className="text-secondary">Cargando configuración...</p></div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.4s' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings className="text-primary" /> Configuración del Comercio
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Personaliza tu logotipo y el diseño de tus recibos.
        </p>
      </div>

      <div className="config-card">
        <h2 className="config-section-title">Logotipo de la Empresa</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="logo-preview-box">
            {logoUrl ? (
              <img src={`${logoUrl}`} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <ImageIcon size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <span style={{ fontSize: '0.75rem' }}>Sin logotipo</span>
              </div>
            )}
          </div>
          <div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleLogoUpload}
            />
            <button 
              className="btn btn-outline" 
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Upload size={16} /> Subir Logo
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Recomendado: PNG o JPG transparente, máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      <div className="config-card" style={{ marginTop: '1.5rem' }}>
        <h2 className="config-section-title">Diseño del Recibo</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div 
            className={`template-option ${receiptTemplate === 'CLASSIC' ? 'selected' : ''}`}
            onClick={() => setReceiptTemplate('CLASSIC')}
          >
            <FileText size={32} className="template-icon" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.5rem 0' }}>Plantilla Clásica (A4)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Ideal para imprimir en hojas tamaño carta o guardar como PDF para enviar por correo.
            </p>
          </div>

          <div 
            className={`template-option ${receiptTemplate === 'TICKET' ? 'selected' : ''}`}
            onClick={() => setReceiptTemplate('TICKET')}
          >
            <ScrollText size={32} className="template-icon" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.5rem 0' }}>Plantilla Ticket (80mm)</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Formato estrecho optimizado para impresoras térmicas de puntos de venta (POS).
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {showSuccess && (
          <span style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <CheckCircle size={16} /> Cambios guardados
          </span>
        )}
        <button 
          className="btn btn-primary" 
          onClick={handleSaveSettings}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
        >
          {isSaving ? 'Guardando...' : <><Save size={18} /> Guardar Configuración</>}
        </button>
      </div>

    </div>
  );
}
