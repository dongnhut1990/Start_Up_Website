import Link from "next/link";
import { BookOpen, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">TesterPro Academy</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Nền tảng học tập chuyên biệt dành cho Tester. Từ kiến thức cơ bản đến nâng cao, giúp bạn tự tin ứng tuyển và thành công trong sự nghiệp.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-semibold mb-5">Khóa học</h4>
            <ul className="space-y-3 text-sm">
              {["Manual Testing", "Automation Testing", "API Testing", "Performance Testing", "Test Management"].map((c) => (
                <li key={c}>
                  <Link href={`/courses?category=${c}`} className="hover:text-primary-400 transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-5">Công ty</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Về chúng tôi", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Tuyển dụng", href: "/careers" },
                { label: "Điều khoản sử dụng", href: "/terms" },
                { label: "Chính sách bảo mật", href: "/privacy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5">Liên hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span>Hà Nội / TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="mailto:hello@testerpro.vn" className="hover:text-primary-400 transition-colors">
                  hello@testerpro.vn
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <a href="tel:+84901234567" className="hover:text-primary-400 transition-colors">
                  0901 234 567
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2026 TesterPro Academy. All rights reserved.</p>
          <p>Phát triển bởi đội ngũ TesterPro 🇻🇳</p>
        </div>
      </div>
    </footer>
  );
}
