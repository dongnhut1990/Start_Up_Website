"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, BookOpen, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">TesterPro</span>
            <span className="text-gray-700">Academy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Khóa học
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Về chúng tôi
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Blog
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Xin chào,</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ của tôi
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-outline text-sm py-2 px-5">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-5">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/courses" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Khóa học</Link>
          <Link href="/about" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Về chúng tôi</Link>
          <Link href="/blog" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Blog</Link>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={logout} className="block py-2 text-red-500 font-medium">Đăng xuất</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="btn-outline flex-1 text-center text-sm py-2" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link href="/register" className="btn-primary flex-1 text-center text-sm py-2" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
