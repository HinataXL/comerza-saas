'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, PackageSearch, X, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({ name: '', description: '', price: 0, stock: 0 });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        credentials: 'include'
      });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [router]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
    } else {
      setIsEditing(false);
      setCurrentProduct({ name: '', description: '', price: 0, stock: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({ name: '', description: '', price: 0, stock: 0 });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `/api/products/${currentProduct.id}`
        : '/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(currentProduct)
      });

      if (!res.ok) throw new Error('Error al guardar el producto');
      
      handleCloseModal();
      fetchProducts(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="flex-center" style={{ height: 'calc(100vh - 70px)' }}><p className="text-secondary">Cargando productos...</p></div>;
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Catálogo de Productos</h2>
          <p className="text-secondary">Gestiona tu inventario y precios</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {error ? (
        <div className="card text-error" style={{ textAlign: 'center', padding: '2rem' }}>{error}</div>
      ) : products.length === 0 ? (
        <div className="card flex-center" style={{ flexDirection: 'column', padding: '4rem', gap: '1rem' }}>
          <PackageSearch size={48} className="text-muted" />
          <p className="text-secondary">Aún no hay productos en tu catálogo.</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>Crear el primero</button>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.25rem' }}>Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ paddingLeft: '1.25rem', fontWeight: 500 }}>{product.name}</td>
                  <td className="text-secondary">{product.description || '-'}</td>
                  <td style={{ fontWeight: 600 }}>Q {product.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${product.stock > 5 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-error'}`}>
                      {product.stock} und
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleOpenModal(product)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)', borderColor: 'var(--error-bg)' }} onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="modal-close" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Nombre del producto</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción (opcional)</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio (Q)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock disponible</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
