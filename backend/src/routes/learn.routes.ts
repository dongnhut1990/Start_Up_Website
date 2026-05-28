import { Router } from "express";
import * as learnController from "../controllers/learn.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/:slug/certificate", learnController.getCertificate);
router.get("/:slug", learnController.getCourseContent);
router.post("/:slug/lessons/:lessonId/complete", learnController.toggleLessonComplete);
router.put("/lessons/:lessonId/watchtime", learnController.updateWatchTime);

export default router;
