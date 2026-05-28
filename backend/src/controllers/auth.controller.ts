import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

const generateToken = (userId: string, email: string, role: string) =>
  jwt.sign({ userId, email, role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  const { email, password, name, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: "Email đã được sử dụng" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, phone },
    select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
  });

  const token = generateToken(user.id, user.email, user.role);
  res.status(201).json({ success: true, data: { user, token } });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, error: "Email hoặc mật khẩu không đúng" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, error: "Email hoặc mật khẩu không đúng" });
    return;
  }

  const token = generateToken(user.id, user.email, user.role);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword, token } });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, email: true, name: true, role: true, avatar: true,
      phone: true, createdAt: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, thumbnail: true, slug: true } } },
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: "Người dùng không tồn tại" });
    return;
  }
  res.json({ success: true, data: { user } });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, phone, avatar },
    select: { id: true, email: true, name: true, role: true, avatar: true, phone: true },
  });
  res.json({ success: true, data: { user } });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  if (!user) {
    res.status(404).json({ success: false, error: "Người dùng không tồn tại" });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400).json({ success: false, error: "Mật khẩu hiện tại không đúng" });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  res.json({ success: true, message: "Đổi mật khẩu thành công" });
};
