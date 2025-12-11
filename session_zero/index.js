import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.js';

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.json());

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

app.get('/users', async (req, res) => {
    const users = await prisma.users.findMany();
    res.json(users);
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