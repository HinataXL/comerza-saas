'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Save, Link as LinkIcon, SmartphoneNfc } from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isQpayproActive, setIsQpayproActive] = useState(false);
  const [recurrenteSecretKey, setRecurrenteSecretKey] = useState('');
  const [recurrenteTerminalId, setRecurrenteTerminalId] = useState('');
  const [isRecurrenteActive, setIsRecurrenteActive] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch('/api/tenant/integrations', { credentials: 'include' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setApiKey(data.qpayproApiKey || '');
          setApiSecret(data.qpayproApiSecret || '');
          setIsQpayproActive(data.isQpayproActive || false);
          setRecurrenteSecretKey(data.recurrenteSecretKey || '');
          setRecurrenteTerminalId(data.recurrenteTerminalId || '');
          setIsRecurrenteActive(data.isRecurrenteActive || false);
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
          isQpayproActive,
          recurrenteSecretKey,
          recurrenteTerminalId,
          isRecurrenteActive
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
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div className="flex-row" style={{ gap: '0.75rem' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/qpaypro.png" alt="QPayPro" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: isQpayproActive ? 'none' : 'grayscale(100%)', opacity: isQpayproActive ? 1 : 0.6 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>QPayPro</h3>
              <p className="text-secondary text-sm">Links de Pago y Pasarela de Cobros</p>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <input type="checkbox" checked={isQpayproActive} onChange={(e) => setIsQpayproActive(e.target.checked)} style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
              <div style={{ width: '40px', height: '24px', backgroundColor: isQpayproActive ? 'var(--success)' : '#d1d5db', borderRadius: '9999px', transition: 'background-color 0.2s', position: 'relative' }}>
                <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isQpayproActive ? '19px' : '3px', transition: 'left 0.2s' }}></div>
              </div>
            </div>
          </label>
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
          {isQpayproActive && (
            <>
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
            </>
          )}

          <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />

          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div className="flex-row" style={{ gap: '0.75rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/recurrente.svg" alt="Recurrente" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: isRecurrenteActive ? 'none' : 'grayscale(100%)', opacity: isRecurrenteActive ? 1 : 0.6 }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>Recurrente</h3>
                <p className="text-secondary text-sm">Cobros NFC Tap to Pay</p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <input type="checkbox" checked={isRecurrenteActive} onChange={(e) => setIsRecurrenteActive(e.target.checked)} style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                <div style={{ width: '40px', height: '24px', backgroundColor: isRecurrenteActive ? 'var(--success)' : '#d1d5db', borderRadius: '9999px', transition: 'background-color 0.2s', position: 'relative' }}>
                  <div style={{ width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isRecurrenteActive ? '19px' : '3px', transition: 'left 0.2s' }}></div>
                </div>
              </div>
            </label>
          </div>

          {isRecurrenteActive && (
            <>
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
            </>
          )}

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
