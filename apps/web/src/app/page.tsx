'use client';
import Link from 'next/link';
import { 
  ShoppingCart, ShieldCheck, CheckCircle2, 
  MessageCircle, Link as LinkIcon, BarChart2, FileText,
  LayoutDashboard, Wallet, CreditCard, Package, Users,
  Zap, Eye, ArrowRight, Check
} from 'lucide-react';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-body">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <ShoppingCart size={28} color="#2563eb" />
          <span>Comerza</span>
        </div>
        <nav className="landing-nav">
          <Link href="#inicio">Inicio</Link>
          <Link href="#funciones">Funciones</Link>
          <Link href="#precios">Precios</Link>
          <Link href="#demo">Demo</Link>
          <Link href="#contacto">Contacto</Link>
        </nav>
        <div className="landing-header-actions">
          <Link href="/login" className="btn-outline" style={{ border: 'none' }}>Iniciar Sesión</Link>
          <Link href="/login" className="btn-primary">Solicitar demo</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="inicio">
        <div className="hero-content">
          <div className="hero-badge">
            <CheckCircle2 size={16} /> Hecho para comerciantes en Guatemala
          </div>
          <h1 className="hero-title">
            Controla tus ventas, cobros y pagos desde un solo panel.
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#334155', marginBottom: '1rem', lineHeight: 1.4 }}>
            Vende, cobra y controla tu negocio desde un solo panel.
          </h2>
          <p className="hero-description">
            Comerza ayuda a comercios en Guatemala a organizar ventas, clientes, links de pago, cobros pendientes y reportes sin depender de cuadernos o Excel.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Solicitar demo <ArrowRight size={18} />
            </Link>
            <Link href="#precios" className="btn-outline">Ver planes</Link>
          </div>
          <div className="hero-features">
            <div className="hero-feature-item">
              <CheckCircle2 size={16} color="#2563eb" /> Fácil de usar
            </div>
            <div className="hero-feature-item">
              <ShieldCheck size={16} color="#2563eb" /> Tus datos seguros
            </div>
            <div className="hero-feature-item">
              <CheckCircle2 size={16} color="#2563eb" /> Soporte en Guatemala
            </div>
          </div>
        </div>
        <div className="hero-image">
          {/* A placeholder for the dashboard screenshot shown in the image */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            aspectRatio: '16/10',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
            <div style={{ padding: '2rem', flex: 1, display: 'flex', gap: '2rem' }}>
               <div style={{ width: '150px', background: '#f8fafc', borderRadius: '8px' }}></div>
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div style={{ height: '60px', background: '#f8fafc', borderRadius: '8px' }}></div>
                 <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px' }}></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon"><MessageCircle size={24} /></div>
            <div>
              <div className="benefit-title">Ideal para ventas por WhatsApp</div>
              <div className="benefit-desc">Registra pedidos y clientes sin salir de la conversación.</div>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><LinkIcon size={24} /></div>
            <div>
              <div className="benefit-title">Links de pago</div>
              <div className="benefit-desc">Cobra fácil y rápido con links de pago seguros.</div>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><BarChart2 size={24} /></div>
            <div>
              <div className="benefit-title">Reportes claros</div>
              <div className="benefit-desc">Métricas simples para entender tu negocio al instante.</div>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon"><FileText size={24} /></div>
            <div>
              <div className="benefit-title">Preparado para FEL</div>
              <div className="benefit-desc">Emite facturas electrónicas sin complicaciones.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="modules-section" id="funciones">
        <h2 className="section-title">No solo un POS: una plataforma centralizada para tu negocio</h2>
        <div className="modules-grid">
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><ShoppingCart size={24} /></div>
              <div className="module-title">Ventas Centralizadas</div>
            </div>
            <div className="module-desc">Ya sea en tienda física, WhatsApp o POS, gestiona todas tus ventas del día.</div>
            <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ventas del día</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Q 8,420</div>
              <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.25rem' }}>↑ +8.2% vs. ayer</div>
            </div>
          </div>
          
          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><Wallet size={24} /></div>
              <div className="module-title">Cobros</div>
            </div>
            <div className="module-desc">Lleva el control de cobros, saldos pendientes y recuperación.</div>
            <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cobros pendientes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Q 18,920</div>
              <div style={{ fontSize: '0.75rem', color: '#eab308', marginTop: '0.25rem' }}>⚠ 12 por vencer</div>
            </div>
          </div>

          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><CreditCard size={24} /></div>
              <div className="module-title">Pagos</div>
            </div>
            <div className="module-desc">Registra tus pagos a proveedores y otros gastos del negocio.</div>
          </div>

          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Package size={24} /></div>
              <div className="module-title">Inventario</div>
            </div>
            <div className="module-desc">Controla tu inventario, entradas, salidas y alertas de stock.</div>
          </div>

          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Users size={24} /></div>
              <div className="module-title">Clientes</div>
            </div>
            <div className="module-desc">Administra tus clientes y su historial de compras y pagos.</div>
          </div>

          <div className="module-card">
            <div className="module-header">
              <div className="module-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}><FileText size={24} /></div>
              <div className="module-title">Reportes</div>
            </div>
            <div className="module-desc">Visualiza el desempeño de tu negocio con reportes listos.</div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why-section">
        <h2 className="section-title">¿Por qué Comerza?</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon" style={{ color: '#22c55e', background: '#f0fdf4' }}><CheckCircle2 size={32} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Menos desorden</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Centraliza ventas, cobros y pagos en una sola plataforma.</div>
            </div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ color: '#3b82f6', background: '#eff6ff' }}><ShieldCheck size={32} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Más control</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Toma decisiones con información confiable y en tiempo real.</div>
            </div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ color: '#a855f7', background: '#faf5ff' }}><Zap size={32} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Cobros más rápidos</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Links de pago y recordatorios para cobrar sin complicaciones.</div>
            </div>
          </div>
          <div className="why-card">
            <div className="why-icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><Eye size={32} /></div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Visibilidad del negocio</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Entiende cómo va tu negocio desde cualquier lugar.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <h2 className="section-title">Así de fácil funciona Comerza</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Registra tu venta</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Añade clientes, productos e importes en pocos segundos.</div>
          </div>
          <ArrowRight className="step-arrow" size={32} style={{ left: '30%' }} />
          <div className="step-card">
            <div className="step-number" style={{ background: '#f0fdf4', color: '#16a34a' }}>2</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Genera tu cobro o link de pago</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Envía a tu cliente y recibe el pago de forma segura.</div>
          </div>
          <ArrowRight className="step-arrow" size={32} style={{ left: '63%' }} />
          <div className="step-card">
            <div className="step-number" style={{ background: '#f5f3ff', color: '#7c3aed' }}>3</div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Da seguimiento y revisa tus reportes</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Monitorea cobros, ventas e inventario en tiempo real.</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="precios">
        <h2 className="section-title">Planes que se adaptan a tu negocio</h2>
        <div className="pricing-grid">
          
          <div className="pricing-card">
            <div className="pricing-title">Básico</div>
            <div className="pricing-desc">Ideal para empezar a ordenar tu negocio.</div>
            <div className="pricing-price">Q99<span>/mes</span></div>
            <ul className="pricing-features">
              <li><Check size={18} color="#22c55e" /> Ventas y cobros ilimitados</li>
              <li><Check size={18} color="#22c55e" /> Links de pago</li>
              <li><Check size={18} color="#22c55e" /> Clientes y productos ilimitados</li>
              <li><Check size={18} color="#22c55e" /> Reportes básicos</li>
              <li><Check size={18} color="#22c55e" /> Soporte por WhatsApp</li>
            </ul>
            <Link href="/login" className="btn-outline" style={{ textAlign: 'center', width: '100%', display: 'block', padding: '0.75rem' }}>Elegir plan</Link>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Más popular</div>
            <div className="pricing-title">Negocio</div>
            <div className="pricing-desc">Para negocios en crecimiento.</div>
            <div className="pricing-price">Q149<span>/mes</span></div>
            <ul className="pricing-features">
              <li><Check size={18} color="#2563eb" /> Todo lo del plan Básico</li>
              <li><Check size={18} color="#2563eb" /> Inventario con alertas</li>
              <li><Check size={18} color="#2563eb" /> Facturación FEL Incluida</li>
              <li><Check size={18} color="#2563eb" /> Reportes avanzados</li>
              <li><Check size={18} color="#2563eb" /> Soporte prioritario</li>
            </ul>
            <Link href="/login" className="btn-primary" style={{ textAlign: 'center', width: '100%', display: 'block', padding: '0.75rem' }}>Elegir plan</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-title">Pro</div>
            <div className="pricing-desc">Para negocios que necesitan más.</div>
            <div className="pricing-price">Q299<span>/mes</span></div>
            <ul className="pricing-features">
              <li><Check size={18} color="#22c55e" /> Todo lo del plan Negocio</li>
              <li><Check size={18} color="#22c55e" /> Multiusuarios</li>
              <li><Check size={18} color="#22c55e" /> Integraciones con pasarelas</li>
              <li><Check size={18} color="#22c55e" /> Exportación de datos</li>
              <li><Check size={18} color="#22c55e" /> Soporte dedicado</li>
            </ul>
            <Link href="/login" className="btn-outline" style={{ textAlign: 'center', width: '100%', display: 'block', padding: '0.75rem' }}>Elegir plan</Link>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-footer">
        <div className="cta-box">
          <div>
            <h3>Empieza a ordenar tu comercio hoy</h3>
            <p>Agenda una demo gratuita y descubre cómo Comerza puede ayudarte a vender más y cobrar mejor.</p>
          </div>
          <div>
            <Link href="/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Agenda una demo <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <div className="footer-logo">
              <ShoppingCart size={24} color="#2563eb" /> Comerza
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Ventas, cobros y pagos para comercios modernos en Guatemala.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: '#64748b' }}>
              <span>Facebook</span>
              <span>Instagram</span>
              <span>Twitter</span>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Producto</h4>
            <ul>
              <li><Link href="#funciones">Funciones</Link></li>
              <li><Link href="#precios">Precios</Link></li>
              <li><Link href="#demo">Demo</Link></li>
              <li><Link href="#">Actualizaciones</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><Link href="#">Sobre nosotros</Link></li>
              <li><Link href="#">Contacto</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Trabaja con nosotros</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Recursos</h4>
            <ul>
              <li><Link href="#">Centro de ayuda</Link></li>
              <li><Link href="#">Guías</Link></li>
              <li><Link href="#">Preguntas frecuentes</Link></li>
              <li><Link href="#">Estado del sistema</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contáctanos</h4>
            <ul style={{ color: '#64748b', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>WhatsApp: +502 0000 0000</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>hola@comerza.com</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Guatemala, Guatemala</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div>&copy; 2026 Comerza. Todos los derechos reservados.</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="#">Términos y condiciones</Link>
            <Link href="#">Política de privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
