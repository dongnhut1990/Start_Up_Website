import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  getCourseTasks,
  createTask,
  updateTask,
  deleteTask,
  getSubmissions,
  reviewSubmission,
  getMySubmission,
  submitTask,
  getTasksForStudent,
  getMyAllTasks,
} from "../controllers/task.controller";

const router = Router({ mergeParams: true });

// All routes require auth
router.use(authenticate);

// Student: view tasks with own submission status
router.get("/student", getTasksForStudent);

// Admin/Instructor: list tasks
router.get("/", authorize("ADMIN", "INSTRUCTOR"), getCourseTasks);

// Admin/Instructor: CRUD
router.post("/", authorize("ADMIN", "INSTRUCTOR"), createTask);
router.put("/:taskId", authorize("ADMIN", "INSTRUCTOR"), updateTask);
router.delete("/:taskId", authorize("ADMIN", "INSTRUCTOR"), deleteTask);

// Admin: view all submissions for a task
router.get("/:taskId/submissions", authorize("ADMIN", "INSTRUCTOR"), getSubmissions);

// Admin: review/grade a submission
router.put("/:taskId/submissions/:submissionId/review", authorize("ADMIN", "INSTRUCTOR"), reviewSubmission);

// Student: get own submission
router.get("/:taskId/my-submission", getMySubmission);

// Student: submit / resubmit
router.post("/:taskId/submit", submitTask);

export default router;
