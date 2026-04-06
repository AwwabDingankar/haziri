import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import { api } from '../../api';
import { getCoverImage } from '../../utils/courseCovers';

interface Course {
  id: string; title: string; code: string; teacher_name: string;
  enrollment_count: number; status: string; is_enrolled: boolean;
  cover_image_url?: string;
}

export default function AvailableCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'confirm' | 'success' | 'already'; course: Course } | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getAvailableCourses().then(d => { setCourses(d as Course[]); setLoading(false); }).catch(() => setLoading(false));
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

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="flex-1 w-full p-5 sm:p-8 md:p-10 lg:px-12 lg:py-8 mx-auto max-w-7xl animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-8 mt-2 lg:mt-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Available Courses</h2>
            <p className="text-slate-500 mt-2 text-base">Discover and enroll in courses offered by your teachers.</p>
          </div>
          <button 
            onClick={() => navigate('/student')}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all shrink-0 self-start md:self-auto flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            My Courses
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code, or teacher..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5048e5]/20 focus:border-[#5048e5] outline-none transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5048e5]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-slate-300">{search ? 'search_off' : 'school'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{search ? 'No results found' : 'No courses available'}</h3>
            <p className="text-slate-500 max-w-sm">{search ? `No courses match "${search}". Try a different search.` : 'Check back later — your teachers will publish new courses soon.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((course, idx) => (
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


                </div>

                {/* Info */}
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
                    <button
                      onClick={() => handleEnrollClick(course)}
                      disabled={enrolling === course.id}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                        course.is_enrolled 
                          ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-default'
                          : 'bg-[#5048e5] hover:bg-[#5048e5]/90 text-white shadow-md shadow-[#5048e5]/20'
                      }`}
                    >
                      {course.is_enrolled ? (
                        <><span className="material-symbols-outlined text-lg">check</span> Enrolled</>
                      ) : enrolling === course.id ? (
                        <><span className="material-symbols-outlined text-lg animate-spin">refresh</span> Enrolling...</>
                      ) : (
                        <><span className="material-symbols-outlined text-lg">add_circle</span> Enroll Now</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================== MODALS ===================== */}

        {/* Confirm Enrollment */}
        {modal?.type === 'confirm' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModal(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              {/* Cover preview in modal */}
              <div className="h-32 relative overflow-hidden">
                <img src={getCoverImage(modal.course.id, modal.course.cover_image_url)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
              </div>
              <div className="px-6 pb-6 -mt-6 relative">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{modal.course.title}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                  <span className="inline-flex items-center gap-1 bg-[#5048e5]/10 text-[#5048e5] px-2.5 py-0.5 rounded-full font-bold text-xs">{modal.course.code}</span>
                  <span>by {modal.course.teacher_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={() => { setModal(null); doEnroll(modal.course); }} className="flex-1 px-5 py-3 text-sm font-bold bg-[#5048e5] hover:bg-[#5048e5]/90 text-white rounded-xl transition-colors shadow-lg shadow-[#5048e5]/30 cursor-pointer flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Already Enrolled */}
        {modal?.type === 'already' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModal(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-amber-500">info</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Already Enrolled</h3>
              <p className="text-sm text-slate-500 mb-6">You are already enrolled in <strong>{modal.course.title}</strong>.</p>
              <button onClick={() => { setModal(null); navigate('/student'); }} className="w-full px-5 py-3 text-sm font-bold bg-[#5048e5] hover:bg-[#5048e5]/90 text-white rounded-xl transition-colors shadow-lg shadow-[#5048e5]/30 cursor-pointer">
                Go to My Courses
              </button>
            </div>
          </div>
        )}

        {/* Enrollment Success */}
        {modal?.type === 'success' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModal(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-emerald-500">celebration</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enrolled Successfully!</h3>
              <p className="text-sm text-slate-500 mb-6">You've joined <strong>{modal.course.title}</strong>. Head to My Courses to see it.</p>
              <button onClick={() => { setModal(null); navigate('/student'); }} className="w-full px-5 py-3 text-sm font-bold bg-[#5048e5] hover:bg-[#5048e5]/90 text-white rounded-xl transition-colors shadow-lg shadow-[#5048e5]/30 cursor-pointer">
                Go to My Courses
              </button>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
