"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalNotification = exports.deleteUser = exports.deleteTenant = exports.createSuperadmin = exports.getAllUsers = exports.getGatewaysStatus = exports.getAuditLogs = exports.getHealth = exports.updatePlan = exports.getPlans = exports.changeTenantPlan = exports.impersonateTenant = exports.toggleTenantStatus = exports.createTenant = exports.getTenants = exports.getGlobalMetrics = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const email_service_1 = require("../services/email.service");
const notifications_controller_1 = require("./notifications.controller");
const getGlobalMetrics = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const totalTenants = await prisma_1.prisma.tenant.count({ where: { isActive: true } });
        const totalUsers = await prisma_1.prisma.user.count();
        // Ventas exitosas de todos los tiempos
        const allCompletedSales = await prisma_1.prisma.sale.findMany({
            where: { status: 'COMPLETED' },
            select: { total: true, createdAt: true, tenant: { select: { id: true, name: true } } }
        });
        const totalVolume = allCompletedSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalInvoices = await prisma_1.prisma.sale.count({
            where: { felStatus: 'CERTIFICADA' }
        });
        // Calcular historial de 6 meses
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const volumeHistoryMap = new Map();
        const now = new Date();
        // Inicializar los últimos 6 meses en 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            volumeHistoryMap.set(key, 0);
        }
        // Agregar volumen a cada mes
        allCompletedSales.forEach(sale => {
            const d = new Date(sale.createdAt);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            if (volumeHistoryMap.has(key)) {
                volumeHistoryMap.set(key, volumeHistoryMap.get(key) + sale.total);
            }
        });
        const volumeHistory = Array.from(volumeHistoryMap.entries()).map(([name, amount]) => ({ name, amount }));
        // Top comercios (agrupar ventas por tenant)
        const tenantVolumes = new Map();
        allCompletedSales.forEach(sale => {
            if (sale.tenant) {
                if (!tenantVolumes.has(sale.tenant.id)) {
                    tenantVolumes.set(sale.tenant.id, { id: sale.tenant.id, name: sale.tenant.name, volume: 0 });
                }
                tenantVolumes.get(sale.tenant.id).volume += sale.total;
            }
        });
        const topTenants = Array.from(tenantVolumes.values())
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5);
        res.status(200).json({
            totalTenants,
            totalUsers,
            totalVolume,
            totalInvoices,
            volumeHistory,
            topTenants
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving global metrics' });
    }
};
exports.getGlobalMetrics = getGlobalMetrics;
const getTenants = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const tenants = await prisma_1.prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, sales: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(tenants);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving tenants' });
    }
};
exports.getTenants = getTenants;
const createTenant = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { companyName, adminName, adminEmail } = req.body;
        if (!companyName || !adminName || !adminEmail) {
            res.status(400).json({ message: 'Faltan campos obligatorios' });
            return;
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingUser) {
            res.status(400).json({ message: 'El correo ya está registrado en el sistema' });
            return;
        }
        // Generate random secure password (e.g., Cmrza-8Xy2)
        const randomPassword = 'Cmrz-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(randomPassword, salt);
        const tenant = await prisma_1.prisma.tenant.create({
            data: { name: companyName }
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                tenantId: tenant.id,
                email: adminEmail,
                password: hashedPassword,
                name: adminName,
                role: 'ADMIN',
            },
        });
        // Enviar correo de bienvenida con credenciales
        // Usamos un bloque try-catch para no fallar la creación del comercio si el correo falla
        try {
            await (0, email_service_1.sendWelcomeEmail)({
                toEmail: adminEmail,
                adminName,
                companyName,
                password: randomPassword
            });
        }
        catch (emailError) {
            console.error('No se pudo enviar el correo de bienvenida:', emailError);
        }
        res.status(201).json({
            message: 'Comercio creado exitosamente',
            tenant,
            credentials: { email: adminEmail, password: randomPassword }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating tenant' });
    }
};
exports.createTenant = createTenant;
const toggleTenantStatus = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { id } = req.params;
        const tenant = await prisma_1.prisma.tenant.findUnique({ where: { id: id } });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant not found' });
            return;
        }
        const updatedTenant = await prisma_1.prisma.tenant.update({
            where: { id: id },
            data: { isActive: !tenant.isActive },
            select: { id: true, isActive: true, name: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: updatedTenant.isActive ? 'TENANT_ACTIVATED' : 'TENANT_SUSPENDED',
                actorId: req.user.id,
                targetId: id,
                details: JSON.stringify({ name: updatedTenant.name })
            }
        });
        if (!updatedTenant.isActive) {
            try {
                const adminUser = await prisma_1.prisma.user.findFirst({
                    where: { tenantId: id, role: 'ADMIN' }
                });
                if (adminUser) {
                    await (0, email_service_1.sendSuspensionEmail)({
                        toEmail: adminUser.email,
                        companyName: updatedTenant.name
                    });
                }
            }
            catch (e) {
                console.error('Error enviando email de suspensión:', e);
            }
        }
        res.status(200).json(updatedTenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating tenant status' });
    }
};
exports.toggleTenantStatus = toggleTenantStatus;
const impersonateTenant = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { id } = req.params;
        const tenant = await prisma_1.prisma.tenant.findUnique({ where: { id: id } });
        if (!tenant || !tenant.isActive) {
            res.status(404).json({ message: 'Comercio no encontrado o está suspendido.' });
            return;
        }
        // Buscar el primer usuario ADMIN de este comercio
        const adminUser = await prisma_1.prisma.user.findFirst({
            where: { tenantId: id, role: 'ADMIN' },
            orderBy: { createdAt: 'asc' }
        });
        if (!adminUser) {
            res.status(404).json({ message: 'Este comercio no tiene usuarios administradores.' });
            return;
        }
        // Generar un token de sesión para este usuario, pero inyectando impersonatedBy
        const { generateToken } = require('../utils/jwt');
        const token = generateToken({
            id: adminUser.id,
            role: adminUser.role,
            tenantId: adminUser.tenantId,
            impersonatedBy: req.user.id
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'IMPERSONATION_STARTED',
                actorId: req.user.id,
                targetId: id,
                details: JSON.stringify({ tenantName: tenant.name, impersonatedUserId: adminUser.id })
            }
        });
        res.status(200).json({ message: 'Modo Dios activado. Redirigiendo...' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error de servidor al iniciar impersonation' });
    }
};
exports.impersonateTenant = impersonateTenant;
const changeTenantPlan = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { id } = req.params;
        const { plan } = req.body;
        if (!['PRO', 'PREMIUM'].includes(plan)) {
            res.status(400).json({ message: 'Invalid plan selected' });
            return;
        }
        const tenant = await prisma_1.prisma.tenant.findUnique({ where: { id: id } });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant not found' });
            return;
        }
        const updatedTenant = await prisma_1.prisma.tenant.update({
            where: { id: id },
            data: { plan },
            select: { id: true, plan: true, name: true }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'PLAN_CHANGED',
                actorId: req.user.id,
                targetId: id,
                details: JSON.stringify({ newPlan: plan, tenantName: updatedTenant.name })
            }
        });
        res.status(200).json(updatedTenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating tenant plan' });
    }
};
exports.changeTenantPlan = changeTenantPlan;
const DEFAULT_MODULES = [
    'Ventas', 'Cobros', 'Pagos', 'Recibos',
    'Catálogo', 'Clientes', 'Reportes', 'Integraciones', 'Configuración'
];
const getPlans = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        // Inicializar planes si no existen
        for (const planName of ['PRO', 'PREMIUM']) {
            const exists = await prisma_1.prisma.planConfig.findUnique({ where: { name: planName } });
            if (!exists) {
                await prisma_1.prisma.planConfig.create({
                    data: {
                        name: planName,
                        features: JSON.stringify(DEFAULT_MODULES) // Todo habilitado por defecto
                    }
                });
            }
        }
        const plans = await prisma_1.prisma.planConfig.findMany({
            orderBy: { name: 'desc' } // PRO, PREMIUM
        });
        res.status(200).json(plans);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving plans' });
    }
};
exports.getPlans = getPlans;
const updatePlan = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { name } = req.params;
        const { features } = req.body; // array de strings
        if (!Array.isArray(features)) {
            res.status(400).json({ message: 'Features must be an array' });
            return;
        }
        const updated = await prisma_1.prisma.planConfig.update({
            where: { name: name },
            data: { features: JSON.stringify(features) }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'PLAN_CONFIG_UPDATED',
                actorId: req.user.id,
                targetId: name,
                details: JSON.stringify({ features })
            }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating plan' });
    }
};
exports.updatePlan = updatePlan;
const getHealth = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        // Ping DB
        let dbStatus = 'ok';
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
        }
        catch (e) {
            dbStatus = 'error';
        }
        const memoryUsage = process.memoryUsage();
        res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            dbStatus,
            memory: {
                rss: memoryUsage.rss,
                heapTotal: memoryUsage.heapTotal,
                heapUsed: memoryUsage.heapUsed,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving health status' });
    }
};
exports.getHealth = getHealth;
const getAuditLogs = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const logs = await prisma_1.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        // Enriquecer con nombres de usuarios si es posible
        const actorIds = [...new Set(logs.map(l => l.actorId))];
        const actors = await prisma_1.prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, name: true, email: true }
        });
        const actorMap = new Map(actors.map(a => [a.id, a]));
        const enrichedLogs = logs.map(log => ({
            ...log,
            actor: actorMap.get(log.actorId) || null
        }));
        res.status(200).json(enrichedLogs);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving audit logs' });
    }
};
exports.getAuditLogs = getAuditLogs;
const getGatewaysStatus = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const checkService = async (url) => {
            try {
                const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
                return response.status >= 200 && response.status < 500 ? 'ok' : 'error';
            }
            catch (e) {
                // Fallback to GET if HEAD fails
                try {
                    const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
                    return response.status >= 200 && response.status < 500 ? 'ok' : 'error';
                }
                catch (err) {
                    return 'error';
                }
            }
        };
        const [qpayproStatus, recurrenteStatus] = await Promise.all([
            checkService('https://payments.qpaypro.com'),
            checkService('https://app.recurrente.com')
        ]);
        res.status(200).json({
            qpaypro: qpayproStatus,
            recurrente: recurrenteStatus
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error validating gateways' });
    }
};
exports.getGatewaysStatus = getGatewaysStatus;
const getAllUsers = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const users = await prisma_1.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: { name: true, plan: true }
                }
            }
        });
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantName: user.tenant?.name || 'Sistema (Superadmin)',
            tenantPlan: user.tenant?.plan || '-',
            createdAt: user.createdAt
        }));
        res.status(200).json(formattedUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving all users' });
    }
};
exports.getAllUsers = getAllUsers;
const createSuperadmin = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({ message: 'Nombre y correo son requeridos' });
            return;
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'El correo ya está en uso' });
            return;
        }
        const randomPassword = 'SAdmin-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(randomPassword, salt);
        const newSuperadmin = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'SUPERADMIN',
            }
        });
        try {
            await (0, email_service_1.sendSuperAdminWelcomeEmail)({
                toEmail: email,
                adminName: name,
                password: randomPassword
            });
        }
        catch (e) {
            console.error('Error enviando email a nuevo superadmin:', e);
        }
        res.status(201).json({
            message: 'Superadmin creado exitosamente',
            user: { id: newSuperadmin.id, name: newSuperadmin.name, email: newSuperadmin.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating superadmin' });
    }
};
exports.createSuperadmin = createSuperadmin;
const deleteTenant = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { id } = req.params;
        const tenant = await prisma_1.prisma.tenant.findUnique({ where: { id: id } });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant not found' });
            return;
        }
        await prisma_1.prisma.tenant.delete({ where: { id: id } });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'TENANT_DELETED',
                actorId: req.user.id,
                targetId: id,
                details: JSON.stringify({ name: tenant.name })
            }
        });
        res.status(200).json({ message: 'Tenant deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting tenant' });
    }
};
exports.deleteTenant = deleteTenant;
const deleteUser = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { id } = req.params;
        // Prevenir auto-eliminación
        if (id === req.user.id) {
            res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await prisma_1.prisma.user.delete({ where: { id: id } });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'USER_DELETED',
                actorId: req.user.id,
                targetId: id,
                details: JSON.stringify({ email: user.email, role: user.role })
            }
        });
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2003') {
            res.status(400).json({ message: 'No se puede eliminar el usuario porque tiene registros asociados (ej. ventas)' });
            return;
        }
        res.status(500).json({ message: 'Server error deleting user' });
    }
};
exports.deleteUser = deleteUser;
const createGlobalNotification = async (req, res) => {
    try {
        if (req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ message: 'Forbidden: SuperAdmin only' });
            return;
        }
        const { title, message, type } = req.body;
        if (!title || !message) {
            res.status(400).json({ message: 'Title and message are required' });
            return;
        }
        // Get all active tenants
        const activeTenants = await prisma_1.prisma.tenant.findMany({
            where: { isActive: true },
            select: { id: true }
        });
        if (activeTenants.length === 0) {
            res.status(404).json({ message: 'No active tenants found' });
            return;
        }
        const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
        // Create a notification for each active tenant
        const notificationsData = activeTenants.map(tenant => ({
            tenantId: tenant.id,
            title,
            message,
            type: type || 'INFO',
            expiresAt
        }));
        await prisma_1.prisma.notification.createMany({
            data: notificationsData
        });
        // Notify connected SSE clients in real-time
        notificationsData.forEach(notif => {
            (0, notifications_controller_1.broadcastNotification)(notif.tenantId, {
                ...notif,
                id: crypto.randomUUID(), // Temp ID until page reload or it could be omitted
                isRead: false
            });
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: 'GLOBAL_NOTIFICATION_SENT',
                actorId: req.user.id,
                details: JSON.stringify({ title, type, tenantCount: activeTenants.length })
            }
        });
        res.status(201).json({ message: 'Global notification sent successfully', count: activeTenants.length });
    }
    catch (error) {
        console.error('Error creating global notification:', error);
        res.status(500).json({ message: 'Server error creating global notification' });
    }
};
exports.createGlobalNotification = createGlobalNotification;
