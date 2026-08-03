import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSalesReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    const { startDate, endDate, status } = req.query;

    let whereClause: any = { tenantId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      
      whereClause.createdAt = {
        gte: start,
        lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      whereClause.createdAt = {
        gte: start
      };
    } else if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        lte: end
      };
    }

    if (status && status !== 'ALL') {
      whereClause.status = status as string;
    }

    // 1. Transactions
    const transactions = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, email: true }
        }
      }
    });

    // 2. KPIs
    const totalSalesAmount = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const salesCount = transactions.length;
    const averageTicket = salesCount > 0 ? totalSalesAmount / salesCount : 0;

    // 3. Top Products (based on the same date filter)
    const saleIds = transactions.map(tx => tx.id);
    let topProducts = [];
    
    if (saleIds.length > 0) {
      const saleItems = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          tenantId,
          saleId: { in: saleIds }
        },
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });

      const productIds = saleItems.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: { id: true, name: true }
      });

      topProducts = saleItems.map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return {
          id: item.productId,
          name: p ? p.name : 'Unknown Product',
          quantity: item._sum.quantity || 0,
          revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
        };
      });
    }

    res.json({
      kpis: {
        totalSalesAmount,
        salesCount,
        averageTicket
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        date: tx.createdAt.toISOString(),
        customerName: tx.customer?.name || 'Cliente Final',
        status: tx.status,
        paymentMethod: tx.paymentMethod || 'N/A',
        total: tx.total
      })),
      topProducts
    });

  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Server error retrieving sales report' });
  }
};
