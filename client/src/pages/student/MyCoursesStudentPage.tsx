import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';

interface Course {
  id: string; title: string; code: string; teacher_name: string;
  enrollment_count: number; status: string; has_live_session: boolean; live_session_id: string | null;
}

export default function MyCoursesStudentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMyCourses().then(d => { setCourses(d as Course[]); setLoading(false); });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Courses</h1>
            <p className="page-subtitle">{courses.length} enrolled course{courses.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/student/available')} className="btn-secondary">Browse Courses</button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="card flex flex-col items-center py-20 text-center">
            <span className="text-6xl mb-4">📭</span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No enrolled courses</h2>
            <p className="text-gray-500 mb-6">Browse and enroll in courses to get started.</p>
            <button onClick={() => navigate('/student/available')} className="btn-primary">Browse Available Courses</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="course-card relative">
                {course.has_live_session && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    <span className="live-dot bg-white"></span>LIVE
                  </div>
                )}
                <div className="w-full h-28 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 mb-4 flex items-center justify-center">
                  <span className="text-4xl">📖</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{course.title}</h3>
                <p className="text-xs text-gray-400 mb-1"><span className="badge-purple">{course.code}</span></p>
                <p className="text-xs text-gray-400 mb-4">by {course.teacher_name}</p>

                {course.has_live_session && course.live_session_id ? (
                  <button
                    onClick={() => navigate(`/student/mark/${course.live_session_id}`)}
                    className="btn-primary w-full text-xs"
                  >
                    ✅ Mark Attendance
                  </button>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">No active session</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
