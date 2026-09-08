import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  User, 
  Layers, 
  Heart, 
  MessageCircle, 
  Settings,
  Sparkles 
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Compass, label: 'Explore' },
  { path: '/profile', icon: User, label: 'My Profile' },
  { path: '/projects', icon: Layers, label: 'Projects' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-border h-full sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-navy">Student Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-gray-100 hover:text-text'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Optional: User avatar at bottom */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=student"
            alt="Your avatar"
            className="w-10 h-10 rounded-full bg-gray-200"
          />
          <div>
            <p className="text-sm font-medium text-text">You</p>
            <p className="text-xs text-text-secondary">Student</p>
          </div>
        </div>
      </div>
    </aside>
  );
}