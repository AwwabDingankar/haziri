import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';

interface Course {
  id: string; title: string; code: string; teacher_name: string;
  enrollment_count: number; status: string; is_enrolled: boolean;
}

export default function AvailableCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'confirm' | 'success' | 'already'; course: Course } | null>(null);

  useEffect(() => {
    api.getAvailableCourses().then(d => { setCourses(d as Course[]); setLoading(false); });
  }, []);

  async function doEnroll(course: Course) {
    setEnrolling(course.id);
    try {
      await api.enroll(course.id);
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_enrolled: true } : c));
      setModal({ type: 'success', course });
    } catch (err: any) {
      if (err.message?.includes('Already enrolled')) setModal({ type: 'already', course });
      else alert(err.message);
    } finally { setEnrolling(null); }
  }

  function handleEnrollClick(course: Course) {
    if (course.is_enrolled) { setModal({ type: 'already', course }); return; }
    setModal({ type: 'confirm', course });
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Available Courses</h1>
            <p className="page-subtitle">Browse and enroll in active courses</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="w-full h-28 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-100 mb-4 flex items-center justify-center">
                  <span className="text-4xl">🎓</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{course.title}</h3>
                <p className="text-xs mb-1"><span className="badge-purple">{course.code}</span></p>
                <p className="text-xs text-gray-400 mb-4">by {course.teacher_name} · {course.enrollment_count} enrolled</p>
                <button
                  onClick={() => handleEnrollClick(course)}
                  disabled={enrolling === course.id}
                  className={course.is_enrolled ? 'btn-secondary w-full text-xs opacity-70 cursor-default' : 'btn-primary w-full text-xs'}
                >
                  {course.is_enrolled ? '✓ Enrolled' : enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Enrollment Modal */}
        {modal?.type === 'confirm' && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <p className="text-2xl mb-3">📋</p>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Enrollment</h3>
              <p className="text-sm text-gray-500 mb-1">{modal.course.title}</p>
              <p className="text-xs text-gray-400 mb-6">
                <span className="badge-purple mr-2">{modal.course.code}</span>
                by {modal.course.teacher_name}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button onClick={() => doEnroll(modal.course)} className="btn-primary flex-1">Confirm &amp; Enroll</button>
              </div>
            </div>
          </div>
        )}
        {/* Already Enrolled Warning */}
        {modal?.type === 'already' && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal-box text-center" onClick={e => e.stopPropagation()}>
              <p className="text-4xl mb-4">⚠️</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Already Enrolled</h3>
              <p className="text-sm text-gray-500 mb-6">You are already enrolled in <strong>{modal.course.title}</strong>.</p>
              <button onClick={() => setModal(null)} className="btn-primary w-full">Go to My Courses</button>
            </div>
          </div>
        )}
        {/* Enrollment Success */}
        {modal?.type === 'success' && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal-box text-center" onClick={e => e.stopPropagation()}>
              <p className="text-4xl mb-4">🎉</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enrolled Successfully!</h3>
              <p className="text-sm text-gray-500 mb-6">You've joined <strong>{modal.course.title}</strong>. Head to My Courses to see it.</p>
              <button onClick={() => setModal(null)} className="btn-primary w-full">Done</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
