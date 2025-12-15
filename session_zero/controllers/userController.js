import { prisma } from '../database/prisma.js';
import { z } from 'zod';

export const getCurrentUser = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const user = await prisma.users.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
};

export const getAllusers = async (req, res) => {
    const users = await prisma.users.findMany();
    res.json(users);
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const userUpdateSchema = z.object({
        id: z.uuid(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    });
    const { success, data, error } = userUpdateSchema.safeParse({
        id: userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    if (!success) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });
    }

    const user = {
        first_name: data.firstName,
        last_name: data.lastName,
    }
    const updatedUser = await prisma.users.update({
        where: {
            id: userId,
        },
        data: user,
        omit: {
            password_hash: true,
        }
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
};

export const deleteUser = async (req, res) => {
    const userId = req.params.id;
    const userDeleteSchema = z.object({
        id: z.uuid(),
    });
    const { success, data, error } = userDeleteSchema.safeParse({
        id: userId,
    });
    if (!success) {
        return res.status(400).json({ message: 'Invalid request data', data: z.flattenErrors(error) });
    }

    const user = await prisma.users.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    } else {
        const deleteUser = await prisma.users.delete({
            where: {
                id: userId,
            }, omit: { password_hash: true, }
        });
        res.json({ message: 'User deleted successfully', user: deleteUser });
    }

    
};