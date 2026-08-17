import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago en proceso!</h1>
        <p className="text-gray-600 mb-6">
          Estamos validando tu suscripción. Si el pago fue aprobado, activaremos tu cuenta en breve y recibirás un correo de confirmación.
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
