import { Response } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma";
import { AuthRequest, CourseQuery } from "../types";

export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = "1", limit = "12", category, level, search, featured } = req.query as CourseQuery;
  const skip = (Number(page) - 1) * Number(limit);

  const where: Record<string, unknown> = { isPublished: true };
  if (category) where.category = category;
  if (level) where.level = level;
  if (featured === "true") where.isFeatured = true;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true, lessons: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  res.json({
    success: true,
    data: { courses },
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

export const getCourseBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  const course = await prisma.course.findUnique({
    where: { slug: req.params.slug },
    include: {
      instructor: { select: { id: true, name: true, avatar: true } },
      lessons: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    res.status(404).json({ success: false, error: "Khóa học không tồn tại" });
    return;
  }

  let isEnrolled = false;
  if (req.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.userId, courseId: course.id } },
    });
    isEnrolled = enrollment?.status === "ACTIVE";
  }

  // Hide video URLs for non-enrolled users (except free lessons)
  const sanitizedLessons = course.lessons.map((l) => ({
    ...l,
    videoUrl: isEnrolled || l.isFree ? l.videoUrl : null,
    content: isEnrolled || l.isFree ? l.content : null,
  }));

  res.json({ success: true, data: { course: { ...course, lessons: sanitizedLessons }, isEnrolled } });
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, price, originalPrice, level, category, thumbnail, requirements, outcomes } = req.body;

  const slug = slugify(title, { lower: true, strict: true, locale: "vi" }) + "-" + Date.now();

  const course = await prisma.course.create({
    data: {
      slug,
      title,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      level,
      category,
      thumbnail,
      requirements: requirements || [],
      outcomes: outcomes || [],
      instructorId: req.user!.userId,
    },
  });

  res.status(201).json({ success: true, data: { course } });
};

export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    res.status(404).json({ success: false, error: "Khóa học không tồn tại" });
    return;
  }

  if (course.instructorId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Bạn không có quyền chỉnh sửa khóa học này" });
    return;
  }

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: { course: updated } });
};

export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    res.status(404).json({ success: false, error: "Khóa học không tồn tại" });
    return;
  }

  if (course.instructorId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Không có quyền xóa khóa học này" });
    return;
  }

  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Xóa khóa học thành công" });
};

export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, name: true, avatar: true } },
          _count: { select: { lessons: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  res.json({ success: true, data: { enrollments } });
};

// Admin: get all courses including unpublished
export const getAllCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: { courses } });
};
