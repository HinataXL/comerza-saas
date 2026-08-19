"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRelay = void 0;
const prisma_1 = require("../lib/prisma");
const logger_service_1 = require("../services/logger.service");
const handleRelay = async (req, res) => {
    try {
        const { saleId } = req.params;
        const x_response_status = req.query?.x_response_status || req.body?.x_response_status;
        logger_service_1.logger.info(`QPayPro Relay received for sale ${saleId}:`, { query: req.query, body: req.body });
        let sale = await prisma_1.prisma.sale.findUnique({
            where: { id: saleId }
        });
        if (sale) {
            if (x_response_status === '1') {
                if (sale.status === 'PENDING') {
                    // Actualizar estado de la venta
                    sale = await prisma_1.prisma.sale.update({
                        where: { id: sale.id },
                        data: { status: 'COMPLETED' }
                    });
                    logger_service_1.logger.info(`Sale ${sale.id} automatically marked as COMPLETED via QPayPro Relay`);
                }
            }
            else if (x_response_status) {
                if (sale.status === 'PENDING') {
                    sale = await prisma_1.prisma.sale.update({
                        where: { id: sale.id },
                        data: { status: 'FAILED' }
                    });
                    logger_service_1.logger.info(`Sale ${sale.id} automatically marked as FAILED via QPayPro Relay`);
                }
            }
        }
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        // Redirigir según el estado actual de la venta (leído de la BD)
        if (sale?.status === 'COMPLETED') {
            res.redirect(`${frontendUrl}/pago/exitoso?saleId=${saleId || ''}`);
        }
        else if (sale?.status === 'FAILED' || (x_response_status && x_response_status !== '1')) {
            res.redirect(`${frontendUrl}/pago/fallido?saleId=${saleId || ''}`);
        }
        else {
            // Si sigue PENDING, no hay status
            res.redirect(`${frontendUrl}`);
        }
    }
    catch (error) {
        logger_service_1.logger.error('Error handling QPayPro relay:', error);
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        // Redirigir al frontend incluso si hubo un error en nuestro lado
        res.redirect(`${frontendUrl}/pago/fallido?error=server`);
    }
};
exports.handleRelay = handleRelay;
