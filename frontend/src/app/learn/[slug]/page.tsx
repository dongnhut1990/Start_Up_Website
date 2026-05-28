"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  BookOpen, ArrowLeft, Award, Loader2
} from "lucide-react";
import { learnApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn, formatDuration } from "@/lib/utils";
import { LearnLesson, LessonProgress } from "@/types";
import VideoPlayer from "@/components/learn/VideoPlayer";
import CourseSidebar from "@/components/learn/CourseSidebar";
import TaskPanel from "@/components/learn/TaskPanel";
import { ClipboardList } from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
interface CourseData {
  id: string; slug: string; title: string;
  instructor: { name: string };
  lessons: LearnLesson[];
}

export default function LearnPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeLesson, setActiveLesson] = useState<LearnLesson | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainTab, setMainTab] = useState<"lesson" | "tasks">("lesson");

  /* Tải nội dung khoá học */
  const fetchCourse = useCallback(async () => {
    try {
      const res = await learnApi.getCourseContent(slug);
      const { course: c, progressPct: pct, completedCount: cc } = res.data.data;
      setCourse(c);
      setProgressPct(pct);
      setCompletedCount(cc);
      // Mở bài chưa hoàn thành đầu tiên, hoặc bài 1
      const firstIncomplete = c.lessons.find((l: LearnLesson) => !l.progress?.completed);
      setActiveLesson(firstIncomplete ?? c.lessons[0] ?? null);
    } catch {
      toast.error("Không thể tải khoá học. Vui lòng thử lại.");
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace(`/login?redirect=/learn/${slug}`); return; }
    if (!authLoading && user) fetchCourse();
  }, [authLoading, user, fetchCourse, slug, router]);

  /* Đánh dấu hoàn thành / bỏ hoàn thành */
  const handleToggleComplete = async () => {
    if (!activeLesson || !course || toggling) return;
    setToggling(true);
    try {
      const res = await learnApi.toggleLessonComplete(course.slug, activeLesson.id);
      const { progressPct: newPct, completedCount: newCc, progress } = res.data.data;

      setProgressPct(newPct);
      setCompletedCount(newCc);
      setCourse((prev) => prev ? ({
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === activeLesson.id ? { ...l, progress: { ...l.progress, ...progress } as LessonProgress } : l
        ),
      }) : prev);
      setActiveLesson((prev) => prev ? { ...prev, progress: { ...prev.progress, ...progress } as LessonProgress } : prev);
      toast.success(res.data.message);

      // Nếu hoàn thành 100%, hiện thông báo
      if (newPct === 100) {
        setTimeout(() => toast.success("🎉 Chúc mừng! Bạn đã hoàn thành khoá học!", { duration: 5000 }), 500);
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setToggling(false);
    }
  };

  /* Chuyển bài */
  const goToLesson = (lesson: LearnLesson) => setActiveLesson(lesson);

  const currentIndex = course?.lessons.findIndex((l) => l.id === activeLesson?.id) ?? -1;
  const prevLesson = currentIndex > 0 ? course!.lessons[currentIndex - 1] : null;
  const nextLesson = course && currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  const isCompleted = activeLesson?.progress?.completed ?? false;

  /* ─── Loading ─── */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center text-white">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary-400" />
          <p className="text-gray-400">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  /* ─── UI ─── */
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 shrink-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-4 w-px bg-gray-700" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{course.title}</p>
          <p className="text-xs text-gray-400 hidden sm:block">
            Bài {currentIndex + 1}/{course.lessons.length} · {course.instructor.name}
          </p>
        </div>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{progressPct}%</span>
        </div>

        {progressPct === 100 && (
          <Link
            href={`/certificate/${course.slug}`}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            Nhận chứng chỉ
          </Link>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <CourseSidebar
          courseTitle={course.title}
          lessons={course.lessons}
          activeLessonId={activeLesson.id}
          progressPct={progressPct}
          completedCount={completedCount}
          onSelectLesson={goToLesson}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            sidebarOpen ? "ml-72" : "ml-0"
          )}
        >
          {/* Tab bar */}
          <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-8 flex gap-1">
            <button
              onClick={() => setMainTab("lesson")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
                mainTab === "lesson"
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Bài học
            </button>
            <button
              onClick={() => setMainTab("tasks")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
                mainTab === "tasks"
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              <ClipboardList className="w-4 h-4" />
              Bài tập
            </button>
          </div>

          {mainTab === "tasks" ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
              <TaskPanel courseId={course.id} />
            </div>
          ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

            {/* Video / Thumbnail */}
            {activeLesson.videoUrl ? (
              <VideoPlayer
                videoUrl={activeLesson.videoUrl}
                lessonId={activeLesson.id}
                courseSlug={course.slug}
                initialWatchTime={activeLesson.progress?.watchTime ?? 0}
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Bài học này chỉ có nội dung văn bản</p>
                </div>
              </div>
            )}

            {/* Lesson header */}
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Bài {currentIndex + 1} · {formatDuration(activeLesson.duration)}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{activeLesson.title}</h1>
                {activeLesson.description && (
                  <p className="mt-2 text-gray-400 text-sm leading-relaxed">{activeLesson.description}</p>
                )}
              </div>

              {/* Mark complete button */}
              <button
                onClick={handleToggleComplete}
                disabled={toggling}
                className={cn(
                  "shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                  isCompleted
                    ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white"
                )}
              >
                {toggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isCompleted ? "Đã hoàn thành" : "Đánh dấu xong"}
                </span>
              </button>
            </div>

            {/* Lesson content */}
            {activeLesson.content && (
              <div className="mt-8 bg-gray-900 rounded-2xl border border-gray-800 p-6 sm:p-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Nội dung bài học</h2>
                <div
                  className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-strong:text-white prose-code:text-primary-300
                    prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
                    prose-li:text-gray-300 prose-a:text-primary-400"
                  dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4 pb-8">
              <button
                onClick={() => prevLesson && goToLesson(prevLesson)}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Bài trước</span>
              </button>

              {/* Auto mark complete & go next */}
              {nextLesson ? (
                <button
                  onClick={async () => {
                    if (!isCompleted) await handleToggleComplete();
                    goToLesson(nextLesson);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <span>Bài tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleToggleComplete}
                  disabled={isCompleted || toggling}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors",
                    isCompleted
                      ? "bg-green-600/20 text-green-400 cursor-default border border-green-600/30"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {isCompleted ? (
                    <><CheckCircle className="w-4 h-4" /> Đã hoàn thành khoá học!</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Hoàn thành khoá học</>
                  )}
                </button>
              )}
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
