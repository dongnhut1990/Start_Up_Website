"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, ShoppingBag, TrendingUp, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  paidAt: string;
  method: string;
  user: { name: string; email: string };
  course: { title: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((res) => {
        setStats(res.data.data.stats);
        setRecentPayments(res.data.data.recentPayments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Tổng học viên", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600", suffix: "" },
    { label: "Tổng khóa học", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "bg-purple-50 text-purple-600", suffix: "" },
    { label: "Đang học", value: stats?.totalEnrollments ?? 0, icon: TrendingUp, color: "bg-green-50 text-green-600", suffix: "" },
    { label: "Doanh thu", value: stats?.totalRevenue ?? 0, icon: ShoppingBag, color: "bg-amber-50 text-amber-600", suffix: "vnd", isPrice: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Quản trị</h1>
        <p className="text-gray-500 mt-1">Tổng quan hệ thống TesterPro Academy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, isPrice }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5" />
            </div>
            {loading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse mb-1 w-20" />
            ) : (
              <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
                {isPrice ? formatPrice(value) : value.toLocaleString("vi-VN")}
              </p>
            )}
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/dashboard/admin/courses" className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Quản lý khóa học</h3>
              <p className="text-sm text-gray-500">Thêm, chỉnh sửa, xuất bản khóa học</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link href="/dashboard/admin/users" className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Quản lý người dùng</h3>
              <p className="text-sm text-gray-500">Xem, phân quyền, quản lý tài khoản</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Giao dịch gần đây</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Chưa có giao dịch nào</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{payment.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{payment.course.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(payment.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(payment.paidAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
