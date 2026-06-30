import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "TesterPro Academy <noreply@testerpro.vn>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function baseLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#c026d3);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-0.5px;">
                🎓 TesterPro Academy
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Nền tảng học tập dành cho QA/Tester Việt Nam
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 TesterPro Academy. Mọi quyền được bảo lưu.<br/>
                Nếu bạn không thực hiện hành động này, vui lòng bỏ qua email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(label: string, url: string): string {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#c026d3);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:bold;">
      ${label}
    </a>
  </div>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function welcomeHtml(name: string): string {
  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Chào mừng ${name}! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Bạn đã đăng ký tài khoản thành công tại <strong>TesterPro Academy</strong>.
      Hàng trăm khóa học về QA/Tester đang chờ bạn khám phá.
    </p>
    <div style="background:#f0f9ff;border-left:4px solid #2563eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">
        ✅ Xem danh sách khóa học<br/>
        ✅ Đăng ký và học miễn phí một số khóa<br/>
        ✅ Theo dõi tiến độ học tập của bạn
      </p>
    </div>
    ${btn("Khám phá khóa học ngay", `${FRONTEND_URL}/courses`)}
    <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
      Bạn vừa đăng ký với email này. Nếu không phải bạn, vui lòng bỏ qua email này.
    </p>`;
  return baseLayout("Chào mừng đến TesterPro Academy", body);
}

function enrollmentHtml(name: string, courseTitle: string, courseSlug: string): string {
  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Đăng ký thành công! 🚀</h2>
    <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Xin chúc mừng <strong>${name}</strong>! Bạn đã đăng ký thành công khóa học:
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0;font-size:17px;font-weight:bold;color:#15803d;">📚 ${courseTitle}</p>
    </div>
    <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Bạn có thể bắt đầu học ngay bây giờ. Chúc bạn học tập hiệu quả!
    </p>
    ${btn("Bắt đầu học ngay", `${FRONTEND_URL}/learn/${courseSlug}`)}`;
  return baseLayout("Đăng ký khóa học thành công", body);
}

function gradeHtml(
  name: string,
  taskTitle: string,
  courseTitle: string,
  score: number | null,
  maxScore: number,
  feedback: string | null,
  status: string
): string {
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    PASSED:   { label: "Đạt ✅",   color: "#15803d", bg: "#f0fdf4" },
    FAILED:   { label: "Chưa đạt ❌", color: "#b91c1c", bg: "#fef2f2" },
    REVIEWED: { label: "Đã chấm 📋", color: "#1e40af", bg: "#eff6ff" },
  };
  const s = statusMap[status] ?? { label: status, color: "#374151", bg: "#f9fafb" };

  const body = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Bài tập đã được chấm điểm 📝</h2>
    <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Xin chào <strong>${name}</strong>, bài tập của bạn vừa được chấm xong!
    </p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px 24px;margin:0 0 16px;">
      <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Khóa học</p>
      <p style="margin:0;font-size:15px;color:#374151;font-weight:600;">${courseTitle}</p>
    </div>

    <div style="background:#f9fafb;border-radius:8px;padding:20px 24px;margin:0 0 16px;">
      <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Bài tập</p>
      <p style="margin:0;font-size:15px;color:#374151;font-weight:600;">${taskTitle}</p>
    </div>

    <div style="display:flex;gap:12px;margin:0 0 16px;">
      <div style="flex:1;background:${s.bg};border-radius:8px;padding:16px 20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Trạng thái</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:${s.color};">${s.label}</p>
      </div>
      ${score !== null ? `
      <div style="flex:1;background:#f0f9ff;border-radius:8px;padding:16px 20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Điểm số</p>
        <p style="margin:0;font-size:22px;font-weight:bold;color:#1e40af;">${score}<span style="font-size:13px;color:#9ca3af;">/${maxScore}</span></p>
      </div>` : ""}
    </div>

    ${feedback ? `
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:13px;color:#92400e;font-weight:600;">Nhận xét từ giảng viên:</p>
      <p style="margin:0;color:#78350f;line-height:1.6;font-size:14px;">${feedback}</p>
    </div>` : ""}

    ${btn("Xem chi tiết bài tập", `${FRONTEND_URL}/dashboard/tasks`)}`;
  return baseLayout("Kết quả chấm bài tập", body);
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}

export const sendWelcomeEmail = (to: string, name: string) =>
  send(to, "Chào mừng đến TesterPro Academy! 🎓", welcomeHtml(name));

export const sendEnrollmentEmail = (to: string, name: string, courseTitle: string, courseSlug: string) =>
  send(to, `Bạn đã đăng ký thành công: ${courseTitle}`, enrollmentHtml(name, courseTitle, courseSlug));

export const sendGradeEmail = (
  to: string,
  name: string,
  taskTitle: string,
  courseTitle: string,
  score: number | null,
  maxScore: number,
  feedback: string | null,
  status: string
) => send(to, `Kết quả bài tập: ${taskTitle}`, gradeHtml(name, taskTitle, courseTitle, score, maxScore, feedback, status));
