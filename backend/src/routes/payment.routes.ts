import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate, paymentController.createPayment);
router.get("/history", authenticate, paymentController.getPaymentHistory);
router.get("/vnpay/callback", paymentController.vnpayCallback as never);
router.post("/momo/callback", paymentController.momoCallback as never);

export default router;
