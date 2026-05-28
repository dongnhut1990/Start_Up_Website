"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { courseApi, adminApi } from "@/lib/api";
import { Course } from "@/types";
import CourseForm, { CourseFormData } from "@/components/admin/CourseForm";
import LessonEditor from "@/components/admin/LessonEditor";
import TaskEditor from "@/components/admin/TaskEditor";
import EnrollmentsTab from "@/components/admin/EnrollmentsTab";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "lessons" | "tasks" | "enrollments">("info");

  useEffect(() => {
    adminApi
      .getCourses()
      .then((res) => {
        const found = (res.data.data.courses as Course[]).find((c) => c.id === id);
        if (!found) { toast.error("Không tìm thấy khoá học"); router.replace("/dashboard/admin/courses"); return; }
        setCourse(found);
      })
      .catch(() => router.replace("/dashboard/admin/courses"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        requirements: data.requirements.map((r) => r.value).filter(Boolean),
        outcomes: data.outcomes.map((o) => o.value).filter(Boolean),
        originalPrice: data.originalPrice || null,
        thumbnail: data.thumbnail || null,
      };
      const res = await courseApi.update(id, payload);
      setCourse(res.data.data.course);
      toast.success("Đã cập nhật khoá học!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Cập nhật thất bại";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }
  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/courses" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Chỉnh sửa khoá học</h1>
            <p className="text-gray-500 text-sm mt-0.5 truncate max-w-sm">{course.title}</p>
          </div>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 border border-primary-200 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Xem trang khoá học
        </Link>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span className={`badge text-xs ${course.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {course.isPublished ? "✓ Đã xuất bản" : "Bản nháp"}
        </span>
        {course.isFeatured && (
          <span className="badge bg-amber-100 text-amber-700 text-xs">⭐ Nổi bật</span>
        )}
        <span className="badge bg-blue-50 text-blue-600 text-xs">
          {course._count?.lessons ?? course.totalLessons} bài học
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {(["info", "lessons", "tasks", "enrollments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "info" ? "Thông tin khoá học"
              : tab === "lessons" ? `Bài học (${course._count?.lessons ?? course.totalLessons})`
              : tab === "tasks" ? "Bài tập"
              : `Học viên (${course._count?.enrollments ?? 0})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "info" ? (
        <CourseForm
          defaultValues={course}
          onSubmit={handleSubmit}
          submitLabel="Lưu thay đổi"
          isSubmitting={isSubmitting}
        />
      ) : activeTab === "lessons" ? (
        <LessonEditor
          courseId={course.id}
          initialLessons={(course.lessons ?? []) as Parameters<typeof LessonEditor>[0]["initialLessons"]}
          onLessonsChange={(lessons) =>
            setCourse((prev) => prev ? { ...prev, totalLessons: lessons.length } : prev)
          }
        />
      ) : activeTab === "tasks" ? (
        <TaskEditor courseId={course.id} />
      ) : (
        <EnrollmentsTab courseId={course.id} />
      )}
    </div>
  );
}
