import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { uploadImageToS3 } from '../services/s3.service';
import path from 'path';
export const getTenantIntegrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        qpayproApiKey: true,
        qpayproApiSecret: true,
        recurrenteSecretKey: true,
        recurrenteTerminalId: true
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    res.json({
      qpayproApiKey: tenant.qpayproApiKey || '',
      qpayproApiSecret: tenant.qpayproApiSecret || '',
      recurrenteSecretKey: tenant.recurrenteSecretKey || '',
      recurrenteTerminalId: tenant.recurrenteTerminalId || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving integrations' });
  }
};

export const updateTenantIntegrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { qpayproApiKey, qpayproApiSecret, recurrenteSecretKey, recurrenteTerminalId } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        qpayproApiKey: qpayproApiKey || null,
        qpayproApiSecret: qpayproApiSecret || null,
        recurrenteSecretKey: recurrenteSecretKey || null,
        recurrenteTerminalId: recurrenteTerminalId || null
      },
      select: {
        qpayproApiKey: true,
        qpayproApiSecret: true,
        recurrenteSecretKey: true,
        recurrenteTerminalId: true
      }
    });

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating integrations' });
  }
};

export const getTenantSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        logoUrl: true,
        receiptTemplate: true
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant not found' });
      return;
    }

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving settings' });
  }
};

export const updateTenantSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, receiptTemplate } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: name !== undefined ? name : undefined,
        receiptTemplate: receiptTemplate !== undefined ? receiptTemplate : undefined
      },
      select: {
        name: true,
        logoUrl: true,
        receiptTemplate: true
      }
    });

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
};

export const uploadLogo = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const ext = path.extname(req.file.originalname);
    const fileName = `logos/${tenantId}-${Date.now()}${ext}`;
    
    // Subir la imagen a S3 directamente desde la memoria
    const logoUrl = await uploadImageToS3(req.file.buffer, fileName, req.file.mimetype);

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl },
      select: { logoUrl: true }
    });

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error uploading logo' });
  }
};
