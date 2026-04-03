const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('haziri_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  // Auth
  register: (body: object) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Teacher — courses
  getCourses: () => request('/courses'),
  createCourse: (body: object) => request('/courses', { method: 'POST', body: JSON.stringify(body) }),
  updateCourse: (id: string, body: object) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCourse: (id: string) => request(`/courses/${id}`, { method: 'DELETE' }),
  getCourseStudents: (id: string) => request(`/courses/${id}/students`),

  // Student — courses
  getAvailableCourses: () => request('/courses/available'),
  getMyCourses: () => request('/courses/my'),
  enroll: (id: string) => request(`/courses/${id}/enroll`, { method: 'POST' }),

  // Sessions
  startSession: (body: object) => request('/sessions/start', { method: 'POST', body: JSON.stringify(body) }),
  endSession: (id: string) => request(`/sessions/${id}/end`, { method: 'PUT' }),
  getSession: (id: string) => request(`/sessions/${id}`),
  getCourseSessions: (courseId: string) => request(`/sessions/course/${courseId}`),
  clearCourseHistory: (courseId: string) => request(`/sessions/course/${courseId}`, { method: 'DELETE' }),

  // Attendance
  markAttendance: (body: object) => request('/attendance/mark', { method: 'POST', body: JSON.stringify(body) }),
  getSessionAttendance: (sessionId: string) => request(`/attendance/session/${sessionId}`),
  getMyAttendance: () => request('/attendance/my'),
};
