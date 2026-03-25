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
          
          <div className="relative z-10 flex items-center justify-center gap-4 mt-8">
            <div className="flex -space-x-4">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="avatar" className="w-12 h-12 rounded-full border-4 border-white shadow-sm" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=cbd5e1" alt="avatar" className="w-12 h-12 rounded-full border-4 border-white shadow-sm" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=94a3b8" alt="avatar" className="w-12 h-12 rounded-full border-4 border-white shadow-sm" />
            </div>
            <p className="text-sm text-slate-600 font-semibold">Trusted by <br/> <span className="text-[#5048e5]">2,000+ educators</span></p>
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
                <Link className="text-[#5048e5] font-bold text-sm hover:underline" to="/register">Create an account</Link>
              </div>
            </form>
            
            <div className="mt-16 pt-8 border-t-2 border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold tracking-wider">
              <span>© 2024 Haziri Inc.</span>
              <div className="flex gap-6">
                <a className="hover:text-[#5048e5] transition-colors" href="#">Security</a>
                <a className="hover:text-[#5048e5] transition-colors" href="#">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
