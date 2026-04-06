import { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { api } from '../../api';

interface AttendanceRecord {
  id: string; course_title: string; course_code: string;
  status: string; marked_at: string; distance_meters: string;
  session_started: string; teacher_name: string;
}

// Circular progress ring component
function RingProgress({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct > 0 ? '#f59e0b' : '#e2e8f0';
  return (
    <svg width="130" height="130" className="-rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
      />
    </svg>
  );
}

export default function MyReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    api.getMyAttendance().then(d => { setRecords(d as AttendanceRecord[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const totalSessions = records.length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = totalSessions - presentCount;
  const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  const byCourse: Record<string, { title: string; code: string; total: number; present: number }> = {};
  records.forEach(r => {
    if (!byCourse[r.course_code]) byCourse[r.course_code] = { title: r.course_title, code: r.course_code, total: 0, present: 0 };
    byCourse[r.course_code].total++;
    if (r.status === 'present') byCourse[r.course_code].present++;
  });
  const courses = Object.values(byCourse);

  const filteredRecords = selectedCourse
    ? records.filter(r => r.course_code === selectedCourse)
    : records;

  const statusLabel = attendancePct >= 75 ? 'Great standing' : attendancePct > 0 ? 'Needs improvement' : 'No data yet';
  const statusColor = attendancePct >= 75 ? 'text-emerald-600' : attendancePct > 0 ? 'text-amber-500' : 'text-slate-400';

  return (
    <StudentLayout>
      <div className="flex-1 w-full p-5 sm:p-8 md:p-10 lg:px-12 lg:py-8 mx-auto max-w-7xl animate-in fade-in duration-500">

        {/* Header */}
        <div className="mb-10 mt-2 lg:mt-0">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">My Reports</h2>
          <p className="text-slate-500 mt-2 text-base">Track your attendance performance across all courses.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5048e5]"></div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Top Row: Ring summary + 3 stat pills ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both' }}>

              {/* Big attendance ring */}
              <div className="sm:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <RingProgress pct={attendancePct} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{attendancePct}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Attendance</span>
                  </div>
                </div>
                <span className={`text-xs font-bold ${statusColor}`}>{statusLabel}</span>
              </div>

              {/* 3 stat pills stacked vertically */}
              <div className="sm:col-span-2 grid grid-rows-3 gap-3">
                {[
                  { label: 'Total Sessions', value: totalSessions, icon: 'calendar_month', accent: 'border-[#5048e5] bg-[#5048e5]/5 text-[#5048e5]' },
                  { label: 'Present', value: presentCount, icon: 'task_alt', accent: 'border-emerald-400 bg-emerald-50 text-emerald-600' },
                  { label: 'Absent', value: absentCount, icon: 'event_busy', accent: 'border-rose-300 bg-rose-50 text-rose-500' },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.accent} shrink-0`}>
                      <span className="material-symbols-outlined text-xl">{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tighter leading-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Course Breakdown ── */}
            {courses.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-in fade-in duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Course Breakdown</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-4">
                  {courses.map((c, i) => {
                    const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                    const isSelected = selectedCourse === c.code;
                    const barColor = pct >= 75 ? 'bg-[#5048e5]' : pct > 0 ? 'bg-amber-400' : 'bg-slate-200';
                    const pctColor = pct >= 75 ? 'text-[#5048e5]' : pct > 0 ? 'text-amber-500' : 'text-slate-400';
                    return (
                      <div
                        key={c.code}
                        onClick={() => setSelectedCourse(isSelected ? null : c.code)}
                        className={`group cursor-pointer rounded-2xl px-4 py-3 transition-all border ${isSelected ? 'border-[#5048e5]/20 bg-[#5048e5]/5' : 'border-transparent hover:border-slate-100 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-[#5048e5] text-white' : 'bg-slate-100 text-slate-500'} transition-colors shrink-0`}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{c.title}</p>
                              <p className="text-xs text-slate-400">{c.code} · {c.present} of {c.total} present</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold tracking-wide shrink-0 ml-4 ${pctColor}`}>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Sessions Table ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-in fade-in duration-700" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCourse ? `Sessions — ${selectedCourse}` : 'Session History'}
                  </h3>
                  {selectedCourse && (
                    <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1 text-xs text-[#5048e5] font-bold mt-1 hover:underline">
                      <span className="material-symbols-outlined text-sm">close</span>
                      Clear filter
                    </button>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredRecords.length} records</span>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-slate-50/60 rounded-2xl text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">history</span>
                  <p className="text-slate-500 font-semibold text-sm">No attendance records yet</p>
                  <p className="text-xs text-slate-400 mt-1">Mark attendance in your courses to see history here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest">Course</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Date</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Teacher</th>
                        <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredRecords.slice(0, 25).map(r => {
                        const d = new Date(r.marked_at);
                        const isPresent = r.status === 'present';
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900 text-sm">{r.course_title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{r.course_code}</p>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <p className="text-sm font-medium text-slate-700">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <p className="text-sm font-medium text-slate-600">{r.teacher_name}</p>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isPresent ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                <span className="material-symbols-outlined text-[13px]">{isPresent ? 'task_alt' : 'event_busy'}</span>
                                {isPresent ? 'Present' : 'Absent'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </StudentLayout>
  );
}
