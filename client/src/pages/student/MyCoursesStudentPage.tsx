import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { getCoverImage } from '../../utils/courseCovers';

interface Course {
  id: string; title: string; code: string; teacher_name: string;
  enrollment_count: number; status: string; has_live_session: boolean; live_session_id: string | null;
  cover_image_url?: string;
}

export default function MyCoursesStudentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.getMyCourses().then(d => { setCourses(d as Course[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.name?.split(' ')[0] || 'Student';

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5048e5]"></div>
        </div>
      </StudentLayout>
    );
  }

  /* ── EMPTY STATE — Full Immersive Screen ── */
  if (courses.length === 0) {
    return (
      <StudentLayout>
        <div className="flex-1 min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">

          {/* Ambient background blobs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#5048e5]/8 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-400/8 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

          {/* Main card */}
          <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Floating illustration */}
            <div className="flex justify-center mb-10">
              <div className="relative w-40 h-40">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-[#5048e5]/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 rounded-full bg-[#5048e5]/5" />

                {/* Book card — tilted */}
                <div className="absolute inset-3 rounded-2xl bg-gradient-to-br from-[#5048e5] to-[#6860FF] rotate-6 shadow-xl shadow-[#5048e5]/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-4xl">auto_stories</span>
                </div>

                {/* Small badge top-right */}
                <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-[#5048e5]/10">
                  <span className="material-symbols-outlined text-[#5048e5] text-xl">add</span>
                </div>

                {/* Small badge bottom-left */}
                <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">verified</span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="text-center mb-10">
              <p className="text-[#5048e5] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                {greeting}, {firstName} 👋
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                <span className="block mb-2">Start your</span>
                <span className="bg-gradient-to-r from-[#5048e5] to-violet-500 bg-clip-text text-transparent">
                  learning journey
                </span>
              </h1>
              <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Enroll in courses, mark attendance with GPS precision, and track your progress — all in one place.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: 'location_on', label: 'GPS Verified', color: 'bg-blue-50 text-blue-500' },
                { icon: 'bar_chart', label: 'Track Progress', color: 'bg-violet-50 text-violet-500' },
                { icon: 'notifications_active', label: 'Live Alerts', color: 'bg-emerald-50 text-emerald-500' },
              ].map(f => (
                <div key={f.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="material-symbols-outlined text-xl">{f.icon}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{f.label}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/student/available')}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#5048e5] to-[#6860FF] text-white rounded-2xl font-bold text-base tracking-wide shadow-xl shadow-[#5048e5]/30 hover:shadow-2xl hover:shadow-[#5048e5]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="material-symbols-outlined text-lg">explore</span>
              </div>
              Browse Available Courses
              <span className="material-symbols-outlined text-lg opacity-60 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Your teacher must have already published a course for you to enroll.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  /* ── ENROLLED STATE — Course Grid ── */
  // Hide the Demo course if any real course has an active session
  const hasRealActiveSession = courses.some(c => c.code !== 'DEMO101' && c.has_live_session);
  const displayedCourses = hasRealActiveSession ? courses.filter(c => c.code !== 'DEMO101') : courses;

  return (
    <StudentLayout>
      <div className="flex-1 w-full p-5 sm:p-8 md:p-10 lg:px-12 lg:py-8 mx-auto max-w-7xl animate-in fade-in duration-500">

        {/* Header */}
        <div className="mb-10 mt-2 lg:mt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[#5048e5] text-sm font-bold uppercase tracking-widest mb-2">{greeting}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{user?.name || 'Student'}</h2>
              <p className="text-slate-500 mt-2 text-base">
                {`${displayedCourses.length} enrolled course${displayedCourses.length !== 1 ? 's' : ''}${displayedCourses.filter(c => c.has_live_session).length > 0 ? ' · session is live now!' : ''}`}
              </p>
            </div>
            <button
              onClick={() => navigate('/student/available')}
              className="px-6 py-3 bg-[#5048e5] text-white rounded-2xl text-sm font-bold hover:bg-[#5048e5]/90 transition-all shadow-[0_4px_12px_rgba(80,72,229,0.25)] hover:shadow-[0_6px_20px_rgba(80,72,229,0.35)] hover:-translate-y-0.5 shrink-0 self-start md:self-auto flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-lg">explore</span>
              Browse Courses
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedCourses.map((course, idx) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
            >
              {/* Cover Image */}
              <div className="h-36 bg-slate-100 relative overflow-hidden">
                <img
                  src={getCoverImage(course.id, course.cover_image_url)}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20">
                    {course.code}
                  </span>
                </div>
                {course.has_live_session && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Live Session
                  </div>
                )}
                {course.code === 'DEMO101' && (
                  <div className="absolute top-3 left-4 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]">science</span>
                    Demo
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-[#5048e5] transition-colors" title={course.title}>{course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    {course.teacher_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    {course.enrollment_count}
                  </span>
                </div>
                <div className="mt-auto">
                  {course.has_live_session && course.live_session_id ? (
                    <button
                      onClick={() => navigate(`/student/mark/${course.live_session_id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-lg">verified</span>
                      Mark Attendance
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium border border-slate-100">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      No active session
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
