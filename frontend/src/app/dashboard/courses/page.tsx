"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Play, Award, ArrowRight, Clock, CheckCircle, Search } from "lucide-react";
import { courseApi } from "@/lib/api";
import { Enrollment } from "@/types";
import { cn, COURSE_LEVELS, LEVEL_COLORS } from "@/lib/utils";

type FilterTab = "all" | "inprogress" | "completed" | "notstarted";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "inprogress", label: "Đang học" },
  { key: "completed", label: "Hoàn thành" },
  { key: "notstarted", label: "Chưa bắt đầu" },
];

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    courseApi
      .getMyEnrollments()
      .then((res) => setEnrollments(res.data.data.enrollments))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    const matchSearch = search === "" || e.course.title.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (tab === "inprogress") return e.progress > 0 && e.progress < 100;
    if (tab === "completed") return e.progress === 100;
    if (tab === "notstarted") return e.progress === 0;
    return true;
  });

  const counts = {
    all: enrollments.length,
    inprogress: enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    notstarted: enrollments.filter((e) => e.progress === 0).length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Khoá học của tôi</h1>
          <p className="text-gray-500 mt-0.5">{enrollments.length} khoá học đã đăng ký</p>
        </div>
        <Link href="/courses" className="btn-outline flex items-center gap-2 text-sm py-2 px-4">
          <ArrowRight className="w-4 h-4" /> Khám phá thêm
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm khoá học..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
              <span className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                tab === t.key ? "bg-primary-100 text-primary-700" : "bg-gray-200 text-gray-500"
              )}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          {enrollments.length === 0 ? (
            <>
              <h3 className="font-semibold text-gray-500 mb-2">Chưa có khoá học nào</h3>
              <p className="text-gray-400 text-sm mb-6">Bắt đầu hành trình học tập của bạn</p>
              <Link href="/courses" className="btn-primary inline-flex items-center gap-2 text-sm">
                Khám phá khoá học <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Không có khoá học nào phù hợp với bộ lọc</p>
          )}
        </div>
      )}

      {/* Course grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((enrollment) => {
            const isCompleted = enrollment.progress === 100;
            const isStarted = enrollment.progress > 0;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-100 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-36 bg-gradient-to-br from-primary-100 to-accent-100 overflow-hidden">
                  {enrollment.course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary-300" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Hoàn thành
                    </div>
                  )}
                  {/* Progress bar overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-5">
                  {/* Level badge */}
                  <span className={cn("badge text-xs mb-2", LEVEL_COLORS[enrollment.course.level])}>
                    {COURSE_LEVELS[enrollment.course.level]}
                  </span>

                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {enrollment.course.title}
                  </h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{enrollment.course._count?.lessons ?? enrollment.course.totalLessons} bài học</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(enrollment.enrolledAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Tiến độ</span>
                      <span className={cn("font-bold", isCompleted ? "text-green-600" : "text-primary-600")}>
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isCompleted
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gradient-to-r from-primary-500 to-accent-500"
                        )}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/learn/${enrollment.course.slug}`}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 rounded-xl transition-colors",
                        isCompleted
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      )}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isCompleted ? "Xem lại" : isStarted ? "Tiếp tục" : "Bắt đầu"}
                    </Link>
                    {isCompleted && (
                      <Link
                        href={`/certificate/${enrollment.course.slug}`}
                        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Chứng chỉ
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
