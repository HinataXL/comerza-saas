"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLink = void 0;
const createPaymentLink = async (credentials, payload) => {
    if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error('Las llaves de QPayPro no están configuradas completamente para este comercio.');
    }
    // Desestructuramos el nombre en first_name y last_name si es posible
    const nameParts = (payload.customerName || 'Consumidor Final').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Final';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    // Estructura exacta solicitada por QPayPro
    const qpayproPayload = {
        x_login: credentials.apiKey, // Public Key / API Login ID
        x_api_key: credentials.apiSecret, // Private Key / API Secret / Transaction Key
        x_amount: payload.amount.toFixed(2),
        x_currency_code: 'GTQ',
        x_first_name: firstName,
        x_last_name: lastName,
        x_phone: payload.customerPhone || '00000000',
        x_description: payload.description,
        x_reference: payload.reference,
        x_url_cancel: `${frontendUrl}/dashboard/ventas`, // Fallback
        x_company: 'C/F',
        x_address: 'Ciudad',
        x_city: 'Guatemala',
        x_country: 'GT',
        x_state: 'GU',
        x_zip: '01001',
        x_freight: '0.00',
        x_email: payload.customerEmail || 'correo@ejemplo.com',
        x_type: 'AUTH_ONLY',
        x_method: 'CC',
        x_invoice_num: payload.reference.substring(0, 8),
        custom_fields: {},
        x_visacuotas: 'no',
        x_relay_url: `${apiUrl}/qpaypro/relay/${payload.reference}`,
        products: payload.items.map(item => [
            item.name,
            item.id.substring(0, 8),
            '',
            item.quantity,
            item.price.toFixed(2),
            (item.quantity * item.price).toFixed(2)
        ]),
        taxes: '0.00',
        http_origin: frontendUrl,
        origen: 'comerza-app',
        store_type: 'COMERZA'
    };
    console.log('Sending payload to QPayPro para generar Token...');
    try {
        // Aquí hacemos la petición real a QPayPro para obtener el Token.
        // Nota: Reemplaza esta URL si QPayPro utiliza una diferente para generar el token.
        const res = await fetch('https://payments.qpaypro.com/checkout/register_transaction_store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(qpayproPayload)
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('QPayPro API Error:', errorText);
            throw new Error(`Error de QPayPro (${res.status}): ${errorText}`);
        }
        const responseBody = await res.json();
        // QPayPro puede devolver "status" o "estado" para indicar error
        if (responseBody.status === 'error' || responseBody.estado === 'error') {
            console.error('QPayPro Error Response:', responseBody);
            throw new Error(`QPayPro reportó un error: ${JSON.stringify(responseBody.message || responseBody)}`);
        }
        // El token viene anidado dentro de la propiedad "data" del JSON de respuesta: { estado: 'success', data: { token: '...' } }
        const token = responseBody.data?.token || responseBody.token || responseBody.id;
        if (!token) {
            throw new Error(`QPayPro no devolvió un token válido. Respuesta: ${JSON.stringify(responseBody)}`);
        }
        // Generamos el link final con el token que nos pediste
        return `https://payments.qpaypro.com/checkout/store?token=${token}`;
    }
    catch (error) {
        console.error('Error generando link de pago:', error);
        // Lanzamos el error real en lugar de usar un token simulado para que puedas ver por qué falla
        throw error;
    }
};
exports.createPaymentLink = createPaymentLink;
