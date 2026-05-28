"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Clock, CheckCircle, XCircle, Loader2, Send, ChevronDown, ChevronUp } from "lucide-react";
import { taskApi } from "@/lib/api";
import { TaskWithSubmission, TaskStatus } from "@/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: "Chưa nộp",
  SUBMITTED: "Đã nộp — chờ chấm",
  REVIEWED: "Đã chấm",
  PASSED: "Đạt",
  FAILED: "Không đạt",
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4 text-gray-400" />,
  SUBMITTED: <Loader2 className="w-4 h-4 text-blue-500" />,
  REVIEWED: <CheckCircle className="w-4 h-4 text-purple-500" />,
  PASSED: <CheckCircle className="w-4 h-4 text-green-500" />,
  FAILED: <XCircle className="w-4 h-4 text-red-500" />,
};

interface Props {
  courseId: string;
}

export default function TaskPanel({ courseId }: Props) {
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [fileUrl, setFileUrl] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    taskApi.getStudentTasks(courseId)
      .then((res) => setTasks(res.data.data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async (task: TaskWithSubmission) => {
    const text = content[task.id]?.trim();
    if (!text) { toast.error("Vui lòng nhập nội dung bài làm"); return; }
    setSubmitting(task.id);
    try {
      const res = await taskApi.submit(courseId, task.id, { content: text, fileUrl: fileUrl[task.id] || undefined });
      const newSub = res.data.data.submission;
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, submission: newSub } : t));
      toast.success("Nộp bài thành công!");
    } catch {
      toast.error("Có lỗi xảy ra khi nộp bài");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-semibold">Chưa có bài tập nào</p>
        <p className="text-gray-400 text-sm mt-1">Giảng viên chưa thêm bài tập cho khoá học này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const sub = task.submission;
        const status: TaskStatus = sub?.status ?? "PENDING";
        const isOpen = expanded === task.id;

        return (
          <div key={task.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Task header */}
            <button
              onClick={() => setExpanded(isOpen ? null : task.id)}
              className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary-600">{task.order}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{task.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Hạn: {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                  <span>Điểm tối đa: {task.maxScore}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  {STATUS_ICON[status]}
                  {STATUS_LABEL[status]}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                {/* Task description */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Đề bài</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                </div>

                {/* Previous submission result */}
                {sub && (sub.score != null || sub.feedback) && (
                  <div className={`rounded-xl p-4 border ${status === "PASSED" ? "bg-green-50 border-green-200" : status === "FAILED" ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"}`}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Kết quả chấm điểm</p>
                    {sub.score != null && (
                      <p className="text-sm text-gray-700">
                        Điểm: <strong>{sub.score}/{task.maxScore}</strong>
                      </p>
                    )}
                    {sub.feedback && (
                      <p className="text-sm text-gray-600 mt-1">Nhận xét: {sub.feedback}</p>
                    )}
                  </div>
                )}

                {/* Submission form */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {sub ? "Cập nhật bài làm" : "Nộp bài"}
                  </p>
                  {sub && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Bài đã nộp trước đó:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{sub.submittedAt && `[${new Date(sub.submittedAt).toLocaleString("vi-VN")}] `}</p>
                    </div>
                  )}
                  <textarea
                    rows={6}
                    placeholder="Viết bài làm của bạn ở đây... (mô tả cách tiếp cận, kết quả, nhận xét)"
                    className="input-field resize-none text-sm"
                    value={content[task.id] ?? ""}
                    onChange={(e) => setContent((prev) => ({ ...prev, [task.id]: e.target.value }))}
                  />
                  <input
                    type="url"
                    placeholder="Link file đính kèm (Google Drive, GitHub, ...) — tuỳ chọn"
                    className="input-field text-sm"
                    value={fileUrl[task.id] ?? ""}
                    onChange={(e) => setFileUrl((prev) => ({ ...prev, [task.id]: e.target.value }))}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSubmit(task)}
                      disabled={submitting === task.id}
                      className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6"
                    >
                      {submitting === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sub ? "Nộp lại" : "Nộp bài"}
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
}
