import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createPaymentLink } from '../services/qpaypro.service';
import { createTerminalSessionCommand } from '../services/recurrente.service';

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    const { customerId, items, paymentMethod } = req.body;

    if (!tenantId || !userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Sale items are required' });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({ message: 'Payment method is required' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    let customerDetails: any = null;
    if (customerId) {
      customerDetails = await prisma.customer.findUnique({
        where: { id: customerId, tenantId }
      });
    }

    let paymentLink = null;
    let saleTotal = 0;

    // Interactive Transaction to ensure atomicity
    let paymentItems: { id: string; name: string; quantity: number; price: number }[] = [];
    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const lineTotal = product.price * item.quantity;
        total += lineTotal;

        saleItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          tenantId
        });

        paymentItems.push({
          id: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price
        });

        // Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity }
        });
      }

      saleTotal = total;

      // Create Sale
      const newSale = await tx.sale.create({
        data: {
          tenantId,
          userId,
          customerId: customerId || null,
          total,
          status: (paymentMethod === 'Link de pago' || paymentMethod === 'Recurrente NFC') ? 'PENDING' : 'COMPLETED',
          paymentMethod,
          items: {
            create: saleItemsToCreate
          }
        }
      });

      return newSale;
    });

    if (paymentMethod === 'Link de pago') {
      try {
        paymentLink = await createPaymentLink({
          apiKey: tenant.qpayproApiKey || '',
          apiSecret: tenant.qpayproApiSecret || ''
        }, {
          amount: saleTotal,
          description: `Cobro de venta #${sale.id.slice(-6)}`,
          reference: sale.id,
          customerName: customerDetails?.name,
          customerEmail: customerDetails?.email,
          customerPhone: customerDetails?.phone,
          items: paymentItems
        });

        // Update sale with the generated link
        await prisma.sale.update({
          where: { id: sale.id },
          data: { paymentLink }
        });

        sale.paymentLink = paymentLink;
      } catch (err: any) {
        console.error('QPayPro Error:', err);
        throw new Error(err.message || 'Error generating payment link');
      }
    } else if (paymentMethod === 'Recurrente NFC') {
      if (!tenant.recurrenteSecretKey || !tenant.recurrenteTerminalId) {
        throw new Error('Las credenciales de Recurrente no están configuradas.');
      }
      try {
        await createTerminalSessionCommand({
          secretKey: tenant.recurrenteSecretKey,
          terminalId: tenant.recurrenteTerminalId
        }, {
          amount: saleTotal,
          externalId: sale.id
        });
      } catch (err: any) {
        console.error('Recurrente Error:', err);
        throw new Error(err.message || 'Error iniciando cobro NFC');
      }
    }

    res.status(201).json(sale);
  } catch (error: any) {
    console.error(error);
    if (error.message.includes('Insufficient stock') || error.message.includes('not found') || error.message.includes('QPayPro') || error.message.includes('Recurrente')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error processing sale', error: error.message });
    }
  }
};

export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const sales = await prisma.sale.findMany({
      where: { tenantId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(sales);
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error retrieving sales', error: error.message });
  }
};

export const createQuickCharge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    const { amount, description, customerName, customerEmail, customerPhone, paymentMethod } = req.body;

    if (!tenantId || !userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Valid amount is required' });
      return;
    }

    if (!description) {
      res.status(400).json({ message: 'Description is required' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    // Create a generic sale without items
    const sale = await prisma.sale.create({
      data: {
        tenantId,
        userId,
        total: Number(amount),
        status: 'PENDING',
        paymentMethod: paymentMethod || 'Link de pago',
      }
    });

    if (paymentMethod === 'Recurrente NFC') {
      if (!tenant.recurrenteSecretKey || !tenant.recurrenteTerminalId) {
        await prisma.sale.delete({ where: { id: sale.id } });
        res.status(400).json({ message: 'Las credenciales de Recurrente no están configuradas.' });
        return;
      }
      try {
        await createTerminalSessionCommand({
          secretKey: tenant.recurrenteSecretKey,
          terminalId: tenant.recurrenteTerminalId
        }, {
          amount: Number(amount),
          externalId: sale.id
        });
        res.status(201).json(sale);
        return;
      } catch (err: any) {
        await prisma.sale.delete({ where: { id: sale.id } });
        console.error('Recurrente Error in Quick Charge:', err);
        throw new Error(err.message || 'Error iniciando cobro NFC');
      }
    }

    try {
      const paymentLink = await createPaymentLink({
        apiKey: tenant.qpayproApiKey || '',
        apiSecret: tenant.qpayproApiSecret || ''
      }, {
        amount: Number(amount),
        description: description,
        reference: sale.id,
        customerName: customerName || 'Consumidor Final',
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        items: [{ id: 'QUICK', name: description, quantity: 1, price: Number(amount) }]
      });

      await prisma.sale.update({
        where: { id: sale.id },
        data: { paymentLink }
      });

      sale.paymentLink = paymentLink;
      res.status(201).json(sale);
    } catch (err: any) {
      // If QPayPro fails, delete the pending sale so we don't have broken records
      await prisma.sale.delete({ where: { id: sale.id } });
      console.error('QPayPro Error in Quick Charge:', err);
      throw new Error(err.message || 'Error generating payment link');
    }
  } catch (error: any) {
    console.error('Error in createQuickCharge:', error);
    if (error.message.includes('QPayPro') || error.message.includes('Recurrente')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error processing quick charge', error: error.message });
    }
  }
};

export const updateSaleStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;
    const { status } = req.body;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!['PENDING', 'COMPLETED', 'FAILED'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const sale = await prisma.sale.findFirst({
      where: { id: id as string, tenantId: tenantId as string }
    });

    if (!sale) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    const updatedSale = await prisma.sale.update({
      where: { id: id as string },
      data: { status }
    });

    res.status(200).json(updatedSale);
  } catch (error: any) {
    console.error('Error updating sale status:', error);
    res.status(500).json({ message: 'Server error updating sale status', error: error.message });
  }
};

export const getSaleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const sale = await prisma.sale.findFirst({
      where: { id: id as string, tenantId: tenantId as string },
      include: {
        customer: true,
        tenant: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    res.status(200).json(sale);
  } catch (error: any) {
    console.error('Error fetching sale by id:', error);
    res.status(500).json({ message: 'Server error retrieving sale', error: error.message });
  }
};
