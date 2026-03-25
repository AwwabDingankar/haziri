import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const teacherLinks = [
  { to: '/teacher', label: 'My Courses', icon: '📚', end: true },
];
const studentLinks = [
  { to: '/student', label: 'My Courses', icon: '📚', end: true },
  { to: '/student/available', label: 'Available Courses', icon: '🔍' },
  { to: '/student/reports', label: 'My Reports', icon: '📊' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;
  const portalLabel = user?.role === 'teacher' ? 'TEACHER PORTAL' : 'STUDENT PORTAL';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">H</span>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Haziri</p>
            <p className="text-[10px] font-bold text-primary tracking-widest">{portalLabel}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="px-5 py-2 mb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
        </div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full btn-ghost text-sm py-2 rounded-xl text-left px-3">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
