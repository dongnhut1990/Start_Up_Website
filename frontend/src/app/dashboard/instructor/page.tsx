"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, ArrowRight, TrendingUp, Eye, EyeOff } from "lucide-react";
import { instructorApi, adminApi } from "@/lib/api";
import { Course } from "@/types";
import { formatPrice, cn, COURSE_LEVELS, LEVEL_COLORS } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface DashboardData {
  totalCourses: number;
  totalEnrollments: number;
  pendingSubmissions: number;
  courses: Course[];
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    instructorApi
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (course: Course) => {
    setToggling(course.id);
    try {
      const res = await adminApi.togglePublish(course.id);
      toast.success(res.data.message);
      setData((prev) =>
        prev
          ? {
              ...prev,
              courses: prev.courses.map((c) =>
                c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
              ),
            }
          : prev
      );
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-7 text-white">
        <h1 className="text-2xl font-extrabold mb-1">Xin chào, {user?.name?.split(" ").pop()}!</h1>
        <p className="text-primary-100">Quản lý khoá học và học viên của bạn tại TesterPro Academy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Khoá học", value: data?.totalCourses ?? 0, color: "text-blue-600 bg-blue-50" },
          { icon: Users, label: "Học viên", value: data?.totalEnrollments ?? 0, color: "text-purple-600 bg-purple-50" },
          { icon: ClipboardList, label: "Bài nộp chờ chấm", value: data?.pendingSubmissions ?? 0, color: "text-amber-600 bg-amber-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            {loading ? (
              <div className="h-7 bg-gray-100 rounded animate-pulse w-12 mb-1" />
            ) : (
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            )}
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/instructor/submissions"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Chấm bài nộp</h3>
              <p className="text-sm text-gray-500">Xem và chấm điểm bài làm của học viên</p>
              {(data?.pendingSubmissions ?? 0) > 0 && (
                <span className="mt-2 inline-block bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {data?.pendingSubmissions} bài chờ chấm
                </span>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link
          href="/dashboard/instructor/courses"
          className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Quản lý khoá học</h3>
              <p className="text-sm text-gray-500">Chỉnh sửa nội dung, bài học, bài tập</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Courses */}
      {!loading && (data?.courses?.length ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Khoá học của tôi</h2>
            <Link href="/dashboard/instructor/courses" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.courses ?? []).slice(0, 5).map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", LEVEL_COLORS[course.level])}>
                      {COURSE_LEVELS[course.level]}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course._count?.enrollments ?? 0} học viên
                    </span>
                    <span className="text-xs font-semibold text-primary-600">{formatPrice(course.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={toggling === course.id}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={course.isPublished ? "Ẩn khoá học" : "Xuất bản"}
                  >
                    {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/dashboard/admin/courses/${course.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
