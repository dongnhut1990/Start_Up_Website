import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TesterPro Academy - Học Tester Chuyên Nghiệp",
  description:
    "Nền tảng học tập dành riêng cho Tester. Nắm vững kỹ năng kiểm thử phần mềm, vượt qua phỏng vấn và gia nhập các công ty công nghệ hàng đầu.",
  keywords: ["tester", "software testing", "QA", "học tester", "kiểm thử phần mềm"],
  openGraph: {
    title: "TesterPro Academy",
    description: "Học Tester Chuyên Nghiệp - Từ 0 đến Phỏng vấn thành công",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", fontFamily: "Inter, sans-serif" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
