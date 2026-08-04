"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getNotifications = exports.broadcastNotification = exports.streamNotifications = void 0;
const prisma_1 = require("../lib/prisma");
const clients = new Map(); // tenantId -> Response[]
const streamNotifications = (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
        res.status(401).end();
        return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Enviar headers inmediatamente
    // Enviar ping cada 30 segundos para mantener viva la conexión
    const ping = setInterval(() => {
        res.write('event: ping\ndata: {}\n\n');
    }, 30000);
    if (!clients.has(tenantId)) {
        clients.set(tenantId, []);
    }
    clients.get(tenantId).push(res);
    req.on('close', () => {
        clearInterval(ping);
        const tenantClients = clients.get(tenantId);
        if (tenantClients) {
            clients.set(tenantId, tenantClients.filter(client => client !== res));
            if (clients.get(tenantId).length === 0) {
                clients.delete(tenantId);
            }
        }
    });
};
exports.streamNotifications = streamNotifications;
const broadcastNotification = (tenantId, notification) => {
    const tenantClients = clients.get(tenantId);
    if (tenantClients) {
        tenantClients.forEach(client => {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
        });
    }
};
exports.broadcastNotification = broadcastNotification;
const getNotifications = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const notifications = await prisma_1.prisma.notification.findMany({
            where: {
                tenantId,
                isRead: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id } = req.params;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const notification = await prisma_1.prisma.notification.findFirst({
            where: { id: id, tenantId }
        });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        await prisma_1.prisma.notification.update({
            where: { id: id },
            data: { isRead: true }
        });
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error marking notification as read' });
    }
};
exports.markAsRead = markAsRead;
