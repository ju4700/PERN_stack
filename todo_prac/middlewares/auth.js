import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';


export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : "";
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if(err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    });
};