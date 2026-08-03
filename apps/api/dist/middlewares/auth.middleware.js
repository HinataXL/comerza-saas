"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided, authorization denied' });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        // Verificar si el comercio está activo
        if (decoded.tenantId) {
            const tenant = await prisma_1.prisma.tenant.findUnique({
                where: { id: decoded.tenantId },
                select: { isActive: true }
            });
            if (tenant && tenant.isActive === false) {
                res.status(403).json({ message: 'La cuenta de este comercio ha sido suspendida por el administrador.' });
                return;
            }
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authenticate = authenticate;
