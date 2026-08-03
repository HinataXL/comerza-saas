"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTerminalSessionCommand = void 0;
const createTerminalSessionCommand = async (credentials, request) => {
    const { secretKey, terminalId } = credentials;
    const { amount, externalId } = request;
    const url = 'https://app.recurrente.com/api/terminal_session_commands';
    // Convertir monto a centavos
    const amountInCents = Math.round(amount * 100);
    const payload = {
        terminal_id: terminalId,
        currency: 'GTQ',
        external_id: externalId,
        amount_in_cents: amountInCents,
        show_post_payment_screens: true
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SECRET-KEY': secretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Recurrente API Error:', errorData);
            throw new Error(`Recurrente API Error: ${errorData.message || 'Error al crear comando de terminal'}`);
        }
        return await response.json();
    }
    catch (error) {
        throw new Error(`Recurrente Connection Error: ${error.message || 'Error desconocido'}`);
    }
};
exports.createTerminalSessionCommand = createTerminalSessionCommand;
