import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../services/logger.service';

export const getSystemLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Límite por defecto
    });

    const total = await prisma.systemLog.count();
    const errors = await prisma.systemLog.count({ where: { level: 'ERROR' } });
    const warnings = await prisma.systemLog.count({ where: { level: 'WARN' } });
    const serverErrors = await prisma.systemLog.count({ where: { level: 'SERVER_ERROR' } });

    res.json({
      success: true,
      data: logs,
      stats: {
        total,
        errors: errors + serverErrors,
        warnings
      }
    });
  } catch (error) {
    logger.serverError({
      message: 'Error fetch system logs',
      context: error,
      origin: 'logs.controller.ts'
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createPublicLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, message, context, path, origin, user } = req.body;
    
    // Default to WARN if not specified
    const validLevel = ['INFO', 'WARN', 'ERROR', 'SERVER_ERROR'].includes(level) ? level : 'WARN';

    // Evitar que saturen el log (rate limit básico o límite de tamaño)
    if (!message || message.length > 5000) {
      res.status(400).json({ success: false });
      return;
    }

    await logger.log(validLevel as any, {
      message,
      context,
      user: user || 'Usuario no identificado',
      req, // Pasa el request para capturar la IP
      path,
      origin: origin || 'Frontend / Client'
    });

    res.json({ success: true });
  } catch (error) {
    // Falla silenciosa para evitar loop
    process.stdout.write(`[LOGGER_API_ERROR] ${error}\n`);
    res.status(500).json({ success: false });
  }
};
