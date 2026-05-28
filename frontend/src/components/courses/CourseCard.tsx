import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { Course } from "@/types";
import { formatPrice, formatDuration, COURSE_LEVELS, LEVEL_COLORS, cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

export default function CourseCard({ course, compact = false }: CourseCardProps) {
  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video bg-gray-100">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary-400" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              -{discount}%
            </div>
          )}
          {course.isFeatured && (
            <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-lg">
              Nổi bật
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Level + Category */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("badge text-xs", LEVEL_COLORS[course.level])}>
              {COURSE_LEVELS[course.level]}
            </span>
            <span className="badge bg-gray-100 text-gray-600 text-xs">{course.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
            {course.title}
          </h3>

          {!compact && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{course.description}</p>
          )}

          {/* Instructor */}
          <p className="text-sm text-gray-500 mb-3">
            bởi <span className="font-medium text-gray-700">{course.instructor.name}</span>
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-700">{course.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {(course._count?.enrollments ?? course.totalStudents).toLocaleString("vi-VN")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formatDuration(course.duration)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary-600">{formatPrice(course.price)}</span>
              {course.originalPrice && course.originalPrice > course.price && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(course.originalPrice)}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{course._count?.lessons ?? course.totalLessons} bài học</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
