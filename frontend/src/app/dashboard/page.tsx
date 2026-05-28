"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Clock, ArrowRight, Play, ClipboardList, AlertCircle } from "lucide-react";
import { courseApi, myTasksApi } from "@/lib/api";
import { Enrollment, MyTask } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { formatDuration } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pendingTasks, setPendingTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      courseApi.getMyEnrollments().then((res) => setEnrollments(res.data.data.enrollments)).catch(() => {}),
      myTasksApi.getAll().then((res) => {
        const tasks: MyTask[] = res.data.data.tasks;
        setPendingTasks(tasks.filter((t) => !t.submission || t.submission.status === "PENDING"));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const notStarted = enrollments.filter((e) => e.progress === 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-7 text-white">
        <h1 className="text-2xl font-extrabold mb-1">
          Xin chào, {user?.name?.split(" ").pop()}! 👋
        </h1>
        <p className="text-primary-100">
          {enrollments.length > 0
            ? `Bạn đang học ${enrollments.length} khóa học. Hãy tiếp tục học nhé!`
            : "Bắt đầu hành trình học tập của bạn ngay hôm nay!"}
        </p>
        {enrollments.length === 0 && (
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 mt-4 bg-white text-primary-600 font-semibold text-sm px-5 py-2 rounded-xl hover:bg-primary-50 transition-colors"
          >
            Khám phá khóa học <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Khóa đang học", value: enrollments.length, color: "text-blue-600 bg-blue-50" },
          { icon: TrendingUp, label: "Đang tiến hành", value: inProgress.length, color: "text-purple-600 bg-purple-50" },
          { icon: Clock, label: "Chưa bắt đầu", value: notStarted.length, color: "text-amber-600 bg-amber-50" },
          { icon: ClipboardList, label: "Bài tập chưa nộp", value: pendingTasks.length, color: "text-rose-600 bg-rose-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tiếp tục học</h2>
          <div className="space-y-4">
            {inProgress.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{enrollment.course.title}</h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Tiến độ</span>
                      <span className="font-semibold text-primary-600">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Link
                  href={`/learn/${enrollment.course.slug}`}
                  className="shrink-0 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Tiếp tục
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Bài tập cần nộp</h2>
            <Link href="/dashboard/tasks" className="text-sm text-primary-600 font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 5).map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              return (
                <Link
                  key={task.id}
                  href="/dashboard/tasks"
                  className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm hover:border-primary-200 transition-all"
                >
                  <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{task.courseTitle}</p>
                  </div>
                  {task.dueDate && (
                    <span className={`text-xs font-semibold flex items-center gap-1 shrink-0 ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                      {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                      {isOverdue ? "Quá hạn" : new Date(task.dueDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* My Courses */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : enrollments.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Tất cả khóa học của tôi</h2>
            <Link href="/dashboard/courses" className="text-sm text-primary-600 font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.slice(0, 4).map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/learn/${enrollment.course.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{enrollment.progress}% hoàn thành</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-500 mb-2">Chưa có khóa học nào</h3>
          <p className="text-gray-400 text-sm mb-5">Bắt đầu học ngay để phát triển kỹ năng của bạn</p>
          <Link href="/courses" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6">
            Khám phá khóa học <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
