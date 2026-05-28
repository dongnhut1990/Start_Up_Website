"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { User } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị",
  INSTRUCTOR: "Giảng viên",
  STUDENT: "Học viên",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  INSTRUCTOR: "bg-purple-100 text-purple-700",
  STUDENT: "bg-blue-100 text-blue-700",
};

interface UserWithCount extends User {
  _count?: { enrollments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getUsers()
      .then((res) => setUsers(res.data.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (user: UserWithCount) => {
    setUpdating(user.id);
    try {
      await adminApi.updateUser(user.id, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
      toast.success(user.isActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-500 mt-1">{users.length} tài khoản trong hệ thống</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người dùng</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Vai trò</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Ngày đăng ký</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Khóa học</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={cn("badge text-xs", ROLE_COLORS[user.role])}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        {user._count?.enrollments ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.isActive ? (
                        <span className="badge bg-green-100 text-green-700 text-xs flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Hoạt động
                        </span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500 text-xs flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={updating === user.id}
                          className={cn(
                            "text-xs font-medium border px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50",
                            user.isActive
                              ? "text-red-500 border-red-200 hover:bg-red-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          )}
                        >
                          {user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      )}
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
