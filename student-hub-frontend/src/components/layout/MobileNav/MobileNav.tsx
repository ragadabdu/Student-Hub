import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Heart, Layers, MessageCircle, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Compass, label: 'Explore' },
  { path: '/projects', icon: Layers, label: 'Projects' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/messages', icon: MessageCircle, label: 'Messages' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-1 z-50 safe-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
            (path === '/' && location.pathname === '') ||
            (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive: navIsActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[56px] ${
                  isActive || navIsActive ? 'text-primary' : 'text-text-secondary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
              {(isActive || location.pathname === path) && (
                <span className="absolute -top-px w-8 h-0.5 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}