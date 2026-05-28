import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as courseController from "../controllers/course.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.put("/users/:id", adminController.updateUser);
router.get("/courses", courseController.getAllCourses);
router.patch("/courses/:id/publish", adminController.toggleCoursePublish);
router.get("/courses/:id/enrollments", adminController.getCourseEnrollments);
router.delete("/enrollments/:enrollmentId", adminController.removeEnrollment);
router.get("/submissions", adminController.getAllSubmissions);

export default router;
