import { z } from 'zod';
import { prisma } from '../database/prisma.js';

export const createProductImage = async (req, res) => {
    const schema = z.object({
        productId: z.string().uuid(),
        img: z.string().min(1),
        alt: z.string().optional(),
        displayOrder: z.number().int().optional(),
        isPrimary: z.boolean().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const created = await prisma.product_img.create({
            data: {
                product_id: data.productId,
                img: data.img,
                alt: data.alt,
                display_order: data.displayOrder ?? 0,
                is_primary: data.isPrimary ?? false,
            },
        });
        res.json({ message: 'Product image created', productImage: created });
    } catch (e) {
        res.status(500).json({ message: 'Error creating product image', error: e.message });
    }
};

export const getProductImage = async (req, res) => {
    const id = req.params.id;

    try {
        const productImage = await prisma.product_img.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!productImage) return res.status(404).json({ message: 'Product image not found' });
        res.json(productImage);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching product image', error: e.message });
    }
};

export const getAllProductImages = async (req, res) => {
    const { productId, isPrimary } = req.query;

    const where = {};
    if (productId) where.product_id = productId;
    if (typeof isPrimary !== 'undefined') where.is_primary = isPrimary === 'true';

    try {
        const productImages = await prisma.product_img.findMany({
            where,
            orderBy: [{ display_order: 'asc' }, { id: 'asc' }],
        });
        res.json(productImages);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching product images', error: e.message });
    }
};

export const updateProductImage = async (req, res) => {
    const id = req.params.id;

    const schema = z.object({
        productId: z.string().uuid().optional(),
        img: z.string().min(1).optional(),
        alt: z.string().optional(),
        displayOrder: z.number().int().optional(),
        isPrimary: z.boolean().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    const updateData = {
        product_id: data.productId,
        img: data.img,
        alt: data.alt,
        display_order: data.displayOrder,
        is_primary: data.isPrimary,
    };

    try {
        const existing = await prisma.product_img.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Product image not found' });

        const updated = await prisma.product_img.update({ where: { id }, data: updateData });
        res.json({ message: 'Product image updated', productImage: updated });
    } catch (e) {
        res.status(500).json({ message: 'Error updating product image', error: e.message });
    }
};

export const deleteProductImage = async (req, res) => {
    const id = req.params.id;

    try {
        const existing = await prisma.product_img.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Product image not found' });

        const deleted = await prisma.product_img.delete({ where: { id } });
        res.json({ message: 'Product image deleted', productImage: deleted });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting product image', error: e.message });
    }
};
