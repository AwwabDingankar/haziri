import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';

interface Session {
  id: string; started_at: string; ended_at: string | null; present_count: number; radius_meters: number;
}

export default function SessionHistoryPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourseSessions(courseId!).then(s => { setSessions(s as Session[]); setLoading(false); });
  }, [courseId]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Session History</h1>
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-500">No sessions yet for this course.</p>
          </div>
        ) : (
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Date / Time</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Present</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map(s => {
                  const start = new Date(s.started_at);
                  const end = s.ended_at ? new Date(s.ended_at) : null;
                  const durMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;
                  return (
                    <tr key={s.id}>
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{start.toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{start.toLocaleTimeString()}</p>
                      </td>
                      <td className="py-3 text-gray-600">{durMin != null ? `${durMin} min` : 'Ongoing'}</td>
                      <td className="py-3">
                        <span className="badge-green">{s.present_count} present</span>
                      </td>
                      <td className="py-3">
                        {s.ended_at
                          ? <span className="badge-gray">Ended</span>
                          : <span className="badge-green"><span className="live-dot"></span>Live</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
