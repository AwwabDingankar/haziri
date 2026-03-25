import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { api } from '../../api';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useDeviceFingerprint } from '../../hooks/useDeviceFingerprint';

interface Session {
  id: string; course_title: string; course_code: string; teacher_name: string;
  started_at: string; ended_at: string | null;
}

type MarkState = 'idle' | 'loading' | 'success' | 'out_of_range' | 'already_marked' | 'no_session' | 'error';

export default function MarkAttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { lat, lng, error: geoError, loading: geoLoading, request: requestGeo } = useGeoLocation();
  const fingerprint = useDeviceFingerprint();
  const [session, setSession] = useState<Session | null>(null);
  const [markState, setMarkState] = useState<MarkState>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    api.getSession(sessionId!).then(s => setSession(s as Session)).catch(() => setMarkState('no_session'));
  }, [sessionId]);

  async function handleMark() {
    if (!lat || !lng) { requestGeo(); return; }
    setMarkState('loading');
    try {
      await api.markAttendance({ sessionId, latitude: lat, longitude: lng, deviceFingerprint: fingerprint });
      setMarkState('success');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Out of range')) setMarkState('out_of_range');
      else if (msg.includes('Already') || msg.includes('already')) setMarkState('already_marked');
      else if (msg.includes('not found') || msg.includes('ended')) setMarkState('no_session');
      else { setErrMsg(msg); setMarkState('error'); }
    }
  }

  const elapsed = session?.started_at
    ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 60000)
    : 0;

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md">

          {markState === 'success' && (
            <div className="card text-center py-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Marked Successfully!</h2>
              <p className="text-gray-500 text-sm mb-6">{session?.course_title}</p>
              <button onClick={() => navigate('/student')} className="btn-primary w-full">Back to My Courses</button>
            </div>
          )}

          {markState === 'out_of_range' && (
            <div className="card text-center py-10">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">📍</span>
              </div>
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Out of Location Range</h2>
              <p className="text-gray-500 text-sm mb-6">You must be inside the classroom (within 50m) to mark attendance.</p>
              <button onClick={() => { setMarkState('idle'); requestGeo(); }} className="btn-primary w-full">Try Again</button>
            </div>
          )}

          {markState === 'already_marked' && (
            <div className="card text-center py-10">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-700 mb-2">Already Marked</h2>
              <p className="text-gray-500 text-sm mb-6">Your attendance has already been recorded for this session.</p>
              <button onClick={() => navigate('/student')} className="btn-primary w-full">Back to My Courses</button>
            </div>
          )}

          {markState === 'no_session' && (
            <div className="card text-center py-10">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">🚫</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Session Not Active</h2>
              <p className="text-gray-500 text-sm mb-6">This session has ended or does not exist.</p>
              <button onClick={() => navigate('/student')} className="btn-primary w-full">Back to My Courses</button>
            </div>
          )}

          {(markState === 'idle' || markState === 'loading' || markState === 'error') && (
            <div className="card">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Mark Attendance</h2>
                {session && (
                  <>
                    <p className="text-sm font-medium text-gray-700">{session.course_title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <span className="badge-purple mr-2">{session.course_code}</span>
                      with {session.teacher_name} · {elapsed}m ago
                    </p>
                  </>
                )}
              </div>

              {/* GPS status */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                {geoLoading && <p className="text-sm text-gray-500">📡 Getting your location...</p>}
                {geoError && (
                  <div>
                    <p className="text-sm text-red-600 mb-2">❌ Location error: {geoError}</p>
                    <button onClick={requestGeo} className="text-xs text-primary font-medium">Retry</button>
                  </div>
                )}
                {lat && lng && !geoLoading && (
                  <div>
                    <p className="text-sm text-green-700 font-medium">✅ Location ready</p>
                    <p className="text-xs text-gray-400 mt-1">Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</p>
                  </div>
                )}
              </div>

              {errMsg && (
                <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{errMsg}</p>
              )}

              <button
                onClick={handleMark}
                disabled={markState === 'loading' || geoLoading}
                className="btn-primary w-full text-base py-3"
              >
                {markState === 'loading' ? '⏳ Marking...' : !lat ? '📡 Enable Location First' : '✅ Mark as Present'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                You must be within 50m of the classroom.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
