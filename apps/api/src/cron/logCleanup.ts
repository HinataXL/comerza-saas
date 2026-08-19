import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../services/logger.service';

// Ejecutar todos los días a las 3:00 AM
export const startLogCleanupCron = () => {
  cron.schedule('0 3 * * *', async () => {
    logger.info('Iniciando limpieza automática de logs antiguos...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.systemLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      logger.info(`Limpieza completada. Se eliminaron ${result.count} logs antiguos (más de 30 días).`);
    } catch (error) {
      logger.serverError({
        message: 'Error al ejecutar la limpieza de logs',
        context: error,
        origin: 'logCleanup.ts'
      });
    }
  });
  
  logger.info('Cron job de limpieza de logs programado (diario 3:00 AM).');
};
