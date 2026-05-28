"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Download, ArrowLeft, Award, BookOpen } from "lucide-react";
import { learnApi } from "@/lib/api";
import { Certificate } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { COURSE_LEVELS } from "@/lib/utils";

export default function CertificatePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/certificate/${slug}`);
      return;
    }
    if (!authLoading && user) {
      learnApi
        .getCertificate(slug)
        .then((res) => setCert(res.data.data.certificate))
        .catch((err) => {
          setError(err.response?.data?.error || "Không thể tải chứng chỉ");
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, slug, router]);

  const handlePrint = () => window.print();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Award className="w-16 h-16 text-gray-200 mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">Chưa thể nhận chứng chỉ</h1>
        <p className="text-gray-500 text-sm mb-6">{error || "Bạn cần hoàn thành 100% bài học trước"}</p>
        <Link href="/dashboard/courses" className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại khoá học
        </Link>
      </div>
    );
  }

  const completedDate = new Date(cert.completedAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar — hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard/courses" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Khoá học của tôi
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/learn/${cert.courseSlug}`}
            className="flex items-center gap-1.5 text-sm text-primary-600 border border-primary-200 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Xem lại khoá học
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-sm bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            In / Tải PDF
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="flex items-center justify-center p-8 print:p-0 print:block">
        <div
          ref={certRef}
          className="bg-white w-full max-w-3xl print:max-w-none print:w-full shadow-2xl print:shadow-none"
          style={{ minHeight: "500px", fontFamily: "'Georgia', serif" }}
        >
          {/* Outer border */}
          <div className="m-6 print:m-8 border-4 border-double border-amber-400 p-8 print:p-12 relative">
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400" />

            {/* Logo & brand */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl mb-3">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-bold tracking-widest text-gray-500 uppercase">TesterPro Academy</p>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl print:text-4xl font-bold text-gray-800 tracking-wide mb-1">
                Chứng Chỉ Hoàn Thành
              </h1>
              <div className="h-0.5 w-24 bg-amber-400 mx-auto mt-3" />
            </div>

            {/* Body */}
            <div className="text-center space-y-4">
              <p className="text-gray-500 text-sm tracking-wide">Trân trọng chứng nhận</p>

              <div>
                <p className="text-3xl print:text-4xl font-bold text-primary-700 pb-1" style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {cert.studentName}
                </p>
              </div>

              <p className="text-gray-500 text-sm tracking-wide">đã hoàn thành xuất sắc khoá học</p>

              <div className="py-3">
                <p className="text-xl print:text-2xl font-bold text-gray-900 leading-snug">
                  {cert.courseTitle}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-500">
                  <span>{cert.courseCategory}</span>
                  <span>·</span>
                  <span>{COURSE_LEVELS[cert.courseLevel]}</span>
                </div>
              </div>

              <p className="text-gray-500 text-sm">
                Hoàn thành ngày <span className="font-semibold text-gray-700">{completedDate}</span>
              </p>
            </div>

            {/* Footer with signature */}
            <div className="mt-12 flex items-end justify-between">
              <div className="text-center">
                <div className="h-px w-40 bg-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">{cert.instructorName}</p>
                <p className="text-xs text-gray-400">Giảng viên phụ trách</p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400 font-medium">Dấu chứng nhận</p>
              </div>
              <div className="text-center">
                <div className="h-px w-40 bg-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">TesterPro Academy</p>
                <p className="text-xs text-gray-400">Tổ chức cấp chứng chỉ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
