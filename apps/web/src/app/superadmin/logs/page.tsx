'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Log {
  id: string;
  level: string;
  message: string;
  context: string | null;
  user: string | null;
  ip: string | null;
  path: string | null;
  origin: string | null;
  createdAt: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, errors: 0, warnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/superadmin/logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelStyle = (level: string) => {
    if (level === 'ERROR' || level === 'SERVER_ERROR') return 'bg-red-100 text-red-800';
    if (level === 'WARN') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[#00d0f1] font-bold text-sm tracking-wider uppercase mb-1">Administración</h2>
          <h1 className="text-3xl font-extrabold text-[#0B152A] mb-2">Errores del sistema</h1>
          <p className="text-gray-500 text-sm">Registro técnico de fallos del navegador y del servidor, URL, usuario y contexto.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/superadmin/audit" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Ver auditoría
          </Link>
          <Link href="/superadmin" className="px-4 py-2 bg-[#ffcc00] text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-sm">
            Volver al panel
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">Registros</p>
          <p className="text-5xl font-black text-[#0B152A]">{loading ? '-' : stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">Errores</p>
          <p className="text-5xl font-black text-[#0B152A]">{loading ? '-' : stats.errors}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">Advertencias</p>
          <p className="text-5xl font-black text-[#0B152A]">{loading ? '-' : stats.warnings}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#0B152A] mb-2">Como usar este módulo</h3>
        <p className="text-gray-500 text-sm mb-1">
          Los errores del navegador y las pantallas de error del servidor se guardan aqui con contexto para revisar pantalla afectada, usuario, navegador, ruta y detalle técnico sin depender de capturas.
        </p>
        <p className="text-gray-500 text-sm">
          Para depuración local se puede activar <span className="font-bold text-[#00d0f1]">insightsDebug=true</span> en localStorage.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase">Fecha</th>
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase">Nivel</th>
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase">Usuario</th>
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase w-1/4">Pantalla</th>
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase w-1/4">Mensaje</th>
                <th className="py-4 px-6 text-xs font-bold text-[#00d0f1] uppercase">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">Cargando registros...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No hay registros en el sistema</td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedContext: any = {};
                  try {
                    parsedContext = log.context ? JSON.parse(log.context) : {};
                  } catch (e) {}

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('es-ES', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit' 
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getLevelStyle(log.level)}`}>
                          {log.level === 'SERVER_ERROR' ? 'server.error' : log.level}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0B152A]">{log.user || 'Usuario no identificado'}</div>
                        {log.ip && <div className="text-gray-400 text-xs mt-1">{log.ip}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-300 font-mono text-xs mb-1 truncate max-w-[200px]" title={log.path || '-'}>
                          {log.path || '-'}
                        </div>
                        {parsedContext.userAgent && (
                          <div className="text-gray-500 text-xs line-clamp-2" title={parsedContext.userAgent}>
                            {parsedContext.userAgent}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#0B152A]">{log.message}</div>
                        {parsedContext.error && (
                          <div className="text-gray-500 text-xs mt-1 truncate max-w-[250px]" title={String(parsedContext.error)}>
                            {String(parsedContext.error)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-xs">
                        <div className="font-medium">{log.origin || 'Sistema'}</div>
                        {parsedContext.colno !== undefined && (
                          <div className="text-gray-400 mt-1">Columna: {parsedContext.colno}</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
