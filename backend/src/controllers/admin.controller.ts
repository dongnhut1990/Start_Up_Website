import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
  ]);

  const recentPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { paidAt: "desc" },
    take: 10,
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentPayments,
    },
  });
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true,
      isActive: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: { users } });
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role, isActive },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  res.json({ success: true, data: { user } });
};

export const getCourseEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });
  res.json({ success: true, data: { enrollments } });
};

export const removeEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { enrollmentId } = req.params;
  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  res.json({ success: true, message: "Đã xoá học viên khỏi khoá học" });
};

export const getAllSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, courseId } = req.query as { status?: string; courseId?: string };

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (courseId) where.task = { courseId };

  const submissions = await prisma.taskSubmission.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      task: {
        select: {
          id: true, title: true, maxScore: true,
          course: { select: { id: true, title: true, slug: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 100,
  });

  res.json({ success: true, data: { submissions } });
};

export const toggleCoursePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) {
    res.status(404).json({ success: false, error: "Khóa học không tồn tại" });
    return;
  }

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: { isPublished: !course.isPublished },
  });
  res.json({
    success: true,
    message: updated.isPublished ? "Đã xuất bản khóa học" : "Đã ẩn khóa học",
    data: { course: updated },
  });
};
