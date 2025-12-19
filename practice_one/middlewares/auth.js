import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma.js';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = decoded.userId;

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
            
        }
        req.user = user;
        next();
    });
};
