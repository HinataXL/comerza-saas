"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReservationAction = exports.deleteReservation = exports.updateReservation = exports.createReservation = exports.getReservations = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const jwt_1 = require("../utils/jwt");
const email_service_1 = require("../services/email.service");
const whatsapp_service_1 = require("../services/whatsapp.service");
const createReservationSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    title: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    notes: zod_1.z.string().optional(),
});
const updateReservationSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().optional(),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    notes: zod_1.z.string().optional(),
});
// Obtener todas las reservaciones del tenant (con filtros opcionales por fecha)
const getReservations = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId)
            return res.status(401).json({ message: 'No autorizado' });
        const { start, end, customerId, status } = req.query;
        const where = { tenantId };
        if (customerId)
            where.customerId = customerId;
        if (status)
            where.status = status;
        // Si envían rango de fechas
        if (start || end) {
            where.startTime = {};
            if (start)
                where.startTime.gte = new Date(start);
            if (end)
                where.startTime.lte = new Date(end);
        }
        const reservations = await prisma_1.prisma.reservation.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { startTime: 'asc' },
        });
        res.json(reservations);
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.getReservations = getReservations;
// Crear reservación
const createReservation = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId)
            return res.status(401).json({ message: 'No autorizado' });
        const validatedData = createReservationSchema.parse(req.body);
        const reservation = await prisma_1.prisma.reservation.create({
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
        const token = (0, jwt_1.generateToken)({ reservationId: reservation.id }, '7d');
        // Send Email
        if ((notificationType === 'EMAIL' || notificationType === 'BOTH') && reservation.customer.email) {
            (0, email_service_1.sendReservationEmail)({
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
            (0, whatsapp_service_1.sendReservationWhatsApp)({
                toPhone: reservation.customer.phone,
                customerName: reservation.customer.name,
                companyName: reservation.tenant.name,
                date: reservation.startTime,
                title: reservation.title,
                token
            }).catch(err => console.error('Error enviando whatsapp de reservación:', err));
        }
        res.status(201).json(reservation);
    }
    catch (error) {
        console.error('Error creating reservation:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Datos inválidos', issues: error.issues });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.createReservation = createReservation;
// Actualizar reservación
const updateReservation = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId)
            return res.status(401).json({ message: 'No autorizado' });
        const { id } = req.params;
        const validatedData = updateReservationSchema.parse(req.body);
        const existing = await prisma_1.prisma.reservation.findFirst({
            where: { id: id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ message: 'Reservación no encontrada' });
        const reservation = await prisma_1.prisma.reservation.update({
            where: { id: id },
            data: validatedData,
            include: {
                customer: true,
            },
        });
        res.json(reservation);
    }
    catch (error) {
        console.error('Error updating reservation:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Datos inválidos', issues: error.issues });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.updateReservation = updateReservation;
// Eliminar reservación
const deleteReservation = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId)
            return res.status(401).json({ message: 'No autorizado' });
        const { id } = req.params;
        const existing = await prisma_1.prisma.reservation.findFirst({
            where: { id: id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ message: 'Reservación no encontrada' });
        await prisma_1.prisma.reservation.delete({
            where: { id: id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.deleteReservation = deleteReservation;
// Accion Publica para confirmar/declinar reservación desde el correo
const handleReservationAction = async (req, res) => {
    try {
        const { token, action } = req.query;
        if (!token || !action) {
            return res.status(400).json({ message: 'Token y action son requeridos' });
        }
        if (action !== 'CONFIRMED' && action !== 'CANCELLED') {
            return res.status(400).json({ message: 'Acción inválida' });
        }
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(token);
        }
        catch (e) {
            return res.status(401).json({ message: 'El enlace es inválido o ha expirado' });
        }
        const reservationId = decoded.reservationId;
        if (!reservationId)
            return res.status(400).json({ message: 'Token malformado' });
        const reservation = await prisma_1.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { customer: true }
        });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservación no encontrada' });
        }
        if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            return res.status(400).json({ message: 'La reservación ya ha sido procesada o cancelada previamente.' });
        }
        await prisma_1.prisma.reservation.update({
            where: { id: reservationId },
            data: { status: action }
        });
        // Notificar al tenant
        const msg = action === 'CONFIRMED'
            ? `El cliente ${reservation.customer.name} ha confirmado su reservación.`
            : `El cliente ${reservation.customer.name} ha cancelado su reservación.`;
        await prisma_1.prisma.notification.create({
            data: {
                tenantId: reservation.tenantId,
                title: `Reservación ${action === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}`,
                message: msg,
                type: action === 'CONFIRMED' ? 'SUCCESS' : 'WARNING',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expira en 30 días
            }
        });
        res.json({ message: `Reservación ${action === 'CONFIRMED' ? 'confirmada' : 'cancelada'} con éxito. Ya puedes cerrar esta ventana.` });
    }
    catch (error) {
        console.error('Error handling reservation action:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.handleReservationAction = handleReservationAction;
