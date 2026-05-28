import { Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

// ---- VNPay helpers ----
function buildVNPayUrl(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, string>>((acc, k) => { acc[k] = params[k]; return acc; }, {});

  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET || "");
  const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return `${process.env.VNPAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;
}

// ---- MoMo helpers ----
function buildMoMoSignature(rawSignature: string): string {
  return crypto
    .createHmac("sha256", process.env.MOMO_SECRET_KEY || "")
    .update(rawSignature)
    .digest("hex");
}

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId, method, returnUrl } = req.body;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    res.status(404).json({ success: false, error: "Khóa học không tồn tại" });
    return;
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user!.userId, courseId } },
  });
  if (existing?.status === "ACTIVE") {
    res.status(400).json({ success: false, error: "Bạn đã đăng ký khóa học này rồi" });
    return;
  }

  // Free course
  if (course.price === 0) {
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId: req.user!.userId,
          courseId,
          amount: 0,
          method: "FREE",
          status: "SUCCESS",
          paidAt: new Date(),
        },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: req.user!.userId, courseId } },
        create: { userId: req.user!.userId, courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      }),
      prisma.course.update({
        where: { id: courseId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);
    res.json({ success: true, message: "Đăng ký khóa học miễn phí thành công", data: { method: "FREE" } });
    return;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.userId,
      courseId,
      amount: course.price,
      method,
      status: "PENDING",
    },
  });

  if (method === "VNPAY") {
    // vnp_Amount = giá tiền VND × 100 (đơn vị nhỏ nhất theo quy định VNPay)
    const vnpParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || "",
      vnp_Amount: String(Math.round(course.price) * 100),
      vnp_CurrCode: "VND",
      vnp_TxnRef: payment.orderCode,
      vnp_OrderInfo: `Thanh toan khoa hoc: ${course.title}`,
      vnp_OrderType: "education",
      vnp_Locale: "vn",
      vnp_ReturnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/callback`,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_CreateDate: new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14),
    };

    const paymentUrl = buildVNPayUrl(vnpParams);
    res.json({ success: true, data: { paymentUrl, orderId: payment.id, method: "VNPAY" } });
    return;
  }

  if (method === "MOMO") {
    const requestId = payment.orderCode;
    const orderId = payment.orderCode;
    const amount = String(Math.round(course.price));
    const orderInfo = `Thanh toan khoa hoc: ${course.title}`;
    const redirectUrl = returnUrl || `${process.env.FRONTEND_URL}/payment/callback`;
    const ipnUrl = `${process.env.BACKEND_URL}/api/payment/momo/callback`;
    const requestType = "payWithMethod";
    const extraData = "";
    const autoCapture = true;
    const lang = "vi";

    const rawSignature = [
      `accessKey=${process.env.MOMO_ACCESS_KEY}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${process.env.MOMO_PARTNER_CODE}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");

    const signature = buildMoMoSignature(rawSignature);

    const momoBody = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      partnerName: "TesterPro Academy",
      storeId: "TesterProAcademy",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature,
    };

    res.json({ success: true, data: { momoBody, orderId: payment.id, method: "MOMO" } });
    return;
  }

  res.status(400).json({ success: false, error: "Phương thức thanh toán không hợp lệ" });
};

export const vnpayCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_SecureHash } = req.query as Record<string, string>;

  // Verify signature (simplified - production should validate fully)
  const payment = await prisma.payment.findUnique({ where: { orderCode: vnp_TxnRef } });
  if (!payment) {
    res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    return;
  }

  if (vnp_ResponseCode === "00") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", transactionId: vnp_TransactionNo, paidAt: new Date() },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        create: { userId: payment.userId, courseId: payment.courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      }),
      prisma.course.update({
        where: { id: payment.courseId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);
    res.json({ success: true, message: "Thanh toán thành công" });
  } else {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    res.json({ success: false, error: "Thanh toán thất bại" });
  }
};

export const momoCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, resultCode, transId } = req.body as Record<string, string>;

  const payment = await prisma.payment.findUnique({ where: { orderCode: orderId } });
  if (!payment) {
    res.status(404).json({ success: false, error: "Đơn hàng không tồn tại" });
    return;
  }

  if (resultCode === "0") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", transactionId: transId, paidAt: new Date() },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
        create: { userId: payment.userId, courseId: payment.courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      }),
      prisma.course.update({
        where: { id: payment.courseId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);
    res.json({ success: true });
  } else {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    res.json({ success: false });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.userId },
    include: { course: { select: { title: true, thumbnail: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: { payments } });
};
