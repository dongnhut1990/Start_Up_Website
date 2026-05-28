"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

const PERKS = [
  "Truy cập khóa học miễn phí",
  "Được tư vấn lộ trình học tập",
  "Tham gia cộng đồng Tester Việt Nam",
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      });
      const { user, token } = res.data.data;
      login(token, user);
      toast.success("Đăng ký thành công! Chào mừng bạn đến với TesterPro!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Đăng ký thất bại";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        {/* Perks */}
        <div className="bg-primary-50 rounded-2xl p-4 mb-7">
          <p className="text-sm font-semibold text-primary-700 mb-2">Đăng ký ngay để nhận:</p>
          <ul className="space-y-1.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-primary-700">
                <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Tạo tài khoản</h1>
          <p className="text-gray-500 text-sm">Hoàn toàn miễn phí, không cần thẻ tín dụng</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register("name")} type="text" placeholder="Nguyễn Văn A" className="input-field pl-10" />
            </div>
            {errors.name && <p className="mt-1.5 text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10" />
            </div>
            {errors.email && <p className="mt-1.5 text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số điện thoại <span className="text-gray-400 font-normal">(không bắt buộc)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register("phone")} type="tel" placeholder="0901 234 567" className="input-field pl-10" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="input-field pl-10"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-red-500 text-xs">{errors.confirmPassword.message}</p>}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">Điều khoản dịch vụ</Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline">Chính sách bảo mật</Link>.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-base py-3.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Tạo tài khoản miễn phí
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
