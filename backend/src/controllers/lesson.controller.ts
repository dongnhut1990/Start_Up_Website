import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

/** Kiểm tra quyền chỉnh sửa khoá học */
async function checkCourseOwner(courseId: string, userId: string, role: string): Promise<boolean> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return false;
  return role === "ADMIN" || course.instructorId === userId;
}

export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  if (!(await checkCourseOwner(courseId, req.user!.userId, req.user!.role))) {
    res.status(403).json({ success: false, error: "Không có quyền thêm bài học" });
    return;
  }

  const { title, description, videoUrl, content, duration, isFree } = req.body;

  // Tự động tính order (đặt cuối danh sách)
  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  const order = (lastLesson?.order ?? 0) + 1;

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title,
      description: description || null,
      videoUrl: videoUrl || null,
      content: content || null,
      duration: Number(duration) || 0,
      isFree: Boolean(isFree),
      order,
    },
  });

  // Cập nhật totalLessons và tổng duration của khoá học
  await updateCourseMeta(courseId);

  res.status(201).json({ success: true, data: { lesson } });
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.params;

  if (!(await checkCourseOwner(courseId, req.user!.userId, req.user!.role))) {
    res.status(403).json({ success: false, error: "Không có quyền chỉnh sửa bài học" });
    return;
  }

  const { title, description, videoUrl, content, duration, isFree } = req.body;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      description: description || null,
      videoUrl: videoUrl || null,
      content: content || null,
      duration: Number(duration) || 0,
      isFree: Boolean(isFree),
    },
  });

  await updateCourseMeta(courseId);

  res.json({ success: true, data: { lesson } });
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, lessonId } = req.params;

  if (!(await checkCourseOwner(courseId, req.user!.userId, req.user!.role))) {
    res.status(403).json({ success: false, error: "Không có quyền xóa bài học" });
    return;
  }

  await prisma.lesson.delete({ where: { id: lessonId } });

  // Sắp xếp lại order sau khi xóa
  const remaining = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
  await Promise.all(
    remaining.map((l, i) =>
      prisma.lesson.update({ where: { id: l.id }, data: { order: i + 1 } })
    )
  );

  await updateCourseMeta(courseId);

  res.json({ success: true, message: "Đã xóa bài học" });
};

export const reorderLessons = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { orderedIds } = req.body as { orderedIds: string[] };

  if (!(await checkCourseOwner(courseId, req.user!.userId, req.user!.role))) {
    res.status(403).json({ success: false, error: "Không có quyền" });
    return;
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.lesson.update({ where: { id }, data: { order: index + 1 } })
    )
  );

  res.json({ success: true, message: "Đã cập nhật thứ tự bài học" });
};

/** Cập nhật totalLessons và duration của khoá học */
async function updateCourseMeta(courseId: string) {
  const lessons = await prisma.lesson.findMany({ where: { courseId } });
  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  await prisma.course.update({
    where: { id: courseId },
    data: { totalLessons: lessons.length, duration: totalDuration },
  });
}
