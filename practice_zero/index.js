import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("frontend"));

app.post('/auth/login', async (req, res) => {
    const loginschema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
    });
    const {success, data, error} = loginschema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({message: 'Invalid request data', errors: error.flatten()});
    }

    const user = await prisma.users.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    } else {
        if (await bcrypt.compare(data.password, user.password_hash)){
            res.json({message: 'Login successful', user: user});
        } else{
            res.status(401).json({message: 'Invalid password'});
        }
    }
});

app.post ('/auth/sign-up', async (req, res) => {
    const userSchema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.email(),
        password: z.string().min(6),
    });
    const { success, data, error } = userSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.flatten() });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password_hash: hashedPassword,
    };

    const createdUser = await prisma.users.create({
        data: newUser,
    });
    if (!createdUser) {
        return res.status(500).json({ message: 'Error creating user' });
    } else {
        res.json({ message: 'User registered successfully', user: createdUser });
    }
});

app.get('/users', async (req, res) => {
    const users = await prisma.users.findMany();
    res.json(users);
});

app.get('/users/:id', async (req, res) => {
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
});

app.patch('/users/:id', async (req, res) => {
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
});

app.delete('/users/:id', async (req, res) => {
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

    
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});