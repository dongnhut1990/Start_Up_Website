"use client";

import { CheckCircle, Circle, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { LearnLesson } from "@/types";

interface CourseSidebarProps {
  courseTitle: string;
  lessons: LearnLesson[];
  activeLessonId: string;
  progressPct: number;
  completedCount: number;
  onSelectLesson: (lesson: LearnLesson) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CourseSidebar({
  courseTitle,
  lessons,
  activeLessonId,
  progressPct,
  completedCount,
  onSelectLesson,
  isOpen,
  onToggle,
}: CourseSidebarProps) {
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-white border border-gray-200 shadow-md flex items-center justify-center rounded-r-lg transition-all duration-300",
          isOpen ? "left-72" : "left-0"
        )}
        title={isOpen ? "Ẩn danh sách bài" : "Hiện danh sách bài"}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-20 flex flex-col transition-transform duration-300 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{courseTitle}</h2>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{completedCount}/{lessons.length} bài hoàn thành</span>
              <span className="font-semibold text-primary-600">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = lesson.progress?.completed ?? false;

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={cn(
                  "w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors hover:bg-gray-50",
                  isActive && "bg-primary-50 border-l-4 border-l-primary-500"
                )}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-white ml-0.5" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium leading-snug line-clamp-2",
                    isActive ? "text-primary-700" : isCompleted ? "text-gray-500" : "text-gray-800"
                  )}>
                    <span className="text-gray-400 text-xs mr-1">Bài {index + 1}.</span>
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDuration(lesson.duration)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
