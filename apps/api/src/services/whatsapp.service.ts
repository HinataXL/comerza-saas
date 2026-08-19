import twilio from 'twilio';
import { logger } from './logger.service';

interface WhatsAppParams {
  toPhone: string;
  customerName: string;
  companyName: string;
  date: Date;
  title: string | null;
  token: string;
}

export const sendReservationWhatsApp = async (params: WhatsAppParams) => {
  const { toPhone, customerName, companyName, date, title } = params;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_WHATSAPP_NUMBER; // ej. 'whatsapp:+14155238886' (Sandbox number)
  
  if (!accountSid || !authToken || !twilioPhone) {
    console.warn('Configuración de Twilio faltante (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER). No se enviará el mensaje.');
    return;
  }

  const client = twilio(accountSid, authToken);

  // Format date
  const dateStr = date.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

  // Make sure phone number has country code (e.g. 502 for Guatemala), strip non-numeric
  let formattedPhone = toPhone.replace(/\D/g, '');
  if (formattedPhone.length === 8) {
    formattedPhone = `502${formattedPhone}`;
  }

  const messageBody = `Hola ${customerName}, tienes una reservación en ${companyName} para el ${dateStr}${title ? ` (${title})` : ''}.
  
Para confirmar tu asistencia, responde a este mensaje con la palabra *CONFIRMAR*.
Para cancelar tu reservación, responde con *CANCELAR*.`;

  try {
    const response = await client.messages.create({
      body: messageBody,
      from: twilioPhone.includes('whatsapp:') ? twilioPhone : `whatsapp:${twilioPhone}`,
      to: `whatsapp:+${formattedPhone}`
    });

    logger.info('Mensaje de WhatsApp enviado vía Twilio con SID:', response.sid);
    return response;
  } catch (error: any) {
    logger.error('Error al enviar WhatsApp con Twilio:', error.message);
    throw error;
  }
};
