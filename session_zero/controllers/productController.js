import { z } from 'zod';
import { prisma } from '../database/prisma.js';

export const createProduct = async (req, res) => {
    const schema = z.object({
        category: z.string().uuid(),
        name: z.string().min(1).optional(),
        price: z.string().optional(),
        discountedPrice: z.string().optional(),
        slug: z.string().min(1),
        descriptiom: z.string().optional(),
        stock_qn: z.number().int().optional(),
        specification: z.any().optional(),
        is_featured: z.boolean().optional(),
        is_active: z.boolean().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    const productData = {
        category: data.category,
        name: data.name,
        price: data.price ? data.price : undefined,
        discounted_price: data.discountedPrice ? data.discountedPrice : undefined,
        slug: data.slug,
        descriptiom: data.descriptiom,
        stock_qn: data.stock_qn ?? 0,
        specification: data.specification,
        is_featured: data.is_featured ?? false,
        is_active: data.is_active ?? true,
    };

    try {
        const product = await prisma.product.create({ data: productData });
        res.json({ message: 'Product created', product });
    } catch (e) {
        res.status(500).json({ message: 'Error creating product', error: e.message });
    }
};

export const getProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { product_img: true, product_var: true, categories: true },
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching product', error: e.message });
    }
};

export const getAllProducts = async (req, res) => {
    const { category, is_active, is_featured } = req.query;
    const where = {};
    if (category) where.category = category;
    if (typeof is_active !== 'undefined') where.is_active = is_active === 'true';
    if (typeof is_featured !== 'undefined') where.is_featured = is_featured === 'true';

    try {
        const products = await prisma.product.findMany({ where, include: { product_img: true } });
        res.json(products);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching products', error: e.message });
    }
};

export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const schema = z.object({
        category: z.string().uuid().optional(),
        name: z.string().optional(),
        price: z.string().optional(),
        discountedPrice: z.string().optional(),
        slug: z.string().optional(),
        descriptiom: z.string().optional(),
        stock_qn: z.number().int().optional(),
        specification: z.any().optional(),
        is_featured: z.boolean().optional(),
        is_active: z.boolean().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    const updateData = {
        category: data.category,
        name: data.name,
        price: data.price ? data.price : undefined,
        discounted_price: data.discountedPrice ? data.discountedPrice : undefined,
        slug: data.slug,
        descriptiom: data.descriptiom,
        stock_qn: data.stock_qn,
        specification: data.specification,
        is_featured: data.is_featured,
        is_active: data.is_active,
    };

    try {
        const updated = await prisma.product.update({ where: { id }, data: updateData });
        res.json({ message: 'Product updated', product: updated });
    } catch (e) {
        res.status(500).json({ message: 'Error updating product', error: e.message });
    }
};

export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Product not found' });
        const deleted = await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted', product: deleted });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting product', error: e.message });
    }
};
