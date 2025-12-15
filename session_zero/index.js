import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.js';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(express.json());

app.post('/auth/sign-in', async (req, res) => {
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
            const secretKey = process.env.JWT_SECRET
            const token = jwt.sign({userId: user.id, email: user.email}, secretKey, {expiresIn: '1h'});
            res.json({message: 'Sign-in successful', data: {token}});

        } else{
            res.status(401).json({message: 'Invalid password'});
        }
    }
});

app.post('/auth/sign-up', async (req, res) => {
    
    const userSchema = z.object({
        firstName: z.string().min(3),
        lastName: z.string().min(3),
        email: z.email(),
        password: z.string().min(8),
    });
    
    const {success, data, error} = userSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({message: 'Invalid request data', errors: error.flatten()});
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password_hash: hashedPassword,
    };

    const createUser = await prisma.users.create({
        data: user,
    });

    if (!createUser) {
        return  res.status(500).json({message: 'Error creating user'});
    }else{
        res.json({message: 'User created successfully', user: createUser});
    }

    res.json({user:user});
});

app.get('/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization.split(' ')[1];
    if (!authHeader) {
        return res.status(401).json({message: 'Authorization header missing'});
    }
    const token = authHeader;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const user = await prisma.users.findUnique({
            where: {
                id: decoded.userId,
            }, 
            omit: { password_hash: true, }
        });
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json({user});
    });
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


// app.get('/users', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM "users"');
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error fetching users');
//     }
// });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});