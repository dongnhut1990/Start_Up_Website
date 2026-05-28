import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

type AuthReq = Request & { user: { id: string; role: string } };

// ─── Admin/Instructor ───────────────────────────────────────────────

export const getCourseTasks = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const tasks = await prisma.task.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: { _count: { select: { submissions: true } } },
  });
  res.json({ success: true, data: { tasks } });
};

export const createTask = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  const last = await prisma.task.findFirst({ where: { courseId }, orderBy: { order: "desc" } });
  const order = (last?.order ?? 0) + 1;

  const task = await prisma.task.create({
    data: {
      courseId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxScore: maxScore ?? 100,
      order,
    },
  });
  res.status(201).json({ success: true, data: { task } });
};

export const updateTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxScore,
    },
  });
  res.json({ success: true, data: { task } });
};

export const deleteTask = async (req: Request, res: Response) => {
  const { taskId, courseId } = req.params;
  await prisma.task.delete({ where: { id: taskId } });

  // Re-order remaining tasks
  const remaining = await prisma.task.findMany({ where: { courseId }, orderBy: { order: "asc" } });
  await Promise.all(remaining.map((t: { id: string }, i: number) => prisma.task.update({ where: { id: t.id }, data: { order: i + 1 } })));

  res.json({ success: true, message: "Đã xoá bài tập" });
};

export const getSubmissions = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const submissions = await prisma.taskSubmission.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { submittedAt: "desc" },
  });
  res.json({ success: true, data: { submissions } });
};

export const reviewSubmission = async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { score, feedback, status } = req.body;

  const submission = await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback,
      status,
      reviewedAt: new Date(),
    },
  });
  res.json({ success: true, data: { submission }, message: "Đã chấm điểm" });
};

// ─── Student ────────────────────────────────────────────────────────

export const getMySubmission = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req as AuthReq).user.id;

  const submission = await prisma.taskSubmission.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });
  res.json({ success: true, data: { submission } });
};

export const submitTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = (req as AuthReq).user.id;
  const { content, fileUrl } = req.body;

  if (!content?.trim()) {
    res.status(400).json({ success: false, error: "Nội dung nộp bài không được trống" });
    return;
  }

  const existing = await prisma.taskSubmission.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });

  let submission;
  if (existing) {
    submission = await prisma.taskSubmission.update({
      where: { id: existing.id },
      data: { content, fileUrl: fileUrl || null, status: "SUBMITTED", submittedAt: new Date() },
    });
  } else {
    submission = await prisma.taskSubmission.create({
      data: { taskId, userId, content, fileUrl: fileUrl || null, status: "SUBMITTED" },
    });
  }

  res.json({ success: true, data: { submission }, message: "Nộp bài thành công!" });
};

/** Tất cả bài tập của student across all enrolled courses */
export const getMyAllTasks = async (req: Request, res: Response) => {
  const userId = (req as AuthReq).user.id;

  const userEnrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { courseId: true, course: { select: { id: true, title: true, slug: true } } },
  });

  if (userEnrollments.length === 0) {
    res.json({ success: true, data: { tasks: [] } });
    return;
  }

  const courseIds = userEnrollments.map((e) => e.courseId);
  const courseMap = new Map(userEnrollments.map((e) => [e.courseId, e.course]));

  const tasks = await prisma.task.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: [{ course: { title: "asc" } }, { order: "asc" }],
    include: {
      submissions: {
        where: { userId },
        select: { id: true, status: true, score: true, feedback: true, submittedAt: true, reviewedAt: true },
      },
    },
  });

  const result = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    maxScore: t.maxScore,
    order: t.order,
    courseId: t.courseId,
    courseTitle: courseMap.get(t.courseId)?.title ?? "",
    courseSlug: courseMap.get(t.courseId)?.slug ?? "",
    submission: t.submissions[0] ?? null,
  }));

  res.json({ success: true, data: { tasks: result } });
};

export const getTasksForStudent = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = (req as AuthReq).user.id;

  const tasks = await prisma.task.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      submissions: {
        where: { userId },
        select: { id: true, status: true, score: true, feedback: true, submittedAt: true, reviewedAt: true },
      },
    },
  });

  type TaskWithSub = typeof tasks[number];
  const tasksWithSubmission = tasks.map((t: TaskWithSub) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    maxScore: t.maxScore,
    order: t.order,
    submission: t.submissions[0] ?? null,
  }));

  res.json({ success: true, data: { tasks: tasksWithSubmission } });
};
