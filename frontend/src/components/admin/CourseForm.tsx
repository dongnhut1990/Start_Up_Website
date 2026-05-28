"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { COURSE_CATEGORIES } from "@/lib/utils";
import { Course } from "@/types";

const schema = z.object({
  title: z.string().min(5, "Tiêu đề tối thiểu 5 ký tự"),
  description: z.string().min(20, "Mô tả tối thiểu 20 ký tự"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  originalPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  category: z.string().min(1, "Chọn danh mục"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  thumbnail: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
  language: z.string().default("vi"),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  requirements: z.array(z.object({ value: z.string() })),
  outcomes: z.array(z.object({ value: z.string() })),
});

export type CourseFormData = z.infer<typeof schema>;

interface CourseFormProps {
  defaultValues?: Partial<Course>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}

export default function CourseForm({ defaultValues, onSubmit, submitLabel, isSubmitting }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? 0,
      originalPrice: defaultValues?.originalPrice ?? "",
      category: defaultValues?.category ?? "",
      level: defaultValues?.level ?? "BEGINNER",
      thumbnail: defaultValues?.thumbnail ?? "",
      language: "vi",
      isPublished: defaultValues?.isPublished ?? false,
      isFeatured: defaultValues?.isFeatured ?? false,
      requirements: (defaultValues?.requirements ?? [""]).map((v) => ({ value: v })),
      outcomes: (defaultValues?.outcomes ?? [""]).map((v) => ({ value: v })),
    },
  });

  const { fields: reqFields, append: addReq, remove: removeReq } = useFieldArray({ control, name: "requirements" });
  const { fields: outFields, append: addOut, remove: removeOut } = useFieldArray({ control, name: "outcomes" });

  const thumbnailUrl = watch("thumbnail");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ─── Thông tin cơ bản ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-lg">Thông tin cơ bản</h2>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề khoá học *</label>
          <input {...register("title")} placeholder="VD: Manual Testing Toàn Diện từ A-Z" className="input-field" />
          {errors.title && <p className="mt-1.5 text-red-500 text-xs">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả khoá học *</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Mô tả chi tiết về khoá học, học viên sẽ học được gì..."
            className="input-field resize-none"
          />
          {errors.description && <p className="mt-1.5 text-red-500 text-xs">{errors.description.message}</p>}
        </div>

        {/* Category + Level (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
            <select {...register("category")} className="input-field">
              <option value="">-- Chọn danh mục --</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-red-500 text-xs">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ *</label>
            <select {...register("level")} className="input-field">
              <option value="BEGINNER">Cơ bản</option>
              <option value="INTERMEDIATE">Trung cấp</option>
              <option value="ADVANCED">Nâng cao</option>
            </select>
          </div>
        </div>

        {/* Price + Original Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (VNĐ) *</label>
            <input
              {...register("price")}
              type="number"
              min={0}
              step={10000}
              placeholder="0 = Miễn phí"
              className="input-field"
            />
            {errors.price && <p className="mt-1.5 text-red-500 text-xs">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá gốc <span className="text-gray-400 font-normal">(để hiển thị giảm giá)</span>
            </label>
            <input
              {...register("originalPrice")}
              type="number"
              min={0}
              step={10000}
              placeholder="VD: 1500000"
              className="input-field"
            />
          </div>
        </div>
      </section>

      {/* ─── Ảnh bìa ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-lg">Ảnh bìa khoá học</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL ảnh bìa</label>
            <input
              {...register("thumbnail")}
              placeholder="https://images.unsplash.com/..."
              className="input-field"
            />
            {errors.thumbnail && <p className="mt-1.5 text-red-500 text-xs">{errors.thumbnail.message}</p>}
            <p className="mt-2 text-xs text-gray-400">
              Dùng ảnh từ Unsplash, Cloudinary, hoặc bất kỳ URL ảnh public nào.
            </p>
          </div>
          {/* Preview */}
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs">Xem trước ảnh bìa</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Kết quả đầu ra ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Học viên sẽ học được gì?</h2>
            <p className="text-sm text-gray-400 mt-0.5">Liệt kê các kỹ năng, kiến thức học viên đạt được</p>
          </div>
          <button
            type="button"
            onClick={() => addOut({ value: "" })}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:text-primary-700"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
        <div className="space-y-2.5">
          {outFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`outcomes.${i}.value`)}
                placeholder={`VD: Biết viết test case chuyên nghiệp`}
                className="input-field flex-1 text-sm py-2.5"
              />
              {outFields.length > 1 && (
                <button type="button" onClick={() => removeOut(i)} className="text-gray-400 hover:text-red-500 p-2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Yêu cầu đầu vào ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Yêu cầu trước khi học</h2>
            <p className="text-sm text-gray-400 mt-0.5">Học viên cần biết gì trước khi học khoá này</p>
          </div>
          <button
            type="button"
            onClick={() => addReq({ value: "" })}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:text-primary-700"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
        <div className="space-y-2.5">
          {reqFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`requirements.${i}.value`)}
                placeholder={`VD: Biết sử dụng máy tính cơ bản`}
                className="input-field flex-1 text-sm py-2.5"
              />
              {reqFields.length > 1 && (
                <button type="button" onClick={() => removeReq(i)} className="text-gray-400 hover:text-red-500 p-2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Cài đặt xuất bản ─── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Cài đặt xuất bản</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input {...register("isPublished")} type="checkbox" className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-primary-600 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Xuất bản ngay</p>
              <p className="text-xs text-gray-400">Học viên có thể thấy và mua khoá học</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input {...register("isFeatured")} type="checkbox" className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-amber-500 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Khoá học nổi bật</p>
              <p className="text-xs text-gray-400">Hiển thị ở trang chủ và đầu danh sách</p>
            </div>
          </label>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary px-10 py-3.5 text-base flex items-center gap-2"
        >
          {isSubmitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
