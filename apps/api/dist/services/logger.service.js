"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const prisma_1 = require("../lib/prisma");
exports.logger = {
    async log(level, data) {
        let payload;
        if (typeof data === 'string') {
            payload = { message: data };
        }
        else {
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
        }
        else {
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
            await prisma_1.prisma.systemLog.create({
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
        }
        catch (e) {
            process.stdout.write(`[LOGGER_ERROR] Failed to save log to DB: ${e.message}\n`);
        }
    },
    info(data, context) {
        if (typeof data === 'string') {
            return this.log('INFO', { message: data, context });
        }
        return this.log('INFO', data);
    },
    warn(data, context) {
        if (typeof data === 'string') {
            return this.log('WARN', { message: data, context });
        }
        return this.log('WARN', data);
    },
    error(data, context) {
        if (typeof data === 'string') {
            return this.log('ERROR', { message: data, context });
        }
        return this.log('ERROR', data);
    },
    serverError(data, context) {
        if (typeof data === 'string') {
            return this.log('SERVER_ERROR', { message: data, context });
        }
        return this.log('SERVER_ERROR', data);
    }
};
