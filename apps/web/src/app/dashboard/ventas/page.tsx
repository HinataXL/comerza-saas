'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, User, Link as LinkIcon, SmartphoneNfc, CheckCircle2 } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';
import styles from './page.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface Customer {
  id: string;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PosPage() {
  const router = useRouter();
  const { showAlert } = useDialog();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
  
  const [activeMode, setActiveMode] = useState<'cart' | 'quick'>('cart');
  const [quickAmount, setQuickAmount] = useState<string>('');
  const [quickDescription, setQuickDescription] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  
  const [isNfcWaiting, setIsNfcWaiting] = useState(false);
  const [nfcSaleId, setNfcSaleId] = useState<string | null>(null);
  const [nfcAmount, setNfcAmount] = useState<number>(0);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [prodRes, custRes, meRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/customers', { credentials: 'include' }),
        fetch('/api/auth/me', { credentials: 'include' })
      ]);
      
      if (prodRes.status === 401 || custRes.status === 401) {
        router.push('/');
        return;
      }

      if (prodRes.ok) setProducts(await prodRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (meRes.ok) {
        const data = await meRes.json();
        if (data.tenant?.features) {
          setAllowedFeatures(data.tenant.features);
        }
      }
    } catch (err) {
      console.error('Error loading POS data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const subtotal = useMemo(() => {
    if (activeMode === 'quick') {
      return parseFloat(quickAmount) || 0;
    }
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cart, activeMode, quickAmount]);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.product.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNfcWaiting && nfcSaleId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/sales/${nfcSaleId}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'COMPLETED') {
              setIsNfcWaiting(false);
              setNfcSuccess(true);
              clearInterval(interval);
            } else if (data.status === 'FAILED') {
              setIsNfcWaiting(false);
              showAlert('Error de NFC', 'El cobro NFC fue rechazado o falló.', 'error');
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isNfcWaiting, nfcSaleId]);

  const handleCheckout = async () => {
    if (activeMode === 'cart' && cart.length === 0) return;
    if (activeMode === 'quick' && (!quickAmount || parseFloat(quickAmount) <= 0 || !quickDescription)) {
      showAlert('Datos Inválidos', 'Debes ingresar un monto válido y una descripción para el cobro rápido.', 'warning');
      return;
    }
    
    setIsProcessing(true);
    try {
      const url = activeMode === 'cart' ? '/api/sales' : '/api/sales/quick';
      const payload = activeMode === 'cart' 
        ? {
            customerId: selectedCustomerId || undefined,
            paymentMethod,
            items: cart.map(item => ({
              productId: item.product.id,
              quantity: item.quantity
            }))
          }
        : {
            amount: parseFloat(quickAmount),
            description: quickDescription,
            customerId: selectedCustomerId || undefined,
            paymentMethod,
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error processing sale');
      }

      const data = await res.json();

      if (paymentMethod === 'Recurrente NFC') {
        setNfcSaleId(data.id);
        setNfcAmount(subtotal);
        setIsNfcWaiting(true);
        // Clean form
        setCart([]);
        setQuickAmount('');
        setQuickDescription('');
        fetchData();
        return;
      }

      if (data.paymentLink) {
        setGeneratedLink(data.paymentLink);
        setCart([]);
        setQuickAmount('');
        setQuickDescription('');
        setSelectedCustomerId('');
        setPaymentMethod('Efectivo');
        fetchData();
        return;
      }

      showAlert('Venta Completada', '¡Venta completada con éxito!', 'success');
      setCart([]);
      setQuickAmount('');
      setQuickDescription('');
      setSelectedCustomerId('');
      setPaymentMethod('Efectivo');
      fetchData(); // Refresh stock
    } catch (err: any) {
      showAlert('Error en la venta', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex-center" style={{ height: '100%' }}><p className="text-secondary">Cargando POS...</p></div>;
  }

  return (
    <div className={styles.posContainer}>
      {/* Left Pane - Products or Quick Pay */}
      <div className={styles.leftPane}>
        <div className={styles.header} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Punto de Venta</h2>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              <button 
                className={`btn ${activeMode === 'cart' ? 'btn-primary' : ''}`} 
                style={activeMode !== 'cart' ? { background: 'transparent', color: '#64748b', border: 'none', boxShadow: 'none' } : {}}
                onClick={() => setActiveMode('cart')}
              >
                Carrito
              </button>
              <button 
                className={`btn ${activeMode === 'quick' ? 'btn-primary' : ''}`} 
                style={activeMode !== 'quick' ? { background: 'transparent', color: '#64748b', border: 'none', boxShadow: 'none' } : {}}
                onClick={() => setActiveMode('quick')}
              >
                Cobro Rápido
              </button>
            </div>
          </div>
          
          {activeMode === 'cart' && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {activeMode === 'cart' ? (
          <div className={styles.productsGrid}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={`${styles.productCard} ${product.stock <= 0 ? styles.disabled : ''}`}
              onClick={() => handleAddToCart(product)}
            >
              <div style={{ height: '120px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden' }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src="/logo.png" alt="Comerza" style={{ width: '40%', height: 'auto', opacity: 0.3, objectFit: 'contain' }} />
                )}
              </div>
              <div>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productPrice}>Q{product.price.toFixed(2)}</div>
              </div>
              <div className={styles.productStock}>
                {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>
              No se encontraron productos.
            </div>
          )}
        </div>
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: '#fff', border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#1e293b' }}>Cobro Directo</h3>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '1.125rem' }}>Monto a Cobrar (Q)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="0.00" 
                  style={{ fontSize: '2rem', height: '4rem', textAlign: 'center', fontWeight: 'bold' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción del cobro</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  placeholder="Ej. Servicio de consultoría" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Pane - Cart */}
      <div className={styles.rightPane}>
        <div className={styles.cartContainer}>
          <div className={styles.cartHeader}>
            <div className="flex-row">
              <ShoppingCart size={20} className="text-primary"/>
              <span>Resumen de Venta</span>
            </div>
          </div>
          
          <div className={styles.cartItems}>
            {activeMode === 'quick' ? (
              <div className={styles.emptyCart}>
                <CreditCard size={48} opacity={0.5} />
                <p>Modo de cobro rápido activo</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>El monto a cobrar es: Q{subtotal.toFixed(2)}</p>
              </div>
            ) : cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <ShoppingCart size={48} opacity={0.5} />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className={styles.cartItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src="/logo.png" alt="Comerza" style={{ width: '60%', height: 'auto', opacity: 0.3, objectFit: 'contain' }} />
                      )}
                    </div>
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemTitle}>{item.product.name}</div>
                      <div className={styles.cartItemPrice}>
                        Q{item.product.price.toFixed(2)} x {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cartItemControls}>
                    <button className={styles.qtyBtn} onClick={() => handleUpdateQuantity(item.product.id, -1)}><Minus size={14}/></button>
                    <span className={styles.qtyText}>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => handleUpdateQuantity(item.product.id, 1)}><Plus size={14}/></button>
                    <button className={styles.removeBtn} onClick={() => handleRemoveFromCart(item.product.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.controlGroup}>
              <label className="form-label flex-row"><User size={16}/> Cliente</label>
              <select 
                className="form-input" 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Consumidor Final</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label className="form-label flex-row"><CreditCard size={16}/> Método de Pago</label>
              <select 
                className="form-input" 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                {allowedFeatures.includes('Integraciones') && (
                  <>
                    <option value="Link de pago">Link de Pago (QPayPro)</option>
                    <option value="Recurrente NFC">Terminal NFC (Recurrente)</option>
                  </>
                )}
              </select>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total a Cobrar</span>
              <span className="text-primary">Q{subtotal.toFixed(2)}</span>
            </div>

            <button 
              className={`btn btn-primary ${styles.checkoutBtn}`} 
              onClick={handleCheckout}
              disabled={(activeMode === 'cart' && cart.length === 0) || (activeMode === 'quick' && !quickAmount) || isProcessing}
            >
              {isProcessing ? 'Procesando...' : (paymentMethod === 'Recurrente NFC' ? 'Cobrar con NFC' : 'Completar Venta')}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Link Modal */}
      {generatedLink && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <LinkIcon size={24} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Link de Pago Generado</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
              La venta ha sido registrada como pendiente. Comparte este link con tu cliente para recibir el pago.
            </p>
            
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px', marginBottom: '1.5rem', wordBreak: 'break-all', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              {generatedLink}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                showAlert('Copiado', '¡Link copiado al portapapeles!', 'success');
              }}>
                Copiar Link
              </button>
              <button className="btn btn-primary" onClick={() => setGeneratedLink(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurrente NFC Modal */}
      {isNfcWaiting && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' }}>
              <SmartphoneNfc size={32} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Acerque la tarjeta</h3>
            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Acerca la tarjeta o teléfono del cliente al dispositivo configurado con Recurrente POS para procesar el pago.
            </p>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '1.125rem', fontWeight: 'bold' }}>
              Cobrando: Q{nfcAmount.toFixed(2)}
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>Esperando confirmación en tiempo real...</p>
          </div>
        </div>
      )}

      {/* Recurrente NFC Success Modal */}
      {nfcSuccess && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#10b981', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: '#10b981' }}>¡Pago Aprobado!</h3>
            <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              El pago NFC con Recurrente se procesó correctamente.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setNfcSuccess(false)}>
              Cerrar y Continuar
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}} />
    </div>
  );
}
