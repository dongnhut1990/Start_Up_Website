"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen } from "lucide-react";
import { courseApi } from "@/lib/api";
import CourseForm, { CourseFormData } from "@/components/admin/CourseForm";
import LessonEditor from "@/components/admin/LessonEditor";

export default function NewCoursePage() {
  const router = useRouter();
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await courseApi.create(payload);
      const course = res.data.data.course;
      setCreatedCourseId(course.id);
      toast.success("Tạo khoá học thành công! Hãy thêm bài học bên dưới.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Tạo khoá học thất bại";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/courses" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tạo khoá học mới</h1>
          <p className="text-gray-500 text-sm mt-0.5">Điền thông tin và thêm bài học</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${!createdCourseId ? "bg-primary-600 text-white" : "bg-green-100 text-green-700"}`}>
          <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">1</span>
          Thông tin khoá học
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${createdCourseId ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"}`}>
          <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">2</span>
          Bài học
        </div>
      </div>

      {/* Step 1: Course form */}
      {!createdCourseId ? (
        <CourseForm
          onSubmit={handleSubmit}
          submitLabel="Tạo khoá học & Thêm bài học →"
          isSubmitting={isSubmitting}
        />
      ) : (
        /* Step 2: Lesson editor */
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-700 text-sm font-medium">
              Khoá học đã được tạo! Hãy thêm bài học bên dưới, hoặc{" "}
              <Link href="/dashboard/admin/courses" className="underline font-semibold">
                về danh sách
              </Link>{" "}
              để thêm bài học sau.
            </p>
          </div>

          <LessonEditor courseId={createdCourseId} initialLessons={[]} />

          <div className="flex justify-end">
            <Link href="/dashboard/admin/courses" className="btn-primary px-8 py-3">
              Hoàn tất →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
