import { useState, useEffect } from 'react';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface Course {
  id: string;
  title: string;
  code: string;
}

interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  present_count: number;
}

interface CourseReport {
  course: Course;
  sessions: Session[];
  totalSessions: number;
  avgAttendance: number;
  trend: number[]; 
}

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M'>('1M');

  // Derive dynamic chart data based on sessions and selected timeRange
  const getChartData = () => {
    const allSessions = reports.flatMap(r => r.sessions);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today

    if (timeRange === '1W') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
        const daySessions = allSessions.filter(s => {
          const sDate = new Date(s.started_at);
          return sDate.toDateString() === d.toDateString();
        });
        const total = daySessions.reduce((acc, s) => acc + (s.present_count || 0), 0);
        const avg = daySessions.length > 0 ? total / daySessions.length : 0;
        days.push({ label: dayLabel, value: avg });
      }
      return days;
    } else if (timeRange === '1M') {
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);
        
        const weekSessions = allSessions.filter(s => {
          const sDate = new Date(s.started_at);
          return sDate > start && sDate <= end;
        });
        const total = weekSessions.reduce((acc, s) => acc + (s.present_count || 0), 0);
        const avg = weekSessions.length > 0 ? total / weekSessions.length : 0;
        weeks.push({ label: `Week ${4-i}`, value: avg });
      }
      return weeks;
    } else {
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleDateString(undefined, { month: 'short' });
        const monthSessions = allSessions.filter(s => {
          const sDate = new Date(s.started_at);
          return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
        });
        const total = monthSessions.reduce((acc, s) => acc + (s.present_count || 0), 0);
        const avg = monthSessions.length > 0 ? total / monthSessions.length : 0;
        months.push({ label: monthLabel, value: avg });
      }
      return months;
    }
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map(d => d.value), 10); // Minimum scale of 10
  const normalizedData = chartData.map(d => ({
    ...d,
    percentage: Math.round((d.value / maxVal) * 100)
  }));

  useEffect(() => {
    api.getCourses().then(async (data: any) => {
      const c = data as Course[];

      const reportsData: CourseReport[] = [];
      for (const course of c) {
        try {
          const sessions = (await api.getCourseSessions(course.id)) as Session[];
          sessions.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
          
          const endedSessions = sessions.filter(s => s.ended_at !== null);
          const totalPresent = endedSessions.reduce((sum, s) => sum + (s.present_count || 0), 0);
          const avg = endedSessions.length > 0 ? Math.round(totalPresent / endedSessions.length) : 0;
          const trend = endedSessions.map(s => s.present_count || 0);

          reportsData.push({
            course,
            sessions,
            totalSessions: sessions.length,
            avgAttendance: avg,
            trend
          });
        } catch {
          reportsData.push({
            course,
            sessions: [],
            totalSessions: 0,
            avgAttendance: 0,
            trend: []
          });
        }
      }
      setReports(reportsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selectedReport = reports.find(r => r.course.id === selectedCourseId);

  return (
    <TeacherLayout>
      <div className="flex-1 w-full p-6 sm:p-8 md:p-12 lg:px-12 lg:py-6 mx-auto max-w-7xl animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-12 mt-4 lg:mt-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Attendance Reports</h2>
            <p className="text-slate-500 mt-2 text-lg font-light">Detailed overview of session frequency and student presence.</p>
          </div>
          <button className="px-5 py-2.5 bg-[#5048e5] text-white rounded-xl text-sm font-bold hover:bg-[#5048e5]/90 transition-all shadow-[0_4px_12px_rgba(80,72,229,0.25)] hover:shadow-[0_6px_16px_rgba(80,72,229,0.35)] shrink-0 self-start md:self-auto">
            Export Report
          </button>
        </div>

        {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5048e5]"></div>
             </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-slate-300">description</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reports available</h3>
            <p className="text-slate-500 max-w-sm">Create courses and conduct sessions to generate attendance trends.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {reports.map((report, idx) => {
                const estimatedTotalEnrolled = Math.max(...report.trend, report.avgAttendance, 1); 
                const percentage = Math.round((report.avgAttendance / estimatedTotalEnrolled) * 100) || 0;
                const isSelected = selectedCourseId === report.course.id;

                return (
                  <button
                    key={report.course.id}
                    onClick={() => setSelectedCourseId(isSelected ? null : report.course.id)}
                    className={`text-left group rounded-3xl p-8 transition-all flex flex-col min-h-[220px] animate-in fade-in slide-in-from-bottom-4
                      ${isSelected 
                          ? 'bg-white border-[#5048e5] ring-1 ring-[#5048e5] shadow-lg shadow-[#5048e5]/10 -translate-y-1' 
                          : 'bg-white border-slate-100/60 shadow-sm hover:shadow-xl hover:shadow-[#5048e5]/5 hover:-translate-y-1'}`}
                    style={{ border: isSelected ? '1px solid #5048e5' : '1px solid #f1f5f9', animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  >
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#5048e5]/70 mb-2 block">{report.course.code}</span>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#5048e5] transition-colors">{report.course.title}</h3>
                    </div>
                    <div className="space-y-6 mt-auto w-full">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{report.totalSessions}</span>
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">Sessions Held</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-500 text-sm font-medium">Average Attendance</span>
                          <span className="text-[#5048e5] font-bold text-sm tracking-wider">{percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#5048e5] rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Massive Area Chart / Interactive Sessions List */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all animate-in fade-in duration-700 relative overflow-hidden">
              
              {selectedReport ? (
                // Drill-down Sessions View 
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Sessions</h3>
                        <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">{selectedReport.course.code} – {selectedReport.course.title}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCourseId(null); }}
                        className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                         Close Timeline
                      </button>
                   </div>

                   {selectedReport.sessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">event_busy</span>
                        <p className="text-slate-500 font-medium">No sessions recorded yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80">
                              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date recorded</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Timing & Duration</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Attendance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {selectedReport.sessions.slice().reverse().map((s) => {
                              const start = new Date(s.started_at);
                              const end = s.ended_at ? new Date(s.ended_at) : null;
                              const durMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;
                              return (
                                <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="px-6 py-5">
                                    <p className="font-bold text-slate-900 text-sm">{start.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{start.getFullYear()}</p>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                    <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {end ? ` – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                                    <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                                     {durMin != null ? `${durMin} min session` : <span className="text-emerald-500 font-bold flex items-center gap-1"><span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>Active</span>}
                                    </p>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#5048e5]/10 text-[#5048e5] border border-[#5048e5]/10 shadow-sm">
                                      <span className="material-symbols-outlined text-[18px]">group</span>
                                      {s.present_count}
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
              ) : (
                // Clean Global Chart View (Indigo Ethereal Aesthetic)
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Overall Attendance Trends</h3>
                      <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">Visualizing engagement patterns over time.</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="inline-flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['1W', '1M', '3M'].map((range) => (
                           <button 
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            className={`px-5 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                              timeRange === range 
                                ? 'bg-[#5048e5] text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                           >
                            {range}
                           </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <div className="size-2.5 rounded-full bg-[#5048e5] shadow-[#5048e5]/40 shadow-sm"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Average Attendance</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative w-full h-[320px] sm:h-[380px]">
                    {/* Consistent Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {['100%', '75%', '50%', '25%', '0%'].map((pct, i) => (
                         <div key={i} className={`flex items-center gap-4 w-full h-0 border-t ${pct === '0%' ? 'border-slate-200' : 'border-slate-100'}`}>
                           <span className="w-10 text-[10px] font-bold text-slate-400 text-right -mt-4">{pct}</span>
                         </div>
                      ))}
                    </div>

                    {/* Modern Simple Bar Trend */}
                    <div className="absolute inset-0 left-14 right-4 bottom-8 top-1 flex items-end justify-between gap-2 sm:gap-4 md:gap-6 pt-10">
                      {normalizedData.map((d, i) => (
                        <div key={i} className="relative flex-1 h-full flex items-end justify-center group z-10">
                           {/* Hover tooltip */}
                           <div className="absolute -top-10 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none mb-2 shadow-xl z-20">
                             {Math.round(d.value)} students avg
                           </div>
                           
                           {/* The Bar Background Shell */}
                           <div className="w-full max-w-[48px] h-full bg-slate-50/50 border border-slate-100/50 rounded-t-2xl overflow-hidden relative shadow-sm">
                             {/* The Filled Bar */}
                             <div 
                               className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#5048e5] to-[#7c3aed] w-full rounded-t-2xl transition-all duration-700 ease-out group-hover:brightness-110"
                               style={{ 
                                 '--h': `${d.percentage}%`, 
                                 animation: `growBar 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms forwards`,
                                 opacity: 0
                               } as any}
                             >
                               <div className="absolute inset-x-0 top-0 h-1.5 bg-white/20 rounded-t-2xl"></div>
                             </div>
                           </div>
                        </div>
                      ))}
                      
                      <style>{`
                        @keyframes growBar {
                          0% { height: 0%; opacity: 0; transform: translateY(10px); }
                          100% { height: var(--h); opacity: 1; transform: translateY(0); }
                        }
                      `}</style>
                    </div>
                    
                    {/* Airier X Axis Labels */}
                    <div className="absolute bottom-0 left-14 right-4 flex justify-between">
                      {normalizedData.map((d, i) => (
                         <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           {d.label}
                         </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
