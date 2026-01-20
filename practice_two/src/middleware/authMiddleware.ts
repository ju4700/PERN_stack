import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token){
        return res.status(401).json({ message: 'No token provided' });
    }
    const secret = token.split(' ')[1];
    try {
        const decoded = jwt.verify(secret, precess.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};