import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const handleRelay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const x_response_status = req.query.x_response_status || req.body.x_response_status;

    console.log(`QPayPro Relay received for sale ${saleId}:`, { query: req.query, body: req.body });

    // Si la transacción fue exitosa (x_response_status = 1)
    if (x_response_status === '1' && saleId) {
      
      const sale = await prisma.sale.findUnique({
        where: { id: saleId as string }
      });

      if (sale && sale.status === 'PENDING') {
        // Actualizar estado de la venta
        await prisma.sale.update({
          where: { id: sale.id },
          data: { status: 'COMPLETED' }
        });
        
        console.log(`Sale ${sale.id} automatically marked as COMPLETED via QPayPro Relay`);
      }
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Redirigir según el estado
    if (x_response_status === '1') {
      res.redirect(`${frontendUrl}/pago/exitoso?saleId=${saleId || ''}`);
    } else if (x_response_status) {
      // Si hay un status pero no es 1, es que falló
      res.redirect(`${frontendUrl}/pago/fallido?saleId=${saleId || ''}`);
    } else {
      // Si llega vacío (webhook en segundo plano o recarga de página)
      res.redirect(`${frontendUrl}`);
    }

  } catch (error) {
    console.error('Error handling QPayPro relay:', error);
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    // Redirigir al frontend incluso si hubo un error en nuestro lado
    res.redirect(`${frontendUrl}/pago/fallido?error=server`);
  }
};
