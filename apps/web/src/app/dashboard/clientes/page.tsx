'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, X, Edit, Trash2, Search } from 'lucide-react';
import { useDialog } from '@/components/providers/DialogProvider';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function CustomersPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useDialog();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({ name: '', email: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [router]);

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setIsEditing(true);
      setCurrentCustomer({ ...customer, email: customer.email || '', phone: customer.phone || '' });
    } else {
      setIsEditing(false);
      setCurrentCustomer({ name: '', email: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer({ name: '', email: '', phone: '' });
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const url = isEditing 
        ? `/api/customers/${currentCustomer.id}`
        : '/api/customers';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(currentCustomer)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar el cliente');
      }
      
      handleCloseModal();
      fetchCustomers();
    } catch (err: any) {
      showAlert('Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    showConfirm('Eliminar Cliente', '¿Estás seguro de eliminar este cliente? No se podrá eliminar si tiene ventas asociadas.', async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al eliminar cliente');
        }
        fetchCustomers();
      } catch (err: any) {
        showAlert('Error', err.message, 'error');
      }
    });
  };

  if (isLoading) return <div className="flex-center" style={{ height: '50vh' }}><p className="text-secondary">Cargando clientes...</p></div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Gestión de Clientes</h1>
          <p className="text-secondary text-sm">Administra tu cartera de clientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar cliente por nombre..." 
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="flex-center" style={{ padding: '4rem 2rem', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: '50%' }}>
              <Users size={32} className="text-muted" />
            </div>
            <p className="text-secondary">No hay clientes registrados que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{customer.name}</span>
                    </td>
                    <td>{customer.email || <span className="text-muted">-</span>}</td>
                    <td>{customer.phone || <span className="text-muted">-</span>}</td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <div className="flex-row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={() => handleOpenModal(customer)}>
                          <Edit size={16} className="text-secondary" />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem', borderColor: 'transparent' }} onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 size={16} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem' }}>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button className="modal-close" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveCustomer}>
              <div className="form-group">
                <label className="form-label">Nombre del Cliente *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="Ej. Juan Pérez"
                  value={currentCustomer.name}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="juan@ejemplo.com"
                    value={currentCustomer.email || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+502 1234 5678"
                    value={currentCustomer.phone || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Cliente')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
