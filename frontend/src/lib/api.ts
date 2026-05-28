import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put("/auth/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/change-password", data),
};

// Courses
export const courseApi = {
  getAll: (params?: Record<string, string>) => api.get("/courses", { params }),
  getBySlug: (slug: string) => api.get(`/courses/${slug}`),
  create: (data: Record<string, unknown>) => api.post("/courses", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  getMyEnrollments: () => api.get("/courses/me/enrollments"),
};

// Lessons (Admin/Instructor)
export const lessonApi = {
  create: (courseId: string, data: Record<string, unknown>) =>
    api.post(`/courses/${courseId}/lessons`, data),
  update: (courseId: string, lessonId: string, data: Record<string, unknown>) =>
    api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  delete: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  reorder: (courseId: string, orderedIds: string[]) =>
    api.put(`/courses/${courseId}/lessons/reorder`, { orderedIds }),
};

// Learn
export const learnApi = {
  getCourseContent: (slug: string) => api.get(`/learn/${slug}`),
  toggleLessonComplete: (slug: string, lessonId: string) =>
    api.post(`/learn/${slug}/lessons/${lessonId}/complete`),
  updateWatchTime: (lessonId: string, watchTime: number) =>
    api.put(`/learn/lessons/${lessonId}/watchtime`, { watchTime }),
  getCertificate: (slug: string) => api.get(`/learn/${slug}/certificate`),
};

// Tasks — cross-course student endpoint
export const myTasksApi = {
  getAll: () => api.get("/tasks/my"),
};

// Tasks (Admin/Instructor)
export const taskApi = {
  getAll: (courseId: string) => api.get(`/courses/${courseId}/tasks`),
  create: (courseId: string, data: Record<string, unknown>) =>
    api.post(`/courses/${courseId}/tasks`, data),
  update: (courseId: string, taskId: string, data: Record<string, unknown>) =>
    api.put(`/courses/${courseId}/tasks/${taskId}`, data),
  delete: (courseId: string, taskId: string) =>
    api.delete(`/courses/${courseId}/tasks/${taskId}`),
  // Submissions (admin)
  getSubmissions: (courseId: string, taskId: string) =>
    api.get(`/courses/${courseId}/tasks/${taskId}/submissions`),
  reviewSubmission: (courseId: string, taskId: string, submissionId: string, data: Record<string, unknown>) =>
    api.put(`/courses/${courseId}/tasks/${taskId}/submissions/${submissionId}/review`, data),
  // Student
  getStudentTasks: (courseId: string) => api.get(`/courses/${courseId}/tasks/student`),
  getMySubmission: (courseId: string, taskId: string) =>
    api.get(`/courses/${courseId}/tasks/${taskId}/my-submission`),
  submit: (courseId: string, taskId: string, data: { content: string; fileUrl?: string }) =>
    api.post(`/courses/${courseId}/tasks/${taskId}/submit`, data),
};

// Payments
export const paymentApi = {
  create: (data: { courseId: string; method: string; returnUrl?: string }) =>
    api.post("/payment/create", data),
  getHistory: () => api.get("/payment/history"),
};

// Instructor
export const instructorApi = {
  getDashboard: () => api.get("/instructor/dashboard"),
  getCourses: () => api.get("/instructor/courses"),
  getSubmissions: (params?: { status?: string; courseId?: string }) =>
    api.get("/instructor/submissions", { params }),
};

// Admin
export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  updateUser: (id: string, data: { role?: string; isActive?: boolean }) =>
    api.put(`/admin/users/${id}`, data),
  getCourses: () => api.get("/admin/courses"),
  togglePublish: (id: string) => api.patch(`/admin/courses/${id}/publish`),
  getCourseEnrollments: (courseId: string) => api.get(`/admin/courses/${courseId}/enrollments`),
  removeEnrollment: (enrollmentId: string) => api.delete(`/admin/enrollments/${enrollmentId}`),
  getSubmissions: (params?: { status?: string; courseId?: string }) =>
    api.get("/admin/submissions", { params }),
};

export default api;
