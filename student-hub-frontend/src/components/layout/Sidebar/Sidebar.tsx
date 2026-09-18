import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  User, 
  Layers, 
  Heart, 
  MessageCircle, 
  Settings,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const navItems = [
  { path: '/', icon: Compass, label: 'Explore' },
  { path: '/profile', icon: User, label: 'My Profile' },
  { path: '/projects', icon: Layers, label: 'Projects' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      // logout() in AuthContext clears state in `finally`, so we still redirect.
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fall back to a placeholder if name/avatar are not set yet.
  const displayName = profile?.user?.name || user?.name || 'Student';
  const displaySubtitle = profile?.major || profile?.university || 'Student';
  const avatarUrl =
    profile?.user?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id ?? 'student'}`;

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-border h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-navy">Student Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const routeIsActive = location.pathname === path ||
            (path === '/' && location.pathname === '') ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  routeIsActive || isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {routeIsActive && (
                <span className="ml-auto w-1.5 h-6 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section with logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full bg-gray-200 object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text truncate">{displayName}</p>
            <p className="text-xs text-text-secondary truncate">{displaySubtitle}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-shrink-0 p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}