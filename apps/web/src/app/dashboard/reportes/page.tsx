import ReportesClient from './ReportesClient';

export const metadata = {
  title: 'Reportes | Comerza POS',
  description: 'Reportes y análisis de ventas de tu negocio',
};

export default function ReportesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes y Estadísticas</h1>
      <ReportesClient />
    </div>
  );
}
