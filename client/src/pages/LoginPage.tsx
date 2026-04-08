import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white md:bg-[#f6f6f8] min-h-[100dvh] flex items-center justify-center p-0 md:p-6 lg:p-10 font-[Lexend]">
      <div className="flex w-full h-full max-w-[1200px] min-h-[100dvh] md:min-h-[700px] bg-white overflow-hidden md:rounded-3xl md:shadow-2xl md:shadow-[#5048e5]/10">

        {/* Left Side Branding */}
        <div className="hidden lg:flex flex-col w-1/2 bg-[#5048e5]/10 p-12 relative overflow-hidden justify-between">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#5048e5]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-[#5048e5]/15 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex items-center gap-3 text-[#5048e5] mb-8">
            <div className="size-10 flex items-center justify-center bg-[#5048e5] text-white rounded-xl">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4V20M17 4V20M7 12H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Haziri</h2>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {/* Enhanced, scaled-down graphic with floating animation */}
            <div className="w-full max-w-[240px] aspect-square mx-auto mb-10 flex items-center justify-center relative animate-[bounce_4s_infinite]">
              <div className="absolute inset-0 bg-[#5048e5]/5 rounded-3xl transform rotate-6 scale-105"></div>
              <div className="absolute inset-0 bg-[#5048e5]/10 rounded-3xl transform -rotate-3"></div>
              <div className="relative w-full h-full bg-white/80 backdrop-blur-sm rounded-3xl border border-white p-6 shadow-xl grid grid-cols-2 gap-4">
                <div className="bg-[#5048e5]/20 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-[#5048e5] text-3xl">hub</span></div>
                <div className="bg-[#5048e5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5048e5]/30"><span className="material-symbols-outlined text-white text-3xl">school</span></div>
                <div className="bg-slate-100 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-slate-400 text-3xl">history_edu</span></div>
                <div className="bg-[#5048e5]/10 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined text-[#5048e5] text-3xl">sync_alt</span></div>
              </div>
            </div>

            <div className="text-center px-4">
              <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                Welcome <span className="text-[#5048e5] text-opacity-80">back.</span>
              </h1>
              <p className="text-slate-600 text-lg max-w-sm mx-auto leading-relaxed">
                Access your personalized workspace and stay connected with your community.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side Form */}
        <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-20 lg:py-12">

          {/* Mobile Logo Header (Absolute Top-Left) */}
          <div className="absolute top-8 left-6 sm:left-10 lg:hidden flex items-center gap-3 text-[#5048e5]">
            <div className="size-10 flex items-center justify-center bg-[#5048e5] text-white rounded-xl shadow-md shadow-[#5048e5]/20">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4V20M17 4V20M7 12H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Haziri</h2>
          </div>

          <div className="max-w-md w-full mx-auto mt-8 lg:mt-0">

            <div className="mb-10 text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Login to Account</h2>
              <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#5048e5]/10 focus:border-[#5048e5] outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <a className="text-xs font-bold text-[#5048e5] hover:text-[#4038c5] transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#5048e5]/10 focus:border-[#5048e5] outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="w-full h-14 bg-[#5048e5] hover:bg-[#4038c5] text-white font-bold rounded-xl shadow-lg shadow-[#5048e5]/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : 'Log In'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-6">
                <p className="text-slate-500 font-medium text-sm">Don't have an account?</p>
                <Link className="text-[#5048e5] font-bold text-sm hover:underline" to="/register">Register as Student</Link>
              </div>
            </form>

            <div className="flex flex-col items-center justify-center pt-3">
              <div className="flex items-center gap-1 mt-1">
                <a href="https://www.linkedin.com/in/awwab-dingankar-315a06209" target="_blank" rel="noopener noreferrer" className="size-9 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5 transition-all shadow-sm" title="LinkedIn">
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="mailto:awwabsalim9@gmail.com" className="size-9 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#EA4335] hover:border-[#EA4335]/30 hover:bg-[#EA4335]/5 transition-all shadow-sm" title="Email">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </a>
                <a href="tel:+919834887447" className="size-9 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#34A853] hover:border-[#34A853]/30 hover:bg-[#34A853]/5 transition-all shadow-sm" title="Phone">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
