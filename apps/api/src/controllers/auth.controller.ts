import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendPasswordResetEmail } from '../services/email.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, companyName } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tenant = await prisma.tenant.create({
      data: { name: companyName || 'Mi Empresa' }
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
    });

    const token = generateToken({ id: user.id, role: user.role, tenantId: user.tenantId });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Requerido para ngrok HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { tenant: true }
    });
    
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Verificar si el comercio está activo antes de dejarlo entrar
    if (user.tenant && user.tenant.isActive === false) {
      res.status(403).json({ message: 'La cuenta de este comercio ha sido suspendida por el administrador.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, role: user.role, tenantId: user.tenantId });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Requerido para ngrok HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: AuthRequest, res: Response): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded: any = verifyToken(token);
      
      // Si estamos en Modo Dios, restaurar la sesión del Superadmin
      if (decoded.impersonatedBy) {
        const superToken = generateToken({
          id: decoded.impersonatedBy,
          role: 'SUPERADMIN',
        });

        res.cookie('token', superToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Modo Dios finalizado', isSuperadmin: true });
        return;
      }
    } catch (e) {
      // Ignorar errores de token en el logout para siempre limpiar la cookie
    }
  }

  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// Cache para las configuraciones de los planes (no cambian frecuentemente)
const planCache = new Map<string, { features: string[], expiresAt: number }>();

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No user in request' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { tenant: true }
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let features: string[] = [];
    if (user.tenant?.plan) {
      const planName = user.tenant.plan;
      const now = Date.now();
      const cachedPlan = planCache.get(planName);

      if (cachedPlan && cachedPlan.expiresAt > now) {
        features = cachedPlan.features;
      } else {
        const planConfig = await prisma.planConfig.findUnique({
          where: { name: planName }
        });
        if (planConfig && planConfig.features) {
          features = JSON.parse(planConfig.features);
          // Caché por 5 minutos
          planCache.set(planName, { features, expiresAt: now + 300000 });
        }
      }
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        impersonatedBy: req.user.impersonatedBy
      },
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        plan: user.tenant.plan,
        features: features
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(200).json({ message: 'Si el correo existe, se ha enviado una contraseña temporal.' });
      return;
    }

    const temporaryPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await sendPasswordResetEmail({ toEmail: email, newPassword: temporaryPassword });

    res.status(200).json({ message: 'Si el correo existe, se ha enviado una contraseña temporal.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error trying to reset password' });
  }
};
