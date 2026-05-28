import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

/** Lấy toàn bộ nội dung khoá học (chỉ học viên đã đăng ký) */
export const getCourseContent = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { slug } = req.params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, name: true, avatar: true } },
      lessons: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  });

  if (!course) {
    res.status(404).json({ success: false, error: "Khoá học không tồn tại" });
    return;
  }

  // Kiểm tra đã đăng ký chưa (admin/instructor bỏ qua)
  if (req.user!.role === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) {
      res.status(403).json({ success: false, error: "Bạn chưa đăng ký khoá học này" });
      return;
    }
  }

  // Lấy tiến độ từng bài học của user
  const progressList = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { courseId: course.id } },
  });

  const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));
  const completedCount = progressList.filter((p) => p.completed).length;

  const lessonsWithProgress = course.lessons.map((lesson) => ({
    ...lesson,
    progress: progressMap.get(lesson.id) ?? null,
  }));

  // Cập nhật % tiến độ enrollment
  if (course.lessons.length > 0) {
    const pct = Math.round((completedCount / course.lessons.length) * 100);
    await prisma.enrollment.updateMany({
      where: { userId, courseId: course.id },
      data: { progress: pct, ...(pct === 100 ? { status: "COMPLETED", completedAt: new Date() } : {}) },
    });
  }

  res.json({
    success: true,
    data: {
      course: { ...course, lessons: lessonsWithProgress },
      completedCount,
      totalLessons: course.lessons.length,
      progressPct: course.lessons.length > 0 ? Math.round((completedCount / course.lessons.length) * 100) : 0,
    },
  });
};

/** Đánh dấu bài học hoàn thành / chưa hoàn thành */
export const toggleLessonComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { slug, lessonId } = req.params;

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { slug } },
    include: { course: true },
  });

  if (!lesson) {
    res.status(404).json({ success: false, error: "Bài học không tồn tại" });
    return;
  }

  // Kiểm tra enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.courseId } },
  });
  if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) {
    res.status(403).json({ success: false, error: "Bạn chưa đăng ký khoá học này" });
    return;
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const newCompleted = !(existing?.completed ?? false);

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completed: newCompleted },
    update: { completed: newCompleted },
  });

  // Cập nhật lại % tiến độ khoá học
  const [completedCount, totalLessons] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, completed: true, lesson: { courseId: lesson.courseId } } }),
    prisma.lesson.count({ where: { courseId: lesson.courseId } }),
  ]);

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  await prisma.enrollment.updateMany({
    where: { userId, courseId: lesson.courseId },
    data: { progress: pct, ...(pct === 100 ? { status: "COMPLETED", completedAt: new Date() } : {}) },
  });

  res.json({
    success: true,
    data: { progress, progressPct: pct, completedCount, totalLessons },
    message: newCompleted ? "Đã đánh dấu hoàn thành" : "Đã bỏ đánh dấu hoàn thành",
  });
};

/** Lấy thông tin chứng chỉ hoàn thành khoá học */
export const getCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { slug } = req.params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { instructor: { select: { name: true } } },
  });

  if (!course) {
    res.status(404).json({ success: false, error: "Khoá học không tồn tại" });
    return;
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  if (!enrollment || enrollment.progress < 100) {
    res.status(403).json({ success: false, error: "Bạn chưa hoàn thành khoá học này" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  res.json({
    success: true,
    data: {
      certificate: {
        courseTitle: course.title,
        courseSlug: course.slug,
        instructorName: course.instructor.name,
        studentName: user!.name,
        completedAt: enrollment.completedAt ?? new Date(),
        courseCategory: course.category,
        courseLevel: course.level,
      },
    },
  });
};

/** Cập nhật thời gian xem video */
export const updateWatchTime = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { lessonId } = req.params;
  const { watchTime } = req.body as { watchTime: number };

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, watchTime },
    update: { watchTime },
  });

  res.json({ success: true });
};
