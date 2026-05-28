import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import * as instructorController from "../controllers/instructor.controller";

const router = Router();

router.use(authenticate, authorize("INSTRUCTOR", "ADMIN"));

router.get("/dashboard", instructorController.getInstructorDashboard);
router.get("/courses", instructorController.getInstructorCourses);
router.get("/submissions", instructorController.getInstructorSubmissions);

export default router;
