"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, ShoppingBag, User,
  Settings, LogOut, Users, BarChart3, BookMarked, Menu, X, ClipboardList
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const studentLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/dashboard/courses", icon: BookOpen, label: "Khóa học của tôi" },
    { href: "/dashboard/tasks", icon: ClipboardList, label: "Bài tập của tôi" },
    { href: "/dashboard/payments", icon: ShoppingBag, label: "Lịch sử mua" },
    { href: "/dashboard/profile", icon: User, label: "Hồ sơ" },
  ];

  const instructorLinks = [
    { href: "/dashboard/instructor", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/dashboard/instructor/courses", icon: BookMarked, label: "Khóa học của tôi" },
    { href: "/dashboard/instructor/submissions", icon: ClipboardList, label: "Bài nộp" },
    { href: "/dashboard/profile", icon: Settings, label: "Cài đặt" },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", icon: BarChart3, label: "Dashboard" },
    { href: "/dashboard/admin/courses", icon: BookMarked, label: "Quản lý khóa học" },
    { href: "/dashboard/admin/submissions", icon: ClipboardList, label: "Bài nộp" },
    { href: "/dashboard/admin/users", icon: Users, label: "Quản lý người dùng" },
    { href: "/dashboard/profile", icon: Settings, label: "Cài đặt" },
  ];

  const links = user.role === "ADMIN" ? adminLinks : user.role === "INSTRUCTOR" ? instructorLinks : studentLinks;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-800">TesterPro</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <span className="mt-2 inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {user.role === "ADMIN" ? "Quản trị viên" : user.role === "INSTRUCTOR" ? "Giảng viên" : "Học viên"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-4.5 h-4.5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm font-medium w-full"
        >
          <LogOut className="w-4.5 h-4.5" />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 bg-white min-h-screen flex flex-col shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900">TesterPro Dashboard</span>
        </div>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
