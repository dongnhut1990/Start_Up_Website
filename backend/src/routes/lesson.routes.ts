import { Router } from "express";
import * as lessonController from "../controllers/lesson.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true }); // để nhận courseId từ parent router

router.use(authenticate, authorize("ADMIN", "INSTRUCTOR"));

router.post("/", lessonController.createLesson);
router.put("/reorder", lessonController.reorderLessons);
router.put("/:lessonId", lessonController.updateLesson);
router.delete("/:lessonId", lessonController.deleteLesson);

export default router;
