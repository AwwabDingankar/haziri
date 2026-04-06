import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  gender?: string;
  enrolled_courses: number;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getTeacherStudents().then((data: any) => {
      setStudents(data as Student[]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="flex-1 px-4 sm:px-8 md:px-12 pb-12 pt-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Students</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base font-normal">View and manage enrolled students across all courses</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full sm:w-auto group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-[#5048e5]">search</span>
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#5048e5] focus:ring-4 focus:ring-[#5048e5]/10 text-sm transition-all placeholder:text-slate-400 outline-none shadow-sm" 
              placeholder="Search students by name or email..." 
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-[#5048e5] hover:text-[#5048e5] transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-xl">filter_list</span>
            <span>Filter</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-32 text-slate-400 font-medium">
              <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-4xl text-slate-300">group_off</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
              <p className="text-slate-500 max-w-sm">No students are currently enrolled in any of your active courses.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400">Student</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Contact Info</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 hidden lg:table-cell">Gender</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-400 hidden md:table-cell">Enrolled Courses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-slate-500">No students match your search.</td>
                      </tr>
                    ) : filteredStudents.map((s) => (
                      <tr 
                        key={s.id} 
                        onClick={() => navigate(`/teacher/students/${s.id}`)}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-gradient-to-tr from-[#5048e5] to-[#6860FF] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 group-hover:text-[#5048e5] transition-colors">{s.name}</span>
                              <span className="text-xs text-slate-500 sm:hidden mt-0.5">{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-slate-500 font-medium hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span className="text-slate-900 text-sm">{s.phone_number || 'No phone'}</span>
                            <span className="text-xs text-slate-500 mt-0.5">{s.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-slate-500">
                            <span className="material-symbols-outlined text-[18px]">
                              {s.gender === 'female' ? 'woman' : (s.gender === 'male' ? 'man' : 'wc')}
                            </span>
                            <span className="text-sm font-medium capitalize">{s.gender || 'Not specified'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5048e5]/10 text-[#5048e5]">
                            {s.enrolled_courses} Course{s.enrolled_courses !== 1 ? 's' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 tracking-wider">SHOWING {filteredStudents.length} OF {students.length} STUDENTS</p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors cursor-not-allowed opacity-50">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors cursor-not-allowed opacity-50">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
