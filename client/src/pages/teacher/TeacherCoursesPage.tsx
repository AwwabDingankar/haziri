import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';
import { useGeoLocation } from '../../hooks/useGeoLocation';

interface Course {
  id: string; title: string; code: string; description?: string;
  cover_image_url?: string; status: string; enrollment_count: number; created_at: string;
}

function CreateCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Course) => void }) {
  const [form, setForm] = useState({ title: '', code: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const course = await api.createCourse(form);
      onCreated(course as Course);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Create New Course</h3>
        <p className="text-sm text-gray-500 mb-6">Set up your course details</p>
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Course Name</label>
            <input className="input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to UX Design" />
          </div>
          <div>
            <label className="label">Course Code</label>
            <input className="input" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. UXD-101" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief course description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : '+ Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StartSessionModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const navigate = useNavigate();
  const { lat, lng, error, loading } = useGeoLocation();
  const [starting, setStarting] = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleStart() {
    if (!lat || !lng) return;
    setStarting(true); setApiError('');
    try {
      const session = await api.startSession({ courseId: course.id, latitude: lat, longitude: lng }) as { id: string };
      navigate(`/teacher/session/${session.id}`);
    } catch (err: any) { setApiError(err.message); setStarting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Start Session</h3>
        <p className="text-sm text-gray-500 mb-2">{course.title} <span className="badge-purple">{course.code}</span></p>
        <div className="mt-4 mb-6 bg-gray-50 rounded-xl p-4">
          {loading && <p className="text-sm text-gray-500">📡 Getting your location...</p>}
          {error && <p className="text-sm text-red-600">❌ {error}</p>}
          {lat && lng && (
            <div className="space-y-1">
              <p className="text-sm text-green-700 font-medium">✅ Location captured</p>
              <p className="text-xs text-gray-500">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</p>
              <p className="text-xs text-gray-400">50m radius will be set for students</p>
            </div>
          )}
        </div>
        {apiError && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{apiError}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleStart} disabled={!lat || !lng || starting} className="btn-primary flex-1">
            {starting ? 'Starting...' : '🚀 Start Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [sessionCourse, setSessionCourse] = useState<Course | null>(null);

  useEffect(() => {
    api.getCourses().then(d => { setCourses(d as Course[]); setLoading(false); });
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Courses</h1>
            <p className="page-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ Add Course</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-5">🌱</span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Start your journey</h2>
            <p className="text-gray-500 mb-6 max-w-xs">You haven't created any courses yet. Create your first course to get started.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create Your First Course</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="w-full h-28 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 mb-4 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{course.title}</h3>
                  <span className="badge-purple shrink-0">{course.code}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{course.enrollment_count} students enrolled</p>
                <div className="flex gap-2">
                  <button onClick={() => setSessionCourse(course)} className="btn-primary flex-1 text-xs py-2">
                    ▶ Start Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={c => { setCourses(prev => [c, ...prev]); setShowCreate(false); }}
        />
      )}
      {sessionCourse && <StartSessionModal course={sessionCourse} onClose={() => setSessionCourse(null)} />}
    </div>
  );
}
