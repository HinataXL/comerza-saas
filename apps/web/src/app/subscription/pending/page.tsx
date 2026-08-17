import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function SubscriptionPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Suscripción pendiente</h1>
        <p className="text-gray-600 mb-6">
          Tu suscripción está pendiente de confirmación. Te notificaremos cuando se haya completado el proceso.
        </p>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
