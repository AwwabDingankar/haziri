import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Teacher pages
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import ActiveSessionPage from './pages/teacher/ActiveSessionPage';
import SessionHistoryPage from './pages/teacher/SessionHistoryPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherStudentDetailsPage from './pages/teacher/TeacherStudentDetailsPage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';

// Student pages
import AvailableCoursesPage from './pages/student/AvailableCoursesPage';
import MyCoursesStudentPage from './pages/student/MyCoursesStudentPage';
import MarkAttendancePage from './pages/student/MarkAttendancePage';
import MyReportsPage from './pages/student/MyReportsPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'teacher' | 'student' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><span className="text-primary font-medium">Loading...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><span className="text-primary font-medium">Loading...</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherCoursesPage /></ProtectedRoute>} />
          <Route path="/teacher/session/:id" element={<ProtectedRoute role="teacher"><ActiveSessionPage /></ProtectedRoute>} />
          <Route path="/teacher/courses/:id/history" element={<ProtectedRoute role="teacher"><SessionHistoryPage /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><TeacherStudentsPage /></ProtectedRoute>} />
          <Route path="/teacher/students/:id" element={<ProtectedRoute role="teacher"><TeacherStudentDetailsPage /></ProtectedRoute>} />
          <Route path="/teacher/reports" element={<ProtectedRoute role="teacher"><TeacherReportsPage /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="student"><MyCoursesStudentPage /></ProtectedRoute>} />
          <Route path="/student/available" element={<ProtectedRoute role="student"><AvailableCoursesPage /></ProtectedRoute>} />
          <Route path="/student/mark/:sessionId" element={<ProtectedRoute role="student"><MarkAttendancePage /></ProtectedRoute>} />
          <Route path="/student/reports" element={<ProtectedRoute role="student"><MyReportsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
