import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { logger } from '../services/logger.service';
import { sendCronExecutionEmail } from '../services/email.service';

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

      const message = `Limpieza completada. Se eliminaron ${result.count} logs antiguos (más de 30 días).`;
      logger.info(message);

      // Enviar correo de confirmación al administrador
      await sendCronExecutionEmail({
        toEmail: 'erick.pedroza@fixss.com',
        subject: `[Cron] Limpieza de System Logs (${result.count} eliminados)`,
        message: message,
        deletedCount: result.count
      });

    } catch (error) {
      logger.serverError('Error al ejecutar la limpieza de logs', error);
    }
  });
  
  logger.info('Cron job de limpieza de logs programado (diario 3:00 AM).');
};
