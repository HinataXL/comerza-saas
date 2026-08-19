type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SERVER_ERROR';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: any;
  path?: string;
  origin?: string;
}

export const ClientLogger = {
  async log(payload: LogPayload) {
    try {
      const response = await fetch('/api/public/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          path: payload.path || typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          context: {
            ...payload.context,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          }
        }),
      });
      if (!response.ok) {
        console.warn('Failed to send client log');
      }
    } catch (e) {
      // Fallback silencioso para no crear loops infinitos
    }
  },

  info(message: string, context?: any) {
    this.log({ level: 'INFO', message, context, origin: 'ClientLogger' });
  },

  warn(message: string, context?: any) {
    this.log({ level: 'WARN', message, context, origin: 'ClientLogger' });
  },

  error(message: string, context?: any) {
    this.log({ level: 'ERROR', message, context, origin: 'ClientLogger' });
  }
};

export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    ClientLogger.log({
      level: 'ERROR',
      message: event.message || 'Unknown browser error',
      origin: event.filename ? `Browser Error (${event.filename}:${event.lineno})` : 'Browser Error',
      context: {
        error: event.error?.stack || event.error,
        colno: event.colno
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    ClientLogger.log({
      level: 'ERROR',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      origin: 'Unhandled Promise Rejection',
      context: {
        reason: event.reason?.stack || event.reason
      }
    });
  });
}
