import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
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

  const stateConfig: Record<string, { icon: string; iconBg: string; iconColor: string; title: string; desc: string; btnText: string; btnAction: () => void }> = {
    success: {
      icon: 'check_circle', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
      title: 'Marked Successfully!', desc: session?.course_title || 'Your attendance has been recorded.',
      btnText: 'Back to My Courses', btnAction: () => navigate('/student')
    },
    out_of_range: {
      icon: 'location_off', iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
      title: 'Out of Location Range', desc: 'You must be inside the classroom (within 50m) to mark attendance.',
      btnText: 'Try Again', btnAction: () => { setMarkState('idle'); requestGeo(); }
    },
    already_marked: {
      icon: 'info', iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
      title: 'Already Marked', desc: 'Your attendance has already been recorded for this session.',
      btnText: 'Back to My Courses', btnAction: () => navigate('/student')
    },
    no_session: {
      icon: 'event_busy', iconBg: 'bg-slate-50', iconColor: 'text-slate-400',
      title: 'Session Not Active', desc: 'This session has ended or does not exist.',
      btnText: 'Back to My Courses', btnAction: () => navigate('/student')
    }
  };

  const currentState = stateConfig[markState];

  return (
    <StudentLayout>
      <div className="flex-1 w-full p-6 sm:p-8 md:p-12 lg:px-12 lg:py-6 mx-auto max-w-lg flex items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen animate-in fade-in duration-500">
        
        {/* Result State Cards */}
        {currentState ? (
          <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 text-center animate-in zoom-in-95 fade-in duration-300">
            <div className={`w-20 h-20 rounded-full ${currentState.iconBg} flex items-center justify-center mx-auto mb-5`}>
              <span className={`material-symbols-outlined text-4xl ${currentState.iconColor}`}>{currentState.icon}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentState.title}</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">{currentState.desc}</p>
            <button 
              onClick={currentState.btnAction}
              className="w-full px-5 py-3 bg-[#5048e5] text-white rounded-xl text-sm font-bold hover:bg-[#5048e5]/90 transition-all shadow-[0_4px_12px_rgba(80,72,229,0.25)]"
            >
              {currentState.btnText}
            </button>
          </div>
        ) : (
          /* Main Mark Attendance Card */
          <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 animate-in zoom-in-95 fade-in duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#5048e5]/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-[#5048e5]">location_on</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Mark Attendance</h2>
              {session && (
                <>
                  <p className="text-sm font-semibold text-slate-700">{session.course_title}</p>
                  <div className="flex items-center justify-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 bg-[#5048e5]/10 text-[#5048e5] px-2.5 py-1 rounded-full font-bold">{session.course_code}</span>
                    <span>with {session.teacher_name}</span>
                    <span>· {elapsed}m ago</span>
                  </div>
                </>
              )}
            </div>

            {/* GPS Status Panel */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
              {geoLoading && (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5048e5]"></div>
                  <p className="text-sm text-slate-500 font-medium">Getting your location...</p>
                </div>
              )}
              {geoError && (
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <p className="text-sm font-medium">Location error: {geoError}</p>
                  </div>
                  <button onClick={requestGeo} className="text-xs text-[#5048e5] font-bold hover:underline">Retry</button>
                </div>
              )}
              {lat && lng && !geoLoading && (
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <p className="text-sm font-bold">Location ready</p>
                  </div>
                  <p className="text-xs text-slate-400 ml-7">Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</p>
                </div>
              )}
            </div>

            {errMsg && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-4 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <span className="material-symbols-outlined text-lg">warning</span>
                {errMsg}
              </div>
            )}

            <button
              onClick={handleMark}
              disabled={markState === 'loading' || geoLoading}
              className="w-full px-5 py-4 bg-[#5048e5] text-white rounded-xl text-base font-bold hover:bg-[#5048e5]/90 transition-all shadow-[0_4px_12px_rgba(80,72,229,0.25)] hover:shadow-[0_6px_16px_rgba(80,72,229,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {markState === 'loading' ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Marking...</>
              ) : !lat ? (
                <><span className="material-symbols-outlined">gps_fixed</span> Enable Location First</>
              ) : (
                <><span className="material-symbols-outlined">verified</span> Mark as Present</>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              You must be within 50m of the classroom.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
