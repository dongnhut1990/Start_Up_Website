"use client";

import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { courseApi } from "@/lib/api";
import { Course } from "@/types";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/utils";
import CourseCard from "@/components/courses/CourseCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LEVELS = [
  { value: "", label: "Tất cả cấp độ" },
  { value: "BEGINNER", label: COURSE_LEVELS.BEGINNER },
  { value: "INTERMEDIATE", label: COURSE_LEVELS.INTERMEDIATE },
  { value: "ADVANCED", label: COURSE_LEVELS.ADVANCED },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params: Record<string, string> = { page: String(page), limit: "9" };
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;

    setLoading(true);
    courseApi
      .getAll(params)
      .then((res) => {
        setCourses(res.data.data.courses);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, category, level, page]);

  const hasFilter = search || category || level;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Khóa học Tester</h1>
          <p className="text-primary-200 text-lg">
            {total > 0 ? `${total} khóa học đang có sẵn` : "Khám phá các khóa học chuyên nghiệp"}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-10"
                />
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-field w-auto min-w-[180px]"
              >
                <option value="">Tất cả danh mục</option>
                {COURSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Level */}
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                className="input-field w-auto min-w-[160px]"
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>

              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse">
                  <div className="bg-gray-200 h-44" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-400">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary-300 transition-colors"
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === i + 1
                          ? "bg-primary-600 text-white"
                          : "border border-gray-200 text-gray-600 hover:border-primary-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-primary-300 transition-colors"
                  >
                    Tiếp
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
