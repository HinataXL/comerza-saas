'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, ShoppingCart, Edit3, CheckCircle, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Link from 'next/link';
import '../recibos.css';

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Sale {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  tenant?: {
    name: string;
    logoUrl?: string;
    receiptTemplate?: string;
  };
  user?: {
    name: string;
  };
  items: SaleItem[];
}

export default function ReciboDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNote, setEditNote] = useState('Este documento es un comprobante de pago no contable y no tiene valor fiscal.');
  const [editFooter, setEditFooter] = useState('¡Gracias por su preferencia!');

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await fetch(`/api/sales/${resolvedParams.id}`, { credentials: 'include' });
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSale(data);
          setEditName(data.customer?.name || 'Consumidor Final');
          setEditEmail(data.customer?.email || '');
          setEditPhone(data.customer?.phone || '');
        } else {
          router.push('/dashboard/recibos');
        }
      } catch (error) {
        console.error('Error fetching sale details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSale();
  }, [resolvedParams.id, router]);

  if (isLoading) {
    return <div className="flex-center" style={{ height: '100vh' }}><p className="text-secondary">Generando recibo...</p></div>;
  }

  if (!sale) return null;

  const handleWhatsAppShare = async () => {
    // 1. Generar el PDF
    const element = document.getElementById('receipt-content');
    if (element) {
      setIsLoading(true); // Mostrar algo de feedback visual
      try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const isTicket = sale.tenant?.receiptTemplate === 'TICKET';
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: isTicket ? [canvas.width / 2, canvas.height / 2] : 'a4'
        });

        if (isTicket) {
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        } else {
          // Escalar para A4
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        
        // Descargar automáticamente el archivo
        pdf.save(`Recibo-${sale.id.slice(0, 8)}.pdf`);
      } catch (error) {
        console.error('Error generando PDF:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // 2. Abrir WhatsApp con el texto
    const text = `*RECIBO DE COMPRA*\n*${sale.tenant?.name || 'Mi Comercio'}*\n\nHola ${editName},\nAdjunto el detalle de su compra:\n\n*Fecha:* ${new Date(sale.createdAt).toLocaleDateString()}\n*Nº Recibo:* ${sale.id.slice(0, 8).toUpperCase()}\n*Total:* Q${sale.total.toFixed(2)}\n\n${editFooter}\n\n_Por favor envíenos el PDF descargado respondiendo a este mensaje._`;
    
    const cleanPhone = editPhone.replace(/[^\d+]/g, '');
    
    // Pequeño delay para asegurar que la descarga inició antes de abrir la nueva pestaña
    setTimeout(() => {
      if (cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    }, 500);
  };

  const isTicket = sale.tenant?.receiptTemplate === 'TICKET';

  return (
    <div style={{ position: 'relative' }}>
      {/* Controles solo para pantalla, ocultos en impresión */}
      <div className="print-controls" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
        <Link href="/dashboard/recibos" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={18} /> Volver a Recibos
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-success' : 'btn-outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: isEditing ? '#dcfce7' : '', color: isEditing ? '#166534' : '', borderColor: isEditing ? '#bbf7d0' : '' }}
          >
            {isEditing ? <><CheckCircle size={18} /> Terminar Edición</> : <><Edit3 size={18} /> Modo Edición</>}
          </button>
          <button 
            onClick={handleWhatsAppShare}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#25D366', borderColor: '#25D366' }}
          >
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={18} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Contenedor del recibo */}
      <div className="receipt-wrapper">
        <div id="receipt-content" className={`receipt-container ${isTicket ? 'ticket' : 'classic'}`}>
          
          <div className="receipt-header">
            <div style={{ width: isTicket ? '100%' : 'auto' }}>
              <div className="receipt-logo">
                {sale.tenant?.logoUrl ? (
                  <img src={`${sale.tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '60px', maxWidth: '200px' }} />
                ) : (
                  <><ShoppingCart size={28} /> {sale.tenant?.name || 'Mi Comercio'}</>
                )}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Comprobante No Contable
              </p>
            </div>
            <div style={{ textAlign: isTicket ? 'center' : 'right', marginTop: isTicket ? '1rem' : '0' }}>
              <h1 className="receipt-title">RECIBO</h1>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>Nº {sale.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="receipt-info-grid">
            <div className="info-block">
              <h3>Emitido a:</h3>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" className="editable-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre del cliente" />
                  <input type="email" className="editable-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Correo electrónico" />
                  <input type="tel" className="editable-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Teléfono" />
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 600 }}>{editName}</p>
                  {editEmail && <p>{editEmail}</p>}
                  {editPhone && <p>{editPhone}</p>}
                </>
              )}
            </div>
            <div className="info-block" style={{ textAlign: isTicket ? 'center' : 'right' }}>
              <h3>Detalles del Recibo:</h3>
              <p><strong>Fecha:</strong> {new Date(sale.createdAt).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {new Date(sale.createdAt).toLocaleTimeString()}</p>
              <p><strong>Método de pago:</strong> {sale.paymentMethod || 'No especificado'}</p>
            </div>
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Cant.</th>
                <th style={{ width: '50%' }}>Descripción</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Precio</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.length > 0 ? (
                sale.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.quantity}</td>
                    <td>{item.product.name}</td>
                    <td style={{ textAlign: 'right' }}>Q{item.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>Q{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                /* Para cobros rápidos sin productos específicos */
                <tr>
                  <td>1</td>
                  <td>Cobro / Varios</td>
                  <td style={{ textAlign: 'right' }}>Q{sale.total.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>Q{sale.total.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="receipt-totals">
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>Q{sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-footer">
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <textarea className="editable-input" value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                <input type="text" className="editable-input" style={{ textAlign: 'center' }} value={editFooter} onChange={(e) => setEditFooter(e.target.value)} />
              </div>
            ) : (
              <>
                <p>{editNote}</p>
                <p style={{ marginTop: '0.5rem' }}>{editFooter}</p>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
