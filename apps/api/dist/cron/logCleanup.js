"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLogCleanupCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../lib/prisma");
const logger_service_1 = require("../services/logger.service");
// Ejecutar todos los días a las 3:00 AM
const startLogCleanupCron = () => {
    node_cron_1.default.schedule('0 3 * * *', async () => {
        logger_service_1.logger.info('Iniciando limpieza automática de logs antiguos...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await prisma_1.prisma.systemLog.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    }
                }
            });
            logger_service_1.logger.info(`Limpieza completada. Se eliminaron ${result.count} logs antiguos (más de 30 días).`);
        }
        catch (error) {
            logger_service_1.logger.serverError({
                message: 'Error al ejecutar la limpieza de logs',
                context: error,
                origin: 'logCleanup.ts'
            });
        }
    });
    logger_service_1.logger.info('Cron job de limpieza de logs programado (diario 3:00 AM).');
};
exports.startLogCleanupCron = startLogCleanupCron;
