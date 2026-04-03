import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  cover_image_url: string;
  enrollment_count: number;
  status: string;
  has_live_session?: boolean;
  live_session_id?: string;
}

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Forms
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessionStartingFor, setSessionStartingFor] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await api.getCourses();
      setCourses(data as Course[]);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = async () => {
    if (!newTitle || !newCode) return;
    setIsCreating(true);
    try {
      const randomCover = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
      await api.createCourse({
        title: newTitle,
        code: newCode,
        cover_image_url: randomCover
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewCode('');
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to create course. ' + (err as any).message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!showDeleteModal) return;
    setIsDeleting(true);
    try {
      await api.deleteCourse(showDeleteModal);
      setShowDeleteModal(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartSession = async (courseId: string) => {
    setSessionStartingFor(courseId);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setSessionStartingFor(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await api.startSession({
            courseId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius_meters: 50
          }) as { id: string };
          
          navigate(`/teacher/session/${res.id}`);
        } catch (err: any) {
          console.error(err);
          alert(err.message || "Failed to start session.");
          setSessionStartingFor(null);
        }
      },
      (err) => {
        console.error(err);
        alert("Failed to get location: " + err.message);
        setSessionStartingFor(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <TeacherLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">Loading...</div>
        ) : courses.length === 0 ? (
          // Empty State
          <section className="flex-1 flex flex-col items-center justify-start pt-8 md:pt-0 md:justify-center lg:p-16">
            <div className="max-w-4xl w-full bg-white rounded-[2.5rem] p-6 sm:p-12 lg:p-20 text-center shadow-2xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-slate-300">
              <div className="relative w-full max-w-lg mx-auto aspect-video mb-8 md:mb-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#5048e5]/5 via-transparent to-[#5048e5]/10 rounded-3xl -rotate-1"></div>
                <div className="relative z-0 flex flex-col items-center scale-90 md:scale-100">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
                    <div className="absolute inset-0 bg-[#5048e5]/20 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 border border-[#5048e5]/20 rounded-2xl rotate-12 flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-xl">
                        <span className="material-symbols-outlined text-[#5048e5] text-5xl sm:text-6xl font-extralight">auto_stories</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 border-2 border-[#5048e5]/10 rounded-full flex items-center justify-center bg-white shadow-lg">
                        <span className="material-symbols-outlined text-[#5048e5]/40 text-3xl sm:text-4xl">add</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 max-w-md mx-auto px-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Start your journey</h2>
                <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">
                  Your dashboard is currently empty. Begin your teaching experience by adding your first curriculum.
                </p>
              </div>
              <div className="mt-8 md:mt-12">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#5048e5] to-[#6860FF] text-white rounded-full font-bold tracking-wide shadow-lg shadow-[#5048e5]/30 hover:shadow-xl hover:shadow-[#5048e5]/40 hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
                  </div>
                  <span className="text-[15px] sm:text-lg">Create Your First Course</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          // Grid State
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">My Courses</h1>
                <p className="text-slate-500 mt-1">Manage your curriculums and sessions</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5048e5] text-white rounded-xl font-semibold shadow-lg shadow-[#5048e5]/20 hover:bg-[#5048e5]/90 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                New Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                  <div className="h-32 bg-slate-100 relative overflow-hidden">
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#5048e5]/20 to-[#6860FF]/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                      <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20">
                        {course.code}
                      </span>
                      <button onClick={() => setShowDeleteModal(course.id)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500 backdrop-blur-md text-white flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-1" title={course.title}>{course.title}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      <span>{course.enrollment_count} Students Enrolled</span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <Link 
                        to={`/teacher/courses/${course.id}/history`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#5048e5] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        History
                      </Link>
                      {course.has_live_session ? (
                        <Link 
                          to={`/teacher/session/${course.live_session_id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors shadow-sm animate-pulse"
                        >
                          <span className="material-symbols-outlined text-[18px]">sensors</span>
                          Live
                        </Link>
                      ) : (
                        <button 
                          onClick={() => handleStartSession(course.id)}
                          disabled={sessionStartingFor === course.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-[#5048e5] hover:bg-[#5048e5]/90 shadow-md shadow-[#5048e5]/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group/start"
                        >
                          {sessionStartingFor === course.id ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px] group-hover/start:translate-x-0.5 transition-transform">play_arrow</span>
                          )}
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-6 flex justify-between items-start border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Create Course</h3>
                <p className="text-sm text-slate-500 mt-1">Set up your new teaching environment</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-50">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Course Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Mathematics 101"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5048e5]/20 focus:border-[#5048e5] outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Course Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="e.g. CS101"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5048e5]/20 focus:border-[#5048e5] outline-none transition-all placeholder:text-slate-400 uppercase font-medium"
                />
              </div>
            </div>

            <div className="px-8 pb-8 pt-2">
              <button
                onClick={handleCreateCourse}
                disabled={isCreating || !newTitle || !newCode}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#5048e5] hover:bg-[#5048e5]/90 text-white rounded-xl font-bold shadow-lg shadow-[#5048e5]/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                   <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                ) : (
                   <span className="material-symbols-outlined text-xl">add</span>
                )}
                {isCreating ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <span className="material-symbols-outlined text-3xl">delete</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Course</h3>
                <p className="text-sm text-slate-500 mt-1">This will permanently delete the course and all sessions.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCourse}
                disabled={isDeleting}
                className="px-6 py-2.5 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30 cursor-pointer disabled:opacity-70 flex gap-2 items-center"
              >
                {isDeleting && <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
