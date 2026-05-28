"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, CheckCircle, XCircle, Clock, BookOpen, ExternalLink } from "lucide-react";
import { paymentApi } from "@/lib/api";
import { Payment } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  VNPAY: "VNPay",
  MOMO: "MoMo",
  FREE: "Miễn phí",
  BANK_TRANSFER: "Chuyển khoản",
};

const METHOD_COLOR: Record<string, string> = {
  VNPAY: "bg-blue-50 text-blue-700",
  MOMO: "bg-pink-50 text-pink-700",
  FREE: "bg-green-50 text-green-700",
  BANK_TRANSFER: "bg-gray-50 text-gray-700",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SUCCESS: { label: "Thành công", color: "text-green-600", icon: <CheckCircle className="w-4 h-4" /> },
  PENDING: { label: "Đang xử lý", color: "text-amber-600", icon: <Clock className="w-4 h-4" /> },
  FAILED: { label: "Thất bại", color: "text-red-500", icon: <XCircle className="w-4 h-4" /> },
  REFUNDED: { label: "Hoàn tiền", color: "text-purple-600", icon: <XCircle className="w-4 h-4" /> },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentApi
      .getHistory()
      .then((res) => setPayments(res.data.data.payments))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter((p) => p.status === "SUCCESS" && p.method !== "FREE")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Lịch sử thanh toán</h1>
        <p className="text-gray-500 mt-0.5">{payments.length} giao dịch</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {payments.filter((p) => p.status === "SUCCESS").length}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Giao dịch thành công</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{payments.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Tổng giao dịch</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatPrice(totalSpent)}</p>
          <p className="text-sm text-gray-500 mt-0.5">Tổng chi tiêu</p>
        </div>
      </div>

      {/* Payment list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-500 mb-2">Chưa có giao dịch nào</h3>
          <p className="text-gray-400 text-sm mb-6">Đăng ký khoá học để bắt đầu học</p>
          <Link href="/courses" className="btn-primary inline-flex items-center gap-2 text-sm">
            Khám phá khoá học
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {payments.map((payment) => {
              const status = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING;
              return (
                <div key={payment.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  {/* Course thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {payment.course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={payment.course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-primary-500" />
                    )}
                  </div>

                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{payment.course.title}</p>
                      <Link
                        href={`/courses/${payment.course.slug}`}
                        className="text-gray-300 hover:text-primary-500 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={cn("badge text-xs", METHOD_COLOR[payment.method] ?? "bg-gray-100 text-gray-500")}>
                        {METHOD_LABEL[payment.method] ?? payment.method}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(payment.createdAt)}</span>
                      {payment.paidAt && (
                        <span className="text-xs text-gray-400">· Thanh toán: {formatDate(payment.paidAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Amount + Status */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      {payment.method === "FREE" ? "Miễn phí" : formatPrice(payment.amount)}
                    </p>
                    <div className={cn("flex items-center justify-end gap-1 mt-1 text-xs font-semibold", status.color)}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
