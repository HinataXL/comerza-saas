"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicLog = exports.getSystemLogs = void 0;
const prisma_1 = require("../lib/prisma");
const logger_service_1 = require("../services/logger.service");
const getSystemLogs = async (req, res) => {
    try {
        const logs = await prisma_1.prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Límite por defecto
        });
        const total = await prisma_1.prisma.systemLog.count();
        const errors = await prisma_1.prisma.systemLog.count({ where: { level: 'ERROR' } });
        const warnings = await prisma_1.prisma.systemLog.count({ where: { level: 'WARN' } });
        const serverErrors = await prisma_1.prisma.systemLog.count({ where: { level: 'SERVER_ERROR' } });
        res.json({
            success: true,
            data: logs,
            stats: {
                total,
                errors: errors + serverErrors,
                warnings
            }
        });
    }
    catch (error) {
        logger_service_1.logger.serverError({
            message: 'Error fetch system logs',
            context: error,
            origin: 'logs.controller.ts'
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSystemLogs = getSystemLogs;
const createPublicLog = async (req, res) => {
    try {
        const { level, message, context, path, origin, user } = req.body;
        // Default to WARN if not specified
        const validLevel = ['INFO', 'WARN', 'ERROR', 'SERVER_ERROR'].includes(level) ? level : 'WARN';
        // Evitar que saturen el log (rate limit básico o límite de tamaño)
        if (!message || message.length > 5000) {
            res.status(400).json({ success: false });
            return;
        }
        await logger_service_1.logger.log(validLevel, {
            message,
            context,
            user: user || 'Usuario no identificado',
            req, // Pasa el request para capturar la IP
            path,
            origin: origin || 'Frontend / Client'
        });
        res.json({ success: true });
    }
    catch (error) {
        // Falla silenciosa para evitar loop
        process.stdout.write(`[LOGGER_API_ERROR] ${error}\n`);
        res.status(500).json({ success: false });
    }
};
exports.createPublicLog = createPublicLog;
