"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CheckCircle, Clock, Users, BookOpen, Star, Lock,
  Play, ChevronDown, ChevronUp, ShoppingCart, ArrowLeft
} from "lucide-react";
import { courseApi, paymentApi } from "@/lib/api";
import { Course } from "@/types";
import { formatPrice, formatDuration, COURSE_LEVELS, LEVEL_COLORS, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(true);

  useEffect(() => {
    courseApi
      .getBySlug(slug)
      .then((res) => {
        setCourse(res.data.data.course);
        setIsEnrolled(res.data.data.isEnrolled);
      })
      .catch(() => router.replace("/courses"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleEnroll = async (method: "VNPAY" | "MOMO" | "FREE") => {
    if (!user) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    setBuying(true);
    try {
      const res = await paymentApi.create({
        courseId: course!.id,
        method,
        returnUrl: `${window.location.origin}/payment/callback`,
      });

      const data = res.data.data;
      if (data.method === "FREE") {
        toast.success("Đăng ký khóa học thành công!");
        setIsEnrolled(true);
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      toast.error(msg);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) return null;

  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/courses" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-950 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="lg:max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <span className={cn("badge", LEVEL_COLORS[course.level])}>{COURSE_LEVELS[course.level]}</span>
              <span className="badge bg-white/10 text-white">{course.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-5">{course.title}</h1>
            <p className="text-primary-200 text-lg leading-relaxed mb-7">{course.description}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-primary-200">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold">{course.rating.toFixed(1)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {course.totalStudents.toLocaleString("vi-VN")} học viên
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDuration(course.duration)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {course._count?.lessons || course.lessons?.length || 0} bài học
              </span>
            </div>
            <p className="mt-4 text-primary-300 text-sm">
              Giảng viên: <span className="text-white font-semibold">{course.instructor.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="lg:grid lg:grid-cols-3 lg:gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Outcomes */}
              {course.outcomes?.length > 0 && (
                <div className="card p-7">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Bạn sẽ học được gì?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.outcomes.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements?.length > 0 && (
                <div className="card p-7">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Yêu cầu trước khi học</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Curriculum */}
              <div className="card">
                <button
                  onClick={() => setCurriculumOpen(!curriculumOpen)}
                  className="w-full flex items-center justify-between p-7 font-bold text-xl text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>Nội dung khóa học</span>
                  {curriculumOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {curriculumOpen && course.lessons && (
                  <div className="border-t border-gray-100">
                    {course.lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex items-center justify-between px-7 py-4 border-b border-gray-50 last:border-0",
                          lesson.isFree || isEnrolled ? "hover:bg-gray-50" : "opacity-70"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                            lesson.isFree || isEnrolled ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-400"
                          )}>
                            {lesson.isFree || isEnrolled ? (
                              <Play className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Bài {i + 1}: {lesson.title}
                            </p>
                            {lesson.isFree && !isEnrolled && (
                              <span className="text-xs text-green-600 font-medium">Xem miễn phí</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatDuration(lesson.duration)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="mt-8 lg:mt-0">
              <div className="card p-6 sticky top-20">
                {/* Thumbnail preview */}
                {course.thumbnail && (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-5">
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-gray-900">{formatPrice(course.price)}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-gray-400 line-through text-lg">{formatPrice(course.originalPrice!)}</span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                      </>
                    )}
                  </div>
                </div>

                {isEnrolled ? (
                  <Link href={`/learn/${course.slug}`} className="btn-primary w-full text-center block text-base py-3.5 mb-4">
                    Vào học ngay →
                  </Link>
                ) : (
                  <div className="space-y-3 mb-5">
                    {course.price === 0 ? (
                      <button
                        onClick={() => handleEnroll("FREE")}
                        disabled={buying}
                        className="btn-primary w-full text-base py-3.5 disabled:opacity-60"
                      >
                        {buying ? "Đang xử lý..." : "Đăng ký miễn phí"}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEnroll("VNPAY")}
                          disabled={buying}
                          className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {buying ? "Đang xử lý..." : "Thanh toán VNPay"}
                        </button>
                        <button
                          onClick={() => handleEnroll("MOMO")}
                          disabled={buying}
                          className="w-full py-3.5 px-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {buying ? "Đang xử lý..." : "Thanh toán MoMo"}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isEnrolled && (
                  <p className="text-center text-xs text-gray-400 mb-5">
                    Hoàn tiền 100% trong vòng 7 ngày nếu không hài lòng
                  </p>
                )}

                {/* Course includes */}
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Khóa học bao gồm:</p>
                  {[
                    { icon: Clock, text: `${formatDuration(course.duration)} học` },
                    { icon: BookOpen, text: `${course._count?.lessons || 0} bài học` },
                    { icon: Users, text: "Hỗ trợ từ mentor" },
                    { icon: CheckCircle, text: "Chứng chỉ hoàn thành" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Icon className="w-4 h-4 text-gray-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
