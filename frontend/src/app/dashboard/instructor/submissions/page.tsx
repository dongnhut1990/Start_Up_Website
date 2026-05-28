"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ClipboardList, Loader2, Filter, ExternalLink } from "lucide-react";
import { instructorApi, taskApi } from "@/lib/api";
import { AdminSubmission, TaskStatus } from "@/types";
import { formatDate, cn } from "@/lib/utils";

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Chưa nộp",
  SUBMITTED: "Đã nộp",
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

export default function InstructorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [reviewForm, setReviewForm] = useState<Record<string, { score: string; feedback: string; status: TaskStatus }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = (status?: string) => {
    setLoading(true);
    instructorApi.getSubmissions(status ? { status } : {})
      .then((res) => setSubmissions(res.data.data.submissions))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilterChange = (s: string) => {
    setStatusFilter(s);
    load(s || undefined);
  };

  const handleReview = async (sub: AdminSubmission) => {
    const rf = reviewForm[sub.id];
    if (!rf) return;
    try {
      const res = await taskApi.reviewSubmission(sub.task.course.id, sub.task.id, sub.id, {
        score: rf.score ? parseInt(rf.score) : null,
        feedback: rf.feedback || null,
        status: rf.status,
      });
      setSubmissions((prev) => prev.map((s) => s.id === sub.id ? { ...s, ...res.data.data.submission } : s));
      setReviewForm((prev) => { const n = { ...prev }; delete n[sub.id]; return n; });
      setExpandedId(null);
      toast.success("Đã chấm điểm");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Bài nộp của học viên</h1>
        <p className="text-gray-500 mt-0.5">Bài tập học viên đã nộp trong khoá học của bạn</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {[
          { value: "", label: "Tất cả" },
          { value: "SUBMITTED", label: "Chờ chấm" },
          { value: "PASSED", label: "Đạt" },
          { value: "FAILED", label: "Không đạt" },
          { value: "REVIEWED", label: "Đã xem" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors",
              statusFilter === value
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">Chưa có bài nộp nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                  {sub.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">{sub.user.name}</p>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs text-gray-400">{sub.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Link
                      href={`/dashboard/admin/courses/${sub.task.course.id}/edit`}
                      className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1"
                    >
                      {sub.task.course.title}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs text-gray-500">{sub.task.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(sub.submittedAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.score != null && (
                    <span className="text-xs font-bold text-gray-700">{sub.score}/{sub.task.maxScore}</span>
                  )}
                  <span className={cn("badge text-xs", STATUS_COLOR[sub.status as TaskStatus])}>
                    {STATUS_LABEL[sub.status as TaskStatus]}
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                    className="text-xs text-primary-600 font-semibold hover:underline ml-1"
                  >
                    {expandedId === sub.id ? "Đóng" : "Chi tiết"}
                  </button>
                </div>
              </div>

              {expandedId === sub.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Nội dung bài làm</p>
                    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {sub.content}
                    </div>
                    {sub.fileUrl && (
                      <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-primary-600 underline">
                        Xem file đính kèm
                      </a>
                    )}
                  </div>

                  {sub.feedback && (
                    <div className="text-xs text-gray-500">
                      Nhận xét trước: <span className="text-gray-700">{sub.feedback}</span>
                    </div>
                  )}

                  {reviewForm[sub.id] ? (
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Chấm điểm</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number" min={0} max={sub.task.maxScore}
                          placeholder={`Điểm (0–${sub.task.maxScore})`}
                          className="input-field text-sm py-2"
                          value={reviewForm[sub.id].score}
                          onChange={(e) => setReviewForm((p) => ({ ...p, [sub.id]: { ...p[sub.id], score: e.target.value } }))}
                        />
                        <select
                          className="input-field text-sm py-2"
                          value={reviewForm[sub.id].status}
                          onChange={(e) => setReviewForm((p) => ({ ...p, [sub.id]: { ...p[sub.id], status: e.target.value as TaskStatus } }))}
                        >
                          <option value="REVIEWED">Đã xem</option>
                          <option value="PASSED">Đạt</option>
                          <option value="FAILED">Không đạt</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Nhận xét (tuỳ chọn)"
                        className="input-field text-sm resize-none w-full"
                        value={reviewForm[sub.id].feedback}
                        onChange={(e) => setReviewForm((p) => ({ ...p, [sub.id]: { ...p[sub.id], feedback: e.target.value } }))}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(sub)} className="btn-primary text-xs py-2 px-5">Lưu</button>
                        <button
                          onClick={() => setReviewForm((p) => { const n = { ...p }; delete n[sub.id]; return n; })}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewForm((p) => ({
                        ...p,
                        [sub.id]: { score: sub.score?.toString() ?? "", feedback: sub.feedback ?? "", status: sub.status as TaskStatus }
                      }))}
                      className="text-xs text-primary-600 font-semibold hover:underline"
                    >
                      {sub.score != null ? "Chấm lại" : "Chấm điểm"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
