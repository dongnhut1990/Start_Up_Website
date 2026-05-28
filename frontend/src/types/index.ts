export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type PaymentMethod = "VNPAY" | "MOMO" | "FREE";
export type EnrollmentStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type TaskStatus = "PENDING" | "SUBMITTED" | "REVIEWED" | "PASSED" | "FAILED";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export interface TaskSubmission {
  id: string;
  status: TaskStatus;
  score?: number | null;
  feedback?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
}

export interface TaskWithSubmission {
  id: string;
  title: string;
  description: string;
  dueDate?: string | null;
  maxScore: number;
  order: number;
  submission: TaskSubmission | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string | null;
  maxScore: number;
  order: number;
  _count?: { submissions: number };
}

export interface SubmissionWithUser extends TaskSubmission {
  content: string;
  fileUrl?: string | null;
  user: { id: string; name: string; email: string; avatar?: string | null };
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  originalPrice?: number;
  level: CourseLevel;
  category: string;
  duration: number;
  totalLessons: number;
  language: string;
  isPublished: boolean;
  isFeatured: boolean;
  rating: number;
  totalStudents: number;
  requirements: string[];
  outcomes: string[];
  instructor: Instructor;
  lessons?: Lesson[];
  tasks?: Task[];
  createdAt: string;
  _count?: { enrollments: number; lessons: number };
}

export interface LessonProgress {
  completed: boolean;
  watchTime: number;
}

export interface LearnLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  content: string | null;
  duration: number;
  order: number;
  isFree: boolean;
  progress: LessonProgress | null;
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
}

export interface Payment {
  id: string;
  courseId: string;
  course: { title: string; thumbnail?: string; slug: string };
  amount: number;
  method: PaymentMethod;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface MyTask {
  id: string;
  title: string;
  description: string;
  dueDate?: string | null;
  maxScore: number;
  order: number;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  submission: TaskSubmission | null;
}

export interface EnrollmentWithUser {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt?: string | null;
  user: { id: string; name: string; email: string; avatar?: string | null; createdAt: string };
}

export interface Certificate {
  courseTitle: string;
  courseSlug: string;
  instructorName: string;
  studentName: string;
  completedAt: string;
  courseCategory: string;
  courseLevel: CourseLevel;
}

export interface AdminSubmission {
  id: string;
  content: string;
  fileUrl?: string | null;
  status: TaskStatus;
  score?: number | null;
  feedback?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  user: { id: string; name: string; email: string; avatar?: string | null };
  task: {
    id: string;
    title: string;
    maxScore: number;
    course: { id: string; title: string; slug: string };
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
