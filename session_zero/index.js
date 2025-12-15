import express from 'express';
import { z } from 'zod';
import { prisma } from './database/prisma.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);


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