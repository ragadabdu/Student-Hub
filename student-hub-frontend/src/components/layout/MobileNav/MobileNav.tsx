import { NavLink } from 'react-router-dom';
import { Compass, Heart, Layers, MessageCircle, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Compass, label: 'Explore' },
  { path: '/projects', icon: Layers, label: 'Projects' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}