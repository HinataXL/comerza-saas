'use client';
import { useEffect, useState } from 'react';
import { Layers, ShieldCheck, Loader2 } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';

interface PlanConfig {
  id: string;
  name: string;
  features: string; // JSON string
}

const ALL_MODULES = [
  'Ventas', 'Cobros', 'Pagos', 'Recibos', 
  'Catálogo', 'Clientes', 'Reportes', 'Integraciones', 'Configuración'
];

export default function SuperAdminPlanes() {
  const { showAlert } = useDialog();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/superadmin/plans', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleFeature = (planName: string, feature: string) => {
    setPlans(prev => prev.map(p => {
      if (p.name !== planName) return p;
      const currentFeatures: string[] = JSON.parse(p.features);
      let newFeatures;
      if (currentFeatures.includes(feature)) {
        newFeatures = currentFeatures.filter(f => f !== feature);
      } else {
        newFeatures = [...currentFeatures, feature];
      }
      return { ...p, features: JSON.stringify(newFeatures) };
    }));
  };

  const handleSave = async (planName: string) => {
    setSavingPlan(planName);
    const plan = plans.find(p => p.name === planName);
    if (!plan) return;

    try {
      const res = await fetch(`/api/superadmin/plans/${planName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: JSON.parse(plan.features) }),
        credentials: 'include'
      });
      if (res.ok) {
        showAlert('Éxito', `Configuración del plan ${planName} guardada correctamente.`, 'success');
      } else {
        showAlert('Error', 'Error al guardar configuración', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Error de red', 'error');
    } finally {
      setSavingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
        <p>Cargando planes y permisos...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fdf4ff', padding: '0.75rem', borderRadius: '12px' }}>
          <Layers size={24} color="#c026d3" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Gestión de Planes</h1>
          <p style={{ color: '#64748b', margin: 0, marginTop: '0.25rem' }}>Configura los módulos accesibles para cada plan</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map(plan => {
          const enabledFeatures: string[] = JSON.parse(plan.features);
          const isPremium = plan.name === 'PREMIUM';
          
          return (
            <div key={plan.id} style={{ 
              background: 'white', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              border: isPremium ? '2px solid #f0abfc' : '1px solid #e2e8f0'
            }}>
              {/* Card Header */}
              <div style={{ 
                background: isPremium ? 'linear-gradient(to right, #fdf4ff, #fae8ff)' : '#f8fafc',
                padding: '1.5rem',
                borderBottom: isPremium ? '1px solid #f5d0fe' : '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: isPremium ? '#a21caf' : '#0f172a', margin: 0 }}>
                    Plan {plan.name}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, marginTop: '0.25rem' }}>
                    {enabledFeatures.length} módulos habilitados
                  </p>
                </div>
                {isPremium && <ShieldCheck size={28} color="#d946ef" />}
              </div>

              {/* Card Body - Checkboxes */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ALL_MODULES.map(moduleName => {
                  const isEnabled = enabledFeatures.includes(moduleName);
                  return (
                    <label key={moduleName} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                      background: isEnabled ? '#f8fafc' : 'transparent'
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: isEnabled ? 600 : 400, color: isEnabled ? '#0f172a' : '#64748b' }}>
                        {moduleName}
                      </span>
                      
                      {/* Custom Toggle Switch */}
                      <div style={{
                        width: '40px',
                        height: '24px',
                        background: isEnabled ? (isPremium ? '#d946ef' : '#3b82f6') : '#cbd5e1',
                        borderRadius: '12px',
                        position: 'relative',
                        transition: 'background 0.3s'
                      }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          background: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '3px',
                          left: isEnabled ? '19px' : '3px',
                          transition: 'left 0.3s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isEnabled}
                        onChange={() => handleToggleFeature(plan.name, moduleName)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button 
                  onClick={() => handleSave(plan.name)}
                  disabled={savingPlan === plan.name}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: isPremium ? '#d946ef' : '#3b82f6', 
                    color: 'white', 
                    fontWeight: 'bold',
                    cursor: savingPlan === plan.name ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: savingPlan === plan.name ? 0.7 : 1
                  }}
                >
                  {savingPlan === plan.name ? <Loader2 size={18} className="animate-spin" /> : null}
                  Guardar Cambios
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
