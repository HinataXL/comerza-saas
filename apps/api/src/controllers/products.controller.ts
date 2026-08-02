import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const id = req.params.id as string;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const { name, description, price, stock } = req.body;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    if (!name || price === undefined) {
      res.status(400).json({ message: 'Name and price are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
        name,
        description,
        price: Number(price),
        stock: Number(stock || 0),
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const id = req.params.id as string;
    const { name, description, price, stock } = req.body;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    // First ensure the product exists and belongs to the tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        price: price !== undefined ? Number(price) : existing.price,
        stock: stock !== undefined ? Number(stock) : existing.stock,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const id = req.params.id as string;

    if (!tenantId) {
      res.status(401).json({ message: 'Unauthorized: No tenant specified' });
      return;
    }

    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
