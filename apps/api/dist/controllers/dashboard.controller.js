"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const prisma_1 = require("../lib/prisma");
const getDashboardMetrics = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const [tenant, currentMonthSales, previousMonthSales, pendingCollections, currentMonthFel, previousMonthFel, currentMonthTotalTransactions, previousMonthTotalTransactions, paymentMethodsStats, felStatusCounts, lowStockProducts, recentTransactions, recentInvoices] = await Promise.all([
            prisma_1.prisma.tenant.findUnique({ where: { id: tenantId }, select: { isQpayproActive: true, isRecurrenteActive: true } }),
            prisma_1.prisma.sale.aggregate({ where: { tenantId, createdAt: { gte: currentMonthStart }, status: 'COMPLETED' }, _sum: { total: true }, _count: true }),
            prisma_1.prisma.sale.aggregate({ where: { tenantId, createdAt: { gte: previousMonthStart, lt: currentMonthStart }, status: 'COMPLETED' }, _sum: { total: true }, _count: true }),
            prisma_1.prisma.sale.aggregate({ where: { tenantId, status: 'PENDING' }, _sum: { total: true }, _count: true }),
            prisma_1.prisma.sale.count({ where: { tenantId, createdAt: { gte: currentMonthStart }, felStatus: 'CERTIFICADA' } }),
            prisma_1.prisma.sale.count({ where: { tenantId, createdAt: { gte: previousMonthStart, lt: currentMonthStart }, felStatus: 'CERTIFICADA' } }),
            prisma_1.prisma.sale.count({ where: { tenantId, createdAt: { gte: currentMonthStart } } }),
            prisma_1.prisma.sale.count({ where: { tenantId, createdAt: { gte: previousMonthStart, lt: currentMonthStart } } }),
            prisma_1.prisma.sale.groupBy({ by: ['paymentMethod'], where: { tenantId, createdAt: { gte: currentMonthStart }, status: 'COMPLETED', paymentMethod: { not: null } }, _sum: { total: true } }),
            prisma_1.prisma.sale.groupBy({ by: ['felStatus'], where: { tenantId }, _count: true }),
            prisma_1.prisma.product.findMany({ where: { tenantId, stock: { lte: 5 } }, select: { name: true, stock: true }, take: 5 }),
            prisma_1.prisma.sale.findMany({ where: { tenantId }, take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
            prisma_1.prisma.sale.findMany({ where: { tenantId, felStatus: { not: null } }, take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } })
        ]);
        // 1. Ventas del mes
        const ventasDelMes = currentMonthSales._sum.total || 0;
        const previousVentas = previousMonthSales._sum.total || 0;
        const ventasTrend = previousVentas === 0 ? 100 : ((ventasDelMes - previousVentas) / previousVentas) * 100;
        // 2. Cobros pendientes
        const cobrosPendientes = pendingCollections._sum.total || 0;
        const cobrosPendientesCount = pendingCollections._count || 0;
        // 3. Facturas FEL emitidas
        const felTrend = previousMonthFel === 0 ? 100 : ((currentMonthFel - previousMonthFel) / previousMonthFel) * 100;
        // 4. Transacciones aprobadas
        const transaccionesAprobadasPct = currentMonthTotalTransactions === 0
            ? 0
            : ((Number(currentMonthSales._count) / currentMonthTotalTransactions) * 100);
        const previousTransaccionesAprobadasPct = previousMonthTotalTransactions === 0
            ? 0
            : ((Number(previousMonthSales._count) / previousMonthTotalTransactions) * 100);
        const transaccionesTrend = transaccionesAprobadasPct - previousTransaccionesAprobadasPct;
        // 5. Gráfica: Ventas y cobros (Últimos 6 meses)
        const sixMonthsPromises = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const promise = (async () => {
                const [monthSales, monthCobros] = await Promise.all([
                    prisma_1.prisma.sale.aggregate({ where: { tenantId, createdAt: { gte: start, lt: end } }, _sum: { total: true } }),
                    prisma_1.prisma.sale.aggregate({ where: { tenantId, createdAt: { gte: start, lt: end }, status: 'COMPLETED' }, _sum: { total: true } })
                ]);
                return { start, monthSales, monthCobros };
            })();
            sixMonthsPromises.push(promise);
        }
        const sixMonthsResults = await Promise.all(sixMonthsPromises);
        const sixMonthsData = sixMonthsResults.map(({ start, monthSales, monthCobros }) => ({
            name: start.toLocaleString('es-ES', { month: 'short' }),
            ventas: monthSales._sum.total || 0,
            cobros: monthCobros._sum.total || 0
        }));
        // 6. Gráfica: Métodos de pago
        const totalPaymentsValue = paymentMethodsStats.reduce((acc, curr) => acc + (curr._sum.total || 0), 0);
        const paymentMethodsData = paymentMethodsStats.map(pm => {
            let color = '#4b5563';
            if (pm.paymentMethod === 'Tarjeta')
                color = '#2563eb';
            else if (pm.paymentMethod === 'Transferencia')
                color = '#14b8a6';
            else if (pm.paymentMethod === 'Efectivo')
                color = '#eab308';
            else if (pm.paymentMethod === 'Link de pago')
                color = '#8b5cf6';
            const value = pm._sum.total || 0;
            return {
                name: pm.paymentMethod,
                value: totalPaymentsValue === 0 ? 0 : Number(((value / totalPaymentsValue) * 100).toFixed(1)),
                color,
                amount: value
            };
        });
        // 7. Gateways y FEL Status
        let certificadas = 0, pendientes = 0, errorFel = 0;
        felStatusCounts.forEach(f => {
            if (f.felStatus === 'CERTIFICADA')
                certificadas = f._count;
            if (f.felStatus === 'PENDIENTE')
                pendientes = f._count;
            if (f.felStatus === 'ERROR')
                errorFel = f._count;
        });
        // 8. Tablas recientes
        const recentTxFormatted = recentTransactions.map(tx => ({
            date: tx.createdAt.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
            client: tx.customer ? tx.customer.name : 'Cliente Final',
            method: tx.paymentMethod || 'Manual',
            amount: `Q ${tx.total.toFixed(2)}`,
            status: tx.status === 'COMPLETED' ? 'Aprobado' : tx.status === 'FAILED' ? 'Rechazado' : 'Pendiente'
        }));
        const recentInvoicesFormatted = recentInvoices.map(inv => ({
            no: `FEL-${inv.id.substring(0, 6).toUpperCase()}`,
            client: inv.customer ? inv.customer.name : 'Cliente Final',
            total: `Q ${inv.total.toFixed(2)}`,
            status: inv.felStatus === 'CERTIFICADA' ? 'Pagada' : inv.felStatus === 'ERROR' ? 'Vencida' : 'Pendiente',
            date: inv.createdAt.toLocaleDateString('es-ES')
        }));
        res.json({
            kpis: {
                ventasDelMes: {
                    value: ventasDelMes,
                    trend: `${ventasTrend >= 0 ? '+' : ''}${ventasTrend.toFixed(1)}%`,
                    isPositive: ventasTrend >= 0
                },
                cobrosPendientes: {
                    value: cobrosPendientes,
                    trend: `${cobrosPendientesCount} cobros por vencer`,
                    isPositive: false
                },
                facturasFel: {
                    value: currentMonthFel,
                    trend: `${felTrend >= 0 ? '+' : ''}${felTrend.toFixed(1)}%`,
                    isPositive: felTrend >= 0
                },
                transaccionesAprobadas: {
                    value: `${transaccionesAprobadasPct.toFixed(1)}%`,
                    trend: `${transaccionesTrend >= 0 ? '+' : ''}${transaccionesTrend.toFixed(1)}%`,
                    isPositive: transaccionesTrend >= 0
                }
            },
            charts: {
                lineData: sixMonthsData,
                pieData: paymentMethodsData
            },
            gatewaysAndFel: {
                activeGateways: {
                    qpaypro: tenant?.isQpayproActive || false,
                    recurrente: tenant?.isRecurrenteActive || false
                },
                fel: {
                    certificadas,
                    pendientes,
                    error: errorFel,
                    lastSync: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                },
                inventoryAlerts: lowStockProducts.map(p => ({ item: p.name, stock: p.stock }))
            },
            tables: {
                transactions: recentTxFormatted,
                invoices: recentInvoicesFormatted
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving dashboard metrics' });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
