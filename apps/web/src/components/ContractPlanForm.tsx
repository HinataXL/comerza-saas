import React, { useState } from 'react';
import { PlanCode, CreateSubscriptionCheckoutRequest } from '../types/subscription';
import { X, Loader2 } from 'lucide-react';
import { API_URL } from '../proxy';

interface ContractPlanFormProps {
  selectedPlan: PlanCode;
  onClose: () => void;
}

export function ContractPlanForm({ selectedPlan, onClose }: ContractPlanFormProps) {
  const [formData, setFormData] = useState({
    commerceName: '',
    responsibleName: '',
    email: '',
    phone: '',
    nit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: CreateSubscriptionCheckoutRequest = {
        planCode: selectedPlan,
        ...formData
      };

      const response = await fetch(`${API_URL}/subscriptions/recurrente/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar la solicitud');
      }

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al conectar con la pasarela de pagos.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative" style={{ zIndex: 60 }}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Contratar Plan {selectedPlan === 'PRO' ? 'Pro' : 'Premium'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comercio *</label>
              <input
                type="text"
                name="commerceName"
                required
                value={formData.commerceName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Comercial El Sol"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Responsable *</label>
              <input
                type="text"
                name="responsibleName"
                required
                value={formData.responsibleName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Carlos Méndez"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="cliente@correo.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. 55555555"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIT (Opcional)</label>
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. 123456-7"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                'Ir al pago seguro'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
