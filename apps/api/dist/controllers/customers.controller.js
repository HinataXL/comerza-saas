"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomers = void 0;
const prisma_1 = require("../lib/prisma");
const getCustomers = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const customers = await prisma_1.prisma.customer.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
        res.json(customers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving customers' });
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { name, email, phone } = req.body;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        const customer = await prisma_1.prisma.customer.create({
            data: {
                tenantId,
                name,
                email: email || null,
                phone: phone || null,
            },
        });
        res.status(201).json(customer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating customer' });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id } = req.params;
        const { name, email, phone } = req.body;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        // First ensure the customer exists and belongs to the tenant
        const existing = await prisma_1.prisma.customer.findFirst({
            where: { id: id, tenantId },
        });
        if (!existing) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        const updatedCustomer = await prisma_1.prisma.customer.update({
            where: { id: id },
            data: {
                name: name !== undefined ? name : existing.name,
                email: email !== undefined ? email : existing.email,
                phone: phone !== undefined ? phone : existing.phone,
            },
        });
        res.json(updatedCustomer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating customer' });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id } = req.params;
        if (!tenantId) {
            res.status(401).json({ message: 'Unauthorized: No tenant specified' });
            return;
        }
        const existing = await prisma_1.prisma.customer.findFirst({
            where: { id: id, tenantId },
            include: {
                _count: {
                    select: { sales: true }
                }
            }
        });
        if (!existing) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        if (existing._count.sales > 0) {
            res.status(400).json({ message: 'Cannot delete customer with existing sales. Please reassign or delete the sales first.' });
            return;
        }
        await prisma_1.prisma.customer.delete({
            where: { id: id },
        });
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting customer' });
    }
};
exports.deleteCustomer = deleteCustomer;
