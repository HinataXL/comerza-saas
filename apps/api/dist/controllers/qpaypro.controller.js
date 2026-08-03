"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRelay = void 0;
const prisma_1 = require("../lib/prisma");
const handleRelay = async (req, res) => {
    try {
        const { saleId } = req.params;
        const { x_response_status } = req.query;
        console.log(`QPayPro Relay received for sale ${saleId}:`, req.query);
        // Si la transacción fue exitosa (x_response_status = 1)
        if (x_response_status === '1' && saleId) {
            const sale = await prisma_1.prisma.sale.findUnique({
                where: { id: saleId }
            });
            if (sale && sale.status === 'PENDING') {
                // Actualizar estado de la venta
                await prisma_1.prisma.sale.update({
                    where: { id: sale.id },
                    data: { status: 'COMPLETED' }
                });
                console.log(`Sale ${sale.id} automatically marked as COMPLETED via QPayPro Relay`);
            }
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Redirigir según el estado
        if (x_response_status === '1') {
            res.redirect(`${frontendUrl}/dashboard/cobros?payment=success`);
        }
        else if (x_response_status) {
            // Si hay un status pero no es 1, es que falló
            res.redirect(`${frontendUrl}/dashboard/cobros?payment=failed`);
        }
        else {
            // Si llega vacío (webhook en segundo plano o recarga de página)
            res.redirect(`${frontendUrl}/dashboard/cobros`);
        }
    }
    catch (error) {
        console.error('Error handling QPayPro relay:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Redirigir al frontend incluso si hubo un error en nuestro lado
        res.redirect(`${frontendUrl}/dashboard/cobros?payment=error`);
    }
};
exports.handleRelay = handleRelay;
