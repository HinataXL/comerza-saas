import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { generateToken, verifyToken } from '../utils/jwt';
import { sendReservationEmail } from '../services/email.service';
import { sendReservationWhatsApp } from '../services/whatsapp.service';

const createReservationSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
});

const updateReservationSchema = z.object({
  customerId: z.string().uuid().optional(),
  title: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
});

// Obtener todas las reservaciones del tenant (con filtros opcionales por fecha)
export const getReservations = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ message: 'No autorizado' });

    const { start, end, customerId, status } = req.query;

    const where: any = { tenantId };

    if (customerId) where.customerId = customerId as string;
    if (status) where.status = status as string;
    
    // Si envían rango de fechas
    if (start || end) {
      where.startTime = {};
      if (start) where.startTime.gte = new Date(start as string);
      if (end) where.startTime.lte = new Date(end as string);
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear reservación
export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ message: 'No autorizado' });

    const validatedData = createReservationSchema.parse(req.body);

    const reservation = await prisma.reservation.create({
      data: {
        ...validatedData,
        tenantId,
      },
      include: {
        customer: true,
        tenant: true
      },
    });

    const notificationType = reservation.tenant.reservationNotificationType || 'EMAIL';
    const token = generateToken({ reservationId: reservation.id }, '7d');

    // Send Email
    if ((notificationType === 'EMAIL' || notificationType === 'BOTH') && reservation.customer.email) {
      sendReservationEmail({
        toEmail: reservation.customer.email,
        customerName: reservation.customer.name,
        companyName: reservation.tenant.name,
        date: reservation.startTime,
        title: reservation.title,
        token
      }).catch(err => console.error('Error enviando email de reservación:', err));
    }

    // Send WhatsApp
    if ((notificationType === 'WHATSAPP' || notificationType === 'BOTH') && reservation.customer.phone) {
      sendReservationWhatsApp({
        toPhone: reservation.customer.phone,
        customerName: reservation.customer.name,
        companyName: reservation.tenant.name,
        date: reservation.startTime,
        title: reservation.title,
        token
      }).catch(err => console.error('Error enviando whatsapp de reservación:', err));
    }

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos inválidos', issues: error.issues });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar reservación
export const updateReservation = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ message: 'No autorizado' });

    const { id } = req.params;
    const validatedData = updateReservationSchema.parse(req.body);

    const existing = await prisma.reservation.findFirst({
      where: { id: id as string, tenantId },
    });

    if (!existing) return res.status(404).json({ message: 'Reservación no encontrada' });

    const reservation = await prisma.reservation.update({
      where: { id: id as string },
      data: validatedData,
      include: {
        customer: true,
      },
    });

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Datos inválidos', issues: error.issues });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar reservación
export const deleteReservation = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(401).json({ message: 'No autorizado' });

    const { id } = req.params;

    const existing = await prisma.reservation.findFirst({
      where: { id: id as string, tenantId },
    });

    if (!existing) return res.status(404).json({ message: 'Reservación no encontrada' });

    await prisma.reservation.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Accion Publica para confirmar/declinar reservación desde el correo
export const handleReservationAction = async (req: Request, res: Response) => {
  try {
    const { token, action } = req.query;
    
    if (!token || !action) {
      return res.status(400).json({ message: 'Token y action son requeridos' });
    }

    if (action !== 'CONFIRMED' && action !== 'CANCELLED') {
      return res.status(400).json({ message: 'Acción inválida' });
    }

    let decoded: any;
    try {
      decoded = verifyToken(token as string);
    } catch (e) {
      return res.status(401).json({ message: 'El enlace es inválido o ha expirado' });
    }

    const reservationId = decoded.reservationId;
    if (!reservationId) return res.status(400).json({ message: 'Token malformado' });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { customer: true }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }

    if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
       return res.status(400).json({ message: 'La reservación ya ha sido procesada o cancelada previamente.' });
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: action as string }
    });

    // Notificar al tenant
    const msg = action === 'CONFIRMED' 
      ? `El cliente ${reservation.customer.name} ha confirmado su reservación.`
      : `El cliente ${reservation.customer.name} ha cancelado su reservación.`;

    await prisma.notification.create({
      data: {
        tenantId: reservation.tenantId,
        title: `Reservación ${action === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}`,
        message: msg,
        type: action === 'CONFIRMED' ? 'SUCCESS' : 'WARNING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expira en 30 días
      }
    });

    res.json({ message: `Reservación ${action === 'CONFIRMED' ? 'confirmada' : 'cancelada'} con éxito. Ya puedes cerrar esta ventana.` });
  } catch (error) {
    console.error('Error handling reservation action:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
