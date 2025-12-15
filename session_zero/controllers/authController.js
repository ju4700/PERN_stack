import { z } from 'zod';
import { prisma } from '../database/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const userSignin = async (req, res) => {
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
}

export const userSignup = async (req, res) => {
    
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
};

export const getCurrentUser = async (req, res) => {
    const user = req.user;
    res.json({
        status: 'success',
        message: 'User profile fetched successfully',
        data: {user},
    });
};