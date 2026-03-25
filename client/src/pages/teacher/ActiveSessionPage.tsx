import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
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
  const [ending, setEnding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        api.getSession(id!) as Promise<Session>,
        api.getSessionAttendance(id!) as Promise<AttendanceRecord[]>,
      ]);
      setSession(s);
      setAttendance(a);
    } finally { setLoading(false); }
  }, [id]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleEnd() {
    if (!confirm('End this session?')) return;
    setEnding(true);
    try {
      await api.endSession(id!);
      navigate('/teacher');
    } catch { setEnding(false); }
  }

  const elapsed = session?.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000)
    : 0;

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">Loading session...</div>
        ) : !session ? (
          <div className="text-center py-20 text-gray-500">Session not found.</div>
        ) : (
          <>
            <div className="page-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="live-dot"></span>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Live Session</span>
                </div>
                <h1 className="page-title">{session.course_title}</h1>
                <p className="page-subtitle">
                  <span className="badge-purple mr-2">{session.course_code}</span>
                  Started {elapsed} min ago
                </p>
              </div>
              <button onClick={handleEnd} disabled={ending} className="btn-danger">
                {ending ? 'Ending...' : '⏹ Stop Session'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="stat-card">
                <span className="stat-value">{attendance.length}</span>
                <span className="stat-label">Present</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{elapsed}m</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">50m</span>
                <span className="stat-label">Radius</span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Attendance List</h2>
                <button onClick={fetchData} className="btn-ghost text-xs">🔄 Refresh</button>
              </div>
              {attendance.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-3">👀</p>
                  <p className="text-sm">Waiting for students to mark attendance...</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Reg No.</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Distance</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendance.map(a => (
                      <tr key={a.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                              {a.student_name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{a.student_name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500">{a.reg_no || '—'}</td>
                        <td className="py-3 text-gray-500">{parseFloat(a.distance_meters).toFixed(0)}m</td>
                        <td className="py-3 text-gray-400 text-xs">{new Date(a.marked_at).toLocaleTimeString()}</td>
                        <td className="py-3">
                          <span className={a.status === 'present' ? 'badge-green' : 'badge-red'}>
                            {a.status === 'present' ? '✓ Present' : '✗ Rejected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
