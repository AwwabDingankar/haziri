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


export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">No courses assigned</h2>
                <p className="text-slate-500 text-sm sm:text-lg leading-relaxed">
                  You haven't been assigned any courses yet. Please contact your administrator.
                </p>
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


    </TeacherLayout>
  );
}
