import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TeacherLayout from '../../layouts/TeacherLayout';
import { api } from '../../api';

interface Session {
  id: string; started_at: string; ended_at: string | null; present_count: number; radius_meters: number;
}

export default function SessionHistoryPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchSessions = () => {
    setLoading(true);
    api.getCourseSessions(courseId!).then((s: any) => { 
      setSessions(s as Session[]); 
      setLoading(false); 
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await api.clearCourseHistory(courseId!);
      setShowClearModal(false);
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <Link to="/teacher" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#5048e5] transition-colors mb-3">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Courses
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Session History</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Review past classes and attendance counts</p>
          </div>
          
          {sessions.length > 0 && (
            <button 
              onClick={() => setShowClearModal(true)} 
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-4xl text-slate-300">history</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No history yet</h3>
            <p className="text-slate-500 max-w-sm">You haven't conducted any sessions for this course. Start a session from the Courses page to see it here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">Date & Time</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100 hidden sm:table-cell">Duration</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">Present</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sessions.map(s => {
                    const start = new Date(s.started_at);
                    const end = s.ended_at ? new Date(s.ended_at) : null;
                    const durMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 sm:text-base">{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">
                          {durMin != null ? `${durMin} min` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-[#5048e5]/5 text-[#5048e5] border border-[#5048e5]/10">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            {s.present_count}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <span className="material-symbols-outlined text-3xl">delete_sweep</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Clear History</h3>
                <p className="text-sm text-slate-500 mt-1">Are you sure you want to delete all past sessions? Active sessions won't be deleted.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearHistory}
                disabled={isClearing}
                className="px-6 py-2.5 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30 cursor-pointer disabled:opacity-70 flex gap-2 items-center"
              >
                {isClearing && <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>}
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
