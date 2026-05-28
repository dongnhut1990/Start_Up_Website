import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", courseController.getCourses);
router.get("/:slug", authenticate, courseController.getCourseBySlug);

router.post("/", authenticate, authorize("ADMIN", "INSTRUCTOR"), courseController.createCourse);
router.put("/:id", authenticate, authorize("ADMIN", "INSTRUCTOR"), courseController.updateCourse);
router.delete("/:id", authenticate, authorize("ADMIN", "INSTRUCTOR"), courseController.deleteCourse);

router.get("/me/enrollments", authenticate, courseController.getMyEnrollments);

export default router;
