"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../lib/prisma");
const getProducts = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const products = await prisma_1.prisma.product.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving products' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const product = await prisma_1.prisma.product.findFirst({
            where: { id, tenantId },
        });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving product' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
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
        const product = await prisma_1.prisma.product.create({
            data: {
                tenantId,
                name,
                description,
                price: Number(price),
                stock: Number(stock || 0),
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        const { name, description, price, stock } = req.body;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        // First ensure the product exists and belongs to the tenant
        const existing = await prisma_1.prisma.product.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existing.name,
                description: description !== undefined ? description : existing.description,
                price: price !== undefined ? Number(price) : existing.price,
                stock: stock !== undefined ? Number(stock) : existing.stock,
            },
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const id = req.params.id;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const existing = await prisma_1.prisma.product.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        await prisma_1.prisma.product.delete({
            where: { id },
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};
exports.deleteProduct = deleteProduct;
