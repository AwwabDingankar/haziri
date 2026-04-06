import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface CourseStat {
  id: string;
  title: string;
  code: string;
  total_sessions: number;
  present_count: number;
  percent: number;
}

interface StudentDetailsData {
  student: {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    gender?: string;
  };
  overview: {
    totalClasses: number;
    totalPresent: number;
    totalAbsent: number;
    overallPercent: number;
  };
  courses: CourseStat[];
}

export default function TeacherStudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<StudentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getTeacherStudentDetails(id).then((res: any) => {
      setData(res as StudentDetailsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center py-32 text-slate-400 font-medium">
          <span className="material-symbols-outlined text-xl animate-spin mr-2">refresh</span>
          Loading student details...
        </div>
      </TeacherLayout>
    );
  }

  if (!data) {
    return (
      <TeacherLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">person_off</span>
          <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
          <button onClick={() => navigate('/teacher/students')} className="mt-4 text-[#5048e5] font-bold hover:underline">
            Return to Students
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="flex-1 px-4 sm:px-8 md:px-12 pb-12 pt-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col mb-8">
          <button
            onClick={() => navigate('/teacher/students')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#5048e5] font-medium text-sm mb-6 transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Students
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Student Profile Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="size-32 rounded-full ring-4 ring-slate-50 p-1 mb-6 bg-gradient-to-tr from-[#5048e5] to-[#6860FF] flex items-center justify-center text-white text-5xl font-bold shadow-sm">
              {data.student.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{data.student.name}</h2>
            <p className="text-sm font-mono text-[#5048e5] font-semibold mt-1 tracking-wider uppercase">
              HZ-{data.student.id.substring(0, 6)}
            </p>

            <div className="w-full mt-8 space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4 text-left">
                <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Email Address</p>
                  <p className="text-sm font-medium text-slate-700 break-all" title={data.student.email}>{data.student.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Phone Number</p>
                  <p className="text-sm font-medium text-slate-700">{data.student.phone_number || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined">{data.student.gender === 'female' ? 'woman' : (data.student.gender === 'male' ? 'man' : 'wc')}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gender</p>
                  <p className="text-sm font-medium text-slate-700 capitalize">{data.student.gender || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-8">
              <div
                className="relative size-32 rounded-full flex items-center justify-center shadow-inner"
                style={{ background: `conic-gradient(#5048e5 ${data.overview.overallPercent}%, #e2e8f0 0)` }}
              >
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{data.overview.overallPercent}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Overall</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Attendance Overview</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  Track and monitor overall student engagement and presence across all registered courses. This overview provides a summary of attendance performance.
                </p>
                <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Classes</p>
                    <p className="text-lg font-bold text-[#5048e5]">{data.overview.totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Present</p>
                    <p className="text-lg font-bold text-slate-700">{data.overview.totalPresent}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Absences</p>
                    <p className="text-lg font-bold text-rose-500">{data.overview.totalAbsent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-slate-900">Enrolled Courses</h3>
                <span className="text-xs font-bold text-[#5048e5] bg-[#5048e5]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {data.courses.length === 0 ? (
                  <div className="px-8 py-10 text-center text-slate-500 font-medium">No courses found.</div>
                ) : data.courses.map((course, i) => {
                  const colors = [
                    { bg: 'bg-indigo-50', text: 'text-indigo-600', fill: 'bg-indigo-500' },
                    { bg: 'bg-emerald-50', text: 'text-emerald-600', fill: 'bg-emerald-500' },
                    { bg: 'bg-amber-50', text: 'text-amber-600', fill: 'bg-amber-500' },
                    { bg: 'bg-rose-50', text: 'text-rose-600', fill: 'bg-rose-500' }
                  ];
                  const color = colors[i % colors.length];

                  return (
                    <div key={course.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl ${color.bg} flex items-center justify-center ${color.text}`}>
                          <span className="material-symbols-outlined text-xl">book</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{course.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{course.code} • {course.total_sessions} Sessions</p>
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-sm font-bold text-slate-700">{course.percent}%</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full ${color.fill} rounded-full transition-all duration-1000`} style={{ width: `${course.percent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
