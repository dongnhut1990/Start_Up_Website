import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

export const getInstructorDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const instructorId = req.user!.userId;

  const courses = await prisma.course.findMany({
    where: { instructorId },
    include: { _count: { select: { enrollments: true, lessons: true } } },
  });

  const courseIds = courses.map((c) => c.id);

  const [totalEnrollments, pendingSubmissions] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: { in: ["ACTIVE", "COMPLETED"] } } }),
    prisma.taskSubmission.count({ where: { task: { courseId: { in: courseIds } }, status: "SUBMITTED" } }),
  ]);

  res.json({
    success: true,
    data: {
      totalCourses: courses.length,
      totalEnrollments,
      pendingSubmissions,
      courses,
    },
  });
};

export const getInstructorCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const courses = await prisma.course.findMany({
    where: { instructorId: req.user!.userId },
    include: { _count: { select: { enrollments: true, lessons: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: { courses } });
};

export const getInstructorSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, courseId } = req.query as { status?: string; courseId?: string };

  const instructorCourseIds = await prisma.course
    .findMany({ where: { instructorId: req.user!.userId }, select: { id: true } })
    .then((c) => c.map((x) => x.id));

  const taskWhere: Record<string, unknown> = { courseId: { in: instructorCourseIds } };
  if (courseId && instructorCourseIds.includes(courseId)) taskWhere.courseId = courseId;

  const where: Record<string, unknown> = { task: taskWhere };
  if (status) where.status = status;

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
