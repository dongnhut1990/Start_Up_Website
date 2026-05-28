"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ClipboardList, Loader2, Send, CheckCircle, XCircle,
  Clock, ChevronDown, ChevronUp, BookOpen,
} from "lucide-react";
import { myTasksApi, taskApi } from "@/lib/api";
import { MyTask, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Chưa nộp",
  SUBMITTED: "Đã nộp — chờ chấm",
  REVIEWED: "Đã chấm",
  PASSED: "Đạt",
  FAILED: "Không đạt",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  SUBMITTED: "bg-blue-100 text-blue-700",
  REVIEWED: "bg-purple-100 text-purple-700",
  PASSED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

type FilterTab = "all" | "pending" | "submitted" | "passed" | "failed";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [fileUrl, setFileUrl] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    myTasksApi.getAll()
      .then((res) => setTasks(res.data.data.tasks))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    const status = t.submission?.status ?? "PENDING";
    if (tab === "all") return true;
    if (tab === "pending") return status === "PENDING";
    if (tab === "submitted") return status === "SUBMITTED" || status === "REVIEWED";
    if (tab === "passed") return status === "PASSED";
    if (tab === "failed") return status === "FAILED";
    return true;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.submission || t.submission.status === "PENDING").length,
    submitted: tasks.filter((t) => t.submission?.status === "SUBMITTED" || t.submission?.status === "REVIEWED").length,
    passed: tasks.filter((t) => t.submission?.status === "PASSED").length,
    failed: tasks.filter((t) => t.submission?.status === "FAILED").length,
  };

  const handleSubmit = async (task: MyTask) => {
    const text = content[task.id]?.trim();
    if (!text) { toast.error("Vui lòng nhập nội dung bài làm"); return; }
    setSubmitting(task.id);
    try {
      const res = await taskApi.submit(task.courseId, task.id, {
        content: text,
        fileUrl: fileUrl[task.id] || undefined,
      });
      const newSub = res.data.data.submission;
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, submission: newSub } : t));
      setContent((prev) => { const n = { ...prev }; delete n[task.id]; return n; });
      setExpanded(null);
      toast.success("Nộp bài thành công!");
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(null);
    }
  };

  const TABS = [
    { key: "all" as FilterTab, label: "Tất cả" },
    { key: "pending" as FilterTab, label: "Chưa nộp" },
    { key: "submitted" as FilterTab, label: "Chờ chấm" },
    { key: "passed" as FilterTab, label: "Đạt" },
    { key: "failed" as FilterTab, label: "Không đạt" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Bài tập của tôi</h1>
        <p className="text-gray-500 mt-0.5">Tất cả bài tập từ các khoá học đang học</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng bài tập", value: tasks.length, color: "text-gray-700 bg-gray-50" },
          { label: "Chưa nộp", value: counts.pending, color: "text-amber-700 bg-amber-50" },
          { label: "Đã nộp", value: counts.submitted, color: "text-blue-700 bg-blue-50" },
          { label: "Đạt", value: counts.passed, color: "text-green-700 bg-green-50" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className={cn("text-2xl font-extrabold mb-0.5", color.split(" ")[0])}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          {tasks.length === 0 ? (
            <>
              <p className="text-gray-500 font-semibold mb-1">Chưa có bài tập nào</p>
              <p className="text-gray-400 text-sm mb-5">Đăng ký khoá học để nhận bài tập từ giảng viên</p>
              <Link href="/courses" className="btn-primary inline-flex text-sm px-5 py-2.5">
                Khám phá khoá học
              </Link>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Không có bài tập nào trong mục này</p>
          )}
        </div>
      )}

      {/* Task list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {/* Group by course */}
          {Array.from(new Set(filtered.map((t) => t.courseId))).map((courseId) => {
            const courseTasks = filtered.filter((t) => t.courseId === courseId);
            const firstTask = courseTasks[0];
            return (
              <div key={courseId} className="space-y-2">
                {/* Course header */}
                <div className="flex items-center gap-2 px-1">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  <Link
                    href={`/learn/${firstTask.courseSlug}`}
                    className="text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {firstTask.courseTitle}
                  </Link>
                  <span className="text-xs text-gray-400">({courseTasks.length} bài)</span>
                </div>

                {courseTasks.map((task) => {
                  const status: TaskStatus = task.submission?.status ?? "PENDING";
                  const isOpen = expanded === task.id;
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status === "PENDING";

                  return (
                    <div key={task.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : task.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-600">{task.order}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                            {task.dueDate && (
                              <span className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-semibold")}>
                                <Clock className="w-3 h-3" />
                                {isOverdue ? "Quá hạn: " : "Hạn: "}
                                {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                            <span>Điểm tối đa: {task.maxScore}</span>
                            {task.submission?.score != null && (
                              <span className="font-semibold text-primary-600">
                                Điểm: {task.submission.score}/{task.maxScore}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("badge text-xs", STATUS_COLOR[status])}>
                            {STATUS_LABEL[status]}
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 py-5 space-y-4">
                          {/* Description */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Đề bài</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
                          </div>

                          {/* Grading result */}
                          {task.submission && (task.submission.score != null || task.submission.feedback) && (
                            <div className={cn(
                              "rounded-xl p-4 border",
                              status === "PASSED" ? "bg-green-50 border-green-200" :
                              status === "FAILED" ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                {status === "PASSED" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                <p className="text-sm font-semibold text-gray-800">Kết quả chấm điểm</p>
                              </div>
                              {task.submission.score != null && (
                                <p className="text-sm text-gray-700">
                                  Điểm: <strong>{task.submission.score}/{task.maxScore}</strong>
                                </p>
                              )}
                              {task.submission.feedback && (
                                <p className="text-sm text-gray-600 mt-1">Nhận xét: {task.submission.feedback}</p>
                              )}
                            </div>
                          )}

                          {/* Submit form */}
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-700">
                              {task.submission ? "Cập nhật / Nộp lại bài làm" : "Nộp bài"}
                            </p>
                            <textarea
                              rows={5}
                              placeholder="Viết bài làm của bạn ở đây..."
                              className="input-field resize-none text-sm"
                              value={content[task.id] ?? ""}
                              onChange={(e) => setContent((p) => ({ ...p, [task.id]: e.target.value }))}
                            />
                            <input
                              type="url"
                              placeholder="Link file đính kèm (Google Drive, GitHub...) — tuỳ chọn"
                              className="input-field text-sm"
                              value={fileUrl[task.id] ?? ""}
                              onChange={(e) => setFileUrl((p) => ({ ...p, [task.id]: e.target.value }))}
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSubmit(task)}
                                disabled={submitting === task.id}
                                className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6"
                              >
                                {submitting === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {task.submission ? "Nộp lại" : "Nộp bài"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
