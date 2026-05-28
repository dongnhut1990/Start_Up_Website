"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const orderId = searchParams.get("orderId");

    if (vnpResponseCode) {
      // VNPay callback
      const params = Object.fromEntries(searchParams.entries());
      api
        .get("/payment/vnpay/callback", { params })
        .then((res) => setStatus(res.data.success ? "success" : "failed"))
        .catch(() => setStatus("failed"));
    } else {
      // Default fallback
      setTimeout(() => setStatus("success"), 1500);
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang xử lý giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        {status === "success" ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-8">Bạn đã đăng ký khóa học thành công. Bắt đầu học ngay!</p>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard" className="btn-primary w-full py-3.5 text-center">
                Vào Dashboard học ngay
              </Link>
              <Link href="/courses" className="btn-outline w-full py-3.5 text-center">
                Khám phá thêm khóa học
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-8">Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.back()} className="btn-primary w-full py-3.5">
                Thử lại
              </button>
              <Link href="/courses" className="btn-outline w-full py-3.5 text-center">
                Quay lại khóa học
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
