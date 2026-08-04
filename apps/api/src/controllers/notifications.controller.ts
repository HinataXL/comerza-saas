import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const clients = new Map<string, Response[]>(); // tenantId -> Response[]

export const streamNotifications = (req: AuthRequest, res: Response): void => {
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
  clients.get(tenantId)!.push(res);

  req.on('close', () => {
    clearInterval(ping);
    const tenantClients = clients.get(tenantId);
    if (tenantClients) {
      clients.set(tenantId, tenantClients.filter(client => client !== res));
      if (clients.get(tenantId)!.length === 0) {
        clients.delete(tenantId);
      }
    }
  });
};

export const broadcastNotification = (tenantId: string, notification: any) => {
  const tenantClients = clients.get(tenantId);
  if (tenantClients) {
    tenantClients.forEach(client => {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
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
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notification = await prisma.notification.findFirst({
      where: { id: id as string, tenantId }
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    await prisma.notification.update({
      where: { id: id as string },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};
