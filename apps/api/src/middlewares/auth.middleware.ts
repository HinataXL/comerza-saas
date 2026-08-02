import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId: string;
    impersonatedBy?: string;
    [key: string]: any;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided, authorization denied' });
    return;
  }

  try {
    const decoded: any = verifyToken(token);
    
    // Verificar si el comercio está activo
    if (decoded.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: decoded.tenantId },
        select: { isActive: true }
      });

      if (tenant && tenant.isActive === false) {
        res.status(403).json({ message: 'La cuenta de este comercio ha sido suspendida por el administrador.' });
        return;
      }
    }

    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
