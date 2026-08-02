'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Save, Link as LinkIcon, SmartphoneNfc } from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [recurrenteSecretKey, setRecurrenteSecretKey] = useState('');
  const [recurrenteTerminalId, setRecurrenteTerminalId] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch('/api/tenant/integrations', { credentials: 'include' });
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.qpayproApiKey || '');
          setApiSecret(data.qpayproApiSecret || '');
          setRecurrenteSecretKey(data.recurrenteSecretKey || '');
          setRecurrenteTerminalId(data.recurrenteTerminalId || '');
        }
      } catch (error) {
        console.error('Error fetching integrations', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKeys();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tenant/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          qpayproApiKey: apiKey, 
          qpayproApiSecret: apiSecret,
          recurrenteSecretKey,
          recurrenteTerminalId
        })
      });

      if (!res.ok) throw new Error('Error al guardar credenciales');
      
      setMessage({ text: 'Credenciales guardadas con éxito', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex-center" style={{ height: '50vh' }}><p className="text-secondary">Cargando integraciones...</p></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Integraciones</h1>
        <p className="text-secondary text-sm">Conecta Comerza con servicios de terceros</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="flex-row" style={{ marginBottom: '1.5rem', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px' }}>
            <CreditCard size={24} className="text-primary" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>QPayPro</h3>
            <p className="text-secondary text-sm">Links de Pago y Pasarela de Cobros</p>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            borderRadius: '6px', 
            marginBottom: '1.5rem',
            backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">API Key / Public Key</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ingresa tu llave pública o API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">API Secret / Private Key (Opcional)</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Ingresa tu llave privada o secreto"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
            <p className="text-secondary text-xs" style={{ marginTop: '0.5rem' }}>
              Algunos endpoints de QPayPro requieren un secreto adicional para firmar las peticiones.
            </p>
          </div>

          <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />

          <div className="flex-row" style={{ marginBottom: '1.5rem', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px' }}>
              <SmartphoneNfc size={24} className="text-primary" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Recurrente</h3>
              <p className="text-secondary text-sm">Cobros NFC Tap to Pay</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Secret Key</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Ej. sk_live_..."
              value={recurrenteSecretKey}
              onChange={(e) => setRecurrenteSecretKey(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Terminal ID</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. trm_..."
              value={recurrenteTerminalId}
              onChange={(e) => setRecurrenteTerminalId(e.target.value)}
            />
            <p className="text-secondary text-xs" style={{ marginTop: '0.5rem' }}>
              El ID de la terminal virtual desde la app de Recurrente.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : <><Save size={18} /> Guardar Credenciales</>}
          </button>
        </form>
      </div>
    </div>
  );
}
