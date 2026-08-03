"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendSuspensionEmail = exports.sendSuperAdminWelcomeEmail = exports.sendWelcomeEmail = void 0;
const resend_1 = require("resend");
const sendWelcomeEmail = async (params) => {
    const { toEmail, adminName, companyName, password } = params;
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY no configurada. El email no se enviará.');
        return;
    }
    const resend = new resend_1.Resend(resendApiKey);
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Bienvenido a Comerza!</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <p style="font-size: 16px;">Hola <strong>${adminName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Tu espacio de trabajo para <strong>${companyName}</strong> ha sido creado exitosamente por el administrador de la plataforma.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Tus credenciales de acceso:</h3>
          <p style="margin: 8px 0;"><strong>Correo:</strong> ${toEmail}</p>
          <p style="margin: 8px 0;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
          Te recomendamos iniciar sesión lo antes posible y cambiar esta contraseña desde los ajustes de tu cuenta por motivos de seguridad.
        </p>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="http://localhost:3000/" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Ingresar al Sistema
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Este es un correo automático, por favor no respondas a esta dirección.</p>
        <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Comerza POS. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
    try {
        const data = await resend.emails.send({
            from: 'Comerza <hola@comerza.me>', // Usando el dominio oficial
            to: [toEmail],
            subject: `¡Bienvenido a Comerza! Credenciales de acceso para ${companyName}`,
            html: htmlTemplate,
        });
        console.log('Correo de bienvenida enviado:', data);
        return data;
    }
    catch (error) {
        console.error('Error al enviar el correo con Resend:', error);
        throw error;
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendSuperAdminWelcomeEmail = async (params) => {
    const { toEmail, adminName, password } = params;
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY no configurada. El email no se enviará.');
        return;
    }
    const resend = new resend_1.Resend(resendApiKey);
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Bienvenido al Panel Global de Comerza!</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <p style="font-size: 16px;">Hola <strong>${adminName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Tu cuenta de <strong>Superadmin</strong> ha sido creada exitosamente. Ahora tienes acceso global a la administración de comercios.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Tus credenciales de acceso:</h3>
          <p style="margin: 8px 0;"><strong>Correo:</strong> ${toEmail}</p>
          <p style="margin: 8px 0;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
          Por favor inicia sesión lo antes posible y cambia esta contraseña.
        </p>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="http://localhost:3000/" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Ingresar al Sistema
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Este es un correo automático, por favor no respondas a esta dirección.</p>
        <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Comerza POS. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
    try {
        const data = await resend.emails.send({
            from: 'Comerza <hola@comerza.me>',
            to: [toEmail],
            subject: `¡Bienvenido a Comerza! Credenciales de Superadmin`,
            html: htmlTemplate,
        });
        return data;
    }
    catch (error) {
        console.error('Error al enviar el correo con Resend:', error);
        throw error;
    }
};
exports.sendSuperAdminWelcomeEmail = sendSuperAdminWelcomeEmail;
const sendSuspensionEmail = async (params) => {
    const { toEmail, companyName } = params;
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY no configurada. El email no se enviará.');
        return;
    }
    const resend = new resend_1.Resend(resendApiKey);
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #ef4444; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Aviso Importante: Suspensión de Servicio</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <p style="font-size: 16px;">Estimado cliente de <strong>${companyName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">Lamentamos informarte que tu espacio de trabajo en Comerza ha sido <strong>suspendido</strong>.</p>
        
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #fca5a5;">
          <h3 style="margin-top: 0; color: #991b1b;">Motivo de suspensión: Falta de pago</h3>
          <p style="margin: 8px 0; color: #7f1d1d;">Tu sistema POS, inventario y facturación se encuentran temporalmente inhabilitados. Para reactivar tus servicios, es necesario regularizar tu situación de pago.</p>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
          Por favor, contáctanos a la brevedad respondiendo a este correo para procesar tu pago y reactivar tu cuenta inmediatamente.
        </p>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="mailto:billing@comerza.me" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Contactar a Facturación
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Comerza POS. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
    try {
        const data = await resend.emails.send({
            from: 'Comerza Billing <billing@comerza.me>',
            to: [toEmail],
            subject: `Aviso Importante: Suspensión de servicio para ${companyName}`,
            html: htmlTemplate,
        });
        return data;
    }
    catch (error) {
        console.error('Error al enviar el correo de suspensión:', error);
        throw error;
    }
};
exports.sendSuspensionEmail = sendSuspensionEmail;
const sendPasswordResetEmail = async (params) => {
    const { toEmail, newPassword } = params;
    const resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY no configurada. El email no se enviará.');
        return;
    }
    const resend = new resend_1.Resend(resendApiKey);
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Recuperación de Contraseña</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <p style="font-size: 16px;">Hola,</p>
        <p style="font-size: 16px; line-height: 1.5;">Has solicitado restablecer tu contraseña en Comerza.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a;">Tus nuevas credenciales:</h3>
          <p style="margin: 8px 0;"><strong>Correo:</strong> ${toEmail}</p>
          <p style="margin: 8px 0;"><strong>Contraseña temporal:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${newPassword}</span></p>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
          Te recomendamos iniciar sesión y cambiar esta contraseña desde los ajustes de tu cuenta por motivos de seguridad.
        </p>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="https://comerza.me/" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Ingresar al Sistema
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Este es un correo automático, por favor no respondas a esta dirección.</p>
        <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Comerza POS. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
    try {
        const data = await resend.emails.send({
            from: 'Comerza <hola@comerza.me>',
            to: [toEmail],
            subject: 'Restablecimiento de contraseña - Comerza',
            html: htmlTemplate,
        });
        return data;
    }
    catch (error) {
        console.error('Error al enviar el correo de recuperación:', error);
        throw error;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
