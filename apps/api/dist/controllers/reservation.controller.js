"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservation = exports.updateReservation = exports.createReservation = exports.getReservations = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
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
            },
        });
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
        // Verificar pertenencia al tenant
        const existing = await prisma_1.prisma.reservation.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ message: 'Reservación no encontrada' });
        const reservation = await prisma_1.prisma.reservation.update({
            where: { id },
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
        // Verificar pertenencia al tenant
        const existing = await prisma_1.prisma.reservation.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            return res.status(404).json({ message: 'Reservación no encontrada' });
        await prisma_1.prisma.reservation.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
exports.deleteReservation = deleteReservation;
