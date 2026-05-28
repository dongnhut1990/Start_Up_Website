"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Trash2, UserCheck } from "lucide-react";
import { adminApi } from "@/lib/api";
import { EnrollmentWithUser } from "@/types";

interface Props {
  courseId: string;
}

export default function EnrollmentsTab({ courseId }: Props) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getCourseEnrollments(courseId)
      .then((res) => setEnrollments(res.data.data.enrollments))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleRemove = async (enrollmentId: string, userName: string) => {
    if (!confirm(`Xoá học viên "${userName}" khỏi khoá học này?`)) return;
    setRemoving(enrollmentId);
    try {
      await adminApi.removeEnrollment(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      toast.success("Đã xoá học viên");
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
        <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-semibold">Chưa có học viên nào</p>
        <p className="text-gray-400 text-sm mt-1">Khi học viên đăng ký khoá học, họ sẽ xuất hiện ở đây</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{enrollments.length} học viên đã đăng ký</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500">Học viên</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Trạng thái</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Tiến độ</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Ngày đăng ký</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                      {e.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{e.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{e.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    e.status === "COMPLETED" ? "bg-green-100 text-green-700"
                    : e.status === "ACTIVE" ? "bg-blue-100 text-blue-700"
                    : e.status === "CANCELLED" ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                    {e.status === "COMPLETED" ? "Hoàn thành"
                      : e.status === "ACTIVE" ? "Đang học"
                      : e.status === "CANCELLED" ? "Đã huỷ"
                      : "Chờ duyệt"}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        style={{ width: `${e.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{e.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">
                  {new Date(e.enrolledAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleRemove(e.id, e.user.name)}
                    disabled={removing === e.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Xoá học viên"
                  >
                    {removing === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
