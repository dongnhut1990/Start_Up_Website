# TesterPro Academy - Hướng dẫn cài đặt

## Yêu cầu hệ thống
- Node.js 18+
- PostgreSQL 14+
- npm hoặc yarn

---

## 1. Clone & Cấu trúc dự án

```
Start_Up_Website/
├── frontend/     # Next.js 15 + TypeScript + Tailwind CSS
└── backend/      # Node.js + Express + Prisma + PostgreSQL
```

---

## 2. Cài đặt Backend

```bash
cd backend

# Cài dependencies
npm install

# Copy và cấu hình env
copy .env.example .env
# Sau đó chỉnh sửa .env với thông tin database của bạn

# Generate Prisma client
npx prisma generate

# Tạo database schema (lần đầu)
npx prisma migrate dev --name init

# Chạy server dev
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

---

## 3. Cài đặt Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Copy env
copy .env.local.example .env.local

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

---

## 4. Cấu hình Database (PostgreSQL)

```sql
-- Tạo database
CREATE DATABASE testerpro_db;
```

Sau đó cập nhật `DATABASE_URL` trong `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/testerpro_db"
```

---

## 5. Tạo tài khoản Admin đầu tiên

Sau khi migrate database, vào Prisma Studio để tạo admin:

```bash
cd backend
npx prisma studio
```

Hoặc chạy seed script:

```bash
# Đăng ký tài khoản thường tại http://localhost:3000/register
# Sau đó trong Prisma Studio, đổi role thành ADMIN
```

---

## 6. Cấu hình Thanh toán

### VNPay (Sandbox để test)
1. Đăng ký tài khoản tại: https://sandbox.vnpayment.vn
2. Lấy `TmnCode` và `HashSecret`
3. Cập nhật vào `backend/.env`

### MoMo (Sandbox để test)
1. Đăng ký tại: https://developers.momo.vn
2. Lấy `partnerCode`, `accessKey`, `secretKey`
3. Cập nhật vào `backend/.env`

---

## 7. API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)
- `PUT /api/auth/profile` - Cập nhật hồ sơ
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Courses
- `GET /api/courses` - Danh sách khóa học (public, có filter)
- `GET /api/courses/:slug` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học (ADMIN/INSTRUCTOR)
- `PUT /api/courses/:id` - Sửa khóa học
- `DELETE /api/courses/:id` - Xóa khóa học
- `GET /api/courses/me/enrollments` - Khóa học đang học

### Payment
- `POST /api/payment/create` - Tạo đơn thanh toán
- `GET /api/payment/history` - Lịch sử thanh toán
- `GET /api/payment/vnpay/callback` - VNPay callback
- `POST /api/payment/momo/callback` - MoMo callback

### Admin
- `GET /api/admin/dashboard` - Thống kê tổng quan
- `GET /api/admin/users` - Danh sách users
- `PUT /api/admin/users/:id` - Cập nhật user
- `GET /api/admin/courses` - Tất cả khóa học
- `PATCH /api/admin/courses/:id/publish` - Toggle publish

---

## 8. Tính năng đã xây dựng

### Frontend Pages
- `/` - Landing page (Hero, Features, Courses preview, Testimonials, CTA)
- `/courses` - Danh sách khóa học (filter theo category, level, search)
- `/courses/:slug` - Chi tiết khóa học + đăng ký/mua
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/dashboard` - Dashboard học viên (khóa đang học, tiến độ)
- `/dashboard/admin` - Dashboard admin (stats, giao dịch)
- `/dashboard/admin/courses` - Quản lý khóa học
- `/dashboard/admin/users` - Quản lý người dùng
- `/dashboard/profile` - Hồ sơ + đổi mật khẩu
- `/payment/callback` - Xử lý callback sau thanh toán

### Roles & Permissions
| Role | Quyền hạn |
|------|-----------|
| ADMIN | Toàn quyền: quản lý user, course, xem doanh thu |
| INSTRUCTOR | Tạo/sửa khóa học của mình |
| STUDENT | Mua khóa học, xem nội dung đã mua |

---

## 9. Giai đoạn phát triển tiếp theo

- [ ] Trang học bài (video player + tiến độ)
- [ ] Hệ thống bài tập & nộp bài
- [ ] Quản lý task / issue tracking
- [ ] Hệ thống đánh giá & bình luận
- [ ] Chứng chỉ hoàn thành
- [ ] Email notifications
- [ ] Upload video với Cloudinary/S3
- [ ] Forum / cộng đồng học viên
