import { z } from 'zod';
import { prisma } from '../database/prisma.js';

export const createCategory = async (req, res) => {
    const schema = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        parent_id: z.string().uuid().optional(),
        descriptiom: z.string().optional(),
        image: z.string().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const category = await prisma.categories.create({
            data: {
                name: data.name,
                slug: data.slug,
                parent_id: data.parent_id,
                descriptiom: data.descriptiom,
                image: data.image ?? '',
            },
        });
        res.json({ message: 'Category created', category });
    } catch (e) {
        res.status(500).json({ message: 'Error creating category', error: e.message });
    }
};

export const getCategory = async (req, res) => {
    const id = req.params.id;
    try {
        const category = await prisma.categories.findUnique({
            where: { id },
            include: { other_categories: true, product: true },
        });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching category', error: e.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.categories.findMany({ include: { other_categories: true } });
        res.json(categories);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching categories', error: e.message });
    }
};

export const updateCategory = async (req, res) => {
    const id = req.params.id;
    const schema = z.object({
        name: z.string().optional(),
        slug: z.string().optional(),
        parent_id: z.string().uuid().optional(),
        descriptiom: z.string().optional(),
        image: z.string().optional(),
    });

    const { success, data, error } = schema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });

    try {
        const updated = await prisma.categories.update({ where: { id }, data });
        res.json({ message: 'Category updated', category: updated });
    } catch (e) {
        res.status(500).json({ message: 'Error updating category', error: e.message });
    }
};

export const deleteCategory = async (req, res) => {
    const id = req.params.id;
    try {
        const existing = await prisma.categories.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: 'Category not found' });
        const deleted = await prisma.categories.delete({ where: { id } });
        res.json({ message: 'Category deleted', category: deleted });
    } catch (e) {
        res.status(500).json({ message: 'Error deleting category', error: e.message });
    }
};
