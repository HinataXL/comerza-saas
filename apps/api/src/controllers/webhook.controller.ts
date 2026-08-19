import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../services/logger.service';

// Ya no necesitamos validación GET compleja para Twilio en la ruta, Twilio puede verificar firmas pero para desarrollo/SaaS se puede omitir o implementar middleware de Twilio.
export const verifyWhatsAppWebhook = (req: Request, res: Response) => {
  res.status(200).send('OK');
};

// Recepción de mensajes de WhatsApp (vía Twilio)
export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  try {
    // Twilio envía application/x-www-form-urlencoded
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).send('Invalid Twilio payload');
    }

    // Extraer el número de teléfono sin el prefijo "whatsapp:+" o "+"
    // Ej: "whatsapp:+50212345678" -> "50212345678"
    let phoneNumber = From.replace('whatsapp:', '').replace('+', '');
    const textBody = Body.trim().toUpperCase();

    let actionStr = '';
    if (textBody === 'CONFIRMAR') {
      actionStr = 'CONFIRMED';
    } else if (textBody === 'CANCELAR') {
      actionStr = 'CANCELLED';
    } else {
      // No es una palabra clave reconocida, ignoramos
      return res.status(200).send('<Response></Response>');
    }

    // Buscar a qué cliente pertenece este número de teléfono
    // Nota: Como varios clientes pueden tener el mismo número en diferentes Tenants,
    // buscamos las reservaciones PENDIENTES más recientes que coincidan con este número.
    const recentReservation = await prisma.reservation.findFirst({
      where: {
        status: 'PENDING',
        customer: {
          phone: {
            contains: phoneNumber // Usa contains para mitigar diferencias en formatos (ej con o sin código de área)
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: { customer: true }
    });

    if (!recentReservation) {
      // No se encontró reservación pendiente para este número
      return res.status(200).send('<Response></Response>');
    }

    // Actualizar el estado de la reservación
    await prisma.reservation.update({
      where: { id: recentReservation.id },
      data: { status: actionStr }
    });

    // Notificar al tenant
    const msg = actionStr === 'CONFIRMED' 
      ? `El cliente ${recentReservation.customer.name} ha confirmado su reservación vía WhatsApp (Twilio).`
      : `El cliente ${recentReservation.customer.name} ha cancelado su reservación vía WhatsApp (Twilio).`;

    await prisma.notification.create({
      data: {
        tenantId: recentReservation.tenantId,
        title: `Reservación ${actionStr === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}`,
        message: msg,
        type: actionStr === 'CONFIRMED' ? 'SUCCESS' : 'WARNING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    logger.info(`Reservación ${recentReservation.id} actualizada a ${actionStr} exitosamente vía Twilio.`);

    // Responder a Twilio (Opcional: podemos enviarle un mensaje de vuelta al cliente)
    const replyMessage = actionStr === 'CONFIRMED'
      ? '¡Gracias! Tu reservación ha sido confirmada con éxito.'
      : 'Tu reservación ha sido cancelada.';

    res.set('Content-Type', 'text/xml');
    res.status(200).send(`
      <Response>
        <Message>${replyMessage}</Message>
      </Response>
    `);

  } catch (error) {
    logger.error('Error handling Twilio WhatsApp webhook:', error);
    // Para Twilio debemos regresar 200 con o sin error para evitar que siga reintentando infinitamente,
    // aunque un 500 ayuda a depurar en la consola de Twilio.
    res.status(500).send('<Response></Response>'); 
  }
};
