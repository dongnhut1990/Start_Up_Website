import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ArrowRight, Star, Users, BookOpen, Award, Zap, Shield, TrendingUp, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Khóa học thực chiến",
    desc: "Học từ những dự án thực tế, bài tập sát đề phỏng vấn tại các công ty IT hàng đầu.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Zap,
    title: "Mentor 1-1",
    desc: "Được hỗ trợ trực tiếp từ các chuyên gia Tester với nhiều năm kinh nghiệm thực tế.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Lộ trình rõ ràng",
    desc: "Từ Manual Testing → Automation → API Testing → Quản lý dự án, từng bước được định hướng.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Shield,
    title: "Chứng chỉ có giá trị",
    desc: "Hoàn thành khóa học nhận chứng chỉ được công nhận bởi các doanh nghiệp IT.",
    color: "bg-amber-50 text-amber-600",
  },
];

const STATS = [
  { value: "2,500+", label: "Học viên" },
  { value: "15+", label: "Khóa học" },
  { value: "95%", label: "Học viên được nhận việc" },
  { value: "4.9/5", label: "Đánh giá trung bình" },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Tú",
    role: "QA Engineer @ FPT Software",
    avatar: "N",
    content: "Trước đây tôi chưa có kiến thức gì về Testing. Sau 3 tháng học tại TesterPro, tôi đã pass phỏng vấn và vào làm tại FPT. Mentor hỗ trợ rất tận tình!",
    rating: 5,
  },
  {
    name: "Trần Thị Lan Anh",
    role: "Automation Tester @ VNG",
    avatar: "T",
    content: "Khóa Automation Testing cực kỳ chi tiết. Bài tập thực hành sát với công việc thực tế. Tôi hoàn toàn tự tin từ ngày 1 đi làm.",
    rating: 5,
  },
  {
    name: "Lê Văn Hùng",
    role: "Senior QA @ Shopee",
    avatar: "L",
    content: "TesterPro giúp tôi chuyển từ Manual sang Automation một cách trơn tru. Giờ tôi đã là Senior QA và đang hỗ trợ lại cộng đồng.",
    rating: 5,
  },
];

const COURSE_PREVIEWS = [
  {
    title: "Manual Testing Toàn Diện",
    category: "Manual Testing",
    level: "Cơ bản",
    price: 0,
    students: 890,
    lessons: 32,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Selenium WebDriver với Java",
    category: "Automation Testing",
    level: "Trung cấp",
    price: 1290000,
    students: 654,
    lessons: 48,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "API Testing với Postman & RestAssured",
    category: "API Testing",
    level: "Trung cấp",
    price: 990000,
    students: 432,
    lessons: 28,
    gradient: "from-orange-500 to-red-500",
  },
];

function PriceDisplay({ price }: { price: number }) {
  if (price === 0) return <span className="font-bold text-green-600">Miễn phí</span>;
  return (
    <span className="font-bold text-primary-600">
      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-accent-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Nền tảng học tập #1 dành cho Tester Việt Nam
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Trở thành{" "}
              <span className="bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
                Tester Chuyên Nghiệp
              </span>
              <br />
              trong 3-6 tháng
            </h1>

            <p className="text-lg md:text-xl text-primary-100 leading-relaxed mb-10 max-w-2xl">
              Học thực chiến, được mentor hỗ trợ 1-1, và tự tin bước vào phòng phỏng vấn tại các công ty công nghệ hàng đầu như FPT, VNG, Shopee, Tiki.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/courses" className="btn-primary text-base py-3.5 px-8 flex items-center gap-2">
                Khám phá khóa học
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/register" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center gap-2">
                Đăng ký miễn phí
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["N", "T", "L", "M", "A"].map((char, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary-800 bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-sm font-bold"
                  >
                    {char}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-primary-200 text-sm">
                  <span className="font-semibold text-white">2,500+</span> học viên đã thành công
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Tại sao chọn TesterPro?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Chúng tôi không chỉ dạy lý thuyết — chúng tôi đào tạo bạn để sẵn sàng làm việc thực tế từ ngày đầu tiên.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-7 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title mb-3">Khóa học nổi bật</h2>
              <p className="text-gray-500">Được học viên đánh giá cao nhất</p>
            </div>
            <Link href="/courses" className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COURSE_PREVIEWS.map((course) => (
              <div key={course.title} className="card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className={`h-44 bg-gradient-to-br ${course.gradient} relative flex items-center justify-center`}>
                  <BookOpen className="w-16 h-16 text-white/60 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {course.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {course.level}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString("vi-VN")} học viên
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons} bài học
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <PriceDisplay price={course.price} />
                    <Link href="/courses" className="text-sm text-primary-600 font-semibold hover:underline">
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link href="/courses" className="btn-outline">
              Xem tất cả khóa học
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Lộ trình học tập</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Từng bước được thiết kế khoa học để bạn tiến bộ nhanh nhất
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Manual Testing", desc: "Tư duy kiểm thử, viết test case, bug report, làm việc với Jira", color: "border-blue-200 bg-blue-50", badge: "bg-blue-600" },
              { step: "02", title: "API Testing", desc: "Postman, REST API, GraphQL, automation API test với RestAssured", color: "border-purple-200 bg-purple-50", badge: "bg-purple-600" },
              { step: "03", title: "Automation", desc: "Selenium, Playwright, Cypress - tự động hóa quy trình kiểm thử", color: "border-green-200 bg-green-50", badge: "bg-green-600" },
              { step: "04", title: "Phỏng vấn & Làm việc", desc: "Mock interview, bộ câu hỏi thực tế, hỗ trợ tìm việc tại các công ty", color: "border-amber-200 bg-amber-50", badge: "bg-amber-600" },
            ].map((item, i) => (
              <div key={item.step} className={`rounded-2xl border-2 ${item.color} p-7 relative`}>
                <div className={`w-10 h-10 ${item.badge} rounded-xl flex items-center justify-center text-white font-bold text-sm mb-5`}>
                  {item.step}
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Học viên nói gì về chúng tôi?</h2>
            <p className="text-gray-500 text-lg">Những câu chuyện thành công thực tế</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-7 hover:shadow-md transition-shadow">
                <div className="flex text-amber-400 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-primary-200" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Hơn 2,500 học viên đã thay đổi sự nghiệp với TesterPro Academy. Đừng để cơ hội qua đi.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-10 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Bắt đầu học miễn phí
            </Link>
            <Link href="/courses" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-200">
              Xem tất cả khóa học
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
