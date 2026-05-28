"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, X, Loader2, ClipboardList,
  Users, CheckCircle, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { taskApi } from "@/lib/api";
import { Task, SubmissionWithUser, TaskStatus } from "@/types";

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

interface TaskForm {
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
}

const defaultForm: TaskForm = { title: "", description: "", dueDate: "", maxScore: 100 };

interface Props {
  courseId: string;
}

export default function TaskEditor({ courseId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, SubmissionWithUser[]>>({});
  const [loadingSubs, setLoadingSubs] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<Record<string, { score: string; feedback: string; status: TaskStatus }>>({});

  useEffect(() => {
    taskApi.getAll(courseId)
      .then((res) => setTasks(res.data.data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const openCreate = () => {
    setEditingTask(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      maxScore: task.maxScore,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Tiêu đề và mô tả không được trống");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (editingTask) {
        const res = await taskApi.update(courseId, editingTask.id, payload);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data.data.task : t)));
        toast.success("Đã cập nhật bài tập");
      } else {
        const res = await taskApi.create(courseId, payload);
        setTasks((prev) => [...prev, res.data.data.task]);
        toast.success("Đã tạo bài tập");
      }
      setShowForm(false);
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Xoá bài tập "${task.title}"?`)) return;
    try {
      await taskApi.delete(courseId, task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.success("Đã xoá bài tập");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const loadSubmissions = async (taskId: string) => {
    if (submissions[taskId]) {
      setExpandedTask(expandedTask === taskId ? null : taskId);
      return;
    }
    setLoadingSubs(taskId);
    try {
      const res = await taskApi.getSubmissions(courseId, taskId);
      setSubmissions((prev) => ({ ...prev, [taskId]: res.data.data.submissions }));
      setExpandedTask(taskId);
    } catch {
      toast.error("Không tải được bài nộp");
    } finally {
      setLoadingSubs(null);
    }
  };

  const handleReview = async (taskId: string, submissionId: string) => {
    const rf = reviewForm[submissionId];
    if (!rf) return;
    try {
      const res = await taskApi.reviewSubmission(courseId, taskId, submissionId, {
        score: parseInt(rf.score) || null,
        feedback: rf.feedback || null,
        status: rf.status,
      });
      setSubmissions((prev) => ({
        ...prev,
        [taskId]: prev[taskId].map((s) => (s.id === submissionId ? { ...s, ...res.data.data.submission } : s)),
      }));
      setReviewForm((prev) => { const next = { ...prev }; delete next[submissionId]; return next; });
      toast.success("Đã chấm điểm");
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{tasks.length} bài tập</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> Thêm bài tập
        </button>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold mb-1">Chưa có bài tập nào</p>
          <p className="text-gray-400 text-sm">Thêm bài tập để học viên thực hành</p>
        </div>
      )}

      {/* Task list */}
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 flex items-start gap-4">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary-600">{task.order}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{task.title}</p>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Hạn: {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Điểm tối đa: {task.maxScore}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {task._count?.submissions ?? 0} bài nộp
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => loadSubmissions(task.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {loadingSubs === task.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : expandedTask === task.id ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                Bài nộp
              </button>
              <button
                onClick={() => openEdit(task)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Sửa
              </button>
              <button
                onClick={() => handleDelete(task)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Submissions panel */}
          {expandedTask === task.id && submissions[task.id] && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
              {submissions[task.id].length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có học viên nào nộp bài</p>
              ) : (
                submissions[task.id].map((sub) => (
                  <div key={sub.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                          {sub.user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{sub.user.name}</p>
                          <p className="text-xs text-gray-400">{sub.user.email}</p>
                        </div>
                      </div>
                      <span className={`badge text-xs ${STATUS_COLOR[sub.status]}`}>
                        {STATUS_LABEL[sub.status]}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {sub.content}
                    </div>
                    {sub.fileUrl && (
                      <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary-600 underline">Xem file đính kèm</a>
                    )}
                    {sub.score != null && (
                      <p className="text-xs text-gray-500">
                        Điểm: <strong>{sub.score}/{task.maxScore}</strong>
                        {sub.feedback && <> · Nhận xét: {sub.feedback}</>}
                      </p>
                    )}

                    {/* Review form */}
                    {reviewForm[sub.id] ? (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number" min={0} max={task.maxScore}
                            placeholder={`Điểm (0-${task.maxScore})`}
                            className="input-field text-sm py-2"
                            value={reviewForm[sub.id].score}
                            onChange={(e) => setReviewForm((prev) => ({ ...prev, [sub.id]: { ...prev[sub.id], score: e.target.value } }))}
                          />
                          <select
                            className="input-field text-sm py-2"
                            value={reviewForm[sub.id].status}
                            onChange={(e) => setReviewForm((prev) => ({ ...prev, [sub.id]: { ...prev[sub.id], status: e.target.value as TaskStatus } }))}
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
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, [sub.id]: { ...prev[sub.id], feedback: e.target.value } }))}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(task.id, sub.id)}
                            className="btn-primary text-xs py-1.5 px-4"
                          >
                            Lưu chấm điểm
                          </button>
                          <button
                            onClick={() => setReviewForm((prev) => { const n = { ...prev }; delete n[sub.id]; return n; })}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewForm((prev) => ({ ...prev, [sub.id]: { score: sub.score?.toString() ?? "", feedback: sub.feedback ?? "", status: sub.status } }))}
                        className="text-xs text-primary-600 font-semibold hover:underline"
                      >
                        {sub.score != null ? "Chấm lại" : "Chấm điểm"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingTask ? "Sửa bài tập" : "Thêm bài tập mới"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Viết test case cho tính năng đăng nhập"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả / Đề bài *</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả chi tiết yêu cầu bài tập..."
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hạn nộp</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Điểm tối đa</label>
                  <input
                    type="number" min={1} max={1000}
                    value={form.maxScore}
                    onChange={(e) => setForm((f) => ({ ...f, maxScore: parseInt(e.target.value) || 100 }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-5">Huỷ</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-6 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {editingTask ? "Lưu thay đổi" : "Tạo bài tập"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
