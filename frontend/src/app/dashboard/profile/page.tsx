"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, Save } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const profileSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: errP, isSubmitting: submittingP } } =
    useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: user?.name, phone: user?.phone || "" },
    });

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: errPw, isSubmitting: submittingPw } } =
    useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await authApi.updateProfile(data);
      await refreshUser();
      toast.success("Cập nhật hồ sơ thành công!");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      resetPw();
      toast.success("Đổi mật khẩu thành công!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Đổi mật khẩu thất bại";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Hồ sơ của tôi</h1>
        <p className="text-gray-500 mt-1">Cập nhật thông tin cá nhân</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="inline-block mt-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {user?.role === "ADMIN" ? "Quản trị viên" : user?.role === "INSTRUCTOR" ? "Giảng viên" : "Học viên"}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7">
        <h2 className="font-bold text-gray-900 text-lg mb-6">Thông tin cá nhân</h2>
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...regProfile("name")} type="text" className="input-field pl-10" />
            </div>
            {errP.name && <p className="mt-1.5 text-red-500 text-xs">{errP.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={user?.email} disabled className="input-field pl-10 bg-gray-50 cursor-not-allowed" />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Email không thể thay đổi</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...regProfile("phone")} type="tel" placeholder="0901 234 567" className="input-field pl-10" />
            </div>
          </div>

          <button type="submit" disabled={submittingP} className="btn-primary flex items-center gap-2 py-2.5 px-6">
            {submittingP ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7">
        <h2 className="font-bold text-gray-900 text-lg mb-6">Đổi mật khẩu</h2>
        <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-5">
          {[
            { name: "currentPassword" as const, label: "Mật khẩu hiện tại", show: showCurrentPw, toggle: () => setShowCurrentPw(!showCurrentPw) },
            { name: "newPassword" as const, label: "Mật khẩu mới", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
            { name: "confirmPassword" as const, label: "Xác nhận mật khẩu mới", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
          ].map(({ name, label, show, toggle }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...regPw(name)} type={show ? "text" : "password"} className="input-field pl-10 pr-10" />
                {name !== "confirmPassword" && (
                  <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {errPw[name] && <p className="mt-1.5 text-red-500 text-xs">{errPw[name]?.message}</p>}
            </div>
          ))}

          <button type="submit" disabled={submittingPw} className="btn-primary flex items-center gap-2 py-2.5 px-6">
            {submittingPw ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
