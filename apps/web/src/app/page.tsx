'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Redirigir según el rol
        if (data.user?.role === 'SUPERADMIN') {
          router.push('/superadmin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setErrorMsg(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-glass-panel">
        
        <div className="login-header">
          <div className="login-logo">
            <ShoppingCart size={28} />
          </div>
          <h1 className="login-title">Comerza</h1>
          <p className="login-subtitle">Gestión inteligente de ventas y cobros</p>
        </div>
        
        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="login-input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="login-input-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <button className="login-submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 size={20} className="animate-spin" /> Autenticando...</>
            ) : (
              <>Ingresar al Sistema <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="login-demo-hint">
          <p>Credenciales de prueba:</p>
          <p><strong>admin@micomercio.com</strong> (Admin Tienda)</p>
          <p><strong>admin@comerza.com</strong> (SuperAdmin Plataforma)</p>
        </div>

      </div>
    </div>
  );
}
