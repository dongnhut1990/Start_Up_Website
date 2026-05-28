"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff, Pencil, Plus, Users } from "lucide-react";
import { instructorApi, adminApi } from "@/lib/api";
import { Course } from "@/types";
import { formatPrice, cn, COURSE_LEVELS, LEVEL_COLORS } from "@/lib/utils";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    instructorApi
      .getCourses()
      .then((res) => setCourses(res.data.data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (course: Course) => {
    setToggling(course.id);
    try {
      const res = await adminApi.togglePublish(course.id);
      toast.success(res.data.message);
      setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c)));
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Khoá học của tôi</h1>
          <p className="text-gray-500 mt-1">{courses.length} khoá học</p>
        </div>
        <Link href="/dashboard/admin/courses/new" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <Plus className="w-4 h-4" />
          Tạo khoá học mới
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-500 mb-2">Chưa có khoá học nào</h3>
          <p className="text-gray-400 text-sm mb-6">Tạo khoá học đầu tiên để bắt đầu dạy học viên</p>
          <Link href="/dashboard/admin/courses/new" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Tạo khoá học đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Khoá học</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Cấp độ</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Học viên</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{course.title}</p>
                          <p className="text-xs text-gray-400">{course.category} · {course._count?.lessons ?? course.totalLessons} bài</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={cn("badge text-xs", LEVEL_COLORS[course.level])}>
                        {COURSE_LEVELS[course.level]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {course._count?.enrollments ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(course.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("badge text-xs", course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                        {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/courses/${course.id}/edit`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(course)}
                          disabled={toggling === course.id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {course.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {course.isPublished ? "Ẩn" : "Xuất bản"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
