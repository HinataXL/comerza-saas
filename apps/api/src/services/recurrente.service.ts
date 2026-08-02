interface RecurrenteCredentials {
  secretKey: string;
  terminalId: string;
}

interface TerminalCommandRequest {
  amount: number; // En quetzales
  externalId: string; // Nuestro ID de venta
}

export const createTerminalSessionCommand = async (
  credentials: RecurrenteCredentials,
  request: TerminalCommandRequest
) => {
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
  } catch (error: any) {
    throw new Error(`Recurrente Connection Error: ${error.message || 'Error desconocido'}`);
  }
};
