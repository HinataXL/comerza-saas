"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLogo = exports.updateTenantSettings = exports.getTenantSettings = exports.updateTenantIntegrations = exports.getTenantIntegrations = void 0;
const prisma_1 = require("../lib/prisma");
const s3_service_1 = require("../services/s3.service");
const path_1 = __importDefault(require("path"));
const getTenantIntegrations = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                qpayproApiKey: true,
                qpayproApiSecret: true,
                isQpayproActive: true,
                recurrenteSecretKey: true,
                recurrenteTerminalId: true,
                isRecurrenteActive: true
            }
        });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant not found' });
            return;
        }
        res.json({
            qpayproApiKey: tenant.qpayproApiKey || '',
            qpayproApiSecret: tenant.qpayproApiSecret || '',
            isQpayproActive: tenant.isQpayproActive || false,
            recurrenteSecretKey: tenant.recurrenteSecretKey || '',
            recurrenteTerminalId: tenant.recurrenteTerminalId || '',
            isRecurrenteActive: tenant.isRecurrenteActive || false
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving integrations' });
    }
};
exports.getTenantIntegrations = getTenantIntegrations;
const updateTenantIntegrations = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { qpayproApiKey, qpayproApiSecret, isQpayproActive, recurrenteSecretKey, recurrenteTerminalId, isRecurrenteActive } = req.body;
        const tenant = await prisma_1.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                qpayproApiKey: qpayproApiKey || null,
                qpayproApiSecret: qpayproApiSecret || null,
                isQpayproActive: isQpayproActive !== undefined ? isQpayproActive : undefined,
                recurrenteSecretKey: recurrenteSecretKey || null,
                recurrenteTerminalId: recurrenteTerminalId || null,
                isRecurrenteActive: isRecurrenteActive !== undefined ? isRecurrenteActive : undefined
            },
            select: {
                qpayproApiKey: true,
                qpayproApiSecret: true,
                isQpayproActive: true,
                recurrenteSecretKey: true,
                recurrenteTerminalId: true,
                isRecurrenteActive: true
            }
        });
        res.json(tenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating integrations' });
    }
};
exports.updateTenantIntegrations = updateTenantIntegrations;
const getTenantSettings = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                name: true,
                logoUrl: true,
                receiptTemplate: true,
                reservationNotificationType: true
            }
        });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant not found' });
            return;
        }
        res.json(tenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving settings' });
    }
};
exports.getTenantSettings = getTenantSettings;
const updateTenantSettings = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { name, receiptTemplate, reservationNotificationType } = req.body;
        const tenant = await prisma_1.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: name !== undefined ? name : undefined,
                receiptTemplate: receiptTemplate !== undefined ? receiptTemplate : undefined,
                reservationNotificationType: reservationNotificationType !== undefined ? reservationNotificationType : undefined
            },
            select: {
                name: true,
                logoUrl: true,
                receiptTemplate: true,
                reservationNotificationType: true
            }
        });
        res.json(tenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating settings' });
    }
};
exports.updateTenantSettings = updateTenantSettings;
const uploadLogo = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'No image provided' });
            return;
        }
        const ext = path_1.default.extname(req.file.originalname);
        const fileName = `logos/${tenantId}-${Date.now()}${ext}`;
        // Subir la imagen a S3 directamente desde la memoria
        const logoUrl = await (0, s3_service_1.uploadFileToS3)(req.file.buffer, fileName, req.file.mimetype);
        const tenant = await prisma_1.prisma.tenant.update({
            where: { id: tenantId },
            data: { logoUrl },
            select: { logoUrl: true }
        });
        res.json(tenant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error uploading logo' });
    }
};
exports.uploadLogo = uploadLogo;
