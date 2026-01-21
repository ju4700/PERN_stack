import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

export const userSignup = async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const created = await prisma.users.create({
    data: { first_name: firstName, last_name: lastName, email, password_hash },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.json({ message: "User created successfully", user: created });
};

export const userSignin = async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const user = await prisma.users.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Sign-in successful", data: { token } });
};

export const getCurrentUser = async (req, res) => {
  res.json({
    status: "success",
    message: "User profile fetched successfully",
    data: { user: req.user },
  });
};