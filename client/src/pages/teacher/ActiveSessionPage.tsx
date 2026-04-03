import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface AttendanceRecord {
  id: string; student_name: string; student_email: string;
  reg_no?: string; status: string; marked_at: string; distance_meters: string;
}
interface Session {
  id: string; course_title: string; course_code: string;
  started_at: string; ended_at: string | null; present_count: number;
}

export default function ActiveSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & States
  const [showEndModal, setShowEndModal] = useState(false);
  const [ending, setEnding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        api.getSession(id!) as Promise<Session>,
        api.getSessionAttendance(id!) as Promise<AttendanceRecord[]>,
      ]);
      setSession(s);
      setAttendance(a);
    } catch(err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [id]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleEnd() {
    setEnding(true);
    try {
      await api.endSession(id!);
      navigate('/teacher');
    } catch {
      setEnding(false);
      setShowEndModal(false);
    }
  }

  const elapsed = session?.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000)
    : 0;

  return (
    <TeacherLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Loading session...</div>
        ) : !session ? (
          <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl shadow-sm border border-slate-100">Session not found.</div>
        ) : (
          <>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest leading-none">Live Session</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">{session.course_title}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#5048e5]/10 text-[#5048e5] text-xs font-bold uppercase tracking-wider rounded-lg">
                    {session.course_code}
                  </span>
                  <span className="text-slate-500 text-sm font-medium">Started {elapsed} min ago</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowEndModal(true)} 
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all w-full md:w-auto"
              >
                <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                Stop Session
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-[28px]">timer</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 leading-none">{elapsed}<span className="text-xl">m</span></div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Duration</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined text-[28px]">radar</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 leading-none">50<span className="text-xl">m</span></div>
                  <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Radius</div>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Attendance Log</h2>
                <button 
                  onClick={fetchData} 
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-[#5048e5] hover:bg-[#5048e5]/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Refresh
                </button>
              </div>
              
              {attendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-300">visibility</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Waiting for students</h3>
                  <p className="text-slate-500 max-w-sm">When students mark their attendance, they will appear here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">Student</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100 hidden sm:table-cell">Reg No.</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100 text-right hidden md:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendance.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5048e5] to-[#6860FF] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                {a.student_name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{a.student_name}</span>
                                <span className="text-xs text-slate-500 md:hidden block mt-0.5">{a.reg_no || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium hidden sm:table-cell">{a.reg_no || '—'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-500 text-right hidden md:table-cell">{new Date(a.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <span className="material-symbols-outlined text-3xl">stop_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Stop Session</h3>
                <p className="text-sm text-slate-500 mt-1">Are you sure you want to end this attendance session?</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowEndModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEnd}
                disabled={ending}
                className="px-6 py-2.5 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30 cursor-pointer disabled:opacity-70 flex gap-2 items-center"
              >
                {ending && <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>}
                Yes, Stop Session
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
