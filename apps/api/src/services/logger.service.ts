import { prisma } from '../lib/prisma';
import { Request } from 'express';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SERVER_ERROR';

interface LogData {
  message: string;
  context?: any;
  user?: string;
  ip?: string;
  path?: string;
  origin?: string;
  req?: Request;
}

export const logger = {
  async log(level: LogLevel, data: LogData | string) {
    let payload: LogData;

    if (typeof data === 'string') {
      payload = { message: data };
    } else {
      payload = data;
    }

    // Always print to stdout
    const logPrefix = `[${new Date().toISOString()}] [${level}]${payload.origin ? ` [${payload.origin}]` : ''}`;
    
    if (level === 'ERROR' || level === 'SERVER_ERROR') {
      // Use standard console.error internally for actual stdout so we can see it in terminal
      process.stdout.write(`${logPrefix} ${payload.message}\n`);
      if (payload.context) {
        process.stdout.write(`${JSON.stringify(payload.context, null, 2)}\n`);
      }
    } else {
      process.stdout.write(`${logPrefix} ${payload.message}\n`);
      if (payload.context) {
        process.stdout.write(`${JSON.stringify(payload.context, null, 2)}\n`);
      }
    }

    try {
      // Intentar extraer información del Request si se proporciona
      let ip = payload.ip;
      let path = payload.path;
      
      if (payload.req) {
        ip = ip || payload.req.ip || payload.req.connection.remoteAddress;
        path = path || payload.req.originalUrl;
      }

      await prisma.systemLog.create({
        data: {
          level,
          message: payload.message,
          context: payload.context ? JSON.stringify(payload.context) : null,
          user: payload.user || 'Sistema',
          ip,
          path,
          origin: payload.origin,
        }
      });
    } catch (e) {
      process.stdout.write(`[LOGGER_ERROR] Failed to save log to DB: ${(e as Error).message}\n`);
    }
  },

  info(data: LogData | string) {
    return this.log('INFO', data);
  },

  warn(data: LogData | string) {
    return this.log('WARN', data);
  },

  error(data: LogData | string) {
    return this.log('ERROR', data);
  },

  serverError(data: LogData | string) {
    return this.log('SERVER_ERROR', data);
  }
};
