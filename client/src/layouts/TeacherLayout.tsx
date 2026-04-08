import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userName = user?.name || "Teacher";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Extract initials for the avatar fallback
  const initials = userName.charAt(0).toUpperCase();

  return (
    <div className="bg-[#f6f6f8] text-slate-900 antialiased min-h-screen overflow-x-hidden">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200 bg-white p-6 z-50 lg:z-30
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex
        ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full hidden'}
      `}>
        <div className="mb-10 flex items-center gap-2 px-2">
          <div className="size-8 md:size-10 flex items-center justify-center bg-[#5048e5] text-white rounded-xl shadow-md shadow-[#5048e5]/20">
            <svg className="size-5 md:size-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V20M17 4V20M7 12H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 leading-none">Haziri</span>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest leading-none mt-1">Teacher Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink
            to="/teacher"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Courses</span>
          </NavLink>

          <NavLink
            to="/teacher/students"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">Students</span>
          </NavLink>

          <NavLink
            to="/teacher/reports"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span className="material-symbols-outlined">description</span>
            <span className="text-sm">Reports</span>
          </NavLink>
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsAboutOpen(true); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-slate-600 hover:bg-slate-100 w-full cursor-pointer"
          >
            <span className="material-symbols-outlined">info</span>
            <span className="text-sm">About</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 relative">
          <div
            className="flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-50 hover:border-slate-200 rounded-xl transition-all cursor-pointer select-none"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-[#5048e5]/20 p-0.5 bg-white flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#5048e5]/10 flex items-center justify-center text-[#5048e5] font-bold text-base">
                {initials}
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">{userName}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 capitalize truncate">{user?.role || "Teacher"}</p>
            </div>
          </div>

          {/* Profile Dropdown Invisible Overlay for Clicks */}
          {isProfileDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }} />
          )}
          {/* Desktop Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-3 w-64 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-200/50 overflow-hidden origin-bottom-left z-50 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">person_outline</span>
                  <span className="text-sm font-medium">My Profile</span>
                </button>
              </div>
              <div className="p-2 border-t border-slate-50">
                <button
                  onClick={() => { setIsProfileDropdownOpen(false); setIsLogoutModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header (Hidden on LG) */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            className="p-2 -ml-2 text-slate-600 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 flex items-center justify-center bg-[#5048e5] text-white rounded-lg shadow-md shadow-[#5048e5]/20">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4V20M17 4V20M7 12H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">Haziri</span>
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-full ring-2 ring-[#5048e5]/20 bg-[#5048e5]/10 flex items-center justify-center text-[#5048e5] font-bold cursor-pointer relative"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          {initials}

          {/* Profile Dropdown Invisible Overlay for Clicks */}
          {isProfileDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }} />
          )}

          {/* Mobile Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-slate-200/50 overflow-hidden origin-top-right z-50 cursor-default" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">person_outline</span>
                  <span className="text-sm font-medium">My Profile</span>
                </button>
              </div>
              <div className="p-2 border-t border-slate-50">
                <button
                  onClick={() => { setIsProfileDropdownOpen(false); setIsLogoutModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:pl-64 min-h-screen pt-16 lg:pt-0">

        {/* Dynamic Page Content */}
        <div className="flex-1 flex flex-col w-full relative z-0">
          {children}
        </div>
      </main>

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAboutOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-[#5048e5]/10 flex items-center justify-center text-[#5048e5] shrink-0">
                <span className="material-symbols-outlined text-3xl">code</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">About Haziri</h3>
                <p className="text-sm text-slate-500 mt-0.5">Geofenced Attendance System</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-5 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Developer</p>
              <p className="text-lg font-bold text-slate-900">Awwab Dingankar</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">I design and build digital products that solve real-world problems.</p>
            </div>
            <div className="space-y-3">
              <a href="https://www.linkedin.com/in/awwab-dingankar-315a06209" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-[#0A66C2]/5 border border-slate-100 hover:border-[#0A66C2]/20 transition-all group">
                <svg className="size-5 text-slate-400 group-hover:text-[#0A66C2] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0A66C2] transition-colors">LinkedIn Profile</span>
              </a>
              <a href="mailto:awwabsalim9@gmail.com" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-red-50/50 border border-slate-100 hover:border-red-200/50 transition-all group">
                <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-[#EA4335] transition-colors">mail</span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#EA4335] transition-colors">awwabsalim9@gmail.com</span>
              </a>
              <a href="tel:+919834887447" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-[#5048e5]/5 border border-slate-100 hover:border-[#5048e5]/20 transition-all group">
                <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-[#5048e5] transition-colors">call</span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#5048e5] transition-colors">+91 98348 87447</span>
              </a>
            </div>
            <button onClick={() => setIsAboutOpen(false)} className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <span className="material-symbols-outlined text-3xl">logout</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Sign Out</h3>
                <p className="text-sm text-slate-500 mt-1">Are you sure you want to log out of Haziri?</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-8">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsLogoutModalOpen(false); logout(); }}
                className="px-6 py-2.5 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30 cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
