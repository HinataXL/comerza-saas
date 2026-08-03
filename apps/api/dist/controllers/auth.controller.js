"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const register = async (req, res) => {
    try {
        const { email, password, name, companyName } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const tenant = await prisma_1.prisma.tenant.create({
            data: { name: companyName || 'Mi Empresa' }
        });
        const user = await prisma_1.prisma.user.create({
            data: {
                tenantId: tenant.id,
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
            },
        });
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role, tenantId: user.tenantId });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Requerido para ngrok HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Verificar si el comercio está activo antes de dejarlo entrar
        if (user.tenant && user.tenant.isActive === false) {
            res.status(403).json({ message: 'La cuenta de este comercio ha sido suspendida por el administrador.' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role, tenantId: user.tenantId });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Requerido para ngrok HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const logout = (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            // Si estamos en Modo Dios, restaurar la sesión del Superadmin
            if (decoded.impersonatedBy) {
                const superToken = (0, jwt_1.generateToken)({
                    id: decoded.impersonatedBy,
                    role: 'SUPERADMIN',
                });
                res.cookie('token', superToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ message: 'Modo Dios finalizado', isSuperadmin: true });
                return;
            }
        }
        catch (e) {
            // Ignorar errores de token en el logout para siempre limpiar la cookie
        }
    }
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'No user in request' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { tenant: true }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        let features = [];
        if (user.tenant?.plan) {
            const planConfig = await prisma_1.prisma.planConfig.findUnique({
                where: { name: user.tenant.plan }
            });
            if (planConfig && planConfig.features) {
                features = JSON.parse(planConfig.features);
            }
        }
        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                impersonatedBy: req.user.impersonatedBy
            },
            tenant: user.tenant ? {
                id: user.tenant.id,
                name: user.tenant.name,
                plan: user.tenant.plan,
                features: features
            } : null
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving user profile' });
    }
};
exports.getMe = getMe;
