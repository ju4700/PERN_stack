import { z } from 'zod';
import { prisma } from '../database/prisma.js';

export const createProductVariant = async (req, res) => {
    const schema = z.object({
        productId: z.string().uuid(),
        variantName: z.string().min(1),
        variantVal: z.string().min(1),
        priceAdjustment: z.string().optional(),
        stockQuantity: z.number().int().optional(),
        imgUrl: z.string().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const created = await prisma.product_var.create({
            data: {
                product_id: data.productId,
                variant_name: data.variantName,
                variant_val: data.variantVal,
                price_adjustment: data.priceAdjustment ? data.priceAdjustment : undefined,
                stock_quantity: data.stockQuantity ?? 0,
                img_url: data.imgUrl,
            },
        });
        res.json({ message: 'Product variant created', productVariant: created });
    } catch (e) {
        res.status(500).json({ message: 'Error creating product variant', error: e.message });
    }
};

export const getProductVariant = async (req, res) => {
    const id = req.params.id;

    try {
        const productVariant = await prisma.product_var.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!productVariant) return res.status(404).json({ message: 'Product variant not found' });
        res.json(productVariant);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching product variant', error: e.message });
    }
};

export const getAllProductVariants = async (req, res) => {
    const { productId } = req.query;

    const where = {};
    if (productId) where.product_id = productId;

    try {
        const productVariants = await prisma.product_var.findMany({
            where,
            orderBy: [{ variant_name: 'asc' }, { variant_val: 'asc' }, { id: 'asc' }],
        });
        res.json(productVariants);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching product variants', error: e.message });
    }
};

export const updateProductVariant = async (req, res) => {
    const id = req.params.id;

    const schema = z.object({
        productId: z.string().uuid().optional(),
        variantName: z.string().min(1).optional(),
        variantVal: z.string().min(1).optional(),
        priceAdjustment: z.string().optional(),
        stockQuantity: z.number().int().optional(),
        imgUrl: z.string().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    const updateData = {
        product_id: data.productId,
        variant_name: data.variantName,
        variant_val: data.variantVal,
        price_adjustment: data.priceAdjustment ? data.priceAdjustment : undefined,
        stock_quantity: data.stockQuantity,
        img_url: data.imgUrl,
    };

    try {
        const existing = await prisma.product_var.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Product variant not found' });

        const updated = await prisma.product_var.update({ where: { id }, data: updateData });
        res.json({ message: 'Product variant updated', productVariant: updated });
    } catch (e) {
        res.status(500).json({ message: 'Error updating product variant', error: e.message });
    }
};

export const deleteProductVariant = async (req, res) => {
    const id = req.params.id;

    try {
        const existing = await prisma.product_var.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Product variant not found' });

        const deleted = await prisma.product_var.delete({ where: { id } });
        res.json({ message: 'Product variant deleted', productVariant: deleted });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting product variant', error: e.message });
    }
};
