"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, GripVertical, Youtube, FileText,
  X, ChevronDown, ChevronUp, Save, Loader2, Eye
} from "lucide-react";
import { lessonApi } from "@/lib/api";
import { formatDuration, cn } from "@/lib/utils";

const lessonSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự"),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  duration: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(false),
});
type LessonFormData = z.infer<typeof lessonSchema>;

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  content: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface LessonEditorProps {
  courseId: string;
  initialLessons: Lesson[];
  onLessonsChange?: (lessons: Lesson[]) => void;
}

/* ─── Modal thêm/sửa bài học ─── */
function LessonModal({
  courseId,
  lesson,
  onClose,
  onSaved,
}: {
  courseId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: (lesson: Lesson) => void;
}) {
  const isEdit = !!lesson;
  const [tab, setTab] = useState<"basic" | "content">("basic");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      content: lesson?.content ?? "",
      duration: lesson?.duration ?? 0,
      isFree: lesson?.isFree ?? false,
    },
  });

  const videoUrl = watch("videoUrl");

  const onSubmit = async (data: LessonFormData) => {
    try {
      const payload = {
        ...data,
        description: data.description || null,
        videoUrl: data.videoUrl || null,
        content: data.content || null,
      };
      const res = isEdit
        ? await lessonApi.update(courseId, lesson!.id, payload)
        : await lessonApi.create(courseId, payload);
      onSaved(res.data.data.lesson);
      toast.success(isEdit ? "Đã cập nhật bài học" : "Đã thêm bài học mới");
      onClose();
    } catch {
      toast.error("Có lỗi xảy ra, thử lại sau");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">
            {isEdit ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(["basic", "content"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "basic" ? "Thông tin" : "Nội dung"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {tab === "basic" ? (
              <>
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề bài học *</label>
                  <input {...register("title")} placeholder="VD: Giới thiệu về Manual Testing" className="input-field" />
                  {errors.title && <p className="mt-1.5 text-red-500 text-xs">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả ngắn</label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    placeholder="Mô tả ngắn về bài học này..."
                    className="input-field resize-none text-sm"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Youtube className="w-4 h-4 inline mr-1.5 text-red-500" />
                    URL Video
                  </label>
                  <input
                    {...register("videoUrl")}
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://example.com/video.mp4"
                    className="input-field text-sm"
                  />
                  {videoUrl && (
                    <p className="mt-1.5 text-xs text-primary-600">
                      ✓ Video sẽ hiển thị trong trang học
                    </p>
                  )}
                </div>

                {/* Duration + isFree */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thời lượng (phút)</label>
                    <input
                      {...register("duration")}
                      type="number"
                      min={0}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input {...register("isFree")} type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Xem miễn phí</p>
                        <p className="text-xs text-gray-400">Ai cũng xem được</p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1.5 text-blue-500" />
                  Nội dung bài học (HTML hoặc văn bản)
                </label>
                <textarea
                  {...register("content")}
                  rows={14}
                  placeholder="Nhập nội dung bài học ở đây. Hỗ trợ HTML cơ bản như <h2>, <p>, <ul>, <li>, <strong>, <code>..."
                  className="input-field resize-y font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Hỗ trợ HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;code&gt;, &lt;pre&gt;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline py-2.5 px-5 text-sm">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />
              }
              {isEdit ? "Lưu thay đổi" : "Thêm bài học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main LessonEditor ─── */
export default function LessonEditor({ courseId, initialLessons, onLessonsChange }: LessonEditorProps) {
  const [lessons, setLessons] = useState<Lesson[]>(
    [...initialLessons].sort((a, b) => a.order - b.order)
  );
  const [modalLesson, setModalLesson] = useState<Lesson | null | "new">(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const update = (updated: Lesson[]) => {
    const sorted = [...updated].sort((a, b) => a.order - b.order);
    setLessons(sorted);
    onLessonsChange?.(sorted);
  };

  const handleSaved = (lesson: Lesson) => {
    const exists = lessons.find((l) => l.id === lesson.id);
    update(exists
      ? lessons.map((l) => (l.id === lesson.id ? lesson : l))
      : [...lessons, lesson]
    );
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Xóa bài "${lesson.title}"? Thao tác này không thể hoàn tác.`)) return;
    setDeletingId(lesson.id);
    try {
      await lessonApi.delete(courseId, lesson.id);
      update(lessons.filter((l) => l.id !== lesson.id));
      toast.success("Đã xóa bài học");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Drag & drop sắp xếp ─── */
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) return;
    const reordered = [...lessons];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const withOrder = reordered.map((l, i) => ({ ...l, order: i + 1 }));
    setLessons(withOrder);
    setDragIndex(targetIndex);
  };

  const handleDragEnd = async () => {
    setDragIndex(null);
    try {
      await lessonApi.reorder(courseId, lessons.map((l) => l.id));
      toast.success("Đã cập nhật thứ tự bài học");
    } catch {
      toast.error("Không thể lưu thứ tự");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Danh sách bài học</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {lessons.length} bài học · Kéo <GripVertical className="w-3.5 h-3.5 inline" /> để sắp xếp thứ tự
          </p>
        </div>
        <button
          onClick={() => setModalLesson("new")}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
        >
          <Plus className="w-4 h-4" />
          Thêm bài học
        </button>
      </div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Chưa có bài học nào</p>
          <p className="text-gray-300 text-sm mt-1">Nhấn &quot;Thêm bài học&quot; để bắt đầu</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex flex-col transition-colors",
                dragIndex === index && "bg-primary-50 opacity-70"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Drag handle */}
                <div className="cursor-grab text-gray-300 hover:text-gray-500 shrink-0 touch-none">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order badge */}
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</p>
                    {lesson.isFree && (
                      <span className="badge bg-green-100 text-green-700 text-xs">Miễn phí</span>
                    )}
                    {lesson.videoUrl && (
                      <span className="badge bg-red-50 text-red-500 text-xs">
                        <Youtube className="w-3 h-3 inline mr-0.5" />Video
                      </span>
                    )}
                    {lesson.content && (
                      <span className="badge bg-blue-50 text-blue-600 text-xs">Bài đọc</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDuration(lesson.duration)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Xem nội dung"
                  >
                    {expandedId === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setModalLesson(lesson)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson)}
                    disabled={deletingId === lesson.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Xóa"
                  >
                    {deletingId === lesson.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              {expandedId === lesson.id && (lesson.description || lesson.content) && (
                <div className="px-16 pb-4 space-y-2">
                  {lesson.description && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{lesson.description}</p>
                  )}
                  {lesson.content && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 max-h-32 overflow-y-auto">
                      <Eye className="w-3 h-3 inline mr-1" />
                      <span className="line-clamp-3">{lesson.content.replace(/<[^>]+>/g, " ").trim()}</span>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {modalLesson !== null && (
        <LessonModal
          courseId={courseId}
          lesson={modalLesson === "new" ? null : modalLesson}
          onClose={() => setModalLesson(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
