import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';

interface AttendanceRecord {
  id: string; course_title: string; course_code: string;
  status: string; marked_at: string; distance_meters: string;
  session_started: string;
}

export default function MyReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyAttendance().then(d => { setRecords(d as AttendanceRecord[]); setLoading(false); });
  }, []);

  const totalSessions = records.length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  // Group by course
  const byCourse: Record<string, { title: string; code: string; total: number; present: number }> = {};
  records.forEach(r => {
    if (!byCourse[r.course_code]) byCourse[r.course_code] = { title: r.course_title, code: r.course_code, total: 0, present: 0 };
    byCourse[r.course_code].total++;
    if (r.status === 'present') byCourse[r.course_code].present++;
  });
  const courses = Object.values(byCourse);

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Reports</h1>
            <p className="page-subtitle">Your attendance analytics</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="stat-label">Overall</span>
                  <span className="text-2xl">📊</span>
                </div>
                <span className="stat-value">{attendancePct}%</span>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${attendancePct}%` }} />
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Sessions</span>
                <span className="stat-value">{totalSessions}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Present</span>
                <span className="stat-value">{presentCount}</span>
              </div>
            </div>

            {/* Per-course breakdown */}
            {courses.length > 0 && (
              <div className="card mb-8">
                <h2 className="font-bold text-gray-900 mb-5">Course Breakdown</h2>
                <div className="space-y-4">
                  {courses.map(c => {
                    const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                    return (
                      <div key={c.code}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-sm font-semibold text-gray-800">{c.title}</span>
                            <span className="badge-purple ml-2">{c.code}</span>
                          </div>
                          <span className="text-sm font-bold text-primary">{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${pct < 75 ? 'bg-red-400' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{c.present}/{c.total} sessions</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent sessions table */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-5">Recent Sessions</h2>
              {records.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-3">📝</p>
                  <p className="text-sm">No attendance records yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Distance</th>
                      <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.slice(0, 20).map(r => (
                      <tr key={r.id}>
                        <td className="py-3">
                          <p className="font-medium text-gray-800">{r.course_title}</p>
                          <p className="text-xs text-gray-400">{r.course_code}</p>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{new Date(r.marked_at).toLocaleDateString()}</td>
                        <td className="py-3 text-gray-500">{r.distance_meters ? `${parseFloat(r.distance_meters).toFixed(0)}m` : '—'}</td>
                        <td className="py-3">
                          <span className={r.status === 'present' ? 'badge-green' : 'badge-red'}>
                            {r.status === 'present' ? '✓ Present' : '✗ Absent'}
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
